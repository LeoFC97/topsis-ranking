import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Legend,
} from 'recharts';
import type { TopsisResult } from '../types';

interface RankingBarChartProps {
  ranking: TopsisResult[];
}

const COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#f97316', '#eab308', '#84cc16', '#22c55e',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
];

export function RankingBarChart({ ranking }: RankingBarChartProps) {
  const data = ranking.map((r, i) => ({
    name: r.alternative,
    score: r.score,
    rank: r.rank,
    fill: COLORS[i % COLORS.length],
  }));

  const maxScore = data.length ? Math.max(...data.map((d) => d.score)) : 1;
  const minScore = data.length ? Math.min(...data.map((d) => d.score)) : 0;

  return (
    <div className="chart-container">
      <h3 className="chart-title">Ranking por Score</h3>
      <p className="chart-subtitle">
        Quanto maior o score, melhor a posição. Linhas: limite superior (melhor) e inferior (pior).
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="name"
            angle={-35}
            textAnchor="end"
            height={70}
            tick={{ fill: 'var(--text-h)' }}
          />
          <YAxis
            domain={[0, 1]}
            tick={{ fill: 'var(--text)' }}
            tickFormatter={(v) => v.toFixed(2)}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--code-bg)',
              border: '1px solid var(--border)',
              borderRadius: 8,
            }}
            formatter={(value, _name, props) => {
              const v = typeof value === 'number' ? value : 0;
              const rank = props?.payload?.rank ?? 0;
              return [`${v.toFixed(4)} (#${rank}º)`, 'Score'];
            }}
          />
          <ReferenceLine
            y={maxScore}
            stroke="#22c55e"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{ value: 'Limite sup.', position: 'right', fill: '#22c55e' }}
          />
          <ReferenceLine
            y={minScore}
            stroke="#ef4444"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{ value: 'Limite inf.', position: 'right', fill: '#ef4444' }}
          />
          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
          <Legend />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
