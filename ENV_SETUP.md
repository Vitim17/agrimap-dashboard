# 🔧 Configuração de Variáveis de Ambiente

## Configuração do OpenWeather API

Para que a aplicação funcione corretamente com dados meteorológicos reais, você precisa configurar as variáveis de ambiente.

### Passo 1: Criar arquivo `.env.local`

Crie um arquivo `.env.local` na raiz do projeto `Agrimap-dash` com o seguinte conteúdo:

```env
# OpenWeather API
NEXT_PUBLIC_OPENWEATHER_API_KEY=5fd5c3aa6ebb47e9a134c24c85f746b4

# Sentinel Hub OAuth2 (obtenha em https://apps.sentinel-hub.com/)
NEXT_PUBLIC_SENTINEL_CLIENT_ID=seu_client_id_aqui
NEXT_PUBLIC_SENTINEL_CLIENT_SECRET=seu_client_secret_aqui

# Backend API (opcional)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8002
```

**Para obter as credenciais do Sentinel Hub, siga o guia:** [`SENTINEL_HUB_SETUP.md`](./SENTINEL_HUB_SETUP.md)

### Passo 2: Variáveis Disponíveis

#### OpenWeather API
- **NEXT_PUBLIC_OPENWEATHER_API_KEY**: Chave da API do OpenWeather
  - Valor atual: `5fd5c3aa6ebb47e9a134c24c85f746b4`
  - [Obter nova chave](https://openweathermap.org/api)

#### Backend API (Opcional)
- **NEXT_PUBLIC_API_BASE_URL**: URL do backend Python
  - Padrão: `http://localhost:8002`
  - Use se tiver o backend rodando

### Passo 3: Reiniciar o servidor

Após criar o arquivo `.env.local`, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

## 📊 Dados Disponíveis

### OpenWeather API

A aplicação busca os seguintes dados do OpenWeather:

- 🌡️ **Temperatura** - Temperatura atual em °C
- 💧 **Umidade** - Umidade do ar (%)
- 🌧️ **Precipitação** - Chuva acumulada (mm)
- 💨 **Vento** - Velocidade do vento (m/s)
- ☁️ **Nuvens** - Cobertura de nuvens (%)
- 📊 **Pressão** - Pressão atmosférica (hPa)

### Sentinel Hub API (Novo!)

Com as credenciais do Sentinel Hub configuradas, você terá acesso a:

- 🛰️ **Imagens de Satélite Sentinel-2** - Resolução 10m
- 📊 **NDVI Real** - Índice de vegetação calculado das imagens
- 🖼️ **Imagens True Color (RGB)** - Visualização real da área
- ☁️ **Filtro de Nuvens** - Automático (< 30% cobertura)
- 📅 **Histórico** - Últimos 30 dias de imagens
- 🎯 **Análise Multitemporal** - Comparação ao longo do tempo

### Fallback Inteligente

Sistema de fallback em cascata:
1. 🥇 **Sentinel Hub** (se configurado) - Dados de satélite reais
2. 🥈 **OpenWeather** - Dados meteorológicos
3. 🥉 **Backend Local** (se disponível) - Dados customizados
4. 🔄 **Dados Simulados** - Fallback final para demonstração

## 🔒 Segurança

- ✅ Use `.env.local` para desenvolvimento local
- ✅ Nunca commite o arquivo `.env.local` no Git
- ✅ O arquivo `.gitignore` já está configurado para ignorar arquivos `.env*`
- ✅ Em produção (Vercel), adicione as variáveis no painel de configuração

## 🚀 Deploy na Vercel

Ao fazer deploy na Vercel:

1. Vá em **Settings** → **Environment Variables**
2. Adicione `NEXT_PUBLIC_OPENWEATHER_API_KEY` com sua chave
3. Faça redeploy da aplicação

---

**Nota**: As variáveis com prefixo `NEXT_PUBLIC_` são expostas no cliente (browser). Não use para chaves secretas sensíveis.

