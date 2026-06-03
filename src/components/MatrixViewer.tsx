import styles from './MatrixViewer.module.css';
import { MathFormula } from './MathFormula';
import { useI18n } from '../i18n';
import { exportMatrixToCSV, exportMatrixToLatex } from '../lib/matrixExport';

interface MatrixViewerProps {
  title: string;
  description?: string;
  formulaLatex?: string;
  matrix: number[][];
  rowLabels: string[];
  colLabels: string[];
  decimals?: number;
}

export function MatrixViewer({
  title,
  description,
  formulaLatex,
  matrix,
  rowLabels,
  colLabels,
  decimals = 4,
}: MatrixViewerProps) {
  const { t } = useI18n();
  
  const handleDownloadCSV = () => {
    const filename = title ? `${title.toLowerCase().replace(/\s+/g, '_')}.csv` : 'matrix.csv';
    exportMatrixToCSV(matrix, rowLabels, colLabels, decimals, filename);
  };
  
  const handleDownloadLatex = () => {
    const filename = title ? `${title.toLowerCase().replace(/\s+/g, '_')}.tex` : 'matrix.tex';
    exportMatrixToLatex(matrix, rowLabels, colLabels, decimals, filename);
  };
  
  return (
    <div className={styles.container}>
      {title && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className={styles.title}>{title}</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDownloadCSV}
              className={styles.downloadBtn}
              title="Download as CSV"
            >
              📥 CSV
            </button>
            <button
              onClick={handleDownloadLatex}
              className={styles.downloadBtn}
              title="Download as LaTeX"
            >
              📥 LaTeX
            </button>
          </div>
        </div>
      )}
      {description && <p className={styles.description}>{description}</p>}
      {formulaLatex && <MathFormula latex={formulaLatex} className={styles.formula} />}
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.corner}></th>
              {colLabels.map((l) => (
                <th key={l} className={styles.cell}>{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td className={styles.rowLabel}>
                  {rowLabels[i] ?? t('matrix.fallbackAlt').replace('{n}', String(i + 1))}
                </td>
                {row.map((val, j) => (
                  <td key={j} className={styles.cell}>
                    {val.toFixed(decimals)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
