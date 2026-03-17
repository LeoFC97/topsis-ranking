import styles from './MatrixViewer.module.css';

interface MatrixViewerProps {
  title: string;
  description?: string;
  matrix: number[][];
  rowLabels: string[];
  colLabels: string[];
  decimals?: number;
}

export function MatrixViewer({
  title,
  description,
  matrix,
  rowLabels,
  colLabels,
  decimals = 4,
}: MatrixViewerProps) {
  return (
    <div className={styles.container}>
      {title && <h3 className={styles.title}>{title}</h3>}
      {description && <p className={styles.description}>{description}</p>}
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
                <td className={styles.rowLabel}>{rowLabels[i] ?? `A${i + 1}`}</td>
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
