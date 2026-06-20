/**
 * Simple matrix export utilities for CSV and LaTeX formats
 */

/**
 * Download a file with given content
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export matrix to CSV format
 */
export function exportMatrixToCSV(
  matrix: number[][],
  rowLabels: string[],
  colLabels: string[],
  decimals: number = 4,
  filename: string = 'matrix.csv'
): void {
  // Header row with column labels
  const header = ['', ...colLabels].map(label => `"${label}"`).join(',');
  
  // Data rows
  const rows = matrix.map((row, i) => {
    const rowLabel = rowLabels[i] ?? `Row${i + 1}`;
    const values = row.map(val => val.toFixed(decimals));
    return [`"${rowLabel}"`, ...values].join(',');
  });
  
  const csv = [header, ...rows].join('\n');
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export matrix to LaTeX format (simple tabular)
 */
export function exportMatrixToLatex(
  matrix: number[][],
  rowLabels: string[],
  colLabels: string[],
  decimals: number = 4,
  filename: string = 'matrix.tex'
): void {
  const colSpec = 'l|' + 'r'.repeat(colLabels.length);
  
  let latex = '\\begin{table}[htbp]\n';
  latex += '\\centering\n';
  latex += `\\begin{tabular}{${colSpec}}\n`;
  latex += '\\hline\n';
  
  // Header row
  latex += ' & ' + colLabels.map(escapeLatex).join(' & ') + ' \\\\\n';
  latex += '\\hline\n';
  
  // Data rows
  matrix.forEach((row, i) => {
    const rowLabel = rowLabels[i] ?? `Row${i + 1}`;
    const values = row.map(val => val.toFixed(decimals));
    latex += escapeLatex(rowLabel) + ' & ' + values.join(' & ') + ' \\\\\n';
  });
  
  latex += '\\hline\n';
  latex += '\\end{tabular}\n';
  latex += '\\caption{Matrix}\n';
  latex += '\\label{tab:matrix}\n';
  latex += '\\end{table}\n';
  
  downloadFile(latex, filename, 'text/plain;charset=utf-8;');
}

/**
 * Escape special LaTeX characters
 */
function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/_/g, '\\_')
    .replace(/#/g, '\\#')
    .replace(/&/g, '\\&')
    .replace(/\$/g, '\\$')
    .replace(/%/g, '\\%')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}');
}
