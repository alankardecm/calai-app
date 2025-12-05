# 🔄 Configuração do Fluxo N8N - NutriSnap

Este documento descreve como configurar o fluxo N8N para análise de imagens de refeições usando IA.

## 📋 Visão Geral do Fluxo

```
[App] → [Webhook N8N] → [Processamento Imagem] → [API IA (OpenAI/Anthropic)] → [Resposta] → [App]
```

## 🚀 Passo a Passo

### 1. Criar Webhook no N8N

1. No N8N, crie um novo workflow
2. Adicione o nó **Webhook**
3. Configure:
   - **HTTP Method**: POST
   - **Path**: `analyze-food`
   - **Response Mode**: `Last Node`

### 2. Estrutura do Payload Recebido

O app envia o seguinte JSON:

```json
{
  "image": "base64_encoded_image_string",
  "user_id": "uuid-do-usuario",
  "has_diet": true,
  "diet_targets": {
    "calories": 2000,
    "protein": 150,
    "carbs": 200,
    "fat": 65
  },
  "diet_goal": "emagrecimento",
  "timestamp": "2024-12-04T10:30:00.000Z"
}
```

### 3. Nó de Processamento - Preparar Prompt

Adicione um nó **Code** para preparar o prompt:

```javascript
const { image, diet_targets, diet_goal, has_diet } = $input.first().json;

// Construir contexto da dieta
let dietContext = '';
if (has_diet && diet_targets) {
  dietContext = `
O usuário tem uma dieta ativa com objetivo de ${diet_goal}.
Metas diárias:
- Calorias: ${diet_targets.calories} kcal
- Proteínas: ${diet_targets.protein}g
- Carboidratos: ${diet_targets.carbs}g
- Gorduras: ${diet_targets.fat}g

Considere essas metas ao analisar a refeição.
`;
}

const systemPrompt = `Você é um nutricionista especialista em análise de alimentos por imagem. 
Analise a imagem da refeição e retorne APENAS um JSON válido com a seguinte estrutura:

{
  "alimento_reconhecido": "Nome da refeição identificada",
  "classificacao_geral": "Refeição Saudável | Refeição Energética | Refeição Calórica",
  "porcao_descricao": "descrição da porção (ex: 1 prato médio)",
  "porcao_gramas": número em gramas,
  "nutrientes": {
    "carboidratos_g": número,
    "proteinas_g": número,
    "gorduras_g": número,
    "calorias_kcal": número,
    "fibras_g": número,
    "sodio_mg": número
  },
  "estimativa_confianca": número entre 0 e 1,
  "observacoes": "Análise nutricional detalhada com emojis relevantes",
  "alimentos_identificados": [
    { "nome": "nome do alimento", "porcao": "porção estimada", "calorias": número, "proteina": número }
  ],
  "sugestoes": ["sugestão 1", "sugestão 2"]
}

${dietContext}

IMPORTANTE: 
- Seja preciso nas estimativas de macronutrientes
- Considere o objetivo do usuário nas observações
- Use emojis para tornar a leitura mais agradável
- Retorne APENAS o JSON, sem texto adicional`;

return {
  systemPrompt,
  imageBase64: image,
  dietGoal: diet_goal
};
```

### 4. Nó de Chamada à IA (OpenAI Vision ou Claude)

#### Opção A: OpenAI GPT-4 Vision

Adicione o nó **HTTP Request**:

```
URL: https://api.openai.com/v1/chat/completions
Method: POST
Headers:
  Authorization: Bearer {{$credentials.openai.apiKey}}
  Content-Type: application/json

Body (JSON):
{
  "model": "gpt-4-vision-preview",
  "messages": [
    {
      "role": "system",
      "content": "{{$json.systemPrompt}}"
    },
    {
      "role": "user",
      "content": [
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/jpeg;base64,{{$json.imageBase64}}"
          }
        },
        {
          "type": "text",
          "text": "Analise esta refeição e retorne os dados nutricionais em JSON."
        }
      ]
    }
  ],
  "max_tokens": 1500
}
```

#### Opção B: Anthropic Claude Vision

```
URL: https://api.anthropic.com/v1/messages
Method: POST
Headers:
  x-api-key: {{$credentials.anthropic.apiKey}}
  anthropic-version: 2023-06-01
  Content-Type: application/json

Body (JSON):
{
  "model": "claude-3-opus-20240229",
  "max_tokens": 1500,
  "system": "{{$json.systemPrompt}}",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "image",
          "source": {
            "type": "base64",
            "media_type": "image/jpeg",
            "data": "{{$json.imageBase64}}"
          }
        },
        {
          "type": "text",
          "text": "Analise esta refeição e retorne os dados nutricionais em JSON."
        }
      ]
    }
  ]
}
```

### 5. Nó de Parse da Resposta

Adicione outro nó **Code**:

```javascript
const response = $input.first().json;

// Para OpenAI
let content = response.choices?.[0]?.message?.content;

// Para Claude
// let content = response.content?.[0]?.text;

// Limpar e parsear JSON
try {
  // Remover possíveis backticks de markdown
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  const parsed = JSON.parse(content);
  
  // Validar campos obrigatórios
  if (!parsed.alimento_reconhecido || !parsed.nutrientes) {
    throw new Error('Resposta incompleta da IA');
  }
  
  return parsed;
  
} catch (error) {
  // Fallback em caso de erro
  return {
    alimento_reconhecido: "Refeição não identificada",
    classificacao_geral: "Análise indisponível",
    porcao_descricao: "Não estimado",
    porcao_gramas: 0,
    nutrientes: {
      carboidratos_g: 0,
      proteinas_g: 0,
      gorduras_g: 0,
      calorias_kcal: 0,
      fibras_g: 0,
      sodio_mg: 0
    },
    estimativa_confianca: 0,
    observacoes: "Não foi possível analisar esta imagem. Tente novamente com uma foto mais clara.",
    alimentos_identificados: [],
    sugestoes: ["Tire uma foto com melhor iluminação", "Centralize o prato na imagem"]
  };
}
```

### 6. Nó de Resposta

O nó **Webhook** já está configurado para retornar o último nó automaticamente.

## 🔧 Configuração de Credenciais

### No N8N:

1. Vá em **Settings > Credentials**
2. Adicione nova credencial **OpenAI** ou **Anthropic**
3. Cole sua API Key

### No App (.env):

```env
VITE_N8N_WEBHOOK_URL=https://seu-n8n.app.n8n.cloud/webhook/analyze-food
```

## 📊 Fluxo Completo (Importar no N8N)

```json
{
  "name": "NutriSnap - Food Analysis",
  "nodes": [
    {
      "id": "webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "httpMethod": "POST",
        "path": "analyze-food",
        "responseMode": "lastNode"
      }
    },
    {
      "id": "prepare-prompt",
      "type": "n8n-nodes-base.code",
      "position": [450, 300],
      "parameters": {
        "jsCode": "// Código do passo 3"
      }
    },
    {
      "id": "call-ai",
      "type": "n8n-nodes-base.httpRequest",
      "position": [650, 300],
      "parameters": {
        "// Configuração do passo 4": ""
      }
    },
    {
      "id": "parse-response",
      "type": "n8n-nodes-base.code",
      "position": [850, 300],
      "parameters": {
        "jsCode": "// Código do passo 5"
      }
    }
  ],
  "connections": {
    "webhook": { "main": [[{ "node": "prepare-prompt", "type": "main", "index": 0 }]] },
    "prepare-prompt": { "main": [[{ "node": "call-ai", "type": "main", "index": 0 }]] },
    "call-ai": { "main": [[{ "node": "parse-response", "type": "main", "index": 0 }]] }
  }
}
```

## 🔒 Segurança

1. **Autenticação do Webhook**: Configure autenticação básica ou header personalizado
2. **Rate Limiting**: Limite requisições por usuário
3. **Validação de Imagem**: Verifique tamanho e tipo antes de processar
4. **Logs**: Mantenha logs para debug (sem armazenar imagens)

## 💰 Custos Estimados

| Modelo | Custo por análise | Qualidade |
|--------|------------------|-----------|
| GPT-4 Vision | ~$0.02 | Excelente |
| Claude 3 Opus | ~$0.03 | Excelente |
| GPT-4o | ~$0.01 | Muito boa |
| Claude 3 Sonnet | ~$0.01 | Muito boa |

## 🧪 Testando

```bash
curl -X POST https://seu-n8n.app.n8n.cloud/webhook/analyze-food \
  -H "Content-Type: application/json" \
  -d '{
    "image": "BASE64_DA_IMAGEM",
    "user_id": "test-user",
    "has_diet": false,
    "timestamp": "2024-12-04T10:30:00.000Z"
  }'
```

## 📱 Integração com o App

O app já está configurado para enviar a imagem ao webhook. Basta:

1. Configurar a variável `VITE_N8N_WEBHOOK_URL` no `.env`
2. O app automaticamente usa fallback mock se o N8N não estiver disponível
3. Os resultados são exibidos e salvos no histórico

---

## 🚀 Próximos Passos

1. [ ] Configurar N8N Cloud ou self-hosted
2. [ ] Criar credenciais da API de IA
3. [ ] Importar e testar o workflow
4. [ ] Configurar variável de ambiente no app
5. [ ] Testar integração end-to-end
