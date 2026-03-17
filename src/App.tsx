import { useState, useCallback } from 'react';
import { parseCSV } from './lib/parseCsv';
import { topsis, topsisRad } from './lib/topsis';
import { DashboardLayout } from './components/DashboardLayout';
import type { TopsisData, TopsisFullResult } from './types';
import type { DplUplValues } from './components/DplUplInput';
import './App.css';

export default function App() {
  const [data, setData] = useState<TopsisData | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [weights, setWeights] = useState<number[]>([]);
  const [dplUpl, setDplUpl] = useState<DplUplValues | null>(null);
  const [fullResult, setFullResult] = useState<TopsisFullResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleFileLoaded = useCallback((content: string, name: string) => {
    setParseError(null);
    setFullResult(null);
    setDplUpl(null);
    const parsed = parseCSV(content);
    if (parsed) {
      setData(parsed);
      setFileName(name);
      setWeights(parsed.criteria.map(() => 100 / parsed.criteria.length));
    } else {
      setData(null);
      setFileName(null);
      setWeights([]);
      setParseError('Erro ao interpretar o CSV. Verifique o formato (cabeçalho: alternativa,c1,c2,...).');
    }
  }, []);

  const handleCalculate = useCallback(() => {
    if (!data) return;
    const w =
      weights.length === data.criteria.length
        ? weights
        : data.criteria.map(() => 100 / data.criteria.length);
    const sumW = w.reduce((a, b) => a + b, 0);
    const wNorm = sumW > 0 ? w.map((v) => v / sumW) : w.map(() => 1 / data.criteria.length);
    const result = dplUpl
      ? topsisRad(data, wNorm, dplUpl.dpl, dplUpl.upl)
      : topsis(data, wNorm);
    setFullResult(result);
  }, [data, weights, dplUpl]);

  const handleRemoveOutliers = useCallback(
    (toRemove: string[]) => {
      if (!data || toRemove.length === 0) return;
      const removeSet = new Set(toRemove);
      const keptIdx: number[] = [];
      data.alternatives.forEach((a, i) => {
        if (!removeSet.has(a)) keptIdx.push(i);
      });
      const newData: TopsisData = {
        alternatives: keptIdx.map((i) => data.alternatives[i]),
        criteria: data.criteria,
        matrix: keptIdx.map((i) => [...data.matrix[i]]),
      };
      setData(newData);
      const w =
        weights.length === newData.criteria.length
          ? weights
          : newData.criteria.map(() => 100 / newData.criteria.length);
      const sumW2 = w.reduce((a, b) => a + b, 0);
      const wNorm = sumW2 > 0 ? w.map((v) => v / sumW2) : w.map(() => 1 / newData.criteria.length);
      const result = dplUpl
        ? topsisRad(newData, wNorm, dplUpl.dpl, dplUpl.upl)
        : topsis(newData, wNorm);
      setFullResult(result);
    },
    [data, weights, dplUpl]
  );

  return (
    <DashboardLayout
      data={data}
      fileName={fileName}
      parseError={parseError}
      weights={weights}
      dplUpl={dplUpl}
      onDplUplChange={setDplUpl}
      onWeightsChange={setWeights}
      fullResult={fullResult}
      onFileLoaded={handleFileLoaded}
      onCalculate={handleCalculate}
      onRemoveOutliers={handleRemoveOutliers}
    />
  );
}
