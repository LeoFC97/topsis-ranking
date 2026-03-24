import { RankingBarChart } from './RankingBarChart';
import { MatrixHeatmap } from './MatrixHeatmap';
import { CriteriaRadarChart } from './CriteriaRadarChart';
import type { TopsisFullResult } from '../types';
import styles from './TopsisDashboard.module.css';
import { useI18n } from '../i18n';

interface TopsisDashboardProps {
  result: TopsisFullResult;
}

export function TopsisDashboard({ result }: TopsisDashboardProps) {
  const { t } = useI18n();
  return (
    <div className={styles.dashboard}>
      <h2 className={styles.title}>{t('dashboard.title')}</h2>
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
