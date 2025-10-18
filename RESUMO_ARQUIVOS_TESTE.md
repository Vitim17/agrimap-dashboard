# 📁 Resumo dos Arquivos de Teste

## 🗺️ Mapa dos Testes

```
🇧🇷 BRASIL

   ┌──────────────────────────┐
   │                          │
   │  🟢 MT - Mato Grosso     │ ← teste_grande_mato_grosso.geojson
   │     [-12.55, -55.69]     │   (Fazenda 500 ha em Sorriso)
   │     Sorriso - MT         │
   │                          │
   ├──────────────────────────┤
   │                          │
   │  🔵 DF - Brasília        │ ← TODOS OS OUTROS TESTES
   │     [-15.78, -47.93]     │   (Centro-Oeste)
   │                          │
   │  • teste_pequeno.geojson │
   │  • teste_fazenda_exemplo.geojson │
   │  • teste_alerta_critico.geojson │
   │                          │
   └──────────────────────────┘
```

---

## 📦 Arquivos Criados

### 1️⃣ `teste_pequeno.geojson` - TESTE INICIAL
```
📍 Localização: Brasília-DF
📐 Tamanho: 1 área (~25 hectares)
🎯 Objetivo: Teste rápido e simples
⏱️ Tempo: 10 segundos

Contém:
└─ Área de Teste Única
   ├─ 25.5 ha
   ├─ NDVI: 0.65 (Amarelo)
   └─ Status: Normal
```

**Ideal para:**
- ✅ Primeiro teste do sistema
- ✅ Verificar upload básico
- ✅ Testar auto-zoom pequeno
- ✅ Interface básica

---

### 2️⃣ `teste_fazenda_exemplo.geojson` - TESTE COMPLETO
```
📍 Localização: Brasília-DF
📐 Tamanho: 4 talhões (313 hectares total)
🎯 Objetivo: Teste completo de funcionalidades
⏱️ Tempo: 2 minutos

Estrutura:
├─ Talhão A - Soja (85.5 ha)
│  ├─ NDVI: 0.78 🟢 Saudável
│  └─ Data plantio: 15/10/2024
│
├─ Talhão B - Milho (62.3 ha)
│  ├─ NDVI: 0.45 🟡 Atenção
│  └─ Data plantio: 01/11/2024
│
├─ Talhão C - Algodão (120.8 ha)
│  ├─ NDVI: 0.82 🟢 Excelente
│  └─ Data plantio: 20/09/2024
│
└─ Talhão D - Pastagem (45.2 ha)
   ├─ NDVI: 0.35 🔴 CRÍTICO ⚠️
   ├─ Bordas PISCANTES
   └─ Data plantio: 10/05/2023
```

**Ideal para:**
- ✅ Teste de múltiplas áreas
- ✅ Diferentes culturas
- ✅ Variação de NDVI
- ✅ Sistema de alertas
- ✅ Bordas piscantes
- ✅ Click e seleção

---

### 3️⃣ `teste_grande_mato_grosso.geojson` - TESTE DE ESCALA
```
📍 Localização: Sorriso-MT
📐 Tamanho: 1 fazenda grande (500 hectares)
🎯 Objetivo: Teste de mudança de região
⏱️ Tempo: 30 segundos
✈️ Distância: ~900 km de Brasília

Contém:
└─ Fazenda Esperança - MT
   ├─ 500 ha
   ├─ NDVI: 0.75 (Saudável)
   ├─ Cultura: Soja
   ├─ Município: Sorriso
   └─ Estado: Mato Grosso
```

**Ideal para:**
- ✅ Teste de auto-zoom longa distância
- ✅ Área grande (500 ha)
- ✅ Mudança de região do Brasil
- ✅ Performance do mapa

---

### 4️⃣ `teste_alerta_critico.geojson` - TESTE DE ALERTAS
```
📍 Localização: Brasília-DF
📐 Tamanho: 2 áreas lado a lado
🎯 Objetivo: Testar sistema de alertas visuais
⏱️ Tempo: 1 minuto

Estrutura:
├─ Área com Problema (40 ha)
│  ├─ NDVI: 0.30 🔴 CRÍTICO
│  ├─ Bordas PISCANDO
│  ├─ Borda tracejada
│  ├─ Cor: Vermelho intenso
│  └─ Problema: Estresse hídrico severo
│
└─ Área Saudável (35 ha)
   ├─ NDVI: 0.85 🟢 Excelente
   ├─ Bordas normais
   ├─ Cor: Verde escuro
   └─ Status: Tudo ok
```

**Ideal para:**
- ✅ Contraste visual crítico vs saudável
- ✅ Bordas piscantes em ação
- ✅ Sistema de alertas
- ✅ Cores por NDVI

---

## 🎮 Ordem Recomendada de Testes

```
1. teste_pequeno.geojson
   ↓ Familiarizar com interface
   
2. teste_fazenda_exemplo.geojson
   ↓ Explorar funcionalidades completas
   
3. teste_alerta_critico.geojson
   ↓ Focar em alertas visuais
   
4. teste_grande_mato_grosso.geojson
   ↓ Ver auto-zoom em ação (longa distância)
   
5. Repetir teste_fazenda_exemplo.geojson
   ↓ Ver mapa voltar para Brasília
```

---

## 📊 Comparação dos Arquivos

| Arquivo | Localização | Áreas | Tamanho Total | NDVI Variado | Alertas | Auto-Zoom |
|---------|-------------|-------|---------------|--------------|---------|-----------|
| `teste_pequeno` | Brasília | 1 | 25 ha | Não | Não | ✅ Curto |
| `teste_fazenda_exemplo` | Brasília | 4 | 313 ha | ✅ Sim | ✅ Sim | ✅ Médio |
| `teste_grande_mato_grosso` | Mato Grosso | 1 | 500 ha | Não | Não | ✅ Longo |
| `teste_alerta_critico` | Brasília | 2 | 75 ha | ✅ Sim | ✅ Sim | ✅ Curto |

---

## 🎯 Matriz de Funcionalidades Testadas

| Funcionalidade | Pequeno | Fazenda | MT Grande | Alerta |
|----------------|---------|---------|-----------|--------|
| Upload GeoJSON | ✅ | ✅ | ✅ | ✅ |
| Auto-Zoom | ✅ | ✅ | ✅ | ✅ |
| Múltiplas áreas | ❌ | ✅ | ❌ | ✅ |
| Bordas piscantes | ❌ | ✅ | ❌ | ✅ |
| Sistema alertas | ❌ | ✅ | ❌ | ✅ |
| Mudança região | ❌ | ❌ | ✅ | ❌ |
| NDVI variado | ❌ | ✅ | ❌ | ✅ |
| Click seleção | ✅ | ✅ | ✅ | ✅ |
| Hover interativo | ✅ | ✅ | ✅ | ✅ |
| Tooltip | ✅ | ✅ | ✅ | ✅ |

---

## 💾 Informações Técnicas

### Formato dos Arquivos
- **Tipo:** GeoJSON (RFC 7946)
- **Sistema de Coordenadas:** WGS84 (EPSG:4326)
- **Formato de Geometria:** Polygon
- **Encoding:** UTF-8

### Propriedades Incluídas
Todos os arquivos contêm:
- ✅ `nome` - Nome da área
- ✅ `area_ha` - Área em hectares
- ✅ `ndvi` - Índice de vegetação (0-1)
- ✅ `cultura` - Tipo de cultura
- ✅ `status` - Status da área (opcional)

### Compatibilidade
- ✅ AgriMap Dashboard
- ✅ QGIS
- ✅ ArcGIS
- ✅ Google Earth
- ✅ geojson.io
- ✅ Leaflet
- ✅ Mapbox

---

## 🚀 Quick Start

```bash
# 1. Vá para o diretório do projeto
cd Agrimap-dash

# 2. Liste os arquivos de teste
ls teste_*.geojson

# 3. Abra o dashboard
npm run dev

# 4. Acesse
http://localhost:3000

# 5. Upload o primeiro teste
teste_pequeno.geojson
```

---

## 📍 Coordenadas de Referência

### Brasília (Centro dos Testes)
```
Latitude:  -15.7800
Longitude: -47.9300
```

### Sorriso - MT (Teste Grande)
```
Latitude:  -12.5500
Longitude: -55.6900
```

### Distância entre eles
```
Distância em linha reta: ~896 km
Tempo de voo do mapa: 1.5 segundos
Velocidade: ~2.150.400 km/h 🚀
```

---

## 🎨 Legenda de Cores NDVI

```
NDVI >= 0.75  →  🟢 Verde Escuro  (#1B5E20)  →  Saudável
NDVI 0.50-0.74 → 🟡 Amarelo      (#F9A825)  →  Atenção
NDVI < 0.50   →  🔴 Vermelho     (#C62828)  →  Crítico (PISCANDO!)
```

---

## 📖 Documentação Relacionada

- 📄 `GUIA_DE_TESTES.md` - Guia passo a passo completo
- 📄 `AUTO_ZOOM_FEATURE.md` - Documentação do auto-zoom
- 📄 `ENV_SETUP.md` - Configuração do ambiente
- 📄 `SENTINEL_HUB_SETUP.md` - Setup Sentinel Hub

---

**Arquivos prontos para uso!** 🎉
Basta fazer upload no dashboard e testar! 🚀🌾

