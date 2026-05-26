import { useMemo, useState } from 'react';
import { MatrixViewer } from './MatrixViewer';
import type { TopsisFullResult } from '../types';
import { LATEX_DPL_VPL_BENEFIT_ONLY, LATEX_PIS_NIS_BENEFIT_ONLY, LATEX_R_MINMAX, LATEX_R_VECTOR } from '../lib/topsisLatex';
import styles from './TopsisStepsView.module.css';
import { useI18n } from '../i18n';

interface TopsisStepsViewProps {
  result: TopsisFullResult;
  method: 'topsis' | 'rad';
}

export function TopsisStepsView({ result, method }: TopsisStepsViewProps) {
  const { t } = useI18n();
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  const isVector = result.compute?.normalization === 'vector';
  const hasCost = result.compute?.directions.some((d) => d === 'cost') ?? false;

  const { steps, alternatives, criteria } = result;
  const { matrixG, matrixR, matrixT, weights, PIS, NIS, distances } = steps;

  const stepItems = useMemo(() => {
    const rDesc = isVector ? t('steps.step2.descriptionVector') : t('steps.step2.description');
    const rFormula = isVector ? LATEX_R_VECTOR : LATEX_R_MINMAX;
    const refDesc = hasCost
      ? (method === 'rad' ? t('steps.step4.descriptionMixedRad') : t('steps.step4.descriptionMixed'))
      : (method === 'rad' ? t('steps.step4.descriptionRad') : t('steps.step4.description'));
    const refFormula = hasCost ? undefined : (method === 'rad' ? LATEX_DPL_VPL_BENEFIT_ONLY : LATEX_PIS_NIS_BENEFIT_ONLY);

    return [
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
        description: rDesc,
        formulaLatex: rFormula,
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
        title: method === 'rad' ? t('steps.step4.titleRad') : t('steps.step4.title'),
        description: refDesc,
        formulaLatex: refFormula,
        matrix: [PIS, NIS],
        rowLabels: method === 'rad'
          ? [t('rad.method.dpl'), t('rad.method.vpl')]
          : [t('matrix.label.pis'), t('matrix.label.nis')],
        colLabels: criteria,
      },
      {
        key: 'dist',
        title: t('steps.step5.title'),
        description: method === 'rad' ? t('steps.step5.descriptionRad') : t('steps.step5.description'),
        formulaLatex: method === 'rad'
          ? 'd_{ib} = \\sqrt{\\sum_j (t_{ij} - DNL_j)^2},\\quad d_{iw} = \\sqrt{\\sum_j (t_{ij} - VNL_j)^2}'
          : 'd_{ib} = \\sqrt{\\sum_j (t_{ij} - PIS_j)^2},\\quad d_{iw} = \\sqrt{\\sum_j (t_{ij} - NIS_j)^2}',
        matrix: distances.map((d) => [d.d_ib, d.d_iw]),
        rowLabels: alternatives,
        colLabels: method === 'rad'
          ? [t('steps.step5.colDNL'), t('steps.step5.colVNL')]
          : [t('steps.step5.colPIS'), t('steps.step5.colNIS')],
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
  }, [
    method,
    t,
    isVector,
    hasCost,
    alternatives,
    criteria,
    matrixG,
    matrixR,
    matrixT,
    weights,
    PIS,
    NIS,
    distances,
  ]);

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
              <span className={styles.stepNumber}>{index + 1}</span>
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
