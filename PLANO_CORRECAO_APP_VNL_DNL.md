# Plano de Correção: VNL e DNL no Aplicativo TOPSIS-RAD

## Problema Identificado

### Cálculo Atual (INCORRETO) - linha 271-275 em `src/lib/topsis.ts`:
```typescript
const { PIS: PIS_R, NIS: NIS_R } = computePISNIS(R, directions);
const PIS = PIS_R.map((p, j) => p * w[j]);
const NIS = NIS_R.map((n, j) => n * w[j]);
```

**O que faz atualmente:**
1. Calcula PIS/NIS a partir dos valores máximos/mínimos da matriz normalizada R
2. Multiplica esses valores pelos pesos

**Exemplo com os dados do Toy B:**
- R[j] tem valores entre 0 e 1 após normalização
- PIS_R[j] = max(R[:,j]) ≈ 1.0 para benefício
- NIS_R[j] = min(R[:,j]) ≈ valores variados (não zero!)
- Resultado: VNL ≠ {0, 0, 0, 0}

### Cálculo Correto (segundo suas instruções):

Para critérios de **benefício** (p_j = 1):
- **DNL[j] = w[j]** (peso normalizado)
- **VNL[j] = 0** (sempre zero)

Para critérios de **custo** (p_j = -1):
- **DNL[j] = 0** (sempre zero)
- **VNL[j] = w[j]** (peso normalizado)

**Justificativa matemática:**
- A normalização RAD já mapeia o VPL → 0 e DPL → 1
- Após ponderação pela matriz T, temos: t_ij = r_ij × w_j
- Portanto, o valor ponderado do VPL é: 0 × w_j = 0
- E o valor ponderado do DPL é: 1 × w_j = w_j

---

## Arquivos a Modificar

### 1. **src/lib/topsis.ts** (ALTA PRIORIDADE) ✗
**Localização:** Linhas 271-275 (função `topsisRad`)

**Mudança:**
```typescript
// REMOVER (linhas 271-275):
const { PIS: PIS_R, NIS: NIS_R } = computePISNIS(R, directions);
const PIS = PIS_R.map((p, j) => p * w[j]);
const NIS = NIS_R.map((n, j) => n * w[j]);

// SUBSTITUIR POR:
// TOPSIS-RAD: DNL and VNL are computed directly from weights and criterion directions
// For benefit criteria: DNL[j] = w[j], VNL[j] = 0
// For cost criteria: DNL[j] = 0, VNL[j] = w[j]
const PIS: number[] = []; // DNL (Desired Normalized Level)
const NIS: number[] = []; // VNL (Vetoed Normalized Level)
for (let j = 0; j < n; j++) {
  if (directions[j] === 'benefit') {
    PIS.push(w[j]);  // DNL = w_j
    NIS.push(0);     // VNL = 0
  } else {
    PIS.push(0);     // DNL = 0
    NIS.push(w[j]);  // VNL = w_j
  }
}
```

**Comentário adicional a remover:** Linha 271-273 (comentário está incorreto)

---

### 2. **src/i18n.tsx** (MÉDIA PRIORIDADE) ⚠️
**Localização:** Linhas 115-121

**Descrições INCORRETAS a corrigir:**

**Linha 117:**
```typescript
// ATUAL (ERRADO):
'steps.step4.descriptionRad': 'DNL = max por coluna (benefício), VNL = min por coluna.',

// CORRETO:
'steps.step4.descriptionRad': 'DNL = peso do critério (benefício), VNL = 0.',
```

**Linha 121:**
```typescript
// ATUAL (ERRADO):
'Por critério j: em benefício, DNL_j = max_i(t_ij) e VNL_j = min_i(t_ij); em custo, DNL_j = min_i(t_ij) e VNL_j = max_i(t_ij).',

// CORRETO:
'Por critério j: em benefício, DNL_j = w_j e VNL_j = 0; em custo, DNL_j = 0 e VNL_j = w_j.',
```

**Linha 163:**
```typescript
// ATUAL (pode melhorar):
'didactic.step4.descriptionRad': 'Nível desejado (DNL, melhor) e inaceitável (VNL, pior) por critério.',

// MELHOR:
'didactic.step4.descriptionRad': 'DNL = peso (nível desejado), VNL = 0 (nível inaceitável) para benefício.',
```

**Linha 167:**
```typescript
// ATUAL (ERRADO):
'Com critérios de custo: DNL usa o melhor valor por coluna (mínimo no custo) e VNL o pior (máximo no custo).',

// CORRETO:
'Para custo: DNL = 0, VNL = peso do critério.',
```

---

## Steps de Implementação

### Step 1: Corrigir cálculo do DNL/VNL ✗
**Arquivo:** `src/lib/topsis.ts` (linhas 271-275)

**Ação:**
1. Remover chamada a `computePISNIS(R, directions)`
2. Calcular PIS (DNL) e NIS (VNL) diretamente dos pesos e direções
3. Atualizar/remover comentário incorreto

**Teste:**
- Com w = [0.25, 0.25, 0.25, 0.25] e todos critérios benefício
- Esperar: PIS = [0.25, 0.25, 0.25, 0.25], NIS = [0, 0, 0, 0]

### Step 2: Atualizar textos de interface ⚠️
**Arquivo:** `src/i18n.tsx`

**Ação:**
1. Corrigir descrição em `steps.step4.descriptionRad` (linha 117)
2. Corrigir explicação detalhada (linha 121)
3. Corrigir descrição didática (linha 163)
4. Corrigir texto sobre critérios de custo (linha 167)

**Verificação:**
- Revisar todos os textos que mencionam "max", "min", "coluna" em contexto de DNL/VNL
- Substituir por "peso", "w_j", "0"

### Step 3: Testar com Toy Example B 📊
**Dados de entrada:**
- Alternatives: A1-A10 (exceto A8 que viola VPL)
- Weights: [0.25, 0.25, 0.25, 0.25]
- Directions: ['benefit', 'benefit', 'benefit', 'benefit']
- VPL: [20, 20, 20, 20]
- DPL: [90, 88, 150, 118]

**Resultados esperados:**
```
DNL = [0.25, 0.25, 0.25, 0.25]
VNL = [0, 0, 0, 0]

Matriz T (já calculada corretamente):
       C1      C2      C3      C4
A1:  0.1714  0.1912  0.1038  0.1480
A2:  0.1500  0.2059  0.1115  0.1531
A3:  0.1357  0.1838  0.2500  0.1429
A4:  0.2143  0.1912  0.1519  0.1786
A5:  0.2500  0.2500  0.0519  0.2500
A6:  0.2143  0.1618  0.0885  0.1276
A7:  0.2000  0.1765  0.1500  0.2168
A9:  0.1786  0.1985  0.1115  0.1403
A10: 0.1429  0.1765  0.1192  0.1556

Distâncias esperadas (d_iw ao VNL=[0,0,0,0]):
A1:  √(0.1714² + 0.1912² + 0.1038² + 0.1480²) = 0.3225
A2:  0.3265
A3:  0.3681
A4:  0.3895
A5:  0.4367
A6:  0.3215
A7:  0.3898
A9:  0.3276
A10: 0.3121

Distâncias esperadas (d_ib ao DNL=[0.25,0.25,0.25,0.25]):
A1:  √[(0.1714-0.25)² + ... + (0.1480-0.25)²] = 0.1833
...
(ver cálculos completos no plano LaTeX)

Ranking esperado:
1. A4 (0.7647)
2. A7 (0.7553)
3. A3 (0.6978)
4. A5 (0.6880)
5. A2/A9 (empate em 0.6463)
...
```

### Step 4: Testar com Toy Example C 📊
**Dados de entrada:**
- Alternatives: A1-A10 (todos qualificados)
- Weights: [0.25, 0.25, 0.25, 0.25]
- Directions: ['benefit', 'benefit', 'benefit', 'benefit']
- VPL: [15, 20, 5, 40]
- DPL: [80, 80, 80, 80]

**Resultados esperados:**
```
DNL = [0.25, 0.25, 0.25, 0.25]
VNL = [0, 0, 0, 0]

Ranking esperado:
1. A4 (0.9356)
2. A7 (0.8997)
3. A9 (0.8895)
4. A1 (0.8781)
5. A2 (0.8647)
...
```

### Step 5: Validação final ✓
**Checklist:**
- [ ] DNL sempre igual aos pesos para critérios benefício
- [ ] VNL sempre igual a zero para critérios benefício
- [ ] Rankings coincidem com os calculados manualmente (plano LaTeX)
- [ ] Interface mostra textos corretos sobre DNL/VNL
- [ ] Nenhum erro de console
- [ ] Exportação CSV/LaTeX reflete os valores corretos

---

## Impacto das Mudanças

### Código (TypeScript):
- **1 arquivo modificado:** `src/lib/topsis.ts`
- **~10 linhas alteradas** (substituir 5 linhas por ~15)
- **Compatibilidade:** Não quebra API, apenas corrige cálculo
- **Performance:** Melhor (não precisa calcular max/min da matriz R)

### Interface (i18n):
- **1 arquivo modificado:** `src/i18n.tsx`
- **~4 textos corrigidos**
- **Idioma:** Apenas português (pt-BR) precisa ser corrigido por enquanto

### Testes:
- **Dados de teste:** Usar datasets do LaTeX (Toy B e C)
- **Validação:** Comparar com cálculos manuais
- **Regressão:** Verificar que TOPSIS tradicional continua funcionando

---

## Código Completo da Correção

### Arquivo: `src/lib/topsis.ts`

**Localizar linhas 271-275 e substituir:**

```typescript
// ANTES (INCORRETO):
  // TOPSIS-RAD: PIS/NIS calculated from normalized matrix R (not weighted T)
  // This ensures VNL (NIS) reflects actual minimum values from qualified alternatives
  // in the normalized space, avoiding zeros when alternatives are filtered by VPL
  const { PIS: PIS_R, NIS: NIS_R } = computePISNIS(R, directions);
  const PIS = PIS_R.map((p, j) => p * w[j]);
  const NIS = NIS_R.map((n, j) => n * w[j]);

// DEPOIS (CORRETO):
  // TOPSIS-RAD: DNL and VNL computed directly from weights and criterion directions.
  // The RAD normalization maps VPL→0 and DPL→1. After weighting:
  //   - For benefit criteria: VNL[j] = 0 × w[j] = 0, DNL[j] = 1 × w[j] = w[j]
  //   - For cost criteria: VNL[j] = 1 × w[j] = w[j], DNL[j] = 0 × w[j] = 0
  const PIS: number[] = []; // DNL (Desired Normalized Level)
  const NIS: number[] = []; // VNL (Vetoed Normalized Level)
  for (let j = 0; j < n; j++) {
    if (directions[j] === 'benefit') {
      PIS.push(w[j]);  // DNL = w[j]
      NIS.push(0);     // VNL = 0
    } else {
      // For cost criteria: the logic reverses
      PIS.push(0);     // DNL = 0
      NIS.push(w[j]);  // VNL = w[j]
    }
  }
```

---

## Cronograma de Execução

1. **Step 1** (código): 10-15 min
2. **Step 2** (textos): 5-10 min
3. **Step 3** (teste Toy B): 10-15 min
4. **Step 4** (teste Toy C): 5-10 min
5. **Step 5** (validação): 10-15 min

**Total estimado:** 40-65 minutos

---

## Verificação Pós-Implementação

### Teste Manual:
1. Abrir aplicativo em `http://localhost:5173`
2. Carregar dataset: `dataset_Tosis_Rad_Csv.csv`
3. Configurar TOPSIS-RAD:
   - VPL: [20, 20, 20, 20]
   - DPL: [90, 88, 150, 118]
4. Verificar no passo "DNL e VNL":
   - DNL = [0.25, 0.25, 0.25, 0.25] ✓
   - VNL = [0, 0, 0, 0] ✓
5. Verificar ranking final:
   - 1º lugar: A4 ✓
   - 2º lugar: A7 ✓
   - 3º lugar: A3 ✓

### Teste Automatizado (opcional):
```bash
npm test -- topsis.test.ts
```

---

## Notas Importantes

- ✅ Esta correção NÃO afeta TOPSIS tradicional (função `topsis`)
- ✅ Apenas `topsisRad` é modificado
- ✅ Compatível com critérios de benefício E custo
- ✅ Mais eficiente (não precisa calcular extremos de R)
- ⚠️ Rankings mudarão para datasets já processados (é uma correção!)
