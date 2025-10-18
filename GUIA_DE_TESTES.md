# 🧪 Guia Completo de Testes - AgriMap Dashboard

## 📋 Arquivos de Teste Criados

Foram criados 4 arquivos GeoJSON para testar diferentes funcionalidades:

| Arquivo | Descrição | O que Testa |
|---------|-----------|-------------|
| `teste_pequeno.geojson` | 1 área pequena (~25 ha) | Auto-zoom em área pequena, interface básica |
| `teste_fazenda_exemplo.geojson` | 4 talhões (~313 ha total) | Auto-zoom múltiplas áreas, alertas, NDVI variado |
| `teste_grande_mato_grosso.geojson` | 1 fazenda grande (500 ha) em MT | Auto-zoom área grande, mudança de região |
| `teste_alerta_critico.geojson` | 2 áreas (1 crítica, 1 saudável) | Bordas piscantes, sistema de alertas |

## 🚀 Checklist de Testes

### ✅ Teste 1: Upload Básico (Começe por aqui!)

**Arquivo:** `teste_pequeno.geojson`

**Passos:**
1. Abra o dashboard: `http://localhost:3000`
2. Clique no botão "Upload Shape"
3. Selecione `teste_pequeno.geojson`
4. Observe: ✅ Sucesso aparece

**O que verificar:**
- ✅ Mensagem: "✅ GeoJSON carregado com sucesso!"
- ✅ Mapa **anima suavemente** (1.5s)
- ✅ Mapa **centraliza** na área (Brasília)
- ✅ Zoom ajustado para mostrar toda área
- ✅ Polígono aparece no mapa
- ✅ Console: `🎯 Ajustando mapa para: [-15.7875, -47.9275]`

**Status esperado:**
```
🟢 Área de Teste Única
📊 NDVI: 0.65 (Amarelo - Atenção)
```

---

### ✅ Teste 2: Múltiplas Áreas + Alertas

**Arquivo:** `teste_fazenda_exemplo.geojson`

**Passos:**
1. Clique em "Limpar" (se houver shape anterior)
2. Upload: `teste_fazenda_exemplo.geojson`
3. Observe os 4 talhões aparecerem

**O que verificar:**
- ✅ **4 polígonos** aparecem
- ✅ Mapa mostra **todos** os talhões
- ✅ Cores diferentes por NDVI:
  - 🟢 Verde escuro: Talhão A (NDVI 0.78) e C (0.82)
  - 🟡 Amarelo: Talhão B (NDVI 0.45)
  - 🔴 Vermelho piscante: Talhão D (NDVI 0.35) **← ALERTA!**

**Detalhes dos Talhões:**
```
Talhão A - Soja       | 85.5 ha  | NDVI 0.78 | 🟢 Saudável
Talhão B - Milho      | 62.3 ha  | NDVI 0.45 | 🟡 Atenção
Talhão C - Algodão    | 120.8 ha | NDVI 0.82 | 🟢 Excelente
Talhão D - Pastagem   | 45.2 ha  | NDVI 0.35 | 🔴 Crítico (PISCANDO!)
```

**Teste interativo:**
- ✅ Passe o mouse sobre cada talhão
- ✅ Tooltip aparece com nome e área
- ✅ Talhão muda de cor no hover
- ✅ Clique em um talhão → dados aparecem no painel direito

---

### ✅ Teste 3: Mudança de Região (Auto-Zoom)

**Arquivo:** `teste_grande_mato_grosso.geojson`

**Passos:**
1. Com o mapa em Brasília (teste anterior)
2. Upload: `teste_grande_mato_grosso.geojson`
3. **OBSERVE A MÁGICA!** 🎬

**O que verificar:**
- ✅ Mapa **voa** de Brasília para Mato Grosso
- ✅ Animação suave através do Brasil
- ✅ Para em Sorriso - MT
- ✅ Fazenda de 500 hectares bem visível
- ✅ Console: `🎯 Ajustando mapa para: [-12.5500, -55.6900]`

**Distância percorrida:**
- De: Brasília (DF) → [-15.78, -47.93]
- Para: Sorriso (MT) → [-12.55, -55.69]
- Distância: ~900 km em 1.5 segundos! ✈️

---

### ✅ Teste 4: Alertas Críticos (Bordas Piscantes)

**Arquivo:** `teste_alerta_critico.geojson`

**Passos:**
1. Limpar mapa
2. Upload: `teste_alerta_critico.geojson`
3. Observe 2 áreas lado a lado

**O que verificar:**

**Área Crítica (Esquerda):**
- 🔴 Borda **VERMELHA PISCANTE**
- 📊 NDVI: 0.30 (crítico)
- ⚠️ Borda tracejada (dash pattern)
- 🔄 Pisca a cada 0.8s
- 💪 Peso da borda varia: 4px → 6px
- 🎨 Cor alterna: #DC2626 → #EF4444

**Área Saudável (Direita):**
- 🟢 Borda **VERDE ESCURO**
- 📊 NDVI: 0.85 (excelente)
- ➖ Borda contínua
- 🔒 Cor fixa

**Painel de Alertas (Direito):**
- ✅ "1 Alerta Crítico" aparece
- ⚠️ "NDVI Baixo - Possível estresse vegetativo"
- 🔴 Card de alerta em amarelo

---

## 🎯 Testes de Funcionalidades Específicas

### Teste A: Sistema de NDVI e Cores

**Objetivo:** Verificar se as cores mudam conforme NDVI

**Arquivo:** `teste_fazenda_exemplo.geojson`

**Verificar:**
| NDVI | Cor Esperada | Talhão Exemplo |
|------|--------------|----------------|
| ≥ 0.75 | 🟢 Verde escuro (#1B5E20) | Talhão A (0.78), C (0.82) |
| 0.50-0.74 | 🟡 Amarelo (#F9A825) | Talhão B (0.45)* |
| < 0.50 | 🔴 Vermelho piscante (#DC2626) | Talhão D (0.35) |

*Nota: 0.45 está abaixo de 0.50, então deve ser vermelho!

---

### Teste B: Animação de Hover

**Passos:**
1. Upload qualquer arquivo de teste
2. Passe mouse sobre área
3. Retire mouse

**Verificar:**
- ✅ **Hover ON:**
  - Borda fica mais grossa (4px)
  - Opacidade aumenta (0.7)
  - Cor muda para verde (#2E7D32)
  
- ✅ **Hover OFF:**
  - Borda volta ao normal (2px)
  - Opacidade volta (0.5)
  - Cor volta à original

---

### Teste C: Click e Seleção

**Passos:**
1. Upload: `teste_fazenda_exemplo.geojson`
2. Clique no "Talhão A - Soja"
3. Observe painel direito

**Verificar:**
- ✅ Card NDVI mostra: `0.78`
- ✅ Card Umidade mostra valor simulado
- ✅ Card Temperatura mostra valor simulado
- ✅ **Alertas atualizam** baseado no NDVI
- ✅ Console: `Área selecionada: {nome: "Talhão A - Soja", ...}`

---

### Teste D: Botão Limpar

**Passos:**
1. Com shape carregado
2. Clique em "Limpar"

**Verificar:**
- ✅ Shapes desaparecem
- ✅ Mapa volta para posição inicial
- ✅ Botão "Limpar" desaparece
- ✅ Placeholder "Faça upload" aparece

---

## 📊 Teste Completo: Fluxo de Trabalho

**Cenário:** Produtor quer monitorar sua fazenda

1. **Abrir Dashboard**
   - ✅ Header com "OpenWeather Ativo"
   - ✅ Mapa centrado em Brasília
   - ✅ Placeholder de upload visível

2. **Upload Fazenda**
   - ✅ Selecionar `teste_fazenda_exemplo.geojson`
   - ✅ Mapa voa para área
   - ✅ 4 talhões aparecem

3. **Identificar Problemas**
   - ✅ Talhão D está VERMELHO PISCANDO
   - ✅ Alerta aparece: "NDVI Baixo"
   - ✅ Badge "1 Alerta Ativo"

4. **Investigar Talhão**
   - ✅ Clicar no Talhão D
   - ✅ Ver dados: NDVI 0.35
   - ✅ Ver alertas detalhados

5. **Comparar com Saudável**
   - ✅ Clicar no Talhão C
   - ✅ Ver: NDVI 0.82 (excelente)
   - ✅ Alerta: "Tudo Ok - Condições ideais"

6. **Ação:** Produtor decide irrigar Talhão D! 💧

---

## 🐛 Checklist de Problemas Comuns

### ❌ Shape não aparece
- [ ] Arquivo é GeoJSON válido?
- [ ] Console mostra erros?
- [ ] Coordenadas estão corretas? (lat/lon, não lon/lat)
- [ ] Teste em: https://geojson.io

### ❌ Mapa não ajusta automaticamente
- [ ] Console mostra: "🎯 Ajustando mapa..."?
- [ ] Servidor Next.js está rodando?
- [ ] Recarregue a página (F5)

### ❌ Alertas não aparecem
- [ ] NDVI está no GeoJSON?
- [ ] Valor de NDVI é válido (0-1)?
- [ ] Clicou em uma área para selecionar?

### ❌ OpenWeather não funciona
- [ ] `.env.local` está configurado?
- [ ] API Key está correta?
- [ ] Servidor foi reiniciado após `.env.local`?

---

## 📈 Métricas de Sucesso

Após executar todos os testes, você deve ter:

- ✅ 4 uploads bem-sucedidos
- ✅ Auto-zoom funcionando 4x
- ✅ Bordas piscantes visíveis (2x)
- ✅ Alertas aparecendo corretamente
- ✅ Hover interativo funcionando
- ✅ Click e seleção OK
- ✅ Botão Limpar OK
- ✅ Console sem erros críticos

**Taxa de Sucesso Esperada:** 100% ✅

---

## 🎉 Teste Final: Sistema Completo

**Upload sequencial de todos os arquivos:**

1. `teste_pequeno.geojson` → Brasília, zoom próximo
2. `teste_grande_mato_grosso.geojson` → Voa para MT
3. `teste_alerta_critico.geojson` → Volta Brasília, alertas
4. `teste_fazenda_exemplo.geojson` → 4 talhões

**Se tudo funcionar:** 🎊 Sistema 100% operacional!

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique console (F12)
2. Leia logs do terminal (`npm run dev`)
3. Consulte `AUTO_ZOOM_FEATURE.md`
4. Consulte `CORS_FIX.md`

**Bons testes!** 🚀🌾

