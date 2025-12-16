# 🔖 CHECKPOINT - FitAI Pro
**Data:** 15/12/2024 às 23:26
**Commit:** `db60027`

---

## 🚀 COMO CONTINUAR

### 1. Iniciar o servidor
```powershell
cd "c:\Users\Alan Moreira\Documents\54 - FITNES\fitness-pro"
npm run dev
```

### 2. URLs importantes
- **Local:** http://localhost:5173
- **Produção:** https://mynutrisnap.vercel.app
- **GitHub:** https://github.com/alankardecm/calai-app
- **N8N:** https://n8n.srv1121163.hstgr.cloud

---

## 📱 ESTADO ATUAL DO APP

### Páginas funcionando:
| Rota | Página | Status |
|------|--------|--------|
| `/login` | Login | ✅ |
| `/` | Dashboard | ✅ |
| `/onboarding` | Configurar Treinador IA | ✅ NOVO |
| `/workouts` | Plano de Treinos | ✅ NOVO |
| `/coach` | Chat Coach IA | ✅ NOVO |
| `/scan` | Scanner de Comida | ✅ |
| `/history` | Histórico | ✅ |
| `/profile` | Perfil | ✅ |

### Workflows N8N ativos:
| Endpoint | Função | Modelo |
|----------|--------|--------|
| `/analyze-food` | Analisar foto de comida | GPT-4o Vision |
| `/chat-coach` | Chat motivacional | GPT-4o-mini |
| `/generate-plan` | Gerar plano treino/dieta | GPT-4o |

---

## 🎯 PRÓXIMAS TAREFAS (por prioridade)

### Alta Prioridade
- [ ] **Testar fluxo completo:** Login → Onboarding → Dashboard → Coach
- [ ] **Redirecionar novos usuários** para /onboarding automaticamente
- [ ] **Página de Vendas** para Kirvano

### Média Prioridade
- [ ] Melhorar PWA (manifest.json, ícones)
- [ ] Gráficos de progresso (histórico visual)
- [ ] Notificações push (lembrete de refeições)

### Baixa Prioridade
- [ ] Temas (dark/light)
- [ ] Exportar dados (PDF/CSV)
- [ ] Integração com smartwatch

---

## 🧠 ARQUITETURA

```
[App React/Vite] ←→ [N8N Webhooks] ←→ [OpenAI GPT-4]
       ↓                                    
  [Supabase]                              
  - profiles                              
  - meals                                 
  - diets                                 
```

### Cálculos científicos usados:
- **TMB:** Mifflin-St Jeor (1990)
- **TDEE:** Fatores PAL da OMS
- **Macros:** ISSN Guidelines

---

## 📁 ARQUIVOS PRINCIPAIS

```
src/
├── pages/
│   ├── Onboarding.jsx     # Configurar Treinador IA
│   ├── Coach.jsx          # Chat motivacional
│   ├── Workouts.jsx       # Plano de treinos
│   ├── Dashboard.jsx      # Home
│   └── Profile.jsx        # Perfil + link config
├── components/
│   ├── Layout.jsx         # Bottom nav
│   └── FoodRecognition.jsx # Scanner
└── App.jsx                # Rotas

n8n-workflow-coach-chat.json      # Workflow chat
n8n-workflow-generate-plan.json   # Workflow plano
N8N_BRAIN_SETUP.md                # Documentação N8N
```

---

## 💡 DICAS RÁPIDAS

1. **Testar Coach:** Acesse `/coach` e envie uma mensagem
2. **Testar Onboarding:** Acesse `/onboarding` e preencha os dados
3. **Ver N8N:** Acesse https://n8n.srv1121163.hstgr.cloud
4. **Logs:** F12 → Console no navegador

---

## 🔧 COMANDOS ÚTEIS

```powershell
# Iniciar dev
npm run dev

# Build produção
npm run build

# Commit e push
git add -A && git commit -m "feat: sua mensagem" && git push origin main
```

---

**Boa continuação! 🚀**
