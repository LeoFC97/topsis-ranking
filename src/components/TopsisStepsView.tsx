import { useState } from 'react';
import { MatrixViewer } from './MatrixViewer';
import type { TopsisFullResult } from '../types';
import styles from './TopsisStepsView.module.css';
import { useI18n } from '../i18n';

interface TopsisStepsViewProps {
  result: TopsisFullResult;
}

export function TopsisStepsView({ result }: TopsisStepsViewProps) {
  const { t } = useI18n();
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  const { steps, alternatives, criteria } = result;
  const { matrixG, matrixR, matrixT, weights, PIS, NIS, distances } = steps;

  const stepItems = [
    {
      key: 'G',
      title: t('steps.step1.title'),
      description: t('steps.step1.description'),
      matrix: matrixG,
      rowLabels: alternatives,
      colLabels: criteria,
    },
    {
      key: 'weights',
      title: t('steps.weights.title'),
      description: t('steps.weights.description'),
      matrix: [weights],
      rowLabels: ['w'],
      colLabels: criteria,
    },
    {
      key: 'R',
      title: t('steps.step2.title'),
      description: t('steps.step2.description'),
      matrix: matrixR,
      rowLabels: alternatives,
      colLabels: criteria,
    },
    {
      key: 'T',
      title: t('steps.step3.title'),
      description: t('steps.step3.description'),
      matrix: matrixT,
      rowLabels: alternatives,
      colLabels: criteria,
    },
    {
      key: 'ref',
      title: t('steps.step4.title'),
      description: t('steps.step4.description'),
      matrix: [PIS, NIS],
      rowLabels: ['PIS', 'NIS'],
      colLabels: criteria,
    },
    {
      key: 'dist',
      title: t('steps.step5.title'),
      description: t('steps.step5.description'),
      matrix: distances.map((d) => [d.d_ib, d.d_iw]),
      rowLabels: alternatives,
      colLabels: [t('steps.step5.colPIS'), t('steps.step5.colNIS')],
    },
    {
      key: 'scores',
      title: t('steps.step6.title'),
      description: t('steps.step6.description'),
      matrix: distances.map((d) => [d.score]),
      rowLabels: alternatives,
      colLabels: ['S_iw'],
    },
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.mainTitle}>{t('matrices.title')}</h2>

      {stepItems.map((item, index) => {
        const isExpanded = expandedStep === index;
        const rowLabels = item.rowLabels ?? alternatives;
        const colLabels = item.colLabels ?? criteria;

        return (
          <div key={item.key} className={styles.step}>
            <button
              type="button"
              className={styles.stepHeader}
              onClick={() => setExpandedStep(isExpanded ? null : index)}
              aria-expanded={isExpanded}
            >
              <span className={styles.stepNumber}>{(index % 6) + 1}</span>
              <span className={styles.stepTitle}>{item.title}</span>
              <span className={styles.stepToggle}>{isExpanded ? '−' : '+'}</span>
            </button>

            {isExpanded && (
              <div className={styles.stepContent}>
                <MatrixViewer
                  title=""
                  description={item.description}
                  matrix={item.matrix}
                  rowLabels={rowLabels}
                  colLabels={colLabels}
                  decimals={index === 0 ? 0 : 4}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
