import { useEffect } from 'react';
import type { TopsisData } from '../types';
import { useI18n } from '../i18n';
import styles from './DplUplInput.module.css';

export interface DplUplValues {
  dpl: number[];
  upl: number[];
}

interface DplUplInputProps {
  data: TopsisData | null;
  value: DplUplValues | null;
  onChange: (value: DplUplValues | null) => void;
  disabled?: boolean;
}

function buildDefaults(data: TopsisData): DplUplValues {
  const n = data.criteria.length;
  const mins = Array.from({ length: n }, (_, j) => Math.min(...data.matrix.map((row) => row[j])));
  const maxs = Array.from({ length: n }, (_, j) => Math.max(...data.matrix.map((row) => row[j])));
  return { dpl: maxs, upl: mins };
}

export function DplUplInput({ data, value, onChange, disabled = false }: DplUplInputProps) {
  const { t } = useI18n();

  useEffect(() => {
    if (!data) return;
    if (!value || value.dpl.length !== data.criteria.length || value.upl.length !== data.criteria.length) {
      onChange(buildDefaults(data));
    }
  }, [data, value, onChange]);

  if (!data) return null;
  const current = value ?? buildDefaults(data);

  const updateAt = (kind: 'dpl' | 'upl', idx: number, raw: string) => {
    const next = Number(raw);
    const parsed = Number.isFinite(next) ? next : 0;
    const dpl = [...current.dpl];
    const upl = [...current.upl];

    if (kind === 'dpl') {
      dpl[idx] = parsed;
      if (dpl[idx] < upl[idx]) upl[idx] = dpl[idx];
    } else {
      upl[idx] = parsed;
      if (upl[idx] > dpl[idx]) dpl[idx] = upl[idx];
    }

    onChange({ dpl, upl });
  };

  return (
    <section className={styles.section}>
      <h3 className={styles.title}>{t('rad.method.radSettings')}</h3>
      <p className={styles.subtitle}>{t('rad.method.radHint')}</p>
      <div className={styles.grid}>
        {data.criteria.map((criterion, i) => (
          <div key={criterion} className={styles.row}>
            <div className={styles.criterion}>{criterion}</div>
            <label className={styles.field}>
              <span>{t('rad.method.eLabel')}</span>
              <input
                type="number"
                value={current.upl[i]}
                onChange={(e) => updateAt('upl', i, e.target.value)}
                disabled={disabled}
              />
            </label>
            <label className={styles.field}>
              <span>{t('rad.method.pLabel')}</span>
              <input
                type="number"
                value={current.dpl[i]}
                onChange={(e) => updateAt('dpl', i, e.target.value)}
                disabled={disabled}
              />
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}
