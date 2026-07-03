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
import { useI18n } from '../i18n';

interface RankingBarChartProps {
  ranking: TopsisResult[];
}

const COLORS = [
  'var(--cat-1)', 'var(--cat-2)', 'var(--cat-3)', 'var(--cat-4)',
  'var(--cat-5)', 'var(--cat-6)', 'var(--cat-7)', 'var(--cat-8)',
];

export function RankingBarChart({ ranking }: RankingBarChartProps) {
  const { t } = useI18n();
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
      <div>
        <h3 className="chart-title">{t('bar.title')}</h3>
        <p className="chart-subtitle">{t('bar.subtitle')}</p>
      </div>
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
              return [`${v.toFixed(4)} (#${rank})`, t('ranking.col.score')];
            }}
          />
          <ReferenceLine
            y={maxScore}
            stroke="var(--good)"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{ value: t('bar.upperLimit'), position: 'right', fill: 'var(--good)' }}
          />
          <ReferenceLine
            y={minScore}
            stroke="var(--critical)"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{ value: t('bar.lowerLimit'), position: 'right', fill: 'var(--critical)' }}
          />
          <Bar dataKey="score" name={t('ranking.col.score')} radius={[4, 4, 0, 0]}>
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
