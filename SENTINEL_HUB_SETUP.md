# 🛰️ Configuração do Sentinel Hub API

## 📌 O que é o Sentinel Hub?

O Sentinel Hub fornece acesso a imagens de satélite de alta qualidade e cálculo de índices de vegetação (NDVI, EVI, NDMI) em tempo real a partir dos satélites Sentinel-2, Landsat e outros.

## 🔐 Obtendo Credenciais OAuth2

### Passo 1: Fazer Login no Sentinel Hub

1. Acesse: [https://apps.sentinel-hub.com/](https://apps.sentinel-hub.com/)
2. Faça login com suas credenciais:
   - Email: `vitinhos862@gmail.com`
   - Senha: (sua senha)

### Passo 2: Acessar Configurações da Conta

1. Clique no seu avatar/nome no canto superior direito
2. Selecione **"Account Settings"** ou **"User Settings"**
3. Vá para a aba **"OAuth Clients"**

### Passo 3: Criar um Novo OAuth Client

1. Clique no botão **"Create New"** ou **"+ New Client"**
2. Preencha os campos:
   - **Name**: `AgriMap Dashboard` (ou qualquer nome descritivo)
   - **Description**: `Client para AgriMap - monitoramento de lavouras`
   - **Grant Type**: Selecione **"Client Credentials"** (Machine-to-Machine)
   - **Expiration**: Escolha "Never Expire" ou defina uma data futura

3. **IMPORTANTE**: Depois de criar, você verá:
   - ✅ **Client ID** (exemplo: `ab12cd34-5678-90ef-ghij-klmnopqrstuv`)
   - ✅ **Client Secret** (exemplo: `VmFuZGFsb0BzZWNyZXRrZXk...`)
   
4. **⚠️ COPIE E GUARDE O CLIENT SECRET AGORA!**
   - Você não poderá vê-lo novamente depois de fechar a janela
   - Guarde em local seguro

### Passo 4: Verificar suas Quotas

No painel do Sentinel Hub, verifique:
- **Processing Units** disponíveis
- **Requests** permitidos por mês
- **Storage** disponível

Plano gratuito geralmente inclui:
- 30.000 Processing Units/mês
- Ideal para testes e desenvolvimento

## 🔑 Configurar no Projeto

Depois de obter as credenciais, adicione ao arquivo `.env.local`:

```env
# OpenWeather API
NEXT_PUBLIC_OPENWEATHER_API_KEY=5fd5c3aa6ebb47e9a134c24c85f746b4

# Sentinel Hub OAuth2 Credentials
NEXT_PUBLIC_SENTINEL_CLIENT_ID=seu_client_id_aqui
NEXT_PUBLIC_SENTINEL_CLIENT_SECRET=seu_client_secret_aqui

# Backend API (opcional)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8002
```

### ⚠️ Importante sobre CORS

O Sentinel Hub **NÃO** permite requisições diretas do navegador por questões de segurança (CORS).

**Solução Implementada:**
- ✅ Criamos **API Routes** no Next.js (`app/api/sentinel/`)
- ✅ As credenciais ficam **apenas no servidor** (seguro!)
- ✅ O frontend chama as API Routes locais
- ✅ As API Routes fazem as chamadas ao Sentinel Hub

**Arquitetura:**
```
Frontend (Browser)
    ↓ chama /api/sentinel/ndvi
API Route (Next.js Server-Side)
    ↓ autentica com credenciais
Sentinel Hub API
    ↓ retorna dados
API Route
    ↓ retorna para frontend
Frontend (exibe dados)
```

Isso resolve o erro de CORS e mantém suas credenciais seguras!

## 📊 O que você Poderá Fazer com Sentinel Hub

### 1. **Imagens de Satélite em True Color**
- Imagens reais da fazenda
- Resolução até 10m por pixel
- Atualização a cada 5 dias

### 2. **Índices de Vegetação (NDVI)**
- NDVI real calculado das imagens
- Detecção de estresse hídrico
- Monitoramento de crescimento

### 3. **Outros Índices Disponíveis**
- **EVI** - Enhanced Vegetation Index
- **NDMI** - Normalized Difference Moisture Index
- **SAVI** - Soil Adjusted Vegetation Index
- **LAI** - Leaf Area Index

### 4. **Análise Temporal**
- Comparação de imagens ao longo do tempo
- Gráficos de evolução do NDVI
- Detecção de mudanças

## 🧪 Testando a Integração

Após configurar, você pode testar com:

```bash
cd Agrimap-dash
npm run dev
```

A aplicação tentará:
1. ✅ Obter token OAuth2 do Sentinel Hub
2. ✅ Buscar imagens da área da fazenda
3. ✅ Calcular NDVI real
4. ✅ Exibir no mapa

## 🔍 Verificando se Funciona

**Console do navegador (F12):**

Se tudo estiver OK, você verá:
- ✅ "Token Sentinel Hub obtido com sucesso"
- ✅ "NDVI calculado: 0.XX"
- ✅ Imagens carregadas no mapa

Se houver erro:
- ❌ "Erro 401: Invalid client credentials"
  - Verifique Client ID e Secret
- ❌ "Erro 403: Insufficient permissions"
  - Verifique as quotas da sua conta

## 📍 Coordenadas para Teste

O sistema está configurado para Brasília por padrão:
- Latitude: `-15.78`
- Longitude: `-47.93`

Você pode alterar em `src/config/env.js`

## 🌍 Satélites Disponíveis

Via Sentinel Hub você tem acesso a:

- 🛰️ **Sentinel-2** (ESA) - 10m resolução, 5 dias revisita
- 🛰️ **Landsat 8/9** (NASA) - 30m resolução, 16 dias revisita
- 🛰️ **Sentinel-1** (SAR) - Radar, independe de nuvens
- 🛰️ **MODIS** - Baixa resolução, alta frequência

## 💡 Dicas Importantes

1. **Nuvens**: O Sentinel Hub filtra automaticamente nuvens
2. **Cache**: Imagens são cacheadas para economizar Processing Units
3. **Resolução**: Comece com resolução baixa para testes (economiza quota)
4. **Período**: Escolha janelas de 30-60 dias para encontrar imagens sem nuvens

## 🔗 Links Úteis

- [Dashboard Sentinel Hub](https://apps.sentinel-hub.com/)
- [Documentação API](https://docs.sentinel-hub.com/)
- [Exemplos de Evalscripts](https://custom-scripts.sentinel-hub.com/)
- [Processing Unit Calculator](https://www.sentinel-hub.com/pricing/)

## ⚠️ Segurança

- ❌ NUNCA commite credenciais no Git
- ✅ Use `.env.local` apenas local
- ✅ Em produção, use variáveis de ambiente da Vercel
- ✅ Client Secret é sensível como uma senha

---

**Pronto!** Depois de seguir esses passos, o AgriMap terá acesso a dados reais de satélite! 🚀

