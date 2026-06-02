/** Fórmulas KaTeX partilhadas entre matrizes e modo didático. */
export const LATEX_R_MINMAX =
  'r_{ij} = \\frac{g_{ij} - \\min_i(g_{ij})}{\\max_i(g_{ij}) - \\min_i(g_{ij})}';

export const LATEX_R_VECTOR =
  'r_{ij} = \\frac{g_{ij}}{\\sqrt{\\sum_{i=1}^{m} g_{ij}^2}}';

export const LATEX_R_RAD =
  'r_{ij} = \\frac{c_{ij} - VPL_j}{DPL_j - VPL_j},\\quad c_{ij} = \\min(g_{ij},\\, DPL_j)';

export const LATEX_PIS_NIS_BENEFIT_ONLY =
  'PIS_j = \\max_i(t_{ij}),\\quad NIS_j = \\min_i(t_{ij})';
export const LATEX_DPL_VPL_BENEFIT_ONLY =
  'DNL_j = \\max_i(t_{ij}),\\quad VNL_j = \\min_i(t_{ij})';
