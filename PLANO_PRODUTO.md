# 🏋️ FitAI Pro - Plano de Produto

## 📅 Data: 15/12/2024
## 🔄 Ponto de Restauração: `9edf154`

---

## 🎯 VISÃO DO PRODUTO

### O que é?
Um **app de treinos e nutrição com IA** que permite:
1. **Tirar foto da comida** → IA analisa calorias, proteínas, carboidratos, gorduras
2. **Tabela diária** → Mostra consumo total do dia (calorias, macros)
3. **Treinador Pessoal IA** → Baseado no objetivo (emagrecer/engordar/ganhar músculo)
4. **Dieta Recomendada** → Gerada pela IA baseada no objetivo
5. **Chat Motivacional** → Coach que ajuda a manter o foco

### Objetivo de Negócio
- **Vender via Kirvano** (plataforma de infoprodutos)
- **Página de vendas** para capturar leads
- **Modelo de assinatura** (mensal/anual)

---

## 📊 O QUE JÁ EXISTE (Análise do Projeto Atual)

### ✅ Funcionalidades Prontas

| Funcionalidade | Status | Arquivo |
|----------------|--------|---------|
| **Autenticação Supabase** | ✅ Funcionando | `AuthContext.jsx`, `Login.jsx` |
| **Scan de Comida (Foto)** | ✅ Funcionando | `FoodRecognition.jsx` |
| **Análise via N8N + GPT-4o** | ✅ Configurado | Webhook: `n8n.srv1121163.hstgr.cloud` |
| **Salvar refeição no Supabase** | ✅ Funcionando | `FoodRecognition.jsx` |
| **Histórico de refeições** | ✅ Funcionando | `History.jsx` |
| **Totais do dia** | ✅ Funcionando | `History.jsx` (groupMealsByDate) |
| **Gestão de Dieta** | ✅ Funcionando | `Diet.jsx` |
| **Comparação com Dieta** | ✅ Funcionando | `FoodRecognition.jsx` (compareToDiet) |
| **Compressão de Imagem** | ✅ Otimizada | `FoodRecognition.jsx` (compressImage) |
| **Toast Notifications** | ✅ Funcionando | `ToastSystem.jsx` |
| **Layout Mobile** | ✅ Funcionando | `Layout.jsx` |

### 📄 Schema do Banco de Dados (Supabase)

```sql
-- Tabelas existentes:
- profiles (metas diárias, peso, altura, objetivo)
- diets (dietas do nutricionista, meals planejadas)
- meals (refeições registradas com foto e análise IA)
- daily_summaries (resumo diário automático via trigger)
```

### 🔧 N8N já Configurado

**Endpoint ativo:** `POST /webhook/analyze-food`
```json
// Request
{
  "image": "base64...",
  "user_id": "uuid",
  "has_diet": true,
  "diet_targets": { "calories": 2000, "protein": 150 }
}

// Response
{
  "alimento_reconhecido": "Frango com Arroz",
  "classificacao_geral": "Refeição Saudável",
  "nutrientes": {
    "calorias_kcal": 450,
    "proteinas_g": 40,
    "carboidratos_g": 50,
    "gorduras_g": 12
  },
  "estimativa_confianca": 0.92,
  "observacoes": "Boa fonte de proteína...",
  "alimentos_identificados": [...]
}
```

### 📁 Dados de Treino/Dieta Mock
O arquivo `data.js` já tem:
- **Perfil mock** (Alan, 35-45 anos, 100-110kg, meta 90-95kg)
- **5 treinos** (Push/Pull/Legs/FullBody/Cardio)
- **Plano de dieta** (5 refeições, macros 2100-2300kcal)

---

## ❌ O QUE AINDA NÃO EXISTE

| Funcionalidade | Prioridade | Esforço |
|----------------|------------|---------|
| **Onboarding (coletar dados do usuário)** | 🔴 Alta | Médio |
| **Geração de Plano por IA (TMB/GET)** | 🔴 Alta | Médio |
| **Endpoint `/generate-plan` no N8N** | 🔴 Alta | Médio |
| **Dashboard com progresso** | 🔴 Alta | Médio |
| **Chat Coach Motivacional** | 🟡 Média | Médio |
| **Endpoint `/chat-coach` no N8N** | 🟡 Média | Baixo |
| **Tela de Treino Semanal** | 🟡 Média | Médio |
| **Novo Design (Stitch templates)** | 🟡 Média | Alto |
| **Página de Vendas** | 🟢 Depois | Alto |
| **Integração Kirvano** | 🟢 Depois | Médio |

---

## 🎨 NOVO DESIGN (Stitch Templates)

Temos 8 telas prontas em HTML/TailwindCSS:

1. `tela_inicial_do_dashboard` - Dashboard com calorias restantes
2. `food_photo_camera` - Câmera com animação de scan
3. `food_analysis_results` - Resultados com gráfico donut
4. `chatbot_motivacional` - Chat com Coach IA
5. `perfil_do_usuário` - Perfil com metas
6. `metas_de_macronutrientes_e_metabolismo` - TMB/GET/Macros
7. `plano_de_treino_semanal` - Calendario + exercícios
8. `integração_do_treinador_pessoal` - Onboarding

**Design System:**
- Cor primária: `#4cdf20` (verde neon)
- Background dark: `#152111`
- Font: Manrope
- Icons: Material Symbols

---

## 🏗️ ARQUITETURA PROPOSTA

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                      │
│                       "APP BURRO"                                │
├─────────────────────────────────────────────────────────────────┤
│  services/api.ts                                                 │
│  ├── analyzeFood(imageBase64, userId)     → POST /analyze-food  │
│  ├── generatePlan(userData)                → POST /generate-plan │
│  └── chatCoach(message, context)           → POST /chat-coach   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     N8N (MIDDLEWARE)                             │
├─────────────────────────────────────────────────────────────────┤
│  /analyze-food    → GPT-4o Vision → Análise nutricional          │
│  /generate-plan   → Cálculo TMB/GET + GPT-4 → Treino/Dieta       │
│  /chat-coach      → GPT-4 + Contexto → Resposta motivacional     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SUPABASE                                     │
├─────────────────────────────────────────────────────────────────┤
│  Auth        → Autenticação de usuários                          │
│  Database    → profiles, meals, diets, daily_summaries          │
│  Storage     → meal-images, diet-files                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 FÓRMULAS DE NUTRIÇÃO

### TMB (Taxa Metabólica Basal) - Fórmula Mifflin-St Jeor

**Homens:**
```
TMB = (10 × peso_kg) + (6,25 × altura_cm) - (5 × idade) + 5
```

**Mulheres:**
```
TMB = (10 × peso_kg) + (6,25 × altura_cm) - (5 × idade) - 161
```

### GET (Gasto Energético Total)

```
GET = TMB × Fator de Atividade

Fatores:
- Sedentário (pouco ou nenhum exercício): 1.2
- Levemente ativo (1-3 dias/semana): 1.375
- Moderadamente ativo (3-5 dias/semana): 1.55
- Muito ativo (6-7 dias/semana): 1.725
- Extremamente ativo (atleta): 1.9
```

### Macros por Objetivo

**Emagrecimento (déficit 300-500kcal):**
- Proteína: 2.0g/kg de peso
- Carboidrato: 40% das calorias
- Gordura: 25% das calorias

**Hipertrofia (superávit 300-500kcal):**
- Proteína: 1.8-2.2g/kg de peso
- Carboidrato: 50% das calorias
- Gordura: 25% das calorias

**Manutenção:**
- Proteína: 1.6g/kg de peso
- Carboidrato: 45% das calorias
- Gordura: 30% das calorias

---

## 🚀 PLANO DE IMPLEMENTAÇÃO

### Fase 1: Onboarding + Geração de Plano (PRIORIDADE)
1. [ ] Criar tela Onboarding.tsx
2. [ ] Criar endpoint `/generate-plan` no N8N
3. [ ] Calcular TMB/GET no N8N
4. [ ] Gerar treino/dieta via GPT-4
5. [ ] Salvar plano no Supabase

### Fase 2: Dashboard + Novo Design
1. [ ] Aplicar design system (cores, fonts)
2. [ ] Refatorar Dashboard com novo layout
3. [ ] Implementar círculo de progresso
4. [ ] Cards de macros

### Fase 3: Chat Coach
1. [ ] Criar endpoint `/chat-coach` no N8N
2. [ ] Criar tela Chat.tsx
3. [ ] Implementar histórico de mensagens

### Fase 4: Monetização
1. [ ] Página de vendas
2. [ ] Integração Kirvano
3. [ ] Sistema de planos (free/premium)

---

## 🔐 PONTO DE RESTAURAÇÃO

Se algo der errado, volte para:
```bash
git checkout 9edf154
```

Ou para ver o histórico:
```bash
git log --oneline -10
```

---

## ✅ ENTENDI CORRETAMENTE?

**SIM!** O projeto é:

1. **App de foto de comida** → Análise nutricional por IA ✅
2. **Tabela com consumo diário** → Soma calorias/macros ✅
3. **Treinador Pessoal IA** → Baseado no objetivo do cliente
4. **Dieta recomendada** → Gerada pela IA
5. **Vender via Kirvano** → Página de vendas + integração
6. **Autenticação Supabase** → Mantém o Supabase

---

*Documento gerado em 15/12/2024*
