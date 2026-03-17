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

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FLeoFC97%2Ftopsis-ranking)

1. Clique no botão acima ou acesse [vercel.com/new](https://vercel.com/new)
2. Importe o repositório `LeoFC97/topsis-ranking`
3. Clique em **Deploy** (a Vercel detecta Vite automaticamente)
4. Pronto — seu link estará em `https://topsis-ranking-xxx.vercel.app`

Build local: `npm run build`
