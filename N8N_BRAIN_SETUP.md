# 🧠 Configuração do N8N - FitAI Pro

Este guia explica como configurar os workflows N8N para o "cérebro" do FitAI Pro.

## 📦 Workflows Disponíveis

| Arquivo | Endpoint | Função |
|---------|----------|--------|
| `n8n-workflow-nutrisnap.json` | `/analyze-food` | Análise de imagens de comida |
| `n8n-workflow-coach-chat.json` | `/chat-coach` | Chat com Coach Motivacional |
| `n8n-workflow-generate-plan.json` | `/generate-plan` | Gerar plano de treino/dieta |

---

## 🚀 Como Importar os Workflows

### 1. Acesse seu N8N
- URL do seu N8N: `https://n8n.srv1121163.hstgr.cloud` (ou sua instância)

### 2. Importe cada workflow
1. Clique em **"+"** para criar novo workflow
2. Clique nos **3 pontos** (menu) → **"Import from File"**
3. Selecione o arquivo `.json` correspondente
4. Clique em **"Save"**

### 3. Configure as Credenciais OpenAI
Para cada workflow, você precisa configurar a credencial da OpenAI:

1. Clique no nó **"OpenAI Vision"** ou **"OpenAI Chat"**
2. Em **Credentials**, clique em **"Create New"**
3. Tipo: **"HTTP Header Auth"**
4. Nome: `OpenAI API Key`
5. Header Name: `Authorization`
6. Header Value: `Bearer sk-your-openai-api-key-here`

### 4. Ative os Workflows
1. Clique no toggle **"Active"** no canto superior direito
2. Copie a URL do webhook que aparece

---

## 🔗 URLs dos Webhooks

Após ativar, você terá URLs como:

```
https://seu-n8n.app.n8n.cloud/webhook/analyze-food
https://seu-n8n.app.n8n.cloud/webhook/chat-coach
https://seu-n8n.app.n8n.cloud/webhook/generate-plan
```

---

## ⚙️ Configurar no App

### 1. Edite o arquivo `.env`:

```env
# N8N Webhook URLs
VITE_N8N_WEBHOOK_URL=https://seu-n8n/webhook/analyze-food
VITE_N8N_COACH_URL=https://seu-n8n/webhook/chat-coach
VITE_N8N_GENERATE_PLAN_URL=https://seu-n8n/webhook/generate-plan
```

### 2. Ou edite diretamente nos arquivos (já configurado):

Os arquivos já têm fallback para a URL hardcoded:
- `src/components/FoodRecognition.jsx` - linha 11
- `src/pages/Coach.jsx` - linha 7
- `src/pages/Onboarding.jsx` - linha 7

---

## 📋 Detalhes dos Endpoints

### `/analyze-food` - Análise de Comida

**Request:**
```json
{
  "image": "base64_da_imagem",
  "user_id": "uuid",
  "has_diet": true,
  "diet_targets": {
    "calories": 2000,
    "protein": 150,
    "carbs": 200,
    "fat": 60
  },
  "diet_goal": "emagrecimento"
}
```

**Response:**
```json
{
  "alimento_reconhecido": "Frango Grelhado com Arroz",
  "classificacao_geral": "Refeição Saudável",
  "porcao_gramas": 400,
  "nutrientes": {
    "calorias_kcal": 450,
    "proteinas_g": 42,
    "carboidratos_g": 45,
    "gorduras_g": 12
  },
  "observacoes": "Excelente escolha! 💪",
  "sugestoes": ["Adicione mais vegetais"]
}
```

---

### `/chat-coach` - Chat Motivacional

**Request:**
```json
{
  "message": "Não estou conseguindo treinar",
  "user_id": "uuid",
  "user_name": "Alan",
  "user_goal": "emagrecimento",
  "user_stats": {
    "weight": 80,
    "height": 175,
    "activity_level": "moderado"
  },
  "conversation_history": [
    { "type": "coach", "text": "Olá! Como posso ajudar?" },
    { "type": "user", "text": "Não estou conseguindo treinar" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response": "Eu entendo! Às vezes a motivação foge mesmo. Mas lembre-se: 15 minutos de treino é melhor que zero! Que tal começar com algo leve hoje? 💪",
  "timestamp": "2024-12-15T22:35:00Z"
}
```

---

### `/generate-plan` - Gerar Plano Personalizado

**Request:**
```json
{
  "user_id": "uuid",
  "gender": "masculino",
  "age": 30,
  "weight": 80,
  "height": 175,
  "activity_level": "moderado",
  "goal": "gordura"
}
```

**Response:**
```json
{
  "success": true,
  "calculations": {
    "tmb": 1755,
    "tdee": 2721,
    "calorieTarget": 2177,
    "proteinTarget": 176,
    "carbsTarget": 180,
    "fatTarget": 64
  },
  "plan": {
    "nutrition": {
      "daily_calories": 2177,
      "daily_protein": 176,
      "meals": [
        {
          "name": "Café da Manhã",
          "time": "07:00",
          "calories": 450,
          "foods": ["6 claras + 2 ovos", "50g aveia", "1 banana"]
        }
      ]
    },
    "training": {
      "weekly_schedule": [
        {
          "day": "Segunda",
          "type": "Push",
          "exercises": [...]
        }
      ]
    },
    "motivation": "Você vai conseguir! Foco na jornada. 🎯"
  }
}
```

---

## 🔥 Modelos OpenAI Utilizados

| Workflow | Modelo | Motivo |
|----------|--------|--------|
| analyze-food | `gpt-4o` | Visão de alta qualidade para imagens |
| chat-coach | `gpt-4o-mini` | Rápido e barato para chat |
| generate-plan | `gpt-4o` | Resposta complexa com JSON estruturado |

---

## 💡 Dicas de Otimização

1. **Cache de Respostas**: Configure cache no N8N para respostas repetidas
2. **Rate Limiting**: Configure limite de requests por usuário
3. **Logs**: Ative logs para debugging no N8N
4. **Fallback**: O app tem fallback local caso N8N falhe

---

## 🐛 Troubleshooting

### Erro: "N8N não disponível"
- Verifique se o workflow está ativo
- Verifique se a URL está correta
- Teste o webhook manualmente com Postman/cURL

### Erro: "Resposta vazia da IA"
- Verifique se a credencial OpenAI tem créditos
- Verifique o limite de tokens

### CORS Error
- Os workflows já têm header `Access-Control-Allow-Origin: *`
- Se persistir, configure no proxy do N8N

---

## 📞 Suporte

Dúvidas? Verifique:
1. Console do navegador (F12)
2. Logs do N8N (Executions)
3. Status da API OpenAI

Boa sorte! 🚀
