import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { useMemo } from 'react';
import type { TopsisFullResult } from '../types';

interface CriteriaRadarChartProps {
  result: TopsisFullResult;
  topN?: number;
}

export function CriteriaRadarChart({ result, topN = 5 }: CriteriaRadarChartProps) {
  const { alternatives, criteria, steps } = result;
  const matrixT = steps.matrixT;

  const { PIS, NIS } = steps;

  const data = useMemo(() => {
    const ranked = result.ranking.slice(0, topN);
    return criteria.map((c, j) => {
      const obj: Record<string, string | number> = {
        criterion: c,
        PIS: PIS[j],
        NIS: NIS[j],
      };
      ranked.forEach((r) => {
        const altIdx = alternatives.indexOf(r.alternative);
        if (altIdx >= 0) {
          obj[r.alternative] = matrixT[altIdx][j];
        }
      });
      return obj;
    });
  }, [alternatives, criteria, matrixT, PIS, NIS, result.ranking, topN]);

  const keys = useMemo(
    () => result.ranking.slice(0, topN).map((r) => r.alternative),
    [result.ranking, topN]
  );

  const COLORS = ['#6366f1', '#22c55e', '#f97316', '#ec4899', '#06b6d4'];

  if (keys.length === 0 || data.length === 0) return null;

  return (
    <div className="chart-container">
      <h3 className="chart-title">Comparação por critério (matriz T)</h3>
      <p className="chart-subtitle">
        Top {topN} alternativas. PIS (limite superior) e NIS (limite inferior) como referência.
      </p>
      <ResponsiveContainer width="100%" height={380}>
        <RadarChart data={data}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="criterion"
            tick={{ fill: 'var(--text-h)' }}
          />
          <PolarRadiusAxis
            tick={{ fill: 'var(--text)' }}
            angle={90}
          />
          <Radar
            name="PIS (limite sup.)"
            dataKey="PIS"
            stroke="#059669"
            fill="#059669"
            fillOpacity={0.08}
            strokeWidth={2}
            strokeDasharray="4 4"
          />
          <Radar
            name="NIS (limite inf.)"
            dataKey="NIS"
            stroke="#dc2626"
            fill="#dc2626"
            fillOpacity={0.08}
            strokeWidth={2}
            strokeDasharray="4 4"
          />
          {keys.map((key, i) => (
            <Radar
              key={key}
              name={key}
              dataKey={key}
              stroke={COLORS[i % COLORS.length]}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          ))}
          <Legend />
          <Tooltip
            contentStyle={{
              background: 'var(--code-bg)',
              border: '1px solid var(--border)',
              borderRadius: 8,
            }}
            formatter={(value) => (typeof value === 'number' ? value.toFixed(4) : String(value))}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
