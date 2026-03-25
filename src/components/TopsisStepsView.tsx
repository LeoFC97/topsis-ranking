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
      formulaLatex: 'g_{ij}',
      matrix: matrixG,
      rowLabels: alternatives,
      colLabels: criteria,
    },
    {
      key: 'weights',
      title: t('steps.weights.title'),
      description: t('steps.weights.description'),
      formulaLatex: t('formula.weightsNorm'),
      matrix: [weights],
      rowLabels: [t('matrix.label.w')],
      colLabels: criteria,
    },
    {
      key: 'R',
      title: t('steps.step2.title'),
      description: t('steps.step2.description'),
      formulaLatex: 'r_{ij} = \\frac{g_{ij} - \\min_i(g_{ij})}{\\max_i(g_{ij}) - \\min_i(g_{ij})}',
      matrix: matrixR,
      rowLabels: alternatives,
      colLabels: criteria,
    },
    {
      key: 'T',
      title: t('steps.step3.title'),
      description: t('steps.step3.description'),
      formulaLatex: 't_{ij} = w_j \\cdot r_{ij}',
      matrix: matrixT,
      rowLabels: alternatives,
      colLabels: criteria,
    },
    {
      key: 'ref',
      title: t('steps.step4.title'),
      description: t('steps.step4.description'),
      formulaLatex: 'PIS_j = \\max_i(t_{ij}),\\quad NIS_j = \\min_i(t_{ij})',
      matrix: [PIS, NIS],
      rowLabels: [t('matrix.label.pis'), t('matrix.label.nis')],
      colLabels: criteria,
    },
    {
      key: 'dist',
      title: t('steps.step5.title'),
      description: t('steps.step5.description'),
      formulaLatex:
        'd_{ib} = \\sqrt{\\sum_j (t_{ij} - PIS_j)^2},\\quad d_{iw} = \\sqrt{\\sum_j (t_{ij} - NIS_j)^2}',
      matrix: distances.map((d) => [d.d_ib, d.d_iw]),
      rowLabels: alternatives,
      colLabels: [t('steps.step5.colPIS'), t('steps.step5.colNIS')],
    },
    {
      key: 'scores',
      title: t('steps.step6.title'),
      description: t('steps.step6.description'),
      formulaLatex: 'S_{iw} = \\frac{d_{iw}}{d_{iw} + d_{ib}}',
      matrix: distances.map((d) => [d.score]),
      rowLabels: alternatives,
      colLabels: [t('matrix.label.siw')],
    },
  ];

  return (
    <div className={styles.container}>
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
                  formulaLatex={item.formulaLatex}
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
