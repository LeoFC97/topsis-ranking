import { useI18n } from '../i18n';
import styles from './TopsisRadFlowchart.module.css';

/** Flowchart aligned with the paper’s TOPSIS-RAD figure (UPL filter + DPL cap + TOPSIS stages). */
export function TopsisRadFlowchart() {
  const { t } = useI18n();

  return (
    <div className={styles.wrap}>
      <h3 className={styles.heading}>{t('flowchartRad.title')}</h3>
      <p className={styles.note}>{t('flowchartRad.note')}</p>

      <div className={styles.chart} aria-label={t('flowchartRad.title')}>
        <div className={`${styles.node} ${styles.io}`}>
          <strong>{t('flowchartRad.step1')}</strong>
        </div>
        <div className={styles.arrow}>↓</div>

        <div className={`${styles.node} ${styles.novel}`}>
          <strong>{t('flowchartRad.step2')}</strong>
        </div>
        <div className={styles.arrow}>↓</div>

        <div className={styles.rowUpl}>
          <span className={styles.stepTag}>{t('flowchartRad.tagUpl')}</span>
          <div className={`${styles.node} ${styles.diamond}`}>
            <span>{t('flowchartRad.uplQ')}</span>
          </div>
          <div className={styles.sideBranch}>
            <span className={styles.branchLbl}>{t('flowchartRad.no')}</span>
            <div className={`${styles.node} ${styles.discard}`}>{t('flowchartRad.discard')}</div>
          </div>
        </div>
        <div className={styles.arrow}>↓ {t('flowchartRad.yes')}</div>

        <div className={`${styles.node} ${styles.novel}`}>{t('flowchartRad.qualified')}</div>
        <div className={styles.arrow}>↓</div>

        <div className={styles.rowDpl}>
          <span className={styles.stepTag}>{t('flowchartRad.tagDpl')}</span>
          <div className={`${styles.node} ${styles.diamond}`}>
            <span>{t('flowchartRad.dplQ')}</span>
          </div>
          <div className={styles.dplBranches}>
            <div className={styles.branchCol}>
              <span className={styles.branchLbl}>{t('flowchartRad.yes')}</span>
              <div className={`${styles.node} ${styles.cap}`}>{t('flowchartRad.cap')}</div>
            </div>
            <div className={styles.branchCol}>
              <span className={styles.branchLbl}>{t('flowchartRad.no')}</span>
              <div className={`${styles.node} ${styles.keep}`}>{t('flowchartRad.keep')}</div>
            </div>
          </div>
        </div>
        <div className={styles.arrow}>↓</div>

        <div className={`${styles.node} ${styles.novel}`}>{t('flowchartRad.matrixC')}</div>
        <div className={styles.arrow}>↓</div>

        <div className={`${styles.node} ${styles.standard}`}>{t('flowchartRad.step4')}</div>
        <div className={styles.arrow}>↓</div>
        <div className={`${styles.node} ${styles.standard}`}>{t('flowchartRad.step5')}</div>
        <div className={styles.arrow}>↓</div>
        <div className={`${styles.node} ${styles.standard}`}>{t('flowchartRad.step6')}</div>
        <div className={styles.arrow}>↓</div>
        <div className={`${styles.node} ${styles.standard}`}>{t('flowchartRad.step7')}</div>
        <div className={styles.arrow}>↓</div>
        <div className={`${styles.node} ${styles.standard}`}>{t('flowchartRad.step8')}</div>
        <div className={styles.arrow}>↓</div>
        <div className={`${styles.node} ${styles.out}`}>{t('flowchartRad.step9')}</div>
      </div>

      <p className={styles.legend}>
        <span className={styles.legNovel}>■</span> {t('flowchartRad.legendNovel')}
        <span className={styles.legStd}>■</span> {t('flowchartRad.legendStd')}
      </p>
    </div>
  );
}
