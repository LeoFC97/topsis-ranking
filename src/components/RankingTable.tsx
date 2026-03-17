import type { RankedAlternative } from '../types';
import styles from './RankingTable.module.css';

interface RankingTableProps {
  ranking: RankedAlternative[];
}

export function RankingTable({ ranking }: RankingTableProps) {
  if (ranking.length === 0) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Resultado</h2>
        <p className={styles.empty}>Nenhum resultado ainda. Carregue uma planilha e calcule o ranking.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Resultado</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Alternativa</th>
            <th>Score</th>
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
