import type {
  TopsisData,
  TopsisResult,
  TopsisFullResult,
  CriterionDirection,
  NormalizationMethod,
  TopsisComputeOptions,
} from '../types';

/** Garante um vetor de direções (benefício/custo) por critério. */
export function ensureDirections(data: TopsisData): CriterionDirection[] {
  const n = data.criteria.length;
  const d = data.directions;
  if (d && d.length === n) {
    return d.map((x) => (x === 'cost' ? 'cost' : 'benefit'));
  }
  return Array.from({ length: n }, () => 'benefit' as CriterionDirection);
}

function minMaxNormalize(matrix: number[][]): number[][] {
  const m = matrix.length;
  const n = matrix[0]?.length ?? 0;
  const mins = Array.from({ length: n }, (_, j) => Math.min(...matrix.map((row) => row[j])));
  const maxs = Array.from({ length: n }, (_, j) => Math.max(...matrix.map((row) => row[j])));

  const R: number[][] = [];
  for (let i = 0; i < m; i++) {
    R.push([]);
    for (let j = 0; j < n; j++) {
      const denom = maxs[j] - mins[j];
      R[i][j] = denom > 0 ? (matrix[i][j] - mins[j]) / denom : 0;
    }
  }
  return R;
}

/** Normalização vetorial (Hwang & Yoon): r_ij = x_ij / sqrt(sum_i x_ij^2). */
function vectorNormalize(matrix: number[][]): number[][] {
  const m = matrix.length;
  const n = matrix[0]?.length ?? 0;
  const norms = Array.from({ length: n }, (_, j) => {
    let s = 0;
    for (let i = 0; i < m; i++) s += matrix[i][j] * matrix[i][j];
    return Math.sqrt(s);
  });

  const R: number[][] = [];
  for (let i = 0; i < m; i++) {
    R.push([]);
    for (let j = 0; j < n; j++) {
      R[i][j] = norms[j] > 0 ? matrix[i][j] / norms[j] : 0;
    }
  }
  return R;
}

function normalizeMatrix(matrix: number[][], method: NormalizationMethod): number[][] {
  return method === 'vector' ? vectorNormalize(matrix) : minMaxNormalize(matrix);
}

function computePISNIS(
  T: number[][],
  directions: CriterionDirection[]
): { PIS: number[]; NIS: number[] } {
  const n = directions.length;
  const PIS: number[] = [];
  const NIS: number[] = [];
  for (let j = 0; j < n; j++) {
    const col = T.map((row) => row[j]);
    if (directions[j] === 'benefit') {
      PIS.push(Math.max(...col));
      NIS.push(Math.min(...col));
    } else {
      PIS.push(Math.min(...col));
      NIS.push(Math.max(...col));
    }
  }
  return { PIS, NIS };
}

/** VPL/DPL por defeito: benefício — VPL no mínimo da coluna e DPL no máximo; custo — o simétrico. */
export function defaultDplVplValues(data: TopsisData): { dpl: number[]; vpl: number[] } {
  const n = data.criteria.length;
  const dirs = ensureDirections(data);
  const vpl = Array.from({ length: n }, (_, j) => {
    const col = data.matrix.map((row) => row[j]);
    return dirs[j] === 'benefit' ? Math.min(...col) : Math.max(...col);
  });
  const dpl = Array.from({ length: n }, (_, j) => {
    const col = data.matrix.map((row) => row[j]);
    return dirs[j] === 'benefit' ? Math.max(...col) : Math.min(...col);
  });
  return { dpl, vpl };
}

/**
 * TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution)
 * Based on Hwang & Yoon (1981)
 *
 * `options`: normalização (Min–Max ou vetorial) e direção por critério (benefício/custo).
 */
export function topsis(
  data: TopsisData,
  weights: number[],
  options?: Partial<TopsisComputeOptions>
): TopsisFullResult {
  const directions = options?.directions ?? ensureDirections(data);
  const normalization = options?.normalization ?? 'minmax';
  const compute: TopsisComputeOptions = { normalization, directions };

  const { alternatives, criteria, matrix } = data;
  const m = matrix.length;
  const n = matrix[0].length;

  const sumW = weights.reduce((a, b) => a + b, 0);
  const w = sumW > 0 ? weights.map((v) => v / sumW) : weights.map(() => 1 / n);

  const R = normalizeMatrix(matrix, normalization);
  const T: number[][] = R.map((row) => row.map((r, j) => r * w[j]));
  const { PIS, NIS } = computePISNIS(T, directions);

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

  results.sort((a, b) => b.score - a.score);
  results.forEach((r, i) => {
    r.rank = i + 1;
  });

  return {
    ranking: results,
    alternatives,
    criteria,
    compute,
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
 * TOPSIS-RAD: VPL filtra alternativas; DPL constrói matriz C antes da normalização.
 * Compatível com o apêndice: comparações VPL/DPL dependem de benefício vs custo.
 */
export function topsisRad(
  data: TopsisData,
  weights: number[],
  dpl: number[],
  vpl: number[],
  options?: Partial<TopsisComputeOptions>
): TopsisFullResult {
  const directions = options?.directions ?? ensureDirections(data);
  const normalization = options?.normalization ?? 'minmax';
  const compute: TopsisComputeOptions = { normalization, directions };

  const { alternatives, criteria, matrix } = data;
  const n = matrix[0].length;

  const qualifiedIdx: number[] = [];
  const excludedAlternatives: string[] = [];
  for (let i = 0; i < matrix.length; i++) {
    let qualified = true;
    for (let j = 0; j < n; j++) {
      const ok =
        directions[j] === 'benefit'
          ? matrix[i][j] >= vpl[j]
          : matrix[i][j] <= vpl[j];
      if (!ok) {
        qualified = false;
        excludedAlternatives.push(alternatives[i]);
        break;
      }
    }
    if (qualified) qualifiedIdx.push(i);
  }

  const qualifiedAlternatives = qualifiedIdx.map((i) => alternatives[i]);
  const qualifiedMatrix = qualifiedIdx.map((i) => matrix[i].map((v) => v));

  const sumW0 = weights.reduce((a, b) => a + b, 0);
  const w0 = sumW0 > 0 ? weights.map((v) => v / sumW0) : weights.map(() => 1 / n);

  if (qualifiedMatrix.length === 0) {
    return {
      ranking: [],
      alternatives: qualifiedAlternatives,
      criteria,
      compute,
      isRad: true,
      excludedAlternatives,
      steps: {
        weights: w0,
        matrixG: [],
        matrixR: [],
        matrixT: [],
        PIS: [],
        NIS: [],
        distances: [],
      },
    };
  }

  const C: number[][] = qualifiedMatrix.map((row) =>
    row.map((val, j) =>
      directions[j] === 'benefit'
        ? Math.min(val, dpl[j])
        : Math.max(val, dpl[j])
    )
  );

  const m = C.length;

  const sumW = weights.reduce((a, b) => a + b, 0);
  const w = sumW > 0 ? weights.map((v) => v / sumW) : weights.map(() => 1 / n);

  const R = normalizeMatrix(C, normalization);
  const T: number[][] = R.map((row) => row.map((r, j) => r * w[j]));
  const { PIS, NIS } = computePISNIS(T, directions);

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
    compute,
    isRad: true,
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
