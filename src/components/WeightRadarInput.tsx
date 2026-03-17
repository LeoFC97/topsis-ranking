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
import styles from './WeightRadarInput.module.css';

const TOTAL = 100; // Soma fixa (equivale a 1 quando normalizado)

export interface WeightRadarInputProps {
  data: ParsedData | null;
  weights: number[];
  onWeightsChange: (weights: number[]) => void;
  disabled?: boolean;
}

/**
 * Redistribui os pesos mantendo soma = TOTAL.
 * Quando o usuário move o slider i para newVal, os outros são ajustados proporcionalmente.
 */
function redistributeWeights(
  current: number[],
  index: number,
  newVal: number
): number[] {
  const n = current.length;
  const clamped = Math.max(0, Math.min(TOTAL, newVal));

  if (n === 1) return [TOTAL];

  const rest = TOTAL - clamped;
  if (rest <= 0) {
    const out = current.map(() => 0);
    out[index] = TOTAL;
    return out;
  }

  const currentRest = current.filter((_, i) => i !== index).reduce((a, b) => a + b, 0);
  const out = [...current];
  out[index] = clamped;

  if (currentRest <= 0) {
    const each = rest / (n - 1);
    for (let i = 0; i < n; i++) {
      if (i !== index) out[i] = each;
    }
  } else {
    for (let i = 0; i < n; i++) {
      if (i !== index) {
        out[i] = (current[i] / currentRest) * rest;
      }
    }
  }

  const sum = out.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - TOTAL) > 0.01) {
    let diff = TOTAL - sum;
    for (let i = 0; i < n && Math.abs(diff) > 0.001; i++) {
      if (i !== index) {
        const adjust = diff > 0 ? Math.min(diff, 0.5) : Math.max(diff, -0.5);
        out[i] += adjust;
        out[i] = Math.max(0, out[i]);
        diff -= adjust;
      }
    }
    out[index] = TOTAL - out.reduce((a, b, i) => (i === index ? a : a + b), 0);
  }

  return out;
}

export function WeightRadarInput({
  data,
  weights,
  onWeightsChange,
  disabled = false,
}: WeightRadarInputProps) {
  const chartData = useMemo(() => {
    if (!data || data.criteria.length === 0) return [];
    const criteria = data.criteria;
    let currentWeights =
      weights.length === criteria.length
        ? [...weights]
        : criteria.map(() => TOTAL / criteria.length);

    const sum = currentWeights.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - TOTAL) > 0.01 && sum > 0) {
      currentWeights = currentWeights.map((w) => (w / sum) * TOTAL);
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
        : data.criteria.map(() => TOTAL / data.criteria.length);
    const sum = w.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - TOTAL) > 0.01 && sum > 0) {
      w = w.map((v) => (v / sum) * TOTAL);
    }
    return w;
  }, [data, weights, chartData.length]);

  // Sincroniza pesos quando vêm de outra fonte (ex: Sliders) e não somam TOTAL
  useEffect(() => {
    if (!data || data.criteria.length < 3) return;
    const n = data.criteria.length;
    const w =
      weights.length === n
        ? [...weights]
        : data.criteria.map(() => TOTAL / n);
    const sum = w.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - TOTAL) > 0.01 && sum > 0) {
      const normalized = w.map((v) => (v / sum) * TOTAL);
      onWeightsChange(normalized);
    }
  }, [data, weights, onWeightsChange]);

  const handleSliderChange = (index: number, value: number) => {
    if (!data) return;
    const newWeights = redistributeWeights(currentWeights, index, value);
    onWeightsChange(newWeights);
  };

  const sumDisplay = currentWeights.reduce((a, b) => a + b, 0);

  // Domain dinâmico: "zoom" no intervalo dos dados para destacar diferenças
  const radarDomainMax = useMemo(() => {
    if (currentWeights.length === 0) return TOTAL;
    const max = Math.max(...currentWeights);
    return Math.max(15, Math.ceil(max * 1.2));
  }, [currentWeights]);

  if (!data || data.criteria.length < 3) {
    return null;
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Distribuir pontos no radar</h2>
      <p className={styles.subtitle}>
        Ajuste os sliders. A soma é sempre {TOTAL} (1 quando normalizado).
      </p>
      <div className={styles.wrapper}>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={chartData} margin={{ top: 24, right: 24, bottom: 24, left: 24 }}>
              <defs>
                <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
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
                name="Pesos"
                dataKey="value"
                stroke="#ef4444"
                fill="url(#radarFill)"
                strokeWidth={2}
                dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0] || !data) return null;
                  const d = payload[0].payload;
                  return (
                    <div className={styles.tooltip}>
                      <span>{d.fullCriterion}</span>
                      <span className={styles.tooltipValue}>
                        {d.value.toFixed(1)} → {(d.value / TOTAL).toFixed(2)} normalizado
                      </span>
                    </div>
                  );
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
          {radarDomainMax < TOTAL && (
            <p className={styles.scaleHint}>
              Escala ajustada: 0–{radarDomainMax} (para destacar diferenças)
            </p>
          )}
        </div>
        <div className={styles.sliders}>
          {chartData.map((d) => (
            <div key={d.index} className={styles.sliderRow}>
              <label className={styles.sliderLabel} htmlFor={`radar-slider-${d.index}`}>
                {d.fullCriterion}
              </label>
              <div className={styles.sliderWrap}>
                <input
                  id={`radar-slider-${d.index}`}
                  type="range"
                  min={0}
                  max={TOTAL}
                  step={0.5}
                  value={d.value}
                  onChange={(e) => handleSliderChange(d.index, Number(e.target.value))}
                  disabled={disabled}
                  className={styles.slider}
                />
                <span className={styles.sliderValue}>
                  <span className={styles.sliderRaw}>{d.value.toFixed(0)}</span>
                  <span className={styles.sliderNorm}>{(d.value / TOTAL).toFixed(2)}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className={styles.sum}>
        Soma total: {sumDisplay.toFixed(1)} ✓
      </p>
    </section>
  );
}
