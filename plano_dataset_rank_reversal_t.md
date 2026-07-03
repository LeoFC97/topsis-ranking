# Plano: Dataset para Demonstração de Rank Reversal

## Dataset Final (substituir dataset_Tosis_Rad_Csv.csv)

| Alt | C1 | C2 | C3  | C4  |
|-----|----|----|-----|-----|
| A1  | 68 | 72 |  76 |  78 |
| A2  | 62 | 76 |  78 |  80 |
| A3  | 58 | 70 | 150 |  76 |
| A4  | 80 | 72 |  95 |  90 |
| A5  | 76 | 68 |  90 | 105 |
| A6  | 80 | 64 |  66 |  70 |
| A7  | 90 | 88 |  32 | 118 |
| A8  | 15 | 20 |   5 |  35 |
| A9  | 70 | 74 |  78 |  75 |
| A10 | 60 | 68 |  82 |  81 |

## Cenário 1 — TOPSIS padrão → A7 em 1º (score 0.5897)
## Cenário 2 — TOPSIS-RAD VPL=[50,50,20,50] DPL=[90,88,150,118] → A8 eliminada; A7 cai para 4º
## Cenário 3 — TOPSIS-RAD VPL=[10,15,5,30] DPL=[80,75,150,110] → A4 em 1º, A5 em 2º, A7 em 6º