/** Escala de pesos na UI (radar / sliders com travas): soma fixa. */
export const WEIGHT_TOTAL = 100;

/**
 * Redistribui pesos mantendo soma = WEIGHT_TOTAL.
 * Índices com `locks[j] === true` mantêm `current[j]` (exceto ao mover `index`, que deve estar desbloqueado).
 */
export function redistributeWeightsWithLocks(
  current: number[],
  index: number,
  newVal: number,
  locks: boolean[]
): number[] {
  const n = current.length;
  if (n === 0) return [];
  if (n === 1) return [WEIGHT_TOTAL];
  if (locks[index]) return [...current];

  const clamped = Math.max(0, Math.min(WEIGHT_TOTAL, newVal));

  const sumLockedOther = current.reduce(
    (s, w, j) => s + (locks[j] && j !== index ? w : 0),
    0
  );
  const maxForIndex = Math.max(0, WEIGHT_TOTAL - sumLockedOther);
  const newW = Math.min(clamped, maxForIndex);

  const unlockedOthers: number[] = [];
  for (let j = 0; j < n; j++) {
    if (j !== index && !locks[j]) unlockedOthers.push(j);
  }

  const out = [...current];
  out[index] = newW;

  for (let j = 0; j < n; j++) {
    if (locks[j] && j !== index) out[j] = current[j];
  }

  if (unlockedOthers.length === 0) {
    out[index] = WEIGHT_TOTAL - sumLockedOther;
    return out;
  }

  const rest = WEIGHT_TOTAL - sumLockedOther - newW;
  const currentRestSum = unlockedOthers.reduce((s, j) => s + current[j], 0);

  if (currentRestSum <= 0) {
    const each = rest / unlockedOthers.length;
    for (const j of unlockedOthers) out[j] = each;
  } else {
    for (const j of unlockedOthers) {
      out[j] = (current[j] / currentRestSum) * rest;
    }
  }

  let sum = out.reduce((a, b) => a + b, 0);
  let diff = WEIGHT_TOTAL - sum;
  if (Math.abs(diff) > 0.01) {
    for (let i = 0; i < n && Math.abs(diff) > 0.001; i++) {
      if (i !== index && !locks[i]) {
        const adjust = diff > 0 ? Math.min(diff, 0.5) : Math.max(diff, -0.5);
        out[i] += adjust;
        out[i] = Math.max(0, out[i]);
        diff -= adjust;
      }
    }
    out[index] = WEIGHT_TOTAL - out.reduce((a, b, i) => (i === index ? a : a + b), 0);
  }

  return out;
}

export function redistributeWeights(
  current: number[],
  index: number,
  newVal: number
): number[] {
  return redistributeWeightsWithLocks(current, index, newVal, current.map(() => false));
}

export function normalizeWeightsToTotal(weights: number[], total: number): number[] {
  const n = weights.length;
  if (n === 0) return [];
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum <= 0) return weights.map(() => total / n);
  return weights.map((w) => (w / sum) * total);
}
