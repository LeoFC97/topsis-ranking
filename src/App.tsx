import { useState, useCallback, useEffect } from 'react';
import { parseCSV } from './lib/parseCsv';
import { topsis, topsisRad } from './lib/topsis';
import { DashboardLayout } from './components/DashboardLayout';
import type { TopsisData, TopsisFullResult } from './types';
import { useI18n } from './i18n';
import type { DplUplValues } from './components/DplUplInput';
import './App.css';

type Method = 'topsis' | 'rad';

function getDefaultDplUpl(data: TopsisData): DplUplValues {
  const n = data.criteria.length;
  const upl = Array.from({ length: n }, (_, j) => Math.min(...data.matrix.map((row) => row[j])));
  const dpl = Array.from({ length: n }, (_, j) => Math.max(...data.matrix.map((row) => row[j])));
  return { dpl, upl };
}

export default function App() {
  const { t, lang } = useI18n();
  const [data, setData] = useState<TopsisData | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [weights, setWeights] = useState<number[]>([]);
  const [method, setMethod] = useState<Method>('topsis');
  const [dplUpl, setDplUpl] = useState<DplUplValues | null>(null);
  const [fullResult, setFullResult] = useState<TopsisFullResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    document.title = t('app.documentTitle');
  }, [lang, t]);

  const handleFileLoaded = useCallback((content: string, name: string) => {
    setParseError(null);
    setFullResult(null);
    const parsed = parseCSV(content);
    if (parsed) {
      setData(parsed);
      setFileName(name);
      setWeights(parsed.criteria.map(() => 100 / parsed.criteria.length));
      setMethod('topsis');
      setDplUpl(getDefaultDplUpl(parsed));
    } else {
      setData(null);
      setFileName(null);
      setWeights([]);
      setParseError(t('upload.error'));
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
    const useRad = method === 'rad';
    const config = dplUpl && dplUpl.dpl.length === data.criteria.length ? dplUpl : getDefaultDplUpl(data);
    const result = useRad ? topsisRad(data, wNorm, config.dpl, config.upl) : topsis(data, wNorm);
    setFullResult(result);
  }, [data, weights, method, dplUpl]);

  const handleDataChange = useCallback((nextData: TopsisData) => {
    setData(nextData);
    setFullResult(null);
    if (!dplUpl || dplUpl.dpl.length !== nextData.criteria.length || dplUpl.upl.length !== nextData.criteria.length) {
      setDplUpl(getDefaultDplUpl(nextData));
    }
  }, [dplUpl]);

  return (
    <DashboardLayout
      data={data}
      fileName={fileName}
      parseError={parseError}
      weights={weights}
      method={method}
      dplUpl={dplUpl}
      onMethodChange={setMethod}
      onDplUplChange={setDplUpl}
      onDataChange={handleDataChange}
      onWeightsChange={setWeights}
      fullResult={fullResult}
      onFileLoaded={handleFileLoaded}
      onCalculate={handleCalculate}
    />
  );
}
