import { useState } from 'react';
import { MatrixViewer } from './MatrixViewer';
import type { TopsisFullResult } from '../types';
import styles from './TopsisStepsView.module.css';

interface TopsisStepsViewProps {
  result: TopsisFullResult;
}

export function TopsisStepsView({ result }: TopsisStepsViewProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  const { steps, alternatives, criteria } = result;
  const { matrixG, matrixR, matrixT, weights, PIS, NIS, distances } = steps;

  const stepItems = [
    {
      key: 'G',
      title: 'Step 1: Matriz de decisão (G)',
      description: 'Dados originais: desempenho de cada alternativa em cada critério.',
      matrix: matrixG,
      rowLabels: alternatives,
      colLabels: criteria,
    },
    {
      key: 'weights',
      title: 'Pesos normalizados (W)',
      description: 'Soma = 1. Cada critério tem peso w_j.',
      matrix: [weights],
      rowLabels: ['w'],
      colLabels: criteria,
    },
    {
      key: 'R',
      title: 'Step 2: Matriz normalizada (R)',
      description: 'r_ij = g_ij / √(Σᵢ g²ᵢⱼ). Normalização vetorial de Hwang.',
      matrix: matrixR,
      rowLabels: alternatives,
      colLabels: criteria,
    },
    {
      key: 'T',
      title: 'Step 3: Matriz ponderada (T)',
      description: 't_ij = w_j · r_ij.',
      matrix: matrixT,
      rowLabels: alternatives,
      colLabels: criteria,
    },
    {
      key: 'ref',
      title: 'Step 4: Referências PIS e NIS',
      description: 'PIS = max por coluna (benefício), NIS = min por coluna.',
      matrix: [PIS, NIS],
      rowLabels: ['PIS', 'NIS'],
      colLabels: criteria,
    },
    {
      key: 'dist',
      title: 'Step 5: Distâncias (d_ib, d_iw)',
      description: 'd_ib = distância ao PIS, d_iw = distância ao NIS.',
      matrix: distances.map((d) => [d.d_ib, d.d_iw]),
      rowLabels: alternatives,
      colLabels: ['d_ib (PIS)', 'd_iw (NIS)'],
    },
    {
      key: 'scores',
      title: 'Step 6: Scores (S_iw)',
      description: 'S_iw = d_iw / (d_iw + d_ib). Maior score = melhor ranking.',
      matrix: distances.map((d) => [d.score]),
      rowLabels: alternatives,
      colLabels: ['S_iw'],
    },
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.mainTitle}>Matrizes intermediárias</h2>

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
