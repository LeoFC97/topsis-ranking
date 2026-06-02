import { useEffect } from 'react';
import type { TopsisData } from '../types';
import { defaultDplVplValues, ensureDirections } from '../lib/topsis';
import { useI18n } from '../i18n';
import styles from './DplVplInput.module.css';

export interface DplVplValues {
  dpl: number[];
  vpl: number[];
}

interface DplVplInputProps {
  data: TopsisData | null;
  value: DplVplValues | null;
  onChange: (value: DplVplValues | null) => void;
  disabled?: boolean;
}

export function DplVplInput({ data, value, onChange, disabled = false }: DplVplInputProps) {
  const { t } = useI18n();

  useEffect(() => {
    if (!data) return;
    if (!value || value.dpl.length !== data.criteria.length || value.vpl.length !== data.criteria.length) {
      onChange(defaultDplVplValues(data));
    }
  }, [data, value, onChange]);

  if (!data) return null;
  const current = value ?? defaultDplVplValues(data);
  const dirs = ensureDirections(data);

  const updateAt = (kind: 'dpl' | 'vpl', idx: number, raw: string) => {
    const next = Number(raw);
    const parsed = Number.isFinite(next) ? next : 0;
    const dpl = [...current.dpl];
    const vpl = [...current.vpl];

    if (kind === 'dpl') {
      dpl[idx] = parsed;
    } else {
      vpl[idx] = parsed;
    }

    onChange({ dpl, vpl });
  };

  return (
    <section className={styles.section}>
      <h3 className={styles.title}>{t('rad.method.radSettings')}</h3>
      <p className={styles.subtitle}>{t('rad.method.radHint')}</p>
      <div className={styles.grid}>
        {data.criteria.map((criterion, i) => (
          <div key={criterion} className={styles.row}>
            <div className={styles.criterion}>
              {criterion}
              <span className={styles.dirBadge}>
                {dirs[i] === 'benefit' ? t('dataset.benefit') : t('dataset.cost')}
              </span>
            </div>
            <label className={styles.field}>
              <span>{dirs[i] === 'benefit' ? t('rad.method.eLabel') : t('rad.method.eLabelCost')}</span>
              <input
                type="number"
                value={current.vpl[i]}
                onChange={(e) => updateAt('vpl', i, e.target.value)}
                disabled={disabled}
              />
            </label>
            <label className={styles.field}>
              <span>{dirs[i] === 'benefit' ? t('rad.method.pLabel') : t('rad.method.pLabelCost')}</span>
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
