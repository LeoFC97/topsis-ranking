import { useState, useCallback } from 'react';
import { parseCSV } from './lib/parseCsv';
import { topsis } from './lib/topsis';
import { DashboardLayout } from './components/DashboardLayout';
import type { TopsisData, TopsisFullResult } from './types';
import { useI18n } from './i18n';
import './App.css';

export default function App() {
  const { t } = useI18n();
  const [data, setData] = useState<TopsisData | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [weights, setWeights] = useState<number[]>([]);
  const [fullResult, setFullResult] = useState<TopsisFullResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleFileLoaded = useCallback((content: string, name: string) => {
    setParseError(null);
    setFullResult(null);
    const parsed = parseCSV(content);
    if (parsed) {
      setData(parsed);
      setFileName(name);
      setWeights(parsed.criteria.map(() => 100 / parsed.criteria.length));
    } else {
      setData(null);
      setFileName(null);
      setWeights([]);
      setParseError(
        t('upload.error') || 'Erro ao interpretar o CSV. Verifique o formato (cabeçalho: alternativa,c1,c2,...).'
      );
    }
  }, [t]);

  const handleCalculate = useCallback(() => {
    if (!data) return;
    const w =
      weights.length === data.criteria.length
        ? weights
        : data.criteria.map(() => 100 / data.criteria.length);
    const sumW = w.reduce((a, b) => a + b, 0);
    const wNorm = sumW > 0 ? w.map((v) => v / sumW) : w.map(() => 1 / data.criteria.length);
    const result = topsis(data, wNorm);
    setFullResult(result);
  }, [data, weights]);

  return (
    <DashboardLayout
      data={data}
      fileName={fileName}
      parseError={parseError}
      weights={weights}
      onWeightsChange={setWeights}
      fullResult={fullResult}
      onFileLoaded={handleFileLoaded}
      onCalculate={handleCalculate}
    />
  );
}
