import { RankingBarChart } from './RankingBarChart';
import { MatrixHeatmap } from './MatrixHeatmap';
import { CriteriaRadarChart } from './CriteriaRadarChart';
import type { TopsisFullResult } from '../types';
import styles from './TopsisDashboard.module.css';

interface TopsisDashboardProps {
  result: TopsisFullResult;
}

export function TopsisDashboard({ result }: TopsisDashboardProps) {
  return (
    <div className={styles.dashboard}>
      <h2 className={styles.title}>Dashboard</h2>
      <div className={styles.grid}>
        <section className={styles.card}>
          <RankingBarChart ranking={result.ranking} />
        </section>
        <section className={styles.card}>
          <CriteriaRadarChart result={result} topN={5} />
        </section>
        <section className={`${styles.card} ${styles.cardFull}`}>
          <MatrixHeatmap result={result} />
        </section>
      </div>
    </div>
  );
}
