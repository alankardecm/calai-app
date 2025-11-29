# Configuração do Fluxo n8n (Baseado no Workflow Visual)

Este guia reflete a estrutura exata do fluxo mostrada na sua imagem de referência.

## Estrutura do Workflow
**Webhook** ➔ **Edit Fields** ➔ **Convert to File** ➔ **Analyze Image (AI)** ➔ **Edit Fields** ➔ **Respond to Webhook**

---

## 1. Nó Webhook
- **HTTP Method**: `POST`
- **Path**: `/analyze-food`
- **Authentication**: `None`
- **Respond**: `Using 'Respond to Webhook' Node`

## 2. Nó Edit Fields (Preparação)
Este nó serve para isolar a string Base64 se ela vier dentro de um objeto JSON complexo.
- **Mode**: `Manual`
- **Fields**:
  - `data`: `{{ $json.image }}` (ou o caminho onde vem a imagem)

## 3. Nó Convert to File
Este nó é crucial para transformar a string Base64 em um arquivo binário que a IA possa ler.
- **Operation**: `Move Binary Data to File` (ou `Convert Base64 to Binary` dependendo da versão do n8n)
- **Source Property**: `data` (o campo definido no nó anterior)
- **Binary Property**: `data` (nome do campo binário de saída)
- **MIME Type**: `image/jpeg` (ou detectado automaticamente)

## 4. Nó Analyze Image (Google Gemini / OpenAI)
Use o nó que suporta visão (Google Gemini Vision ou OpenAI Vision).
- **Resource**: `Chat` / `Image Analysis`
- **Model**: `Gemini 1.5 Pro` ou `GPT-4o`
- **Binary Property**: `data` (o arquivo gerado no passo anterior)
- **System Prompt**:
  *(Copie o prompt JSON definido anteriormente)*

## 5. Nó Edit Fields (Limpeza)
Opcional, mas útil para limpar a resposta da IA e garantir que apenas o JSON limpo seja passado para frente.
- **Mode**: `Manual`
- **Fields**:
  - `output`: `{{ $json.content }}` (ou onde a resposta da IA estiver)
  - *Dica*: Se a IA retornar markdown (```json ... ```), use uma expressão javascript aqui para limpar.

## 6. Nó Respond to Webhook
- **Respond With**: `JSON`
- **Body**: `{{ $json.output }}` (o JSON limpo do passo anterior)

---

## Dicas de Implementação no App
O app deve enviar o JSON no formato:
```json
{
  "image": "base64_string_aqui..."
}
```
Isso garante que o nó "Edit Fields" inicial consiga pegar o campo `image` corretamente.
