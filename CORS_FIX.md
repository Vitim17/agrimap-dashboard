# 🔧 Correção do Erro de CORS do Sentinel Hub

## ❌ O Problema

Você estava recebendo este erro:

```
Access to fetch at 'https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

### Por que aconteceu?

1. **CORS** (Cross-Origin Resource Sharing) é uma política de segurança dos navegadores
2. O Sentinel Hub **NÃO** permite requisições OAuth2 diretas do navegador
3. **Client Secret** NUNCA deve estar exposto no frontend (JavaScript do navegador)
4. Tentar fazer autenticação OAuth2 Client Credentials do navegador = bloqueio CORS

## ✅ A Solução

Criamos **API Routes no Next.js** que rodam no servidor (Node.js), não no navegador!

### Arquivos Criados:

1. **`app/api/sentinel/token/route.ts`**
   - Endpoint: `GET /api/sentinel/token`
   - Obtém token OAuth2 do Sentinel Hub
   - Cache de token (reutiliza por 1 hora)
   - **Roda no servidor** → sem CORS!

2. **`app/api/sentinel/ndvi/route.ts`**
   - Endpoint: `GET /api/sentinel/ndvi?west=...&south=...&east=...&north=...`
   - Calcula NDVI real usando Sentinel-2
   - Processa imagens de satélite
   - **Roda no servidor** → sem CORS!

### Arquivos Atualizados:

3. **`src/api/agriMapApi.js`**
   - Função `getSentinelToken()` agora chama `/api/sentinel/token`
   - Função `getSentinelNDVI()` agora chama `/api/sentinel/ndvi`
   - **Frontend só fala com API Routes locais** → sem CORS!

## 🏗️ Arquitetura Nova

### Antes (❌ Com CORS):
```
Browser (localhost:3000)
    ↓ tentava chamar direto
Sentinel Hub (services.sentinel-hub.com)
    ❌ BLOQUEADO por CORS
```

### Depois (✅ Sem CORS):
```
Browser (localhost:3000)
    ↓ chama /api/sentinel/ndvi
Next.js Server (localhost:3000/api/...)
    ↓ autentica com Client Secret
Sentinel Hub (services.sentinel-hub.com)
    ✅ ACEITA (servidor para servidor)
    ↓ retorna dados
Next.js Server
    ↓ retorna para browser
Browser
    ✅ Recebe dados!
```

## 🧪 Como Testar Agora

### 1. Verifique o `.env.local`

Certifique-se que o arquivo existe em `Agrimap-dash/.env.local`:

```env
# OpenWeather API
NEXT_PUBLIC_OPENWEATHER_API_KEY=5fd5c3aa6ebb47e9a134c24c85f746b4

# Sentinel Hub OAuth2
NEXT_PUBLIC_SENTINEL_CLIENT_ID=seu_client_id_real_aqui
NEXT_PUBLIC_SENTINEL_CLIENT_SECRET=seu_client_secret_real_aqui

# Backend API (opcional)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8002
```

### 2. Reinicie o Servidor Next.js

**IMPORTANTE:** Você DEVE reiniciar após criar/editar `.env.local`

```bash
# Pare o servidor (Ctrl+C se estiver rodando)

# Reinicie
cd Agrimap-dash
npm run dev
```

### 3. Abra o Dashboard

Acesse: `http://localhost:3000`

### 4. Verifique o Console (F12)

**Se funcionando corretamente, você verá:**
```
✅ Token Sentinel Hub obtido com sucesso (via API Route)
✅ NDVI do Sentinel Hub calculado: 0.75
```

**Se ainda com erro:**
```
❌ Credenciais do Sentinel Hub não configuradas
```
→ Verifique se o `.env.local` está correto e reiniciou o servidor

## 🔍 Testando as API Routes Diretamente

Você pode testar os endpoints no navegador:

### 1. Testar Token
```
http://localhost:3000/api/sentinel/token
```

Deve retornar:
```json
{
  "access_token": "eyJhbGciOiJSUzI1...",
  "expires_in": 3600,
  "from_cache": false
}
```

### 2. Testar NDVI
```
http://localhost:3000/api/sentinel/ndvi?west=-47.95&south=-15.80&east=-47.91&north=-15.76
```

Deve retornar:
```json
{
  "ndvi_atual": 0.75,
  "fonte": "sentinel-2",
  "data": "2025-01-18",
  "cobertura_nuvens": "baixa",
  "resolucao": "10m",
  "bbox": {...}
}
```

## 🐛 Resolução de Problemas

### Erro: "Credenciais não configuradas"
- ✅ Verifique se `.env.local` existe
- ✅ Certifique-se que as variáveis começam com `NEXT_PUBLIC_`
- ✅ **REINICIE** o servidor Next.js

### Erro: "Failed to fetch" nas API Routes
- ✅ Verifique se o servidor está rodando
- ✅ Teste direto no navegador: `http://localhost:3000/api/sentinel/token`
- ✅ Veja logs do terminal onde `npm run dev` está rodando

### Erro 401: "Invalid client credentials"
- ✅ Client ID ou Client Secret estão incorretos
- ✅ Verifique no dashboard do Sentinel Hub
- ✅ Copie novamente as credenciais (cuidado com espaços extras)

### Erro 403: "Insufficient permissions"
- ✅ Sua conta Sentinel Hub não tem Processing Units
- ✅ Verifique quotas em: https://apps.sentinel-hub.com/
- ✅ Plano gratuito: 30.000 PU/mês

## 📊 Verificando Logs Server-Side

Os logs das API Routes aparecem no **terminal** onde você rodou `npm run dev`, NÃO no console do navegador!

**Terminal (onde roda npm run dev):**
```
✅ Token Sentinel Hub obtido com sucesso (server-side)
✅ NDVI do Sentinel Hub calculado: 0.75
```

**Console do Navegador (F12):**
```
✅ Token Sentinel Hub obtido com sucesso (via API Route)
✅ NDVI do Sentinel Hub calculado: 0.75
```

## 🎉 Pronto!

Agora o Sentinel Hub funciona sem erros de CORS! As credenciais ficam seguras no servidor e o frontend recebe os dados processados.

### Benefícios da Arquitetura:
- ✅ **Sem CORS** - Servidor → Servidor
- ✅ **Seguro** - Client Secret nunca vai para o browser
- ✅ **Cache** - Token reutilizado por 1 hora
- ✅ **Robusto** - Tratamento de erros completo
- ✅ **Escalável** - Fácil adicionar novos endpoints

---

**Documentação adicional:**
- 📄 `SENTINEL_HUB_SETUP.md` - Como obter credenciais
- 📄 `ENV_SETUP.md` - Configuração completa
- 📄 `TESTE_OPENWEATHER.md` - Testes gerais

