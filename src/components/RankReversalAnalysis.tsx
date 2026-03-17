import { useState, useMemo } from 'react';
import { topsis, topsisRad } from '../lib/topsis';
import type { TopsisData, TopsisFullResult, TopsisResult } from '../types';
import type { DplUplValues } from './DplUplInput';
import styles from './RankReversalAnalysis.module.css';

export interface RankReversalAnalysisProps {
  data: TopsisData;
  fullResult: TopsisFullResult;
  weights: number[];
  dplUpl: DplUplValues | null;
}

interface RankChange {
  alternative: string;
  rankOriginal: number;
  rankNew: number;
  change: number;
  scoreOriginal: number;
  scoreNew: number;
}

export function RankReversalAnalysis({
  data,
  fullResult,
  weights,
  dplUpl,
}: RankReversalAnalysisProps) {
  const [selectedToRemove, setSelectedToRemove] = useState<Set<string>>(new Set());
  const [analysisResult, setAnalysisResult] = useState<RankChange[] | null>(null);

  const normalizedWeights = useMemo(() => {
    const w =
      weights.length === data.criteria.length
        ? weights
        : data.criteria.map(() => 100 / data.criteria.length);
    const sum = w.reduce((a, b) => a + b, 0);
    return sum > 0 ? w.map((v) => v / sum) : w.map(() => 1 / data.criteria.length);
  }, [data.criteria.length, weights]);

  const handleToggle = (alt: string) => {
    setSelectedToRemove((prev) => {
      const next = new Set(prev);
      if (next.has(alt)) next.delete(alt);
      else next.add(alt);
      return next;
    });
    setAnalysisResult(null);
  };

  const handleAnalyze = () => {
    if (selectedToRemove.size === 0) return;
    const removeSet = selectedToRemove;
    const keptIdx: number[] = [];
    data.alternatives.forEach((a, i) => {
      if (!removeSet.has(a)) keptIdx.push(i);
    });
    if (keptIdx.length < 2) {
      setAnalysisResult([]);
      return;
    }
    const reducedData: TopsisData = {
      alternatives: keptIdx.map((i) => data.alternatives[i]),
      criteria: data.criteria,
      matrix: keptIdx.map((i) => [...data.matrix[i]]),
    };
    const newResult = dplUpl
      ? topsisRad(reducedData, normalizedWeights, dplUpl.dpl, dplUpl.upl)
      : topsis(reducedData, normalizedWeights);

    const rankMapOriginal = new Map<string, TopsisResult>();
    fullResult.ranking.forEach((r) => rankMapOriginal.set(r.alternative, r));
    const rankMapNew = new Map<string, TopsisResult>();
    newResult.ranking.forEach((r) => rankMapNew.set(r.alternative, r));

    const changes: RankChange[] = [];
    newResult.ranking.forEach((r) => {
      const orig = rankMapOriginal.get(r.alternative);
      if (!orig) return;
      const change = r.rank - orig.rank;
      changes.push({
        alternative: r.alternative,
        rankOriginal: orig.rank,
        rankNew: r.rank,
        change,
        scoreOriginal: orig.score,
        scoreNew: r.score,
      });
    });
    setAnalysisResult(changes);
  };

  const reversalCount = analysisResult?.filter((c) => c.change !== 0).length ?? 0;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Análise de rank reversal</h2>
      <p className={styles.intro}>
        Simule a remoção de alternativas e veja como o ranking das demais é alterado. O fenômeno de
        rank reversal ocorre quando a ordem relativa muda ao alterar o conjunto de alternativas.
      </p>

      <div className={styles.controls}>
        <p className={styles.controlLabel}>Selecione alternativas para simular remoção:</p>
        <div className={styles.checkboxGrid}>
          {fullResult.ranking.map((r) => (
            <label key={r.alternative} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedToRemove.has(r.alternative)}
                onChange={() => handleToggle(r.alternative)}
              />
              <span>
                {r.alternative} <span className={styles.rankHint}>(#{r.rank})</span>
              </span>
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={selectedToRemove.size === 0}
          className={styles.analyzeBtn}
        >
          Analisar reversão de rank
        </button>
      </div>

      {analysisResult !== null && (
        <div className={styles.results}>
          <h3 className={styles.resultsTitle}>Comparação de ranks</h3>
          {analysisResult.length === 0 ? (
            <p className={styles.hint}>Poucas alternativas restantes para comparar (mín. 2).</p>
          ) : (
            <>
              {reversalCount > 0 && (
                <p className={styles.summary}>
                  <strong>{reversalCount}</strong> alternativa{reversalCount > 1 ? 's' : ''} com
                  reversão de rank.
                </p>
              )}
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Alternativa</th>
                      <th>Rank original</th>
                      <th>Rank novo</th>
                      <th>Variação</th>
                      <th>Score original</th>
                      <th>Score novo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisResult.map((c) => (
                      <tr
                        key={c.alternative}
                        className={c.change !== 0 ? styles.reversedRow : ''}
                      >
                        <td>{c.alternative}</td>
                        <td>{c.rankOriginal}</td>
                        <td>{c.rankNew}</td>
                        <td className={c.change !== 0 ? styles.changeCell : ''}>
                          {c.change > 0 ? `+${c.change}` : c.change}
                        </td>
                        <td>{c.scoreOriginal.toFixed(4)}</td>
                        <td>{c.scoreNew.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
