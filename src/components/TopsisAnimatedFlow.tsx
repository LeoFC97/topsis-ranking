import { useState, useCallback, useEffect } from 'react';
import { AnimatedMatrixTable } from './AnimatedMatrixTable';
import type { TopsisFullResult } from '../types';
import styles from './TopsisAnimatedFlow.module.css';

const STEPS = [
  {
    key: 'G',
    title: 'Step 1: Matriz de decisão (G)',
    formula: 'gᵢⱼ = desempenho da alternativa i no critério j',
    description: 'Dados originais da planilha.',
  },
  {
    key: 'W',
    title: 'Pesos normalizados (W)',
    formula: 'wⱼ = peso_j / Σ peso_k',
    description: 'Pesos que somam 1, definidos pelo decisor.',
  },
  {
    key: 'R',
    title: 'Step 2: Matriz normalizada (R)',
    formula: 'rᵢⱼ = gᵢⱼ / √(Σᵢ g²ᵢⱼ)',
    description: 'Normalização vetorial de Hwang para cada coluna.',
  },
  {
    key: 'T',
    title: 'Step 3: Matriz ponderada (T)',
    formula: 'tᵢⱼ = wⱼ · rᵢⱼ',
    description: 'Cada coluna multiplicada pelo peso do critério.',
  },
  {
    key: 'ref',
    title: 'Step 4: PIS e NIS',
    formula: 'PISⱼ = max(tᵢⱼ)  |  NISⱼ = min(tᵢⱼ)',
    description: 'Ideal positivo (melhor) e negativo (pior) por critério.',
  },
  {
    key: 'dist',
    title: 'Step 5: Distâncias',
    formula: 'dᵢ₋ = √Σ(tᵢⱼ − NISⱼ)²  |  dᵢ₊ = √Σ(tᵢⱼ − PISⱼ)²',
    description: 'Distância euclidiana ao pior (NIS) e ao melhor (PIS).',
  },
  {
    key: 'scores',
    title: 'Step 6: Scores',
    formula: 'Sᵢ = dᵢ₋ / (dᵢ₋ + dᵢ₊)',
    description: 'Score de afastamento do pior. Maior = melhor ranking.',
  },
] as const;

interface TopsisAnimatedFlowProps {
  result: TopsisFullResult;
}

export function TopsisAnimatedFlow({ result }: TopsisAnimatedFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const { steps, alternatives, criteria } = result;
  const { matrixG, matrixR, matrixT, weights, PIS, NIS, distances } = steps;

  const stepData = [
    { matrix: matrixG, rowLabels: alternatives, colLabels: criteria, decimals: 0 },
    { matrix: [weights], rowLabels: ['w'], colLabels: criteria, decimals: 4 },
    { matrix: matrixR, rowLabels: alternatives, colLabels: criteria, decimals: 4 },
    { matrix: matrixT, rowLabels: alternatives, colLabels: criteria, decimals: 4 },
    { matrix: [PIS, NIS], rowLabels: ['PIS', 'NIS'], colLabels: criteria, decimals: 4 },
    {
      matrix: distances.map((d) => [d.d_iw, d.d_ib]),
      rowLabels: alternatives,
      colLabels: ['d_iw (NIS)', 'd_ib (PIS)'],
      decimals: 4,
    },
    {
      matrix: distances.map((d) => [d.score]),
      rowLabels: alternatives,
      colLabels: ['S_iw'],
      decimals: 4,
    },
  ];

  const totalSteps = STEPS.length;

  const goNext = useCallback(() => {
    setCurrentStep((s) => (s < totalSteps - 1 ? s + 1 : s));
  }, [totalSteps]);

  const goPrev = useCallback(() => {
    setCurrentStep((s) => (s > 0 ? s - 1 : s));
  }, []);

  const goToStep = useCallback((index: number) => {
    setCurrentStep(index);
    setAnimationKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(goNext, 4000);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, goNext]);

  useEffect(() => {
    if (currentStep >= totalSteps - 1 && isPlaying) {
      setIsPlaying(false);
    }
  }, [currentStep, totalSteps, isPlaying]);

  const data = stepData[currentStep];
  const stepInfo = STEPS[currentStep];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Modo didático — cálculo animado</h2>
      <p className={styles.subtitle}>
        Assista o cálculo passo a passo. Use os controles ou deixe a animação rodar.
      </p>

      <div className={styles.controls}>
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className={styles.playBtn}
          title={isPlaying ? 'Pausar' : 'Reproduzir'}
        >
          {isPlaying ? '⏸ Pausar' : '▶ Reproduzir'}
        </button>
        <button type="button" onClick={goPrev} disabled={currentStep === 0} className={styles.stepBtn}>
          ‹ Anterior
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={currentStep === totalSteps - 1}
          className={styles.stepBtn}
        >
          Próximo ›
        </button>
        <span className={styles.stepIndicator}>
          {currentStep + 1} / {totalSteps}
        </span>
      </div>

      <div className={styles.progress}>
        <div
          className={styles.progressBar}
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>

      <div className={styles.stepNav}>
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => goToStep(i)}
            className={`${styles.stepDot} ${i === currentStep ? styles.stepDotActive : ''} ${i < currentStep ? styles.stepDotDone : ''}`}
            title={s.title}
            aria-label={`Ir para passo ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className={styles.stepContent}>
        <div className={styles.formulaBox}>
          <h3 className={styles.stepTitle}>{stepInfo.title}</h3>
          <code className={styles.formula}>{stepInfo.formula}</code>
          <p className={styles.stepDesc}>{stepInfo.description}</p>
        </div>

        <div className={styles.matrixWrap}>
          <AnimatedMatrixTable
            key={animationKey}
            matrix={data.matrix}
            rowLabels={data.rowLabels}
            colLabels={data.colLabels}
            decimals={data.decimals}
          />
        </div>
      </div>
    </div>
  );
}
