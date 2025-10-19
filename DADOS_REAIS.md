# 🌾 AgriMap - Configuração de Dados Reais

## ✅ Mudanças Implementadas

O AgriMap agora está configurado para usar **exclusivamente dados reais**. Todos os dados mockados/simulados foram removidos.

---

## 📋 Fontes de Dados

### 1️⃣ **Dados do GeoJSON** (Primário)
Os dados das lavouras vêm principalmente do arquivo GeoJSON que você carrega:

```json
{
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "properties": {
      "id": "fazenda-001",
      "nome": "Fazenda São José",
      "area_ha": 150,
      "ndvi": 0.72,
      "umidade": 65,
      "chuva": 12.5,
      "temperatura": 28
    },
    "geometry": {
      "type": "Polygon",
      "coordinates": [[...]]
    }
  }]
}
```

### 2️⃣ **OpenWeather API** (Dados Climáticos)
Fonte: https://openweathermap.org/api

**Configuração:**
```env
NEXT_PUBLIC_OPENWEATHER_API_KEY=sua_chave_aqui
```

**Dados fornecidos:**
- ☀️ Temperatura atual
- 💧 Umidade do ar
- 🌧️ Precipitação
- 💨 Vento
- ☁️ Cobertura de nuvens
- 📊 Pressão atmosférica

### 3️⃣ **Sentinel Hub** (Imagens de Satélite + NDVI Real)
Fonte: https://apps.sentinel-hub.com/

**Configuração:**
```env
NEXT_PUBLIC_SENTINEL_CLIENT_ID=seu_client_id
NEXT_PUBLIC_SENTINEL_CLIENT_SECRET=seu_client_secret
```

**Dados fornecidos:**
- 🛰️ Imagens Sentinel-2 (resolução 10m)
- 📊 NDVI calculado de satélite
- 🖼️ True Color RGB
- ☁️ Filtro automático de nuvens

### 4️⃣ **Backend Python** (Opcional)
URL: http://localhost:8002

**Configuração:**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8002
```

**Endpoints esperados:**
- `GET /ndvi` - Dados de NDVI
- `GET /weather` - Dados meteorológicos
- `GET /alerts` - Alertas da lavoura
- `GET /yield` - Produtividade

---

## 🔄 Fluxo de Dados

### Dados da Fazenda Selecionada

```
Clique no polígono
    ↓
1. Lê dados do GeoJSON (ndvi, umidade, etc)
    ↓
2. Se houver ID, busca APIs:
    ├─ GET /api/lavouras/[id]/historico (histórico NDVI)
    └─ GET /api/lavouras/[id]/clima (dados climáticos)
    ↓
3. Combina dados do GeoJSON + APIs
    ↓
4. Exibe no PainelLavoura
```

### Dados Gerais do Dashboard

```
Inicialização do Dashboard
    ↓
1. Tenta Sentinel Hub (se configurado)
    ├─ ✅ Sucesso: usa dados do satélite
    └─ ❌ Falha: próximo passo
    ↓
2. Tenta Backend Python (se configurado)
    ├─ ✅ Sucesso: usa dados do backend
    └─ ❌ Falha: próximo passo
    ↓
3. Tenta OpenWeather (requer API key)
    ├─ ✅ Sucesso: usa dados meteorológicos
    └─ ❌ Falha: erro exibido
```

---

## 🚨 APIs que Precisam Implementação

### 1. Histórico de NDVI
**Arquivo:** `app/api/lavouras/[id]/historico/route.ts`

**Status:** ⚠️ Não implementado

**O que fazer:**
- Conectar a um banco de dados
- Buscar histórico de NDVI da lavoura
- Ou integrar com Sentinel Hub para buscar dados históricos

**Resposta esperada:**
```json
[
  { "data": "20/01", "ndvi": 0.65 },
  { "data": "21/01", "ndvi": 0.68 },
  { "data": "22/01", "ndvi": 0.72 }
]
```

### 2. Dados Climáticos da Lavoura
**Arquivo:** `app/api/lavouras/[id]/clima/route.ts`

**Status:** ✅ Implementado (usa OpenWeather)

**Melhoria sugerida:**
- Buscar coordenadas reais da fazenda do banco de dados
- Atualmente usa coordenadas padrão (Brasília)

---

## 📦 Estrutura de Dados do GeoJSON

Para aproveitar ao máximo o sistema, seu GeoJSON deve ter estas propriedades:

```json
{
  "properties": {
    "id": "string",           // ID único da fazenda (obrigatório para APIs)
    "nome": "string",         // Nome da fazenda
    "area_ha": number,        // Área em hectares
    "ndvi": number,           // NDVI atual (0-1)
    "umidade": number,        // Umidade do solo (%)
    "chuva": number,          // Chuva acumulada (mm)
    "temperatura": number     // Temperatura (°C)
  }
}
```

---

## ⚙️ Como Configurar

### Passo 1: Criar `.env.local`

```bash
cd agrimap-dashboard
touch .env.local
```

### Passo 2: Adicionar Variáveis

```env
# OpenWeather (obrigatório para dados climáticos)
NEXT_PUBLIC_OPENWEATHER_API_KEY=sua_chave_aqui

# Sentinel Hub (opcional, para imagens de satélite)
NEXT_PUBLIC_SENTINEL_CLIENT_ID=seu_id_aqui
NEXT_PUBLIC_SENTINEL_CLIENT_SECRET=seu_secret_aqui

# Backend Python (opcional)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8002
```

### Passo 3: Reiniciar o Servidor

```bash
npm run dev
```

---

## 🎯 Prioridade de Dados

O sistema segue esta ordem de prioridade:

### NDVI:
1. 🥇 Sentinel Hub (satélite real)
2. 🥈 Backend Python
3. 🥉 Dados do GeoJSON
4. ❌ Erro se nenhum disponível

### Dados Climáticos:
1. 🥇 OpenWeather API
2. 🥈 Backend Python
3. ❌ Erro se nenhum disponível

### Histórico:
1. 🥇 API `/api/lavouras/[id]/historico`
2. ❌ Não exibe gráfico se não disponível

---

## 📊 Logs do Console

O sistema agora exibe logs detalhados:

```
✅ Dados meteorológicos obtidos do OpenWeather
✅ Usando dados reais do Sentinel-2
📍 Fazenda selecionada: { nome: "...", ndvi: 0.72 }
🔍 Buscando dados completos da fazenda fazenda-001...
✅ Histórico NDVI carregado
✅ Dados climáticos carregados
```

Ou avisos/erros:

```
⚠️ API de histórico ainda não implementada
❌ Nenhuma fonte de dados NDVI disponível
❌ Erro ao buscar dados do OpenWeather
```

---

## 🔧 Próximos Passos

1. **Configure OpenWeather** (essencial)
   - Obtenha chave em: https://openweathermap.org/api
   
2. **Opcional: Configure Sentinel Hub** (dados de satélite)
   - Crie conta em: https://apps.sentinel-hub.com/
   - Veja: `SENTINEL_HUB_SETUP.md`

3. **Implemente APIs de Histórico**
   - Conecte a um banco de dados
   - Implemente `/api/lavouras/[id]/historico`

4. **Prepare GeoJSON com Dados Reais**
   - Adicione propriedades necessárias
   - Inclua IDs únicos para cada fazenda

---

## 🚀 Deploy em Produção

Na Vercel:
1. Vá em **Settings** → **Environment Variables**
2. Adicione todas as variáveis `NEXT_PUBLIC_*`
3. Redeploy da aplicação

---

## ⚠️ Avisos Importantes

- ❌ **Sem dados mockados**: Sistema falhará se APIs não estiverem configuradas
- ✅ **Logs informativos**: Console mostra exatamente qual fonte está sendo usada
- 🔧 **Fácil depuração**: Mensagens claras sobre o que falta configurar
- 📊 **Graceful degradation**: Algumas features (gráfico) são opcionais

---

**Documentação atualizada em:** ${new Date().toLocaleDateString('pt-BR')}

