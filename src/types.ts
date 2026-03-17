export interface TopsisData {
  alternatives: string[];
  criteria: string[];
  matrix: number[][];
}

export type ParsedData = TopsisData;

export interface TopsisResult {
  alternative: string;
  score: number;
  rank: number;
}

/** Alias for TopsisResult used in ranking table */
export type RankedAlternative = TopsisResult;

/** Intermediate matrices and vectors from TOPSIS algorithm */
export interface TopsisSteps {
  weights: number[];
  matrixG: number[][];
  matrixR: number[][];
  matrixT: number[][];
  PIS: number[];
  NIS: number[];
  distances: { d_ib: number; d_iw: number; score: number }[];
}

export interface TopsisFullResult {
  ranking: TopsisResult[];
  steps: TopsisSteps;
  alternatives: string[];
  criteria: string[];
  /** Alternativas excluídas por UPL (TOPSIS-RAD) */
  excludedAlternatives?: string[];
  /** Indica se foi usado TOPSIS-RAD */
  isRad?: boolean;
}

