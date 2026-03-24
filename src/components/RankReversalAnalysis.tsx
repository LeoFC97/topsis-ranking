import { useState, useMemo } from 'react';
import { topsis } from '../lib/topsis';
import type { TopsisData, TopsisFullResult, TopsisResult } from '../types';
import styles from './RankReversalAnalysis.module.css';
import { useI18n } from '../i18n';

export interface RankReversalAnalysisProps {
  data: TopsisData;
  fullResult: TopsisFullResult;
  weights: number[];
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
}: RankReversalAnalysisProps) {
  const { t } = useI18n();
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
    const newResult = topsis(reducedData, normalizedWeights);

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
      <h2 className={styles.title}>{t('rr.title')}</h2>
      <p className={styles.intro}>
        {t('rr.intro')}
      </p>

      <div className={styles.controls}>
        <p className={styles.controlLabel}>{t('rr.select')}</p>
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
          {t('rr.button')}
        </button>
      </div>

      {analysisResult !== null && (
        <div className={styles.results}>
          <h3 className={styles.resultsTitle}>{t('rr.compare')}</h3>
          {analysisResult.length === 0 ? (
            <p className={styles.hint}>{t('rr.notEnough')}</p>
          ) : (
            <>
              {reversalCount > 0 && (
                <p className={styles.summary}>
                  <strong>{reversalCount}</strong> {t('rr.reversalCount')}
                </p>
              )}
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t('rr.col.alt')}</th>
                      <th>{t('rr.col.rankOld')}</th>
                      <th>{t('rr.col.rankNew')}</th>
                      <th>{t('rr.col.change')}</th>
                      <th>{t('rr.col.scoreOld')}</th>
                      <th>{t('rr.col.scoreNew')}</th>
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
