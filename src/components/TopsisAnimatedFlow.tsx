import { useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatedMatrixTable } from './AnimatedMatrixTable';
import { MathFormula } from './MathFormula';
import type { TopsisFullResult } from '../types';
import { LATEX_DPL_UPL_BENEFIT_ONLY, LATEX_PIS_NIS_BENEFIT_ONLY, LATEX_R_MINMAX, LATEX_R_VECTOR } from '../lib/topsisLatex';
import styles from './TopsisAnimatedFlow.module.css';
import { useI18n } from '../i18n';

interface TopsisAnimatedFlowProps {
  result: TopsisFullResult;
  method: 'topsis' | 'rad';
}

export function TopsisAnimatedFlow({ result, method }: TopsisAnimatedFlowProps) {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const isVector = result.compute?.normalization === 'vector';
  const hasCost = result.compute?.directions.some((d) => d === 'cost') ?? false;

  const { steps, alternatives, criteria } = result;
  const { matrixG, matrixR, matrixT, weights, PIS, NIS, distances } = steps;

  const stepsInfo = useMemo(() => {
    const rFormula = isVector ? LATEX_R_VECTOR : LATEX_R_MINMAX;
    const rDesc = isVector ? t('didactic.step2.descriptionVector') : t('didactic.step2.description');
    const refDesc = hasCost
      ? (method === 'rad' ? t('didactic.step4.descriptionMixedRad') : t('didactic.step4.descriptionMixed'))
      : (method === 'rad' ? t('didactic.step4.descriptionRad') : t('didactic.step4.description'));
    const refFormula = hasCost ? undefined : (method === 'rad' ? LATEX_DPL_UPL_BENEFIT_ONLY : LATEX_PIS_NIS_BENEFIT_ONLY);

    return [
      {
        key: 'G',
        title: t('didactic.step1.title'),
        formulaLatex: 'g_{ij}',
        description: t('didactic.step1.description'),
      },
      {
        key: 'W',
        title: t('didactic.weights.title'),
        formulaLatex: t('formula.weightsNorm'),
        description: t('didactic.weights.description'),
      },
      {
        key: 'R',
        title: t('didactic.step2.title'),
        formulaLatex: rFormula,
        description: rDesc,
      },
      {
        key: 'T',
        title: t('didactic.step3.title'),
        formulaLatex: 't_{ij} = w_j \\cdot r_{ij}',
        description: t('didactic.step3.description'),
      },
      {
        key: 'ref',
        title: method === 'rad' ? t('didactic.step4.titleRad') : t('didactic.step4.title'),
        formulaLatex: refFormula,
        description: refDesc,
      },
      {
        key: 'dist',
        title: t('didactic.step5.title'),
        formulaLatex: method === 'rad'
          ? 'd_{ib} = \\sqrt{\\sum_j (t_{ij} - DPL_j)^2},\\quad d_{iw} = \\sqrt{\\sum_j (t_{ij} - UPL_j)^2}'
          : 'd_{ib} = \\sqrt{\\sum_j (t_{ij} - PIS_j)^2},\\quad d_{iw} = \\sqrt{\\sum_j (t_{ij} - NIS_j)^2}',
        description: method === 'rad' ? t('didactic.step5.descriptionRad') : t('didactic.step5.description'),
      },
      {
        key: 'scores',
        title: t('didactic.step6.title'),
        formulaLatex: 'S_{iw} = \\frac{d_{iw}}{d_{iw} + d_{ib}}',
        description: t('didactic.step6.description'),
      },
    ];
  }, [method, t, isVector, hasCost]);

  const stepData = [
    { matrix: matrixG, rowLabels: alternatives, colLabels: criteria, decimals: 0 },
    { matrix: [weights], rowLabels: [t('matrix.label.w')], colLabels: criteria, decimals: 4 },
    { matrix: matrixR, rowLabels: alternatives, colLabels: criteria, decimals: 4 },
    { matrix: matrixT, rowLabels: alternatives, colLabels: criteria, decimals: 4 },
    {
      matrix: [PIS, NIS],
      rowLabels: method === 'rad'
        ? [t('rad.method.dpl'), t('rad.method.upl')]
        : [t('matrix.label.pis'), t('matrix.label.nis')],
      colLabels: criteria,
      decimals: 4,
    },
    {
      matrix: distances.map((d) => [d.d_iw, d.d_ib]),
      rowLabels: alternatives,
      colLabels: method === 'rad'
        ? [t('didactic.col.nisRad'), t('didactic.col.pisRad')]
        : [t('didactic.col.nis'), t('didactic.col.pis')],
      decimals: 4,
    },
    {
      matrix: distances.map((d) => [d.score]),
      rowLabels: alternatives,
      colLabels: [t('matrix.label.siw')],
      decimals: 4,
    },
  ];

  const totalSteps = stepsInfo.length;

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setAnimationKey((k) => k + 1);
  }, [result]);

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
          {stepInfo.formulaLatex && (
            <MathFormula latex={stepInfo.formulaLatex} className={styles.formula} />
          )}
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
