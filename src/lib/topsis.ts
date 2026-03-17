import type { TopsisData, TopsisResult, TopsisFullResult } from '../types';

/**
 * TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution)
 * Based on Hwang & Yoon (1981)
 *
 * Returns full result with intermediate matrices for visualization.
 */
export function topsis(data: TopsisData, weights: number[]): TopsisFullResult {
  const { alternatives, criteria, matrix } = data;
  const m = matrix.length;
  const n = matrix[0].length;

  // Normalize weights (sum = 1)
  const sumW = weights.reduce((a, b) => a + b, 0);
  const w = sumW > 0 ? weights.map((v) => v / sumW) : weights.map(() => 1 / n);

  // Step 1: Normalize R (r_ij = g_ij / sqrt(sum_i g_ij^2))
  const R: number[][] = [];
  for (let i = 0; i < m; i++) {
    R.push([]);
    for (let j = 0; j < n; j++) {
      const colSum = matrix.reduce((s, row) => s + row[j] * row[j], 0);
      const denom = Math.sqrt(colSum);
      R[i][j] = denom > 0 ? matrix[i][j] / denom : 0;
    }
  }

  // Step 2: Weighted T (t_ij = w_j * r_ij)
  const T: number[][] = R.map((row) => row.map((r, j) => r * w[j]));

  // Step 3: PIS and NIS (benefit criteria p_j=1: max=best, min=worst)
  const PIS: number[] = [];
  const NIS: number[] = [];
  for (let j = 0; j < n; j++) {
    const col = T.map((row) => row[j]);
    PIS.push(Math.max(...col));
    NIS.push(Math.min(...col));
  }

  // Step 4 & 5: Distances and scores
  const distances: { d_ib: number; d_iw: number; score: number }[] = [];
  const results: TopsisResult[] = [];
  for (let i = 0; i < m; i++) {
    let d_ib = 0;
    let d_iw = 0;
    for (let j = 0; j < n; j++) {
      d_ib += (T[i][j] - PIS[j]) ** 2;
      d_iw += (T[i][j] - NIS[j]) ** 2;
    }
    d_ib = Math.sqrt(d_ib);
    d_iw = Math.sqrt(d_iw);
    const score = d_ib + d_iw > 0 ? d_iw / (d_iw + d_ib) : 0;
    distances.push({ d_ib, d_iw, score });
    results.push({ alternative: alternatives[i], score, rank: 0 });
  }

  // Step 6: Rank by score descending
  results.sort((a, b) => b.score - a.score);
  results.forEach((r, i) => {
    r.rank = i + 1;
  });

  return {
    ranking: results,
    alternatives,
    criteria,
    steps: {
      weights: w,
      matrixG: matrix.map((row) => [...row]),
      matrixR: R.map((row) => [...row]),
      matrixT: T.map((row) => [...row]),
      PIS: [...PIS],
      NIS: [...NIS],
      distances,
    },
  };
}

/**
 * TOPSIS-RAD: variante que mitiga outliers usando DPL e UPL.
 * DPL (Desired Performance Levels): limita valores acima do desejado.
 * UPL (Unaccepted Performance Levels): exclui alternativas abaixo do mínimo.
 * Ref: artigo TOPSIS-RAD.
 */
export function topsisRad(
  data: TopsisData,
  weights: number[],
  dpl: number[],
  upl: number[]
): TopsisFullResult {
  const { alternatives, criteria, matrix } = data;
  const n = matrix[0].length;

  // Step 3*.i: Filtrar alternativas qualificadas (a_ij >= u_j para todo j)
  const qualifiedIdx: number[] = [];
  const excludedAlternatives: string[] = [];
  for (let i = 0; i < matrix.length; i++) {
    let qualified = true;
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] < upl[j]) {
        qualified = false;
        excludedAlternatives.push(alternatives[i]);
        break;
      }
    }
    if (qualified) qualifiedIdx.push(i);
  }

  const qualifiedAlternatives = qualifiedIdx.map((i) => alternatives[i]);
  const qualifiedMatrix = qualifiedIdx.map((i) => matrix[i].map((v) => v));

  if (qualifiedMatrix.length === 0) {
    return {
      ranking: [],
      alternatives: qualifiedAlternatives,
      criteria,
      steps: {
        weights: weights.map((w) => w / weights.reduce((a, b) => a + b, 0)),
        matrixG: [],
        matrixR: [],
        matrixT: [],
        PIS: [],
        NIS: [],
        distances: [],
      },
      excludedAlternatives,
    };
  }

  // Step 3*.ii: Construir matriz C (cap em DPL: se x_ij >= d_j então c_ij = d_j)
  const C: number[][] = qualifiedMatrix.map((row) =>
    row.map((val, j) => (val >= dpl[j] ? dpl[j] : val))
  );

  const m = C.length;

  // Normalize weights
  const sumW = weights.reduce((a, b) => a + b, 0);
  const w = sumW > 0 ? weights.map((v) => v / sumW) : weights.map(() => 1 / n);

  // Step 4: Normalize C -> R
  const R: number[][] = [];
  for (let i = 0; i < m; i++) {
    R.push([]);
    for (let j = 0; j < n; j++) {
      const colSum = C.reduce((s, row) => s + row[j] * row[j], 0);
      const denom = Math.sqrt(colSum);
      R[i][j] = denom > 0 ? C[i][j] / denom : 0;
    }
  }

  // Step 5: Weighted T
  const T: number[][] = R.map((row) => row.map((r, j) => r * w[j]));

  // Step 6: PIS and NIS
  const PIS: number[] = [];
  const NIS: number[] = [];
  for (let j = 0; j < n; j++) {
    const col = T.map((row) => row[j]);
    PIS.push(Math.max(...col));
    NIS.push(Math.min(...col));
  }

  // Step 7 & 8: Distances and scores
  const distances: { d_ib: number; d_iw: number; score: number }[] = [];
  const results: TopsisResult[] = [];
  for (let i = 0; i < m; i++) {
    let d_ib = 0;
    let d_iw = 0;
    for (let j = 0; j < n; j++) {
      d_ib += (T[i][j] - PIS[j]) ** 2;
      d_iw += (T[i][j] - NIS[j]) ** 2;
    }
    d_ib = Math.sqrt(d_ib);
    d_iw = Math.sqrt(d_iw);
    const score = d_ib + d_iw > 0 ? d_iw / (d_iw + d_ib) : 0;
    distances.push({ d_ib, d_iw, score });
    results.push({ alternative: qualifiedAlternatives[i], score, rank: 0 });
  }

  results.sort((a, b) => b.score - a.score);
  results.forEach((r, i) => {
    r.rank = i + 1;
  });

  return {
    ranking: results,
    alternatives: qualifiedAlternatives,
    criteria,
    steps: {
      weights: w,
      matrixG: C.map((row) => [...row]),
      matrixR: R.map((row) => [...row]),
      matrixT: T.map((row) => [...row]),
      PIS: [...PIS],
      NIS: [...NIS],
      distances,
    },
    excludedAlternatives: excludedAlternatives.length > 0 ? excludedAlternatives : undefined,
  };
}
