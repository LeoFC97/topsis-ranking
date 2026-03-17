import { useEffect, useState } from 'react';
import styles from './AnimatedMatrixTable.module.css';

interface AnimatedMatrixTableProps {
  matrix: number[][];
  rowLabels: string[];
  colLabels: string[];
  decimals?: number;
  /** Delay between each cell appearing (ms) */
  cellDelay?: number;
  /** Start animation when true */
  play?: boolean;
}

export function AnimatedMatrixTable({
  matrix,
  rowLabels,
  colLabels,
  decimals = 4,
  cellDelay = 50,
  play = true,
}: AnimatedMatrixTableProps) {
  const [visibleCells, setVisibleCells] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!play || matrix.length === 0) return;

    setVisibleCells(new Set());
    setIsComplete(false);

    const ids: string[] = [];
    matrix.forEach((_, i) =>
      matrix[0]?.forEach((_, j) => {
        ids.push(`${i}-${j}`);
      })
    );

    let idx = 0;
    const timer = setInterval(() => {
      if (idx >= ids.length) {
        clearInterval(timer);
        setIsComplete(true);
        return;
      }
      setVisibleCells((prev) => new Set([...prev, ids[idx]]));
      idx++;
    }, cellDelay);

    return () => clearInterval(timer);
  }, [matrix, play, cellDelay]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.corner}></th>
              {colLabels.map((l) => (
                <th key={l} className={styles.header}>
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td className={styles.rowLabel}>{rowLabels[i] ?? `A${i + 1}`}</td>
                {row.map((val, j) => {
                  const key = `${i}-${j}`;
                  const visible = visibleCells.has(key) || isComplete;
                  return (
                    <td
                      key={j}
                      className={`${styles.cell} ${visible ? styles.cellVisible : ''}`}
                      style={
                        visible
                          ? undefined
                          : { animationDelay: `${(i * (matrix[0]?.length ?? 0) + j) * cellDelay}ms` }
                      }
                    >
                      {visible ? val.toFixed(decimals) : '···'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
