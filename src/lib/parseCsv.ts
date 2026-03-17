import Papa from 'papaparse';
import type { TopsisData } from '../types';

/**
 * Parses a CSV string into TopsisData.
 * Expected format: first row = headers (alternativa, c1, c2, ...), rows = data.
 */
export function parseCsvToTopsis(content: string): TopsisData | null {
  const parsed = Papa.parse<string[]>(content, { skipEmptyLines: true });

  if (!parsed.data || parsed.data.length < 2) {
    return null;
  }

  const [headerRow, ...dataRows] = parsed.data;
  if (!headerRow || headerRow.length < 2) {
    return null;
  }

  const alternatives: string[] = [];
  const criteria: string[] = headerRow.slice(1).filter(Boolean);
  const matrix: number[][] = [];

  for (const row of dataRows) {
    if (!row || row.length < 2) continue;

    const altName = String(row[0] ?? '').trim();
    const values = row.slice(1, 1 + criteria.length).map((v) => {
      const n = parseFloat(String(v).replace(',', '.'));
      return Number.isNaN(n) ? 0 : n;
    });

    if (altName && values.length === criteria.length) {
      alternatives.push(altName);
      matrix.push(values);
    }
  }

  if (alternatives.length === 0 || criteria.length === 0) {
    return null;
  }

  return { alternatives, criteria, matrix };
}

/** Alias for parseCsvToTopsis */
export const parseCSV = parseCsvToTopsis;
