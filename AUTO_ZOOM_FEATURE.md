# 🎯 Auto-Zoom no Mapa

## ✨ Feature Implementada

Quando você faz upload de um **GeoJSON** ou **Shapefile**, o mapa **automaticamente**:
- 🎯 **Centraliza** na área carregada
- 🔍 **Ajusta o zoom** para mostrar toda a área
- ✨ **Animação suave** de 1.5 segundos
- 📐 **Margem de 50px** para melhor visualização

## 🚀 Como Funciona

### Antes
```
Usuário faz upload → Shape aparece no mapa
❌ Mas o mapa fica na posição padrão (Brasília)
❌ Usuário precisa arrastar e dar zoom manualmente
```

### Agora
```
Usuário faz upload → Shape aparece no mapa
✅ Mapa automaticamente centraliza e ajusta zoom
✅ Mostra toda a área com margem adequada
✅ Animação suave e profissional
```

## 📋 Comportamento Detalhado

### 1. Upload de Shape
Quando você clica em "Upload Shape" e seleciona um arquivo:

**Formatos Suportados:**
- ✅ GeoJSON (`.json`, `.geojson`)
- ✅ Shapefile (`.zip` contendo `.shp`, `.shx`, `.dbf`)

### 2. Processamento
O sistema:
1. ✅ Carrega o arquivo
2. ✅ Converte para GeoJSON (se necessário)
3. ✅ Calcula o **bounding box** (retângulo que engloba toda a área)
4. ✅ Calcula o **centro** do shape

### 3. Ajuste Automático
O mapa:
1. 🎯 **Centraliza** no centro calculado
2. 🔍 **Ajusta zoom** para mostrar toda a área
3. 📐 **Adiciona margem** de 50px em todos os lados
4. 🎬 **Anima suavemente** por 1.5 segundos
5. 🔒 **Limita zoom máximo** em nível 16

## 🎨 Configurações

### Ajustar Margem
No arquivo `MapaLavouras.tsx`, linha ~46:

```typescript
map.fitBounds(groupBounds, {
  padding: [50, 50], // ← Altere aqui (vertical, horizontal)
  maxZoom: 16,
  animate: true,
  duration: 1.5
});
```

**Exemplos:**
- `[30, 30]` - Margem menor (mais zoom)
- `[100, 100]` - Margem maior (mais distante)
- `[50, 100]` - Margem diferente vertical/horizontal

### Ajustar Zoom Máximo
```typescript
maxZoom: 16 // ← Altere aqui
```

**Níveis de Zoom:**
- `10` - Visão regional
- `13` - Visão de cidade
- `16` - Visão de bairro (padrão)
- `18` - Visão de rua
- `20` - Visão detalhada

### Ajustar Velocidade da Animação
```typescript
duration: 1.5 // ← Altere aqui (em segundos)
```

**Exemplos:**
- `0.5` - Rápido
- `1.0` - Normal
- `1.5` - Suave (padrão)
- `2.0` - Muito suave

### Desabilitar Animação
```typescript
animate: false // ← Zoom instantâneo
```

## 🔍 Logs no Console

Quando o auto-zoom acontece, você verá no console:

```
🎯 Ajustando mapa para: [-15.7800, -47.9300]
```

Isso mostra as coordenadas do centro para onde o mapa está indo.

## 🧪 Testando

### Teste 1: Upload GeoJSON Pequeno
1. Faça upload de um GeoJSON pequeno (< 1 hectare)
2. ✅ Mapa deve dar zoom bem próximo
3. ✅ Zoom máximo será nível 16

### Teste 2: Upload GeoJSON Grande
1. Faça upload de um GeoJSON grande (> 100 hectares)
2. ✅ Mapa deve dar zoom mais distante
3. ✅ Mostrará toda a área com margem

### Teste 3: Múltiplos Shapes
1. Faça upload de um shape
2. Clique em "Limpar"
3. Faça upload de outro shape em local diferente
4. ✅ Mapa deve reajustar automaticamente

### Teste 4: Shapes em Diferentes Regiões
1. Upload shape do Sul do Brasil
2. ✅ Mapa vai para o Sul
3. Upload shape do Norte do Brasil
4. ✅ Mapa vai para o Norte

## 💡 Casos de Uso

### Fazendas
```
Upload: fazenda_soja.geojson (500 hectares em MT)
→ Mapa ajusta para Mato Grosso
→ Zoom mostra toda a fazenda
```

### Talhões
```
Upload: talhao_a.geojson (20 hectares)
→ Mapa ajusta para o talhão específico
→ Zoom mais próximo
```

### Múltiplas Propriedades
```
Upload: propriedades.zip (várias fazendas)
→ Mapa ajusta para mostrar todas
→ Zoom adequado ao conjunto
```

## 🐛 Resolução de Problemas

### Mapa não ajusta automaticamente
- ✅ Verifique se o GeoJSON é válido
- ✅ Verifique console por erros
- ✅ Teste com um GeoJSON simples primeiro

### Zoom muito próximo/distante
- ✅ Ajuste `maxZoom` (linha ~48)
- ✅ Ajuste `padding` (linha ~47)

### Animação muito rápida/lenta
- ✅ Ajuste `duration` (linha ~50)

### GeoJSON não aparece
- ✅ Verifique se tem propriedade `type: "FeatureCollection"`
- ✅ Verifique se coordenadas estão corretas
- ✅ Use https://geojson.io para validar

## 📊 Exemplo de GeoJSON

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "nome": "Fazenda Teste",
        "area_ha": 100
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-47.93, -15.78],
          [-47.92, -15.78],
          [-47.92, -15.79],
          [-47.93, -15.79],
          [-47.93, -15.78]
        ]]
      }
    }
  ]
}
```

## 🎯 Coordenadas de Teste

Para testar com diferentes regiões:

### Brasília (Centro-Oeste)
```json
[-15.78, -47.93]
```

### São Paulo (Sudeste)
```json
[-23.55, -46.63]
```

### Porto Alegre (Sul)
```json
[-30.03, -51.23]
```

### Belém (Norte)
```json
[-1.46, -48.50]
```

## 🌟 Melhorias Futuras

Possíveis melhorias para esta feature:

1. 📍 **Botão "Voltar para shape"** - Reajustar zoom se usuário navegar
2. 🎯 **Indicador visual** - Mostrar "Centralizando mapa..." durante animação
3. 📏 **Mostrar escala** - Exibir área em hectares
4. 🗺️ **Salvar posição** - Lembrar última visualização
5. 📱 **Ajuste mobile** - Margem diferente em dispositivos móveis

---

**Feature implementada e funcionando!** 🎉

Agora toda vez que você faz upload de um shape, o mapa vai automaticamente para a localização correta!

