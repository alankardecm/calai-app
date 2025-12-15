# 🔧 Configuração Atualizada do N8N - NutriSnap (OpenAI Vision)

Este guia detalha a configuração exata para o nó **OpenAI Vision** usando o node **HTTP Request** no n8n, corrigindo erros de "model parameter" e "valid JSON".

## 1. Nó Webhook
- **Method**: `POST`
- **Path**: `/analyze-food`
- **Authentication**: `None`
- **Respond**: `Using 'Respond to Webhook' Node`

## 2. Nó Preparar Prompt (Edit Fields / Set)
Garanta que este nó gere os campos:
- `systemPrompt`: O texto do prompt do nutricionista.
- `imageBase64`: A string base64 da imagem (sem o prefixo `data:image...` se possível, ou ajuste a expressão abaixo).

## 3. Nó OpenAI Vision (HTTP Request)
Esta é a configuração crítica para evitar erros.

### Parâmetros Principais
- **Method**: `POST`
- **URL**: `https://api.openai.com/v1/chat/completions`
- **Authentication**: `None` (Vamos usar Headers manuais)
- **Send Query Parameters**: `OFF` (Desativado)

### Headers (Send Headers: ON)
Adicione estes dois headers manualmente:

| Name | Value |
|------|-------|
| `Content-Type` | `application/json` |
| `Authorization` | `Bearer sk-proj-seu-token-aqui...` |

### Body (Send Body: ON)
- **Body Content Type**: `JSON`
- **Specify Body**: `Using JSON`

**Campo JSON (Expressão):**
Copie e cole exatamente este código no campo de expressão (clique no botão de engrenagem/expressão se necessário, ou certifique-se de que o campo aceita expressões):

```javascript
{{
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": [
        {
          "type": "text",
          "text": $json.systemPrompt
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/jpeg;base64," + $json.imageBase64
          }
        }
      ]
    }
  ],
  "max_tokens": 1000
}
}}
```

> **Nota Importante**: O uso de chaves duplas `{{ { ... } }}` no início e fim transforma o conteúdo em um Objeto JavaScript, permitindo que o n8n trate aspas e quebras de linha dentro das variáveis `$json.systemPrompt` e `$json.imageBase64` corretamente, evitando o erro "JSON parameter needs to be valid JSON".

### Options
- **Binary Data**: `OFF` (Não ative, pois estamos enviando base64 no corpo JSON).

## 4. Nó Respond to Webhook
- **Respond With**: `JSON`
- **Response Body**: `{{ $json.choices[0].message.content }}` (Ajuste conforme a resposta da API da OpenAI).
