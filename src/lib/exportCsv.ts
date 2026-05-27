import type { TopsisData, TopsisResult } from '../types';

/**
 * Exports TopsisData to a CSV string compatible with parseCsvToTopsis.
 */
export function exportDatasetToCsv(data: TopsisData): string {
  const header = ['alternativa', ...data.criteria].join(',');
  const rows = data.alternatives.map((alt, i) =>
    [`"${alt}"`, ...data.matrix[i].map(String)].join(',')
  );
  return [header, ...rows].join('\n');
}

/**
 * Exports ranking to CSV string.
 */
export function exportRankingToCsv(
  ranking: TopsisResult[],
  headers: { position: string; alternative: string; score: string } = {
    position: 'Position',
    alternative: 'Alternative',
    score: 'Score',
  }
): string {
  const header = `${headers.position},${headers.alternative},${headers.score}`;
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
