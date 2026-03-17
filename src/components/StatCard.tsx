import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  variant?: 'default' | 'accent' | 'muted';
}

export function StatCard({ label, value, icon, variant = 'default' }: StatCardProps) {
  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
