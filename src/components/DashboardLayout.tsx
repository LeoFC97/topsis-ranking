import { useState } from 'react';
import { FileUpload } from './FileUpload';
import { WeightSliders } from './WeightSliders';
import { WeightRadarInput } from './WeightRadarInput';
import { RankingTable } from './RankingTable';
import { TopsisDashboard } from './TopsisDashboard';
import { TopsisStepsView } from './TopsisStepsView';
import { TopsisAnimatedFlow } from './TopsisAnimatedFlow';
import { AboutAlgorithm } from './AboutAlgorithm';
import { RankReversalAnalysis } from './RankReversalAnalysis';
import { StatCard } from './StatCard';
import { exportRankingToCsv, downloadFile } from '../lib/exportCsv';
import type { TopsisData, TopsisFullResult } from '../types';
import { useI18n, type Lang } from '../i18n';
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
  fullResult: TopsisFullResult | null;
  parseError: string | null;
  onFileLoaded: (content: string, name: string) => void;
  onWeightsChange: (weights: number[]) => void;
  onCalculate: () => void;
}

export function DashboardLayout({
  data,
  fileName,
  weights,
  fullResult,
  parseError,
  onFileLoaded,
  onWeightsChange,
  onCalculate,
}: DashboardLayoutProps) {
  const { lang, setLang, t } = useI18n();
  const [activeTab, setActiveTab] = useState<DashboardTab>('dados');
  const [weightInputMode, setWeightInputMode] = useState<'sliders' | 'radar'>('radar');

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
    const csv = exportRankingToCsv(fullResult.ranking);
    downloadFile(csv, 'ranking_topsis.csv');
  };

  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.logo}>TOPSIS</h1>
          <span className={styles.subtitle}>{t('app.subtitle')}</span>
          <div className={styles.langWrap}>
            <label htmlFor="lang" className={styles.langLabel}>
              {t('lang.label')}
            </label>
            <select
              id="lang"
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className={styles.langSelect}
            >
              <option value="pt">{t('lang.pt')}</option>
              <option value="en">{t('lang.en')}</option>
              <option value="zh">{t('lang.zh')}</option>
              <option value="es">{t('lang.es')}</option>
            </select>
          </div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <span className={styles.navLabel}>{t('nav.flow')}</span>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.navItem} ${activeTab === tab.id ? styles.navItemActive : ''}`}
                disabled={
                  (!data && tab.id !== 'dados' && tab.id !== 'sobre') ||
                  ((tab.id === 'ranking' ||
                    tab.id === 'graficos' ||
                    tab.id === 'matrizes' ||
                    tab.id === 'didatico' ||
                    tab.id === 'rankreversal') &&
                    !fullResult)
                }
              >
                <span className={styles.navIcon}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </aside>

      <main className={styles.main}>
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
              {data && (
                <>
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
                        disabled={!data}
                      />
                    ) : (
                      <WeightSliders
                        data={data}
                        weights={weights}
                        onWeightsChange={onWeightsChange}
                        disabled={!data}
                      />
                    )}
                  </div>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      onClick={() =>
                        onWeightsChange(data.criteria.map(() => 100 / data.criteria.length))
                      }
                      className={styles.resetBtn}
                      title={t('data.resetTitle')}
                    >
                      {t('data.reset')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onCalculate();
                        setActiveTab('ranking');
                      }}
                      className={styles.calcBtn}
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
              <TopsisStepsView result={fullResult} />
            </section>
          )}

          {activeTab === 'didatico' && fullResult && (
            <section className={styles.panel}>
              <TopsisAnimatedFlow result={fullResult} />
            </section>
          )}

          {activeTab === 'rankreversal' && fullResult && data && (
            <section className={styles.panel}>
              <RankReversalAnalysis
                data={data}
                fullResult={fullResult}
                weights={weights}
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
