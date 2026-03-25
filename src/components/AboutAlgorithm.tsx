import styles from './AboutAlgorithm.module.css';
import { useI18n } from '../i18n';
import { TopsisRadFlowchart } from './TopsisRadFlowchart';

export function AboutAlgorithm() {
  const { t } = useI18n();
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t('about.title')}</h2>
      <p className={styles.intro}>
        {t('about.intro')}
      </p>

      <TopsisRadFlowchart />

      <h3 className={styles.subTitle}>{t('about.sectionClassic')}</h3>
      <div className={styles.flowchart}>
        <div className={styles.nodeStandard}>
          {t('about.step1')}
        </div>
        <div className={styles.arrow}>↓</div>

        <div className={styles.nodeStandard}>
          {t('about.step2')}
        </div>
        <div className={styles.arrow}>↓</div>

        <div className={styles.nodeStandard}>
          {t('about.step3')}
        </div>
        <div className={styles.arrow}>↓</div>

        <div className={styles.nodeStandard}>
          {t('about.step4')}
        </div>
        <div className={styles.arrow}>↓</div>

        <div className={styles.nodeStandard}>
          {t('about.step5')}
        </div>
        <div className={styles.arrow}>↓</div>

        <div className={styles.nodeStandard}>
          {t('about.step6')}
        </div>
        <div className={styles.arrow}>↓</div>

        <div className={styles.nodeOutput}>
          {t('about.step7')}
        </div>
      </div>

      <div className={styles.legend}>
        <span className={styles.legendStandard}>■</span> {t('about.legend')}
      </div>

      <p className={styles.ref}>
        {t('about.ref')}
      </p>
    </section>
  );
}
