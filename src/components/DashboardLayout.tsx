import { useState } from 'react';
import { FileUpload } from './FileUpload';
import { WeightSliders } from './WeightSliders';
import { WeightRadarInput } from './WeightRadarInput';
import { DplUplInput } from './DplUplInput';
import { OutliersPanel } from './OutliersPanel';
import { RankingTable } from './RankingTable';
import { TopsisDashboard } from './TopsisDashboard';
import { TopsisStepsView } from './TopsisStepsView';
import { TopsisAnimatedFlow } from './TopsisAnimatedFlow';
import { AboutAlgorithm } from './AboutAlgorithm';
import { RankReversalAnalysis } from './RankReversalAnalysis';
import { StatCard } from './StatCard';
import { exportRankingToCsv, downloadFile } from '../lib/exportCsv';
import type { TopsisData, TopsisFullResult } from '../types';
import type { DplUplValues } from './DplUplInput';
import styles from './DashboardLayout.module.css';

export type DashboardTab = 'dados' | 'ranking' | 'graficos' | 'matrizes' | 'didatico' | 'outliers' | 'rankreversal' | 'sobre';

interface DashboardLayoutProps {
  data: TopsisData | null;
  fileName: string | null;
  weights: number[];
  dplUpl: DplUplValues | null;
  fullResult: TopsisFullResult | null;
  parseError: string | null;
  onFileLoaded: (content: string, name: string) => void;
  onWeightsChange: (weights: number[]) => void;
  onDplUplChange: (value: DplUplValues | null) => void;
  onCalculate: () => void;
  onRemoveOutliers: (alternatives: string[]) => void;
}

const TABS: { id: DashboardTab; label: string; icon: string }[] = [
  { id: 'dados', label: 'Dados', icon: '📁' },
  { id: 'ranking', label: 'Ranking', icon: '🏆' },
  { id: 'graficos', label: 'Gráficos', icon: '📊' },
  { id: 'matrizes', label: 'Matrizes', icon: '📐' },
  { id: 'outliers', label: 'Outliers', icon: '⚠️' },
  { id: 'rankreversal', label: 'Rank Reversal', icon: '🔄' },
  { id: 'didatico', label: 'Modo Didático', icon: '▶' },
  { id: 'sobre', label: 'Sobre o Algoritmo', icon: '📖' },
];

export function DashboardLayout({
  data,
  fileName,
  weights,
  dplUpl,
  fullResult,
  parseError,
  onFileLoaded,
  onWeightsChange,
  onDplUplChange,
  onCalculate,
  onRemoveOutliers,
}: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('dados');
  const [weightInputMode, setWeightInputMode] = useState<'sliders' | 'radar'>('radar');

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
          <span className={styles.subtitle}>Ranking Multicritério</span>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <span className={styles.navLabel}>Fluxo</span>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.navItem} ${activeTab === tab.id ? styles.navItemActive : ''}`}
                disabled={
                  (!data && tab.id !== 'dados' && tab.id !== 'sobre') ||
                  ((tab.id === 'ranking' || tab.id === 'graficos' || tab.id === 'matrizes' || tab.id === 'didatico' || tab.id === 'rankreversal') &&
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
              label="Alternativas"
              value={data.alternatives.length}
              icon="📋"
            />
            <StatCard
              label="Critérios"
              value={data.criteria.length}
              icon="⚖️"
            />
            {fullResult && (
              <>
                <StatCard
                  label="1º Lugar"
                  value={fullResult.ranking[0]?.alternative ?? '—'}
                  icon="🥇"
                  variant="accent"
                />
                <StatCard
                  label="Score Máx."
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
              <h2 className={styles.panelTitle}>Entrada de dados</h2>
              <FileUpload onFileLoaded={onFileLoaded} />
              {parseError && <p className={styles.error}>{parseError}</p>}
              {data && fileName && (
                <p className={styles.info}>
                  Carregado: <strong>{fileName}</strong>
                </p>
              )}
              {data && (
                <>
                  <DplUplInput
                    data={data}
                    value={dplUpl}
                    onChange={onDplUplChange}
                    disabled={!data}
                  />
                  <div className={styles.weightSection}>
                    <div className={styles.weightModeToggle}>
                      <span className={styles.weightModeLabel}>Distribuir pesos:</span>
                      <button
                        type="button"
                        onClick={() => setWeightInputMode('radar')}
                        className={`${styles.weightModeBtn} ${weightInputMode === 'radar' ? styles.weightModeBtnActive : ''}`}
                        title="Visualização em radar"
                      >
                        Radar
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeightInputMode('sliders')}
                        className={`${styles.weightModeBtn} ${weightInputMode === 'sliders' ? styles.weightModeBtnActive : ''}`}
                        title="Sliders tradicionais"
                      >
                        Sliders
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
                      title="Todos os critérios com peso igual"
                    >
                      ⚖️ Redistribuir pesos
                    </button>
                    <button
                      type="button"
                      onClick={onCalculate}
                      className={styles.calcBtn}
                    >
                      Calcular ranking
                    </button>
                  </div>
                </>
              )}
            </section>
          )}

          {activeTab === 'ranking' && fullResult && (
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Ranking final</h2>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className={styles.exportBtn}
                >
                  📥 Exportar CSV
                </button>
              </div>
              <RankingTable ranking={fullResult.ranking} />
            </section>
          )}

          {activeTab === 'graficos' && fullResult && (
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Dashboard de gráficos</h2>
              <TopsisDashboard result={fullResult} />
            </section>
          )}

          {activeTab === 'matrizes' && fullResult && (
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Matrizes intermediárias</h2>
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
                dplUpl={dplUpl}
              />
            </section>
          )}

          {activeTab === 'sobre' && (
            <section className={styles.panel}>
              <AboutAlgorithm />
            </section>
          )}

          {activeTab === 'outliers' && data && (
            <section className={styles.panel}>
              {fullResult?.excludedAlternatives && fullResult.excludedAlternatives.length > 0 ? (
                <OutliersPanel
                  excludedAlternatives={fullResult.excludedAlternatives}
                  onRemoveAndRecalculate={onRemoveOutliers}
                />
              ) : fullResult ? (
                <p className={styles.hint}>
                  Nenhum outlier detectado. As alternativas qualificaram acima dos limites UPL.
                </p>
              ) : (
                <p className={styles.hint}>
                  Ative o TOPSIS-RAD na aba Dados, configure os limites DPL/UPL e calcule o ranking para detectar outliers.
                </p>
              )}
            </section>
          )}

          {activeTab !== 'dados' && activeTab !== 'outliers' && activeTab !== 'sobre' && activeTab !== 'rankreversal' && !fullResult && data && (
            <section className={styles.panel}>
              <p className={styles.hint}>
                Calcule o ranking na aba Dados para ver os resultados aqui.
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
