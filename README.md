# 📱 NutriSnap - Monitoramento Nutricional com IA

App mobile-first para monitoramento de refeições usando inteligência artificial. Tire fotos das suas refeições e obtenha análise nutricional instantânea!

## ✨ Funcionalidades

### 📸 Scanner de Alimentos
- Tire foto do seu prato
- IA analisa e identifica todos os alimentos
- Cálculo automático de macronutrientes (calorias, proteínas, carboidratos, gorduras)
- Estimativa de porções

### 🥗 Dieta do Nutricionista
- Cadastre a dieta passada pelo seu nutricionista
- Defina metas diárias personalizadas
- Planeje refeições com horários e alimentos
- Upload de PDF/foto da dieta original

### 📊 Comparação Inteligente
- Cada refeição é comparada com sua dieta
- Alertas quando sair do plano
- Sugestões personalizadas baseadas no objetivo
- Score de aderência à dieta

### 📈 Estatísticas
- Histórico completo de refeições
- Gráficos de progresso
- Resumo semanal/mensal
- Streak de dias consistentes

### 🎯 Objetivos
- **Emagrecimento**: Foco em déficit calórico e proteínas
- **Fortalecimento**: Prioridade em proteínas e calorias
- **Manutenção**: Equilíbrio nutricional

## 🚀 Tecnologias

- **Frontend**: React 19 + Vite
- **Estilização**: TailwindCSS
- **Backend**: Supabase (Auth + Database + Storage)
- **IA**: N8N + OpenAI GPT-4 Vision / Claude
- **Ícones**: Lucide React

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/nutrisnap.git
cd nutrisnap

# Instale dependências
pnpm install
# ou
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Inicie o servidor de desenvolvimento
pnpm dev
```

## ⚙️ Configuração

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute o schema SQL em `supabase-nutrisnap-schema.sql`
3. Configure os buckets de storage:
   - `meal-images` (público)
   - `diet-files` (privado)
4. Copie URL e anon key para `.env`

### 2. N8N (Análise de IA)

1. Crie conta em [n8n.io](https://n8n.io)
2. Siga as instruções em `N8N_FOOD_ANALYSIS.md`
3. Configure credenciais OpenAI ou Anthropic
4. Copie URL do webhook para `.env`

## 📱 Estrutura do Projeto

```
src/
├── components/
│   ├── FoodRecognition.jsx   # Scanner principal
│   ├── Layout.jsx            # Layout mobile
│   └── ToastSystem.jsx       # Notificações
├── pages/
│   ├── Diet.jsx              # Gestão de dieta
│   ├── History.jsx           # Histórico
│   ├── Stats.jsx             # Estatísticas
│   ├── Profile.jsx           # Perfil/Metas
│   └── Login.jsx             # Autenticação
├── contexts/
│   └── AuthContext.jsx       # Contexto de auth
└── supabaseClient.js         # Cliente Supabase
```

## 🔄 Fluxo de Análise

```
1. Usuário tira foto → 
2. App envia base64 para N8N → 
3. N8N processa e envia para IA → 
4. IA analisa e retorna JSON → 
5. App exibe resultados e compara com dieta
```

## 📄 Licença

MIT License

---

Feito com 💚 para uma vida mais saudável
