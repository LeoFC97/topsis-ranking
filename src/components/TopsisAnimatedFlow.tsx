import { useState, useCallback, useEffect } from 'react';
import { AnimatedMatrixTable } from './AnimatedMatrixTable';
import type { TopsisFullResult } from '../types';
import styles from './TopsisAnimatedFlow.module.css';
import { useI18n } from '../i18n';

interface TopsisAnimatedFlowProps {
  result: TopsisFullResult;
}

export function TopsisAnimatedFlow({ result }: TopsisAnimatedFlowProps) {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const { steps, alternatives, criteria } = result;
  const { matrixG, matrixR, matrixT, weights, PIS, NIS, distances } = steps;

  const stepsInfo = [
    {
      key: 'G',
      title: t('didactic.step1.title'),
      formula: t('didactic.step1.formula'),
      description: t('didactic.step1.description'),
    },
    {
      key: 'W',
      title: t('didactic.weights.title'),
      formula: t('didactic.weights.formula'),
      description: t('didactic.weights.description'),
    },
    {
      key: 'R',
      title: t('didactic.step2.title'),
      formula: t('didactic.step2.formula'),
      description: t('didactic.step2.description'),
    },
    {
      key: 'T',
      title: t('didactic.step3.title'),
      formula: t('didactic.step3.formula'),
      description: t('didactic.step3.description'),
    },
    {
      key: 'ref',
      title: t('didactic.step4.title'),
      formula: t('didactic.step4.formula'),
      description: t('didactic.step4.description'),
    },
    {
      key: 'dist',
      title: t('didactic.step5.title'),
      formula: t('didactic.step5.formula'),
      description: t('didactic.step5.description'),
    },
    {
      key: 'scores',
      title: t('didactic.step6.title'),
      formula: t('didactic.step6.formula'),
      description: t('didactic.step6.description'),
    },
  ] as const;

  const stepData = [
    { matrix: matrixG, rowLabels: alternatives, colLabels: criteria, decimals: 0 },
    { matrix: [weights], rowLabels: ['w'], colLabels: criteria, decimals: 4 },
    { matrix: matrixR, rowLabels: alternatives, colLabels: criteria, decimals: 4 },
    { matrix: matrixT, rowLabels: alternatives, colLabels: criteria, decimals: 4 },
    { matrix: [PIS, NIS], rowLabels: ['PIS', 'NIS'], colLabels: criteria, decimals: 4 },
    {
      matrix: distances.map((d) => [d.d_iw, d.d_ib]),
      rowLabels: alternatives,
      colLabels: [t('didactic.col.nis'), t('didactic.col.pis')],
      decimals: 4,
    },
    {
      matrix: distances.map((d) => [d.score]),
      rowLabels: alternatives,
      colLabels: ['S_iw'],
      decimals: 4,
    },
  ];

  const totalSteps = stepsInfo.length;

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
  const stepInfo = stepsInfo[currentStep];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('didactic.title')}</h2>
      <p className={styles.subtitle}>
        {t('didactic.subtitle')}
      </p>

      <div className={styles.controls}>
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className={styles.playBtn}
          title={isPlaying ? t('didactic.pause') : t('didactic.play')}
        >
          {isPlaying ? `⏸ ${t('didactic.pause')}` : `▶ ${t('didactic.play')}`}
        </button>
        <button type="button" onClick={goPrev} disabled={currentStep === 0} className={styles.stepBtn}>
          {`‹ ${t('didactic.previous')}`}
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={currentStep === totalSteps - 1}
          className={styles.stepBtn}
        >
          {`${t('didactic.next')} ›`}
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
        {stepsInfo.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => goToStep(i)}
            className={`${styles.stepDot} ${i === currentStep ? styles.stepDotActive : ''} ${i < currentStep ? styles.stepDotDone : ''}`}
            title={s.title}
            aria-label={`${t('didactic.goToStep')} ${i + 1}`}
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
