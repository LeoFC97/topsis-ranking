# Plano: Dataset para Demonstração de Rank Reversal (TOPSIS vs TOPSIS-RAD)

## Objetivo

Dataset de 10 alternativas e 4 critérios (todos BENEFIT, pesos iguais = 0,25)
que demonstra três comportamentos distintos consoante o método utilizado.

| Cenário | Método | Resultado esperado |
|---------|--------|--------------------|
| 1 | TOPSIS padrão (10 alternativas) | **A7 em 1º** |
| 2 | TOPSIS-RAD com VPL (elimina apenas A8) | **A7 cai para 4º**; A5 em 1º |
| 3 | TOPSIS-RAD com DPL capping (sem eliminação) | **A4 em 1º**, A5 em 2º, A7 em 6º |

---

## Dataset

| Alt | C1 | C2 | C3  | C4  | Observação |
|-----|----|----|-----|-----|------------|
| A1  | 68 | 72 |  76 |  78 | |
| A2  | 62 | 76 |  78 |  80 | |
| A3  | 58 | 70 | 150 |  76 | Destaque em C3 |
| A4  | 80 | 72 |  95 |  90 | Equilibrado, forte em C3/C4 |
| A5  | 76 | 68 |  90 | 105 | Forte em C4 |
| A6  | 80 | 64 |  66 |  70 | |
| A7  | 90 | 88 |  32 | 118 | Extremo em C1/C2/C4; fraco em C3 |
| A8  | 15 | 20 |   5 |  35 | **Outlier extremo** — distorce normalização min-max |
| A9  | 70 | 74 |  78 |  75 | |
| A10 | 60 | 68 |  82 |  81 | |

**Mecanismo central:** A8 (outlier) força os limites min-max a serem extremos
(C1 range 15–90, C2 range 20–88), tornando a vantagem de A7 em C1/C2 máxima
no TOPSIS padrão. Ao remover ou limitar esse efeito (via VPL ou DPL), o ranking real emerge.

---

## Cenário 1 — TOPSIS padrão (todas as 10 alternativas)

Ranges com A8: C1=[15,90], C2=[20,88], C3=[5,150], C4=[35,118]

**Ranking:** A7 (0.5897) > A5 (0.5873) > A4 (0.5744) > A3 (0.5361) > A2 > A9 > A1 > A10 > A6 > A8

✅ **A7 em 1º**

---

## Cenário 2 — TOPSIS-RAD com VPL (veto/filtragem)

```
VPL = [48, 50, 20, 65]
DPL = [90, 88, 150, 118]
```

- A8 eliminada: falha em todos os critérios (15<48, 20<50, 5<20, 35<65)
- Normalização fixa: r_ij = (c_ij − VPL_j) / (DPL_j − VPL_j), clamped [0,1]
- Sem A8, C3=150 de A3 ganha peso; A7 fraca em C3=32 perde posição

**Ranking:** A5 (0.5754) > A4 (0.5436) > A3 (0.5365) > **A7 (0.4891)** > A2 > A9 > ...

✅ **A7 cai de 1º para 4º (−3 posições)**

---

## Cenário 3 — TOPSIS-RAD com DPL capping (sem eliminação)

```
VPL = [10, 15, 5, 30]    ← permissivo, nenhuma alternativa eliminada
DPL = [80, 75, 150, 110] ← limita A7: C1 90→80, C2 88→75, C4 118→110
```

- Todas as 10 alternativas mantidas
- A7 perde vantagem em C1, C2, C4 após capping
- A4 e A5 (mais equilibradas) sobem

**Ranking:** **A4 (0.7378)** > **A5 (0.7320)** > A3 (0.7221) > A9 > A10 > **A7 (0.6088)** > ...

✅ **A4 em 1º, A5 em 2º, A7 em 6º**
