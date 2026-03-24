import type { RankedAlternative } from '../types';
import styles from './RankingTable.module.css';
import { useI18n } from '../i18n';

interface RankingTableProps {
  ranking: RankedAlternative[];
}

export function RankingTable({ ranking }: RankingTableProps) {
  const { t } = useI18n();
  if (ranking.length === 0) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{t('rankingTable.title')}</h2>
        <p className={styles.empty}>{t('rankingTable.empty')}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('rankingTable.title')}</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>{t('ranking.col.alternative')}</th>
            <th>{t('ranking.col.score')}</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((item) => (
            <tr key={item.alternative}>
              <td>{item.rank}</td>
              <td>{item.alternative}</td>
              <td>{item.score.toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
