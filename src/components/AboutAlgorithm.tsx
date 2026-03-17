import styles from './AboutAlgorithm.module.css';

export function AboutAlgorithm() {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Sobre o algoritmo TOPSIS-RAD</h2>
      <p className={styles.intro}>
        O TOPSIS-RAD estende o TOPSIS clássico com níveis de referência definidos pelo decisor:
        <strong>DPL</strong> (níveis desejados) e <strong>UPL</strong> (níveis inaceitáveis).
      </p>

      <div className={styles.flowchart}>
        <div className={styles.nodeStandard}>
          <strong>Step 1.</strong> Entrada: alternativas (A), critérios (C), pesos (W), preferências (P)
        </div>
        <div className={styles.arrow}>↓</div>

        <div className={styles.nodeNovel}>
          <strong>Step 2*.</strong> Obter DPL e UPL do decisor
        </div>
        <div className={styles.arrow}>↓</div>

        <div className={styles.decisionRow}>
          <div className={styles.diamond}>
            <span>aᵢⱼ ≥ uⱼ?</span>
          </div>
          <div className={styles.sideNote}>Step 3*.i</div>
        </div>
        <div className={styles.branchRow}>
          <div className={styles.branch}>
            <span className={styles.branchLabel}>Não</span>
            <div className={styles.nodeDiscard}>Descartar aᵢ</div>
          </div>
          <div className={styles.branch}>
            <span className={styles.branchLabel}>Sim</span>
            <div className={styles.nodeNovel}>aᵢ → X_qualificadas</div>
          </div>
        </div>
        <div className={styles.arrow}>↓</div>

        <div className={styles.decisionRow}>
          <div className={styles.diamond}>
            <span>xᵢⱼ ≥ dⱼ?</span>
          </div>
          <div className={styles.sideNote}>Step 3*.ii</div>
        </div>
        <div className={styles.branchRow}>
          <div className={styles.branch}>
            <span className={styles.branchLabel}>Sim</span>
            <div className={styles.nodeCap}>cᵢⱼ = dⱼ</div>
          </div>
          <div className={styles.branch}>
            <span className={styles.branchLabel}>Não</span>
            <div className={styles.nodeCap}>cᵢⱼ = xᵢⱼ</div>
          </div>
        </div>
        <div className={styles.arrow}>↓</div>

        <div className={styles.nodeNovel}>
          <strong>Step 3*.</strong> Construir matriz C (limitada por DPL)
        </div>
        <div className={styles.arrow}>↓</div>

        <div className={styles.nodeStandard}>
          <strong>Step 4.</strong> Normalizar C → R
        </div>
        <div className={styles.arrow}>↓</div>

        <div className={styles.nodeStandard}>
          <strong>Step 5.</strong> Matriz ponderada R → T
        </div>
        <div className={styles.arrow}>↓</div>

        <div className={styles.nodeStandard}>
          <strong>Step 6.</strong> Determinar D⁺ e U⁻
        </div>
        <div className={styles.arrow}>↓</div>

        <div className={styles.nodeStandard}>
          <strong>Step 7.</strong> Calcular distâncias dᵢd e dᵢu
        </div>
        <div className={styles.arrow}>↓</div>

        <div className={styles.nodeStandard}>
          <strong>Step 8.</strong> Calcular score s⁻ = dᵢu / (dᵢd + dᵢu)
        </div>
        <div className={styles.arrow}>↓</div>

        <div className={styles.nodeOutput}>
          <strong>Step 9.</strong> Ordenar alternativas por score
        </div>
      </div>

      <div className={styles.legend}>
        <span className={styles.legendNovel}>■</span> Etapas TOPSIS-RAD
        <span className={styles.legendStandard}>■</span> Etapas TOPSIS padrão
      </div>

      <p className={styles.ref}>
        Baseado em Hwang & Yoon (1981) e na proposta TOPSIS-RAD com DPL/UPL.
      </p>
    </section>
  );
}
