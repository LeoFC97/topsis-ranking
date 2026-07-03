import { useMemo } from 'react';
import type { TopsisFullResult } from '../types';
import { useI18n } from '../i18n';

interface MatrixHeatmapProps {
  result: TopsisFullResult;
}

export function MatrixHeatmap({ result }: MatrixHeatmapProps) {
  const { t } = useI18n();
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

  // Single-hue blue sequential ramp (pale #cde2fb → strong #256abf), aligned with
  // the app's harmonized palette. Low value = pale, high value = saturated.
  const rampRgb = (val: number) => {
    const range = maxVal - minVal || 1;
    const t = (val - minVal) / range;
    return {
      r: Math.round(205 - t * 168),
      g: Math.round(226 - t * 120),
      b: Math.round(251 - t * 60),
    };
  };

  const getColor = (val: number) => {
    const { r, g, b } = rampRgb(val);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Cells always sit on a light→mid blue fill (independent of theme), so pick the
  // value's ink by background luminance rather than the theme text token.
  const getTextColor = (val: number) => {
    const { r, g, b } = rampRgb(val);
    const lin = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    return L > 0.5 ? '#0b1a2e' : '#f5f8ff';
  };

  return (
    <div className="heatmap-container">
      <div>
        <h3 className="chart-title">{t('heatmap.title')}</h3>
        <p className="chart-subtitle">
          {t('heatmap.subtitle')}
        </p>
      </div>
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
              <td className="heatmap-row-label">{t('heatmap.max')}</td>
              {maxRow.map((val, j) => (
                <td
                  key={j}
                  className="heatmap-cell heatmap-cell-limit"
                  style={{ backgroundColor: getColor(val), color: getTextColor(val) }}
                  title={`${t('heatmap.maxIn')} ${criteria[j]}: ${val}`}
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
                    style={{ backgroundColor: getColor(val), color: getTextColor(val) }}
                    title={`${alternatives[i]} - ${criteria[j]}: ${val}`}
                  >
                    {val}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="heatmap-limit-row heatmap-limit-min">
              <td className="heatmap-row-label">{t('heatmap.min')}</td>
              {minRow.map((val, j) => (
                <td
                  key={j}
                  className="heatmap-cell heatmap-cell-limit"
                  style={{ backgroundColor: getColor(val), color: getTextColor(val) }}
                  title={`${t('heatmap.minIn')} ${criteria[j]}: ${val}`}
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
