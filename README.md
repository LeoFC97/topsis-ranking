# TOPSIS - Ranking Multicritério

Aplicação web para cálculo de ranking multicritério usando **TOPSIS** (Technique for Order of Preference by Similarity to Ideal Solution) e **TOPSIS-RAD** (com DPL/UPL para mitigar outliers).

## Como usar

1. Carregue um CSV com alternativas e critérios (formato: `alternativa,c1,c2,...`)
2. Defina os pesos dos critérios (sliders ou radar)
3. Opcionalmente ative TOPSIS-RAD e configure DPL/UPL
4. Calcule o ranking e explore gráficos, matrizes e análises

## Funcionalidades

- TOPSIS clássico e TOPSIS-RAD
- Detecção e remoção de outliers (UPL)
- Análise de rank reversal
- Gráficos e visualizações
- Exportação CSV

## Executar localmente

```bash
npm install
npm run dev
```

## Deploy

Build para produção: `npm run build`
