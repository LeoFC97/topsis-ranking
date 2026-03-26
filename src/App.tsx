import { useState, useCallback, useEffect, useRef } from 'react';
import { parseCSV } from './lib/parseCsv';
import { topsis, topsisRad, defaultDplUplValues, ensureDirections } from './lib/topsis';
import { DashboardLayout } from './components/DashboardLayout';
import type { TopsisData, TopsisFullResult, NormalizationMethod } from './types';
import { useI18n } from './i18n';
import type { DplUplValues } from './components/DplUplInput';
import './App.css';

type Method = 'topsis' | 'rad';

const NORM_STORAGE_KEY = 'topsis-normalization';

function readStoredNormalization(): NormalizationMethod {
  if (typeof window === 'undefined') return 'minmax';
  return localStorage.getItem(NORM_STORAGE_KEY) === 'vector' ? 'vector' : 'minmax';
}

export default function App() {
  const { t, lang } = useI18n();
  const [data, setData] = useState<TopsisData | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [weights, setWeights] = useState<number[]>([]);
  const [weightLocks, setWeightLocks] = useState<boolean[]>([]);
  const [method, setMethod] = useState<Method>('topsis');
  const [dplUpl, setDplUpl] = useState<DplUplValues | null>(null);
  const [fullResult, setFullResult] = useState<TopsisFullResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [normalization, setNormalization] = useState<NormalizationMethod>(readStoredNormalization);

  useEffect(() => {
    document.title = t('app.documentTitle');
  }, [lang, t]);

  const methodNormRef = useRef<{ method: Method; normalization: NormalizationMethod } | null>(null);
  useEffect(() => {
    const prev = methodNormRef.current;
    methodNormRef.current = { method, normalization };
    if (prev === null) return;
    if (prev.method !== method || prev.normalization !== normalization) {
      setFullResult(null);
    }
  }, [method, normalization]);

  const setNormalizationPersist = useCallback((n: NormalizationMethod) => {
    setNormalization(n);
    localStorage.setItem(NORM_STORAGE_KEY, n);
  }, []);

  const handleFileLoaded = useCallback((content: string, name: string) => {
    setParseError(null);
    setFullResult(null);
    const parsed = parseCSV(content);
    if (parsed) {
      setData(parsed);
      setFileName(name);
      setWeights(parsed.criteria.map(() => 100 / parsed.criteria.length));
      setWeightLocks(parsed.criteria.map(() => false));
      setMethod('topsis');
      setNormalization('minmax');
      setDplUpl(defaultDplUplValues(parsed));
    } else {
      setData(null);
      setFileName(null);
      setWeights([]);
      setWeightLocks([]);
      setParseError(t('upload.error'));
    }
  }, [t]);

  const computeOpts = useCallback(() => {
    if (!data) return null;
    const dirs = ensureDirections(data);
    return { normalization, directions: dirs };
  }, [data, normalization]);

  const handleCalculate = useCallback(() => {
    if (!data) return;
    const w =
      weights.length === data.criteria.length
        ? weights
        : data.criteria.map(() => 100 / data.criteria.length);
    const sumW = w.reduce((a, b) => a + b, 0);
    const wNorm = sumW > 0 ? w.map((v) => v / sumW) : w.map(() => 1 / data.criteria.length);
    const useRad = method === 'rad';
    const config =
      dplUpl && dplUpl.dpl.length === data.criteria.length ? dplUpl : defaultDplUplValues(data);
    const opts = computeOpts();
    if (!opts) return;
    const result = useRad
      ? topsisRad(data, wNorm, config.dpl, config.upl, opts)
      : topsis(data, wNorm, opts);
    setFullResult(result);
  }, [data, weights, method, dplUpl, computeOpts]);

  const handleDataChange = useCallback((nextData: TopsisData) => {
    setData((prev) => {
      if (
        !prev ||
        prev.criteria.length !== nextData.criteria.length ||
        JSON.stringify(ensureDirections(prev)) !== JSON.stringify(ensureDirections(nextData))
      ) {
        setDplUpl(defaultDplUplValues(nextData));
      }
      return nextData;
    });
    setWeightLocks((prev) =>
      nextData.criteria.map((_, i) => (i < prev.length ? prev[i] : false))
    );
    setFullResult(null);
  }, []);

  return (
    <DashboardLayout
      data={data}
      fileName={fileName}
      parseError={parseError}
      weights={weights}
      weightLocks={weightLocks}
      onWeightLocksChange={setWeightLocks}
      method={method}
      dplUpl={dplUpl}
      normalization={normalization}
      onNormalizationChange={setNormalizationPersist}
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
