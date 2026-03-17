import type { TopsisResult } from '../types';

/**
 * Exports ranking to CSV string.
 */
export function exportRankingToCsv(ranking: TopsisResult[]): string {
  const header = 'Posição,Alternativa,Score';
  const rows = ranking.map((r) => `${r.rank},"${r.alternative}",${r.score.toFixed(4)}`);
  return [header, ...rows].join('\n');
}

/**
 * Triggers download of a text file.
 */
export function downloadFile(content: string, filename: string, mimeType = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
