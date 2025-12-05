# 🔧 Configuração CORS no N8N - NutriSnap

## 📋 Problema Atual

O app NutriSnap não está conseguindo se comunicar com o N8N porque o navegador está **bloqueando a requisição** por motivos de segurança (CORS).

### O que é CORS?

**CORS** (Cross-Origin Resource Sharing) é uma política de segurança dos navegadores que impede que um site faça requisições para outro domínio diferente.

**Exemplo do nosso caso:**
- O app está em: `https://mynutrisnap.vercel.app`
- O N8N está em: `https://n8n.srv1121163.hstgr.cloud`

Como são domínios diferentes, o navegador **bloqueia** a requisição por padrão.

### Sintomas do Problema

1. ❌ O app tira a foto, mas mostra resultados **errados** (ex: mostra "Pizza" quando é "Bolo")
2. ❌ No N8N, **nenhuma execução aparece** quando você usa o app
3. ❌ O app está usando dados **mock (falsos)** como fallback
4. ❌ No console do navegador (F12), aparece erro de CORS

---

## 🛠️ Soluções

### Opção 1: Configurar N8N via Variáveis de Ambiente (RECOMENDADO)

Se você instalou o N8N via **Docker** ou diretamente no servidor, adicione esta variável de ambiente:

```bash
N8N_CORS_ALLOWED_ORIGINS=https://mynutrisnap.vercel.app
```

Ou para permitir qualquer origem (menos seguro, mas funciona para testes):

```bash
N8N_CORS_ALLOWED_ORIGINS=*
```

#### Para Docker (docker-compose.yml):

```yaml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    environment:
      - N8N_CORS_ALLOWED_ORIGINS=*
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - WEBHOOK_URL=https://n8n.srv1121163.hstgr.cloud/
      # ... outras variáveis
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
```

#### Para instalação direta (systemd ou pm2):

Crie ou edite o arquivo `.env` no diretório do N8N:

```bash
# /home/seu-usuario/.n8n/.env
N8N_CORS_ALLOWED_ORIGINS=*
```

Depois reinicie o N8N:

```bash
# Se usa systemd
sudo systemctl restart n8n

# Se usa pm2
pm2 restart n8n

# Se usa Docker
docker-compose restart n8n
```

---

### Opção 2: Configurar CORS no Nginx/Proxy Reverso

Se você usa Nginx como proxy reverso na frente do N8N, adicione headers CORS:

```nginx
server {
    listen 443 ssl;
    server_name n8n.srv1121163.hstgr.cloud;

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Headers CORS - ADICIONE ESTAS LINHAS
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;

        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
            add_header 'Access-Control-Max-Age' 86400;
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
```

Depois reinicie o Nginx:

```bash
sudo nginx -t  # Testar configuração
sudo systemctl reload nginx
```

---

### Opção 3: Hostinger VPS (Painel hPanel)

Se você está usando **Hostinger VPS** com o painel hPanel:

1. Acesse o painel da VPS
2. Vá em **SSH Access** e conecte via terminal
3. Encontre onde o N8N está rodando:
   ```bash
   docker ps  # Se for Docker
   pm2 list   # Se for PM2
   ```
4. Adicione a variável de ambiente conforme a Opção 1

---

### Opção 4: N8N Cloud

Se você usa **N8N Cloud** (n8n.io), o CORS já deve estar habilitado por padrão.

Verifique se:
1. O workflow está **ativo** (toggle verde)
2. O webhook está configurado como **Production** (não Test)
3. A URL do webhook está correta

---

## ✅ Como Testar se Funcionou

### Teste 1: Via Terminal (no seu computador)

```powershell
# PowerShell
Invoke-RestMethod -Uri "https://n8n.srv1121163.hstgr.cloud/webhook/analyze-food" -Method POST -ContentType "application/json" -Body '{"test": true}'
```

```bash
# Linux/Mac
curl -X POST https://n8n.srv1121163.hstgr.cloud/webhook/analyze-food \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

Se retornar uma resposta (mesmo que seja erro de validação), o webhook está acessível.

### Teste 2: Via Navegador (Console)

1. Abra https://mynutrisnap.vercel.app
2. Pressione F12 → aba **Console**
3. Cole este código:

```javascript
fetch('https://n8n.srv1121163.hstgr.cloud/webhook/analyze-food', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: true })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

- ✅ Se aparecer uma resposta JSON → CORS está funcionando!
- ❌ Se aparecer erro de CORS → Ainda precisa configurar

### Teste 3: Via App

1. Abra o app no celular
2. Tire uma foto de comida
3. Verifique no N8N se apareceu uma nova execução
4. Se aparecer → Está funcionando! 🎉

---

## 🔍 Debug: Verificar Erro no Console

No celular Android, você pode ver os erros assim:

1. Conecte o celular ao computador via USB
2. No celular, ative "Depuração USB" em Configurações → Opções do desenvolvedor
3. No Chrome do computador, acesse: `chrome://inspect`
4. Encontre seu dispositivo e clique em "Inspect"
5. Veja a aba Console para ver os erros

---

## 📊 Fluxo de Dados Esperado

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   App Mobile    │────▶│      N8N        │────▶│    OpenAI       │
│  (NutriSnap)    │     │   (Webhook)     │     │  (GPT-4 Vision) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         │  1. Envia foto        │  2. Processa          │
         │     (base64)          │     imagem            │
         │                       │                       │
         │                       │  3. Chama OpenAI ────▶│
         │                       │                       │
         │                       │◀──── 4. Retorna       │
         │                       │      análise          │
         │◀───────────────────────                       │
         │  5. Recebe resultado  │                       │
         │     (JSON)            │                       │
```

---

## 📝 Informações do Projeto

| Item | Valor |
|------|-------|
| **App URL** | https://mynutrisnap.vercel.app |
| **N8N Webhook** | https://n8n.srv1121163.hstgr.cloud/webhook/analyze-food |
| **GitHub** | https://github.com/alankardecm/calai-app |
| **Supabase** | https://pjdgnsdymzfjgsvlsdwm.supabase.co |

---

## 🆘 Precisa de Ajuda?

Se ainda tiver problemas, me informe:

1. **Como você instalou o N8N?** (Docker, PM2, Hostinger, N8N Cloud)
2. **Qual sistema operacional do servidor?** (Ubuntu, CentOS, etc)
3. **Usa Nginx ou outro proxy reverso?**
4. **Consegue acessar o terminal SSH do servidor?**

Com essas informações, posso dar instruções mais específicas!
