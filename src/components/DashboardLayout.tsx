import { useEffect, useState } from 'react';
import { FileUpload } from './FileUpload';
import { WeightSliders } from './WeightSliders';
import { WeightRadarInput } from './WeightRadarInput';
import { DplVplInput, type DplVplValues } from './DplVplInput';
import { DatasetEditor } from './DatasetEditor';
import { RankingTable } from './RankingTable';
import { TopsisDashboard } from './TopsisDashboard';
import { TopsisStepsView } from './TopsisStepsView';
import { TopsisAnimatedFlow } from './TopsisAnimatedFlow';
import { AboutAlgorithm } from './AboutAlgorithm';
import { RankReversalAnalysis } from './RankReversalAnalysis';
import { StatCard } from './StatCard';
import { exportRankingToCsv, downloadFile } from '../lib/exportCsv';
import type { NormalizationMethod, TopsisData, TopsisFullResult } from '../types';
import { ensureDirections } from '../lib/topsis';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';
import styles from './DashboardLayout.module.css';

export type DashboardTab =
  | 'dados'
  | 'ranking'
  | 'graficos'
  | 'matrizes'
  | 'didatico'
  | 'rankreversal'
  | 'sobre';

interface DashboardLayoutProps {
  data: TopsisData | null;
  fileName: string | null;
  weights: number[];
  weightLocks: boolean[];
  onWeightLocksChange: (locks: boolean[]) => void;
  method: 'topsis' | 'rad';
  dplVpl: DplVplValues | null;
  fullResult: TopsisFullResult | null;
  parseError: string | null;
  onFileLoaded: (content: string, name: string) => void;
  onDataChange: (nextData: TopsisData) => void;
  onWeightsChange: (weights: number[]) => void;
  onMethodChange: (method: 'topsis' | 'rad') => void;
  onDplVplChange: (value: DplVplValues | null) => void;
  onCalculate: () => void;
  normalization: NormalizationMethod;
  onNormalizationChange: (n: NormalizationMethod) => void;
}

export function DashboardLayout({
  data,
  fileName,
  weights,
  weightLocks,
  onWeightLocksChange,
  method,
  dplVpl,
  fullResult,
  parseError,
  onFileLoaded,
  onDataChange,
  onWeightsChange,
  onMethodChange,
  onDplVplChange,
  onCalculate,
  normalization,
  onNormalizationChange,
}: DashboardLayoutProps) {
  const { lang, setLang, t } = useI18n();
  const { theme, toggle: toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<DashboardTab>('dados');
  const [weightInputMode, setWeightInputMode] = useState<'sliders' | 'radar'>('radar');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const goToTab = (id: DashboardTab) => {
    setActiveTab(id);
    setMobileNavOpen(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key !== 'Enter') return;
      if (!data || activeTab !== 'dados') return;
      e.preventDefault();
      onCalculate();
      setActiveTab('ranking');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [data, activeTab, onCalculate]);

  const tabs: { id: DashboardTab; label: string; icon: string }[] = [
    { id: 'dados', label: t('tab.data'), icon: '📁' },
    { id: 'ranking', label: t('tab.ranking'), icon: '🏆' },
    { id: 'graficos', label: t('tab.charts'), icon: '📊' },
    { id: 'matrizes', label: t('tab.matrices'), icon: '📐' },
    { id: 'rankreversal', label: t('tab.rankreversal'), icon: '🔄' },
    { id: 'didatico', label: t('tab.didactic'), icon: '▶' },
    { id: 'sobre', label: t('tab.about'), icon: '📖' },
  ];

  const handleExportCsv = () => {
    if (!fullResult?.ranking.length) return;
    const csv = exportRankingToCsv(fullResult.ranking, {
      position: t('ranking.col.position'),
      alternative: t('ranking.col.alternative'),
      score: t('ranking.col.score'),
    });
    const d = new Date();
    const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    downloadFile(csv, `ranking_topsis_${stamp}.csv`);
  };

  return (
    <div className={styles.wrapper}>
      <a href="#main-content" className={styles.skipLink}>
        {t('skip.content')}
      </a>

      {mobileNavOpen && (
        <button
          type="button"
          className={styles.backdrop}
          aria-label={t('menu.close')}
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        id="sidebar-nav"
        className={`${styles.sidebar} ${mobileNavOpen ? styles.sidebarOpen : ''}`}
      >
        <div className={styles.sidebarHeader}>
          <h1 className={styles.logo}>{t('app.brand')}</h1>
          <span className={styles.subtitle}>{t('app.subtitle')}</span>
        </div>

        <nav className={styles.nav} aria-label={t('nav.flow')}>
          <div className={styles.navSection}>
            <span className={styles.navLabel}>{t('nav.flow')}</span>
            {tabs.map((tab) => (
              (() => {
                const disabledNoData = !data && tab.id !== 'dados' && tab.id !== 'sobre';
                const disabledNoResult =
                  (tab.id === 'ranking' ||
                    tab.id === 'graficos' ||
                    tab.id === 'matrizes' ||
                    tab.id === 'didatico' ||
                    tab.id === 'rankreversal') &&
                  !fullResult;
                const isDisabled = disabledNoData || disabledNoResult;
                const tooltip = disabledNoData
                  ? t('tooltip.loadDataFirst')
                  : disabledNoResult
                    ? t('tooltip.calculateFirst')
                    : '';

                return (
                  <span key={tab.id} className={styles.navItemWrap} title={tooltip}>
                    <button
                      type="button"
                      onClick={() => goToTab(tab.id)}
                      className={`${styles.navItem} ${activeTab === tab.id ? styles.navItemActive : ''}`}
                      disabled={isDisabled}
                      aria-current={activeTab === tab.id ? 'page' : undefined}
                    >
                      <span className={styles.navIcon} aria-hidden>
                        {tab.icon}
                      </span>
                      <span>{tab.label}</span>
                    </button>
                  </span>
                );
              })()
            ))}
          </div>
        </nav>
      </aside>

      <main id="main-content" className={styles.main} tabIndex={-1}>
        <div className={styles.mainTopBar}>
          <button
            type="button"
            className={styles.menuToggle}
            onClick={() => setMobileNavOpen((o) => !o)}
            aria-expanded={mobileNavOpen}
            aria-controls="sidebar-nav"
            aria-label={mobileNavOpen ? t('menu.close') : t('menu.open')}
          >
            <span className={styles.menuToggleIcon} aria-hidden>
              {mobileNavOpen ? '✕' : '☰'}
            </span>
          </button>
          <div className={styles.mainTopSpacer} />
          <button
            type="button"
            className={styles.themeBtn}
            onClick={toggleTheme}
            title={theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')}
            aria-label={theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')}
          >
            <span aria-hidden>{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>
          <div className={styles.langMainWrap}>
            <span className={styles.langMainLabel}>{t('lang.label')}</span>
            <div className={styles.langFlagGroup} role="group" aria-label={t('lang.label')}>
              <button
                type="button"
                onClick={() => setLang('pt')}
                className={`${styles.langFlagBtn} ${lang === 'pt' ? styles.langFlagBtnActive : ''}`}
                title={t('lang.pt')}
                aria-label={t('lang.pt')}
              >
                <span aria-hidden>🇧🇷</span>
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`${styles.langFlagBtn} ${lang === 'en' ? styles.langFlagBtnActive : ''}`}
                title={t('lang.en')}
                aria-label={t('lang.en')}
              >
                <span aria-hidden>🇺🇸</span>
              </button>
              <button
                type="button"
                onClick={() => setLang('zh')}
                className={`${styles.langFlagBtn} ${lang === 'zh' ? styles.langFlagBtnActive : ''}`}
                title={t('lang.zh')}
                aria-label={t('lang.zh')}
              >
                <span aria-hidden>🇨🇳</span>
              </button>
              <button
                type="button"
                onClick={() => setLang('es')}
                className={`${styles.langFlagBtn} ${lang === 'es' ? styles.langFlagBtnActive : ''}`}
                title={t('lang.es')}
                aria-label={t('lang.es')}
              >
                <span aria-hidden>🇪🇸</span>
              </button>
            </div>
          </div>
        </div>
        {data && (
          <div className={styles.stats}>
            <StatCard
              label={t('stats.alternatives')}
              value={data.alternatives.length}
              icon="📋"
            />
            <StatCard
              label={t('stats.criteria')}
              value={data.criteria.length}
              icon="⚖️"
            />
            {fullResult && (
              <>
                <StatCard
                  label={t('stats.firstPlace')}
                  value={fullResult.ranking[0]?.alternative ?? '—'}
                  icon="🥇"
                  variant="accent"
                />
                <StatCard
                  label={t('stats.maxScore')}
                  value={fullResult.ranking[0]?.score.toFixed(3) ?? '—'}
                  icon="📈"
                />
              </>
            )}
          </div>
        )}

        <div className={styles.content}>
          {activeTab === 'dados' && (
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>{t('data.title')}</h2>
              <FileUpload onFileLoaded={onFileLoaded} />
              {parseError && <p className={styles.error}>{parseError}</p>}
              {data && fileName && (
                <p className={styles.info}>
                  {t('data.loaded')} <strong>{fileName}</strong>
                </p>
              )}
              <DatasetEditor data={data} onChange={onDataChange} disabled={!data} />
              {data && (
                <>
                  <details className={styles.advanced}>
                    <summary className={styles.advancedSummary}>{t('advanced.title')}</summary>
                    <div className={styles.advancedBody}>
                      <label className={styles.advancedLabel} htmlFor="norm-select">
                        {t('advanced.normalization')}
                      </label>
                      <select
                        id="norm-select"
                        className={styles.advancedSelect}
                        value={normalization}
                        onChange={(e) =>
                          onNormalizationChange(e.target.value as NormalizationMethod)
                        }
                      >
                        <option value="minmax">{t('advanced.minmax')}</option>
                        <option value="vector">{t('advanced.vector')}</option>
                      </select>
                      <p className={styles.advancedHint}>{t('advanced.hint')}</p>
                    </div>
                  </details>
                  {fullResult?.compute && (
                    <p className={styles.computeBanner} role="status">
                      {fullResult.compute.normalization === 'vector'
                        ? t('advanced.activeVector')
                        : t('advanced.activeMinmax')}
                      {' · '}
                      {fullResult.compute.directions.some((d) => d === 'cost')
                        ? t('advanced.activeMixedDir')
                        : t('advanced.activeBenefitOnly')}
                    </p>
                  )}
                  <div className={styles.methodSection}>
                    <span className={styles.methodLabel}>{t('rad.method.label')}</span>
                    <div className={styles.methodButtons}>
                      <button
                        type="button"
                        className={`${styles.methodBtn} ${method === 'topsis' ? styles.methodBtnActive : ''}`}
                        onClick={() => onMethodChange('topsis')}
                      >
                        {t('method.topsis')}
                      </button>
                      <button
                        type="button"
                        className={`${styles.methodBtn} ${method === 'rad' ? styles.methodBtnActive : ''}`}
                        onClick={() => onMethodChange('rad')}
                      >
                        {t('method.topsisRad')}
                      </button>
                    </div>
                  </div>
                  {method === 'rad' && (
                    <p className={styles.methodHint}>
                      {t('rad.method.a')} {t('rad.method.b')}
                    </p>
                  )}
                  {method === 'rad' && (
                    <DplVplInput
                      data={data}
                      value={dplVpl}
                      onChange={onDplVplChange}
                      disabled={!data}
                    />
                  )}
                  <div className={styles.weightSection}>
                    <div className={styles.weightModeToggle}>
                      <span className={styles.weightModeLabel}>{t('data.distribute')}</span>
                      <button
                        type="button"
                        onClick={() => setWeightInputMode('radar')}
                        className={`${styles.weightModeBtn} ${weightInputMode === 'radar' ? styles.weightModeBtnActive : ''}`}
                        title={t('data.radar')}
                      >
                        {t('data.radar')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeightInputMode('sliders')}
                        className={`${styles.weightModeBtn} ${weightInputMode === 'sliders' ? styles.weightModeBtnActive : ''}`}
                        title={t('data.sliders')}
                      >
                        {t('data.sliders')}
                      </button>
                    </div>
                    {weightInputMode === 'radar' ? (
                      <WeightRadarInput
                        data={data}
                        weights={weights}
                        onWeightsChange={onWeightsChange}
                        weightLocks={weightLocks}
                        onWeightLocksChange={onWeightLocksChange}
                        disabled={!data}
                      />
                    ) : (
                      <WeightSliders
                        data={data}
                        weights={weights}
                        onWeightsChange={onWeightsChange}
                        weightLocks={weightLocks}
                        onWeightLocksChange={onWeightLocksChange}
                        disabled={!data}
                      />
                    )}
                  </div>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      onClick={() => {
                        onWeightsChange(data.criteria.map(() => 100 / data.criteria.length));
                        onWeightLocksChange(data.criteria.map(() => false));
                      }}
                      className={styles.resetBtn}
                      title={t('data.resetTitle')}
                    >
                      {t('data.reset')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onCalculate();
                        goToTab('ranking');
                      }}
                      className={styles.calcBtn}
                      title={t('data.shortcutHint')}
                    >
                      {t('data.calculate')}
                    </button>
                  </div>
                </>
              )}
            </section>
          )}

          {activeTab === 'ranking' && fullResult && (
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>{t('ranking.title')}</h2>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className={styles.exportBtn}
                >
                  {t('ranking.export')}
                </button>
              </div>
              <RankingTable ranking={fullResult.ranking} />
            </section>
          )}

          {activeTab === 'graficos' && fullResult && (
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>{t('charts.title')}</h2>
              <TopsisDashboard result={fullResult} />
            </section>
          )}

          {activeTab === 'matrizes' && fullResult && (
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>{t('matrices.title')}</h2>
              <TopsisStepsView result={fullResult} method={method} />
            </section>
          )}

          {activeTab === 'didatico' && fullResult && (
            <section className={styles.panel}>
              <TopsisAnimatedFlow result={fullResult} method={method} />
            </section>
          )}

          {activeTab === 'rankreversal' && fullResult && data && (
            <section className={styles.panel}>
              <RankReversalAnalysis
                data={data}
                fullResult={fullResult}
                weights={weights}
                method={method}
                dplVpl={dplVpl}
                computeOptions={{
                  normalization,
                  directions: ensureDirections(data),
                }}
              />
            </section>
          )}

          {activeTab === 'sobre' && (
            <section className={styles.panel}>
              <AboutAlgorithm />
            </section>
          )}

          {activeTab !== 'dados' && activeTab !== 'sobre' && activeTab !== 'rankreversal' && !fullResult && data && (
            <section className={styles.panel}>
              <p className={styles.hint}>
                {t('hint.calculateFirst')}
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
