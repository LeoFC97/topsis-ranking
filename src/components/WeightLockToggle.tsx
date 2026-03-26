import { useI18n } from '../i18n';
import styles from './WeightLockToggle.module.css';

export interface WeightLockToggleProps {
  locked: boolean;
  disabled: boolean;
  onToggle: () => void;
}

export function WeightLockToggle({ locked, disabled, onToggle }: WeightLockToggleProps) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      className={`${styles.btn} ${locked ? styles.btnLocked : ''}`}
      onClick={onToggle}
      disabled={disabled}
      title={locked ? t('weights.unlockHint') : t('weights.lockHint')}
      aria-label={locked ? t('weights.unlockAria') : t('weights.lockAria')}
      aria-pressed={locked}
    >
      {locked ? (
        <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
          />
        </svg>
      ) : (
        <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"
          />
        </svg>
      )}
    </button>
  );
}
