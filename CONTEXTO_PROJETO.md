# Contexto do Projeto NutriSnap - Integração N8N e OpenAI Vision

## 📌 Visão Geral
O projeto **NutriSnap** é um aplicativo de nutrição que permite aos usuários tirar fotos de suas refeições para análise automática de calorias e macronutrientes.

A arquitetura envolve:
1.  **Frontend (React/Vite)**: Captura a foto e envia para o N8N.
2.  **Backend (N8N)**: Recebe a imagem, processa e envia para a OpenAI.
3.  **IA (OpenAI GPT-4o)**: Analisa a imagem e retorna os dados nutricionais.

---

## 🛠️ Estado Atual da Integração (N8N)

### Problema Resolvido
O fluxo do N8N estava falhando com erros de `400 Bad Request` ("you must provide a model parameter") e erros de validação JSON ao tentar enviar a imagem para a API da OpenAI.

### Solução Implementada
A configuração do nó **HTTP Request** (OpenAI Vision) foi ajustada para usar **Expressões JavaScript** para construir o corpo da requisição, garantindo que o JSON seja válido mesmo com caracteres especiais no prompt ou na string base64.

### Configuração Crítica do Nó OpenAI Vision
Se precisar recriar ou ajustar o nó, siga estritamente estes parâmetros:

*   **Method**: `POST`
*   **URL**: `https://api.openai.com/v1/chat/completions`
*   **Authentication**: `None` (Autenticação via Headers manuais)
*   **Headers**:
    *   `Content-Type`: `application/json`
    *   `Authorization`: `Bearer sk-proj-...` (Sua chave da OpenAI)
*   **Body Content Type**: `JSON`
*   **Specify Body**: `Using JSON`
*   **JSON (Expressão)**:
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

---

## 📂 Arquivos Importantes
*   `fitness-pro/N8N_OPENAI_CONFIG.md`: Documentação passo a passo da configuração do nó OpenAI.
*   `fitness-pro/CORS_N8N_CONFIGURACAO.md`: Guia para resolver problemas de CORS entre o app e o N8N.
*   `fitness-pro/src/components/FoodRecognition.jsx`: Componente React responsável por capturar a foto e enviar para o webhook.

## 🚀 Próximos Passos (Se abrir novo chat)
1.  Verificar se o fluxo está retornando o JSON corretamente para o app.
2.  Ajustar o prompt do sistema (`systemPrompt`) se a análise nutricional precisar de refinamento.
3.  Monitorar o consumo de tokens da OpenAI.
