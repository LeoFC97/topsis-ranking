import type { ParsedData } from '../types';
import styles from './WeightSliders.module.css';

export interface WeightSlidersProps {
  data: ParsedData | null;
  weights: number[];
  onWeightsChange: (weights: number[]) => void;
  disabled?: boolean;
}

export function WeightSliders({
  data,
  weights,
  onWeightsChange,
  disabled = false,
}: WeightSlidersProps) {
  if (!data || data.criteria.length === 0) {
    return null;
  }

  const criteria = data.criteria;
  const currentWeights = weights.length === criteria.length
    ? weights
    : criteria.map(() => 100 / criteria.length);

  const sum = currentWeights.reduce((a, b) => a + b, 0);
  const normalizedWeights = sum > 0
    ? currentWeights.map((w) => w / sum)
    : currentWeights.map(() => 1 / criteria.length);

  const handleChange = (index: number, value: number) => {
    const newWeights = [...currentWeights];
    newWeights[index] = Math.max(0, Math.min(100, value));
    onWeightsChange(newWeights);
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>
        Pesos dos critérios
      </h2>
      <p className={styles.subtitle}>
        Ajuste os sliders (0–100). A soma é normalizada automaticamente.
      </p>
      <div className={styles.grid}>
        {criteria.map((criterion, i) => (
          <div key={criterion} className={styles.item}>
            <label className={styles.label} htmlFor={`weight-${i}`}>
              {criterion}
            </label>
            <div className={styles.sliderRow}>
              <input
                id={`weight-${i}`}
                type="range"
                min={0}
                max={100}
                value={currentWeights[i]}
                onChange={(e) => handleChange(i, Number(e.target.value))}
                disabled={disabled}
                className={styles.slider}
              />
              <span className={styles.value}>
                {normalizedWeights[i].toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className={styles.sum}>
        Soma total: {normalizedWeights.reduce((a, b) => a + b, 0).toFixed(2)} ✓
      </p>
    </section>
  );
}
