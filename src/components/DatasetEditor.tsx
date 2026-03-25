import type { CriterionDirection, TopsisData } from '../types';
import { ensureDirections } from '../lib/topsis';
import { useI18n } from '../i18n';
import styles from './DatasetEditor.module.css';

interface DatasetEditorProps {
  data: TopsisData | null;
  onChange: (next: TopsisData) => void;
  disabled?: boolean;
}

export function DatasetEditor({ data, onChange, disabled = false }: DatasetEditorProps) {
  const { t } = useI18n();

  if (!data) return null;

  const updateAltName = (rowIdx: number, nextName: string) => {
    const alternatives = [...data.alternatives];
    alternatives[rowIdx] = nextName;
    onChange({ ...data, alternatives });
  };

  const updateCell = (rowIdx: number, colIdx: number, rawValue: string) => {
    const matrix = data.matrix.map((row) => [...row]);
    const parsed = Number(String(rawValue).replace(',', '.'));
    matrix[rowIdx][colIdx] = Number.isFinite(parsed) ? parsed : 0;
    onChange({ ...data, matrix });
  };

  const updateCriterionName = (colIdx: number, nextName: string) => {
    const criteria = [...data.criteria];
    criteria[colIdx] = nextName;
    onChange({ ...data, criteria });
  };

  const updateDirection = (colIdx: number, dir: CriterionDirection) => {
    const dirs = [...ensureDirections(data)];
    dirs[colIdx] = dir;
    onChange({ ...data, directions: dirs });
  };

  const addRow = () => {
    const alternatives = [
      ...data.alternatives,
      t('matrix.fallbackAlt').replace('{n}', String(data.alternatives.length + 1)),
    ];
    const matrix = [...data.matrix, data.criteria.map(() => 0)];
    onChange({ ...data, alternatives, matrix });
  };

  const removeRow = (rowIdx: number) => {
    if (data.alternatives.length <= 1) return;
    const alternatives = data.alternatives.filter((_, i) => i !== rowIdx);
    const matrix = data.matrix.filter((_, i) => i !== rowIdx);
    onChange({ ...data, alternatives, matrix });
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{t('dataset.title')}</h3>
          <p className={styles.subtitle}>{t('dataset.subtitle')}</p>
        </div>
        <button type="button" className={styles.addBtn} onClick={addRow} disabled={disabled}>
          {t('dataset.addRow')}
        </button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('dataset.alt')}</th>
              {data.criteria.map((criterion, colIdx) => (
                <th key={`col-header-${colIdx}`}>{criterion}</th>
              ))}
              <th>{t('dataset.actions')}</th>
            </tr>
            <tr>
              <th>{t('dataset.criteriaNames')}</th>
              {data.criteria.map((criterion, colIdx) => (
                <th key={`col-name-${colIdx}`}>
                  <input
                    type="text"
                    value={criterion}
                    onChange={(e) => updateCriterionName(colIdx, e.target.value)}
                    disabled={disabled}
                    className={styles.textInput}
                  />
                </th>
              ))}
              <th />
            </tr>
            <tr>
              <th>{t('dataset.direction')}</th>
              {data.criteria.map((_, colIdx) => (
                <th key={`col-dir-${colIdx}`}>
                  <select
                    className={styles.selectInput}
                    value={ensureDirections(data)[colIdx]}
                    onChange={(e) =>
                      updateDirection(colIdx, e.target.value === 'cost' ? 'cost' : 'benefit')
                    }
                    disabled={disabled}
                    aria-label={`${t('dataset.direction')}: ${data.criteria[colIdx] ?? ''}`}
                  >
                    <option value="benefit">{t('dataset.benefit')}</option>
                    <option value="cost">{t('dataset.cost')}</option>
                  </select>
                </th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {data.alternatives.map((alt, rowIdx) => (
              <tr key={`row-${rowIdx}`}>
                <td>
                  <input
                    type="text"
                    value={alt}
                    onChange={(e) => updateAltName(rowIdx, e.target.value)}
                    disabled={disabled}
                    className={styles.textInput}
                  />
                </td>
                {data.criteria.map((criterion, colIdx) => (
                  <td key={`${criterion}-${rowIdx}-${colIdx}`}>
                    <input
                      type="number"
                      value={data.matrix[rowIdx][colIdx]}
                      onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                      disabled={disabled}
                      className={styles.numberInput}
                    />
                  </td>
                ))}
                <td>
                  <button
                    type="button"
                    onClick={() => removeRow(rowIdx)}
                    disabled={disabled || data.alternatives.length <= 1}
                    className={styles.removeBtn}
                    title={t('dataset.removeRow')}
                  >
                    {t('dataset.removeRow')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
