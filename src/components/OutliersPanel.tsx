import styles from './OutliersPanel.module.css';

export interface OutliersPanelProps {
  excludedAlternatives: string[];
  onRemoveAndRecalculate: (alternativesToRemove: string[]) => void;
  disabled?: boolean;
}

export function OutliersPanel({
  excludedAlternatives,
  onRemoveAndRecalculate,
  disabled = false,
}: OutliersPanelProps) {
  if (excludedAlternatives.length === 0) {
    return null;
  }

  return (
    <section className={styles.panel}>
      <h2 className={styles.title}>Outliers detectados (TOPSIS-RAD)</h2>
      <p className={styles.subtitle}>
        Estas alternativas foram excluídas por ficarem abaixo do limite UPL em ao menos um critério.
      </p>
      <ul className={styles.list}>
        {excludedAlternatives.map((alt) => (
          <li key={alt} className={styles.item}>{alt}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onRemoveAndRecalculate(excludedAlternatives)}
        disabled={disabled}
        className={styles.removeBtn}
      >
        Remover da planilha e recalcular
      </button>
    </section>
  );
}
