import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useMemo, useEffect } from 'react';
import type { ParsedData } from '../types';
import {
  redistributeWeightsWithLocks,
  WEIGHT_TOTAL,
  normalizeWeightsToTotal,
} from '../lib/weightRedistribute';
import { WeightLockToggle } from './WeightLockToggle';
import styles from './WeightRadarInput.module.css';
import { useI18n } from '../i18n';

export interface WeightRadarInputProps {
  data: ParsedData | null;
  weights: number[];
  onWeightsChange: (weights: number[]) => void;
  weightLocks: boolean[];
  onWeightLocksChange: (locks: boolean[]) => void;
  disabled?: boolean;
}

export function WeightRadarInput({
  data,
  weights,
  onWeightsChange,
  weightLocks,
  onWeightLocksChange,
  disabled = false,
}: WeightRadarInputProps) {
  const { t } = useI18n();
  const chartData = useMemo(() => {
    if (!data || data.criteria.length === 0) return [];
    const criteria = data.criteria;
    let currentWeights =
      weights.length === criteria.length
        ? [...weights]
        : criteria.map(() => WEIGHT_TOTAL / criteria.length);

    const sum = currentWeights.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - WEIGHT_TOTAL) > 0.01 && sum > 0) {
      currentWeights = currentWeights.map((w) => (w / sum) * WEIGHT_TOTAL);
    }

    return criteria.map((c, i) => ({
      criterion: c.length > 12 ? c.slice(0, 12) + '…' : c,
      fullCriterion: c,
      value: currentWeights[i],
      index: i,
    }));
  }, [data, weights]);

  const currentWeights = useMemo(() => {
    if (!data || chartData.length === 0) return [];
    let w =
      weights.length === data.criteria.length
        ? [...weights]
        : data.criteria.map(() => WEIGHT_TOTAL / data.criteria.length);
    const sum = w.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - WEIGHT_TOTAL) > 0.01 && sum > 0) {
      w = w.map((v) => (v / sum) * WEIGHT_TOTAL);
    }
    return w;
  }, [data, weights, chartData.length]);

  const locksAligned = useMemo(
    () => (data ? data.criteria.map((_, i) => weightLocks[i] ?? false) : []),
    [data, weightLocks]
  );

  const unlockedCount = useMemo(
    () => locksAligned.filter((l) => !l).length,
    [locksAligned]
  );

  useEffect(() => {
    if (!data || data.criteria.length < 3) return;
    if (locksAligned.some(Boolean)) return;
    const n = data.criteria.length;
    const w =
      weights.length === n
        ? [...weights]
        : data.criteria.map(() => WEIGHT_TOTAL / n);
    const sum = w.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - WEIGHT_TOTAL) > 0.01 && sum > 0) {
      const normalized = w.map((v) => (v / sum) * WEIGHT_TOTAL);
      onWeightsChange(normalized);
    }
  }, [data, weights, locksAligned, onWeightsChange]);

  const handleSliderChange = (index: number, value: number) => {
    if (!data) return;
    if (locksAligned[index]) return;
    const newWeights = redistributeWeightsWithLocks(currentWeights, index, value, locksAligned);
    onWeightsChange(newWeights);
  };

  const handleToggleLock = (i: number) => {
    if (!data) return;
    if (locksAligned[i]) {
      onWeightLocksChange(locksAligned.map((l, j) => (j === i ? false : l)));
      return;
    }
    if (unlockedCount <= 1) return;
    const normalized = normalizeWeightsToTotal(currentWeights, WEIGHT_TOTAL);
    onWeightsChange(normalized);
    onWeightLocksChange(locksAligned.map((l, j) => (j === i ? true : l)));
  };

  const sumDisplay = currentWeights.reduce((a, b) => a + b, 0);

  const radarDomainMax = useMemo(() => {
    if (currentWeights.length === 0) return WEIGHT_TOTAL;
    const max = Math.max(...currentWeights);
    return Math.max(15, Math.ceil(max * 1.2));
  }, [currentWeights]);

  if (!data || data.criteria.length < 3) {
    return null;
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t('radar.title')}</h2>
      <p className={styles.subtitle}>
        {t('radar.subtitle')}
      </p>
      <p className={styles.lockIntro}>{t('weights.lockIntro')}</p>
      <div className={styles.wrapper}>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={chartData} margin={{ top: 24, right: 24, bottom: 24, left: 24 }}>
              <defs>
                <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fab219" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#fab219" stopOpacity={0.12} />
                </linearGradient>
              </defs>
              <PolarGrid stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
              <PolarAngleAxis
                dataKey="criterion"
                tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, radarDomainMax]}
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
              />
              <Radar
                name={t('weights.title')}
                dataKey="value"
                stroke="#fab219"
                fill="url(#radarFill)"
                strokeWidth={2}
                dot={{ r: 4, fill: '#fab219', strokeWidth: 0 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0] || !data) return null;
                  const d = payload[0].payload;
                  return (
                    <div className={styles.tooltip}>
                      <span>{d.fullCriterion}</span>
                      <span className={styles.tooltipValue}>
                        {d.value.toFixed(1)} → {(d.value / WEIGHT_TOTAL).toFixed(2)}{' '}
                        {t('radar.normalized')}
                      </span>
                    </div>
                  );
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
          {radarDomainMax < WEIGHT_TOTAL && (
            <p className={styles.scaleHint}>
              {t('radar.scaleAdjusted')}: 0–{radarDomainMax} {t('radar.scaleForDiff')}
            </p>
          )}
        </div>
        <div className={styles.sliders}>
          {chartData.map((d) => {
            const locked = locksAligned[d.index] ?? false;
            const sliderDisabled =
              disabled || locked || unlockedCount === 1;
            const cannotLockLast = !locked && unlockedCount <= 1;
            return (
              <div key={d.index} className={styles.sliderRow}>
                <div className={styles.sliderRowHeader}>
                  <WeightLockToggle
                    locked={locked}
                    disabled={disabled || cannotLockLast}
                    onToggle={() => handleToggleLock(d.index)}
                  />
                  <label className={styles.sliderLabel} htmlFor={`radar-slider-${d.index}`}>
                    {d.fullCriterion}
                  </label>
                </div>
                <div className={styles.sliderWrap}>
                  <input
                    id={`radar-slider-${d.index}`}
                    type="range"
                    min={0}
                    max={WEIGHT_TOTAL}
                    step={0.5}
                    value={d.value}
                    onChange={(e) => handleSliderChange(d.index, Number(e.target.value))}
                    disabled={sliderDisabled}
                    className={styles.slider}
                  />
                  <span className={styles.sliderValue}>
                    <span className={styles.sliderRaw}>{d.value.toFixed(0)}</span>
                    <span className={styles.sliderNorm}>{(d.value / WEIGHT_TOTAL).toFixed(2)}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className={styles.sum}>
        {t('radar.sum')}: {sumDisplay.toFixed(1)} ✓
      </p>
    </section>
  );
}
