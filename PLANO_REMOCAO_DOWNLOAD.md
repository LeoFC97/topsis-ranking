# Plano: Remover Funcionalidade de Salvamento de Imagens

## Objetivo
Remover completamente a funcionalidade de botões de download/salvamento de imagens que foi adicionada e apresentou problemas de qualidade visual.

## Escopo da Remoção

### 1. Componentes a deletar
- [ ] `src/components/DownloadButton.tsx` — Componente de botão de download
- [ ] `src/components/DownloadButton.module.css` — Estilos do DownloadButton

### 2. Bibliotecas de exportação a deletar
- [ ] `src/lib/exportTables.ts` — Funções de exportação de tabelas (CSV, Excel, PDF, JSON, LaTeX)
- [ ] `src/lib/exportCharts.ts` — Funções de exportação de gráficos (PNG, SVG, PDF)

### 3. Componentes a modificar (remover uso de DownloadButton)
- [ ] `src/components/AnimatedMatrixTable.tsx`
  - Remover: `import DownloadButton`
  - Remover: prop `showDownload?: boolean`
  - Remover: bloco `{showDownload && (<DownloadButton ... />)}`
  
- [ ] `src/components/CriteriaRadarChart.tsx`
  - Remover: `import DownloadButton`
  - Remover: prop `showDownload?: boolean`
  - Remover: bloco `{showDownload && (<DownloadButton ... />)}`

### 4. Strings de tradução a revisar
- [ ] `src/i18n.tsx` — Revisar e remover chaves de tradução relacionadas a download (se não forem usadas em outros lugares)

### 5. Dependências npm a remover
As seguintes bibliotecas são usadas **apenas** para exportação de imagens/tabelas:
- [ ] `html2canvas` (^1.4.1) — Captura gráficos como PNG
- [ ] `jspdf` (^4.2.1) — Gera PDFs
- [ ] `jszip` (^3.10.1) — Cria arquivos ZIP
- [ ] `xlsx` (^0.18.5) — Exporta para Excel

**Manter:**
- `exportCsv.ts` será mantido (usado por DashboardLayout e DatasetEditor para CSV de dados/ranking)

## Etapas de Execução

### ✅ 1. Revisão concluída
- `exportCsv.ts` mantido (usado por DashboardLayout e DatasetEditor)
- Dependências de export identificadas: html2canvas, jspdf, jszip, xlsx

### ✅ 2. Arquivos deletados
- ❌ `src/components/DownloadButton.tsx`
- ❌ `src/components/DownloadButton.module.css`
- ❌ `src/lib/exportTables.ts`
- ❌ `src/lib/exportCharts.ts`

### ✅ 3. Componentes atualizados
- ✏️ `AnimatedMatrixTable.tsx` — Removido import DownloadButton, prop showDownload e renderização
- ✏️ `CriteriaRadarChart.tsx` — Removido import DownloadButton, prop showDownload e renderização
- ✏️ `MatrixHeatmap.tsx` — Removido import DownloadButton, prop showDownload e renderização
- ✏️ `RankingBarChart.tsx` — Removido import DownloadButton, prop showDownload e renderização
- ✏️ `RankingTable.tsx` — Removido import DownloadButton, prop showDownload e renderização
- ✏️ `MatrixViewer.tsx` — Removido import DownloadButton, prop showDownload e renderização
- ✏️ `TopsisDashboard.tsx` — Removido import DownloadButton, props showDownload e "Download All"

### ✅ 4. Dependências npm removidas
- ❌ `html2canvas` (^1.4.1)
- ❌ `jspdf` (^4.2.1)
- ❌ `jszip` (^3.10.1)
- ❌ `xlsx` (^0.18.5)

### ✅ 5. Compilação concluída
- TypeScript: ✅ PASSED
- Vite build: ✅ PASSED
- Bundle size reduzido (1.37s de build)

## Resultado Esperado
- ✅ Aplicação compila sem erros
- ✅ Nenhum botão de download visível na interface
- ✅ Matrizes e gráficos exibem corretamente sem os botões
- ✅ Tamanho do bundle reduzido (remoção de bibliotecas de export)

---

## Resumo das Mudanças

### Arquivos Deletados (4)
1. `src/components/DownloadButton.tsx` — Componente de botão com dropdown para múltiplos formatos
2. `src/components/DownloadButton.module.css` — Estilos associados
3. `src/lib/exportTables.ts` — Exporta tabelas para CSV, Excel, PDF, JSON, LaTeX
4. `src/lib/exportCharts.ts` — Exporta gráficos para PNG, SVG, PDF

### Arquivos Modificados (7)
1. **AnimatedMatrixTable.tsx**
   - Removido: `import DownloadButton`
   - Removido: prop `showDownload?: boolean`
   - Removido: bloco de renderização `{showDownload && <DownloadButton ... />}`
   - Removido: variáveis de preparação de dados (tableHeaders, tableData)

2. **CriteriaRadarChart.tsx**
   - Removido: `import DownloadButton`
   - Removido: prop `showDownload?: boolean`
   - Removido: bloco de renderização
   - Simplificado: layout do cabeçalho (sem flexbox para alinhamento)

3. **MatrixHeatmap.tsx**
   - Removido: `import DownloadButton`
   - Removido: prop `showDownload?: boolean`
   - Removido: `useRef` para heatmapRef
   - Removido: bloco de renderização

4. **RankingBarChart.tsx**
   - Removido: `import DownloadButton`
   - Removido: `useRef` desnecessário
   - Removido: prop `showDownload?: boolean`
   - Removido: bloco de renderização

5. **RankingTable.tsx**
   - Removido: `import DownloadButton`
   - Removido: prop `showDownload?: boolean`
   - Removido: variáveis de preparação (tableHeaders, tableData)
   - Removido: bloco de renderização

6. **MatrixViewer.tsx**
   - Removido: `import DownloadButton`
   - Removido: `useRef` para tableRef
   - Removido: prop `showDownload?: boolean`
   - Removido: variáveis de preparação
   - Removido: bloco de renderização

7. **TopsisDashboard.tsx**
   - Removido: `import DownloadButton`
   - Removido: `useRef` para múltiplas referências (barChartRef, radarChartRef, heatmapRef)
   - Removido: `chartReferences` array
   - Removido: "Download All Charts" button
   - Removido: props `showDownload={true}` de componentes filhos

### Dependências npm Removidas (4)
```json
- "html2canvas": "^1.4.1"
- "jspdf": "^4.2.1"
- "jszip": "^3.10.1"
- "xlsx": "^0.18.5"
```

### Manutenção
- ✅ `src/lib/exportCsv.ts` mantido (essencial para exportar CSV de dados/ranking)
- ✅ `src/components/DashboardLayout.tsx` — Continua usando CSV export
- ✅ `src/components/DatasetEditor.tsx` — Continua usando CSV export
