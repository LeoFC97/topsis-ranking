import type { ParsedData } from '../types';
import {
  redistributeWeightsWithLocks,
  normalizeWeightsToTotal,
  WEIGHT_TOTAL,
} from '../lib/weightRedistribute';
import { WeightLockToggle } from './WeightLockToggle';
import styles from './WeightSliders.module.css';
import { useI18n } from '../i18n';
import { useMemo } from 'react';

export interface WeightSlidersProps {
  data: ParsedData | null;
  weights: number[];
  onWeightsChange: (weights: number[]) => void;
  weightLocks: boolean[];
  onWeightLocksChange: (locks: boolean[]) => void;
  disabled?: boolean;
}

export function WeightSliders({
  data,
  weights,
  onWeightsChange,
  weightLocks,
  onWeightLocksChange,
  disabled = false,
}: WeightSlidersProps) {
  const { t } = useI18n();
  if (!data || data.criteria.length === 0) {
    return null;
  }

  const criteria = data.criteria;
  const currentWeights = weights.length === criteria.length
    ? weights
    : criteria.map(() => WEIGHT_TOTAL / criteria.length);

  const locksAligned = useMemo(
    () => criteria.map((_, i) => weightLocks[i] ?? false),
    [criteria, weightLocks]
  );

  const unlockedCount = useMemo(
    () => locksAligned.filter((l) => !l).length,
    [locksAligned]
  );

  const sum = currentWeights.reduce((a, b) => a + b, 0);
  const normalizedWeights =
    sum > 0
      ? currentWeights.map((w) => w / sum)
      : currentWeights.map(() => 1 / criteria.length);

  const handleChange = (index: number, value: number) => {
    if (locksAligned[index]) return;
    if (locksAligned.some(Boolean)) {
      const newWeights = redistributeWeightsWithLocks(
        currentWeights,
        index,
        value,
        locksAligned
      );
      onWeightsChange(newWeights);
    } else {
      const newWeights = [...currentWeights];
      newWeights[index] = Math.max(0, Math.min(100, value));
      onWeightsChange(newWeights);
    }
  };

  const handleToggleLock = (i: number) => {
    if (locksAligned[i]) {
      onWeightLocksChange(locksAligned.map((l, j) => (j === i ? false : l)));
      return;
    }
    if (unlockedCount <= 1) return;
    const normalized = normalizeWeightsToTotal(currentWeights, WEIGHT_TOTAL);
    onWeightsChange(normalized);
    onWeightLocksChange(locksAligned.map((l, j) => (j === i ? true : l)));
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t('weights.title')}</h2>
      <p className={styles.subtitle}>
        {t('weights.subtitle')}
      </p>
      <p className={styles.lockIntro}>{t('weights.lockIntro')}</p>
      <div className={styles.grid}>
        {criteria.map((criterion, i) => {
          const locked = locksAligned[i];
          const sliderDisabled = disabled || locked || unlockedCount === 1;
          const cannotLockLast = !locked && unlockedCount <= 1;
          return (
            <div key={criterion} className={styles.item}>
              <div className={styles.itemHeader}>
                <WeightLockToggle
                  locked={locked}
                  disabled={disabled || cannotLockLast}
                  onToggle={() => handleToggleLock(i)}
                />
                <label className={styles.label} htmlFor={`weight-${i}`}>
                  {criterion}
                </label>
              </div>
              <div className={styles.sliderRow}>
                <input
                  id={`weight-${i}`}
                  type="range"
                  min={0}
                  max={100}
                  value={currentWeights[i]}
                  onChange={(e) => handleChange(i, Number(e.target.value))}
                  disabled={sliderDisabled}
                  className={styles.slider}
                />
                <span className={styles.value}>
                  {normalizedWeights[i].toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <p className={styles.sum}>
        {t('weights.sum')}: {normalizedWeights.reduce((a, b) => a + b, 0).toFixed(2)} ✓
      </p>
    </section>
  );
}
