import { useMemo } from 'react';
import type { TopsisFullResult } from '../types';

interface MatrixHeatmapProps {
  result: TopsisFullResult;
}

export function MatrixHeatmap({ result }: MatrixHeatmapProps) {
  const { alternatives, criteria, steps } = result;
  const matrix = steps.matrixG;

  const { minVal, maxVal, maxRow, minRow } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    const n = matrix[0]?.length ?? 0;
    const maxRow: number[] = [];
    const minRow: number[] = [];
    for (let j = 0; j < n; j++) {
      let colMax = -Infinity;
      let colMin = Infinity;
      for (const row of matrix) {
        const v = row[j];
        if (v > colMax) colMax = v;
        if (v < colMin) colMin = v;
        if (v < min) min = v;
        if (v > max) max = v;
      }
      maxRow.push(colMax === -Infinity ? 0 : colMax);
      minRow.push(colMin === Infinity ? 0 : colMin);
    }
    return {
      minVal: min === Infinity ? 0 : min,
      maxVal: max === -Infinity ? 1 : max,
      maxRow,
      minRow,
    };
  }, [matrix]);

  const getColor = (val: number) => {
    const range = maxVal - minVal || 1;
    const t = (val - minVal) / range;
    const r = Math.round(99 + (1 - t) * 156);
    const g = Math.round(130 + (1 - t) * 125);
    const b = Math.round(237 - t * 77);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="heatmap-container">
      <h3 className="chart-title">Matriz de decisão (G) — Heatmap</h3>
      <p className="chart-subtitle">
        Intensidade por critério. Cores mais escuras = valores maiores. Limites Máx e Mín por coluna.
      </p>
      <div className="heatmap-scroll">
        <table className="heatmap-table">
          <thead>
            <tr>
              <th className="heatmap-corner"></th>
              {criteria.map((c) => (
                <th key={c} className="heatmap-header">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="heatmap-limit-row heatmap-limit-max">
              <td className="heatmap-row-label">Máx (sup.)</td>
              {maxRow.map((val, j) => (
                <td
                  key={j}
                  className="heatmap-cell heatmap-cell-limit"
                  style={{ backgroundColor: getColor(val) }}
                  title={`Máximo em ${criteria[j]}: ${val}`}
                >
                  {val}
                </td>
              ))}
            </tr>
            {matrix.map((row, i) => (
              <tr key={alternatives[i]}>
                <td className="heatmap-row-label">{alternatives[i]}</td>
                {row.map((val, j) => (
                  <td
                    key={j}
                    className="heatmap-cell"
                    style={{ backgroundColor: getColor(val) }}
                    title={`${alternatives[i]} - ${criteria[j]}: ${val}`}
                  >
                    {val}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="heatmap-limit-row heatmap-limit-min">
              <td className="heatmap-row-label">Mín (inf.)</td>
              {minRow.map((val, j) => (
                <td
                  key={j}
                  className="heatmap-cell heatmap-cell-limit"
                  style={{ backgroundColor: getColor(val) }}
                  title={`Mínimo em ${criteria[j]}: ${val}`}
                >
                  {val}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
