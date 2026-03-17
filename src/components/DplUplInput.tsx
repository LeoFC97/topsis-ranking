import { useState } from 'react';
import type { TopsisData } from '../types';
import styles from './DplUplInput.module.css';

export type DplUplValues = {
  dpl: number[];
  upl: number[];
};

interface DplUplInputProps {
  data: TopsisData;
  value: DplUplValues | null;
  onChange: (value: DplUplValues | null) => void;
  disabled?: boolean;
}

export function DplUplInput({ data, value, onChange, disabled }: DplUplInputProps) {
  const [enabled, setEnabled] = useState(!!value);
  const { criteria, matrix } = data;

  const colMin = criteria.map((_, j) =>
    Math.min(...matrix.map((row) => row[j]))
  );
  const colMax = criteria.map((_, j) =>
    Math.max(...matrix.map((row) => row[j]))
  );

  const currentDpl = value?.dpl ?? colMax.map((v) => v);
  const currentUpl = value?.upl ?? colMin.map((v) => v);

  const handleToggle = () => {
    if (enabled) {
      onChange(null);
      setEnabled(false);
    } else {
      onChange({
        dpl: [...colMax],
        upl: [...colMin],
      });
      setEnabled(true);
    }
  };

  const handleFillExtremes = () => {
    onChange({
      dpl: [...colMax],
      upl: [...colMin],
    });
  };

  const handleDplChange = (j: number, v: number) => {
    const next = [...currentDpl];
    next[j] = v;
    onChange({ dpl: next, upl: currentUpl });
  };

  const handleUplChange = (j: number, v: number) => {
    const next = [...currentUpl];
    next[j] = v;
    onChange({ dpl: currentDpl, upl: next });
  };

  return (
    <div className={styles.wrapper}>
      <label className={styles.toggle}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={handleToggle}
          disabled={disabled}
        />
        <span className={styles.toggleLabel}>
          Usar TOPSIS-RAD (mitigar outliers)
        </span>
      </label>
      <p className={styles.help}>
        DPL: limite superior desejado (valores acima são limitados). UPL: limite inferior aceitável (alternativas abaixo são excluídas).
      </p>

      {enabled && (
        <div className={styles.panel}>
          <button
            type="button"
            onClick={handleFillExtremes}
            className={styles.fillBtn}
            title="Preencher com máximo e mínimo observados por critério"
          >
            ↕ Preencher com extremos
          </button>
          <div className={styles.scroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.critCol}>Critério</th>
                  <th className={styles.numCol}>UPL (mín)</th>
                  <th className={styles.numCol}>DPL (máx)</th>
                </tr>
              </thead>
              <tbody>
                {criteria.map((c, j) => (
                  <tr key={c}>
                    <td className={styles.critCol}>{c}</td>
                    <td className={styles.numCol}>
                      <input
                        type="number"
                        value={currentUpl[j]}
                        onChange={(e) =>
                          handleUplChange(j, parseFloat(e.target.value) || 0)
                        }
                        disabled={disabled}
                        className={styles.input}
                      />
                    </td>
                    <td className={styles.numCol}>
                      <input
                        type="number"
                        value={currentDpl[j]}
                        onChange={(e) =>
                          handleDplChange(j, parseFloat(e.target.value) || 0)
                        }
                        disabled={disabled}
                        className={styles.input}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
