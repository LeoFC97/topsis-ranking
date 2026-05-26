export type CriterionDirection = 'benefit' | 'cost';

/** Min–Max (interactive matrices) vs vetorial \(r_{ij}=x_{ij}/\sqrt{\sum x_{ij}^2}\) como no apêndice Hwang */
export type NormalizationMethod = 'minmax' | 'vector';

export interface TopsisData {
  alternatives: string[];
  criteria: string[];
  matrix: number[][];
  /** Por critério: benefício (maior melhor) ou custo (menor melhor). Omisso = todos benefício. */
  directions?: CriterionDirection[];
}

export type ParsedData = TopsisData;

export interface TopsisResult {
  alternative: string;
  score: number;
  rank: number;
}

/** Alias for TopsisResult used in ranking table */
export type RankedAlternative = TopsisResult;

export interface TopsisComputeOptions {
  normalization: NormalizationMethod;
  directions: CriterionDirection[];
}

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
  /** Alternativas excluídas por VPL (TOPSIS-RAD) */
  excludedAlternatives?: string[];
  /** Indica se foi usado TOPSIS-RAD */
  isRad?: boolean;
  /** Opções usadas neste cálculo (para UI / reprodutibilidade) */
  compute?: TopsisComputeOptions;
}
