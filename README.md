# AgriMap Dashboard Frontend

Dashboard interativo para monitoramento agrícola desenvolvido com Next.js e React.

## 🚀 Funcionalidades

- **Dashboard interativo** com mapa em tempo real
- **Visualização de dados** de NDVI, clima e alertas
- **Mapa interativo** com marcadores de fazendas
- **Gráficos dinâmicos** com histórico de dados
- **Atualização automática** a cada 5 minutos
- **Interface responsiva** para desktop e mobile

## 📁 Estrutura do Projeto

```
Agrimap-dash/
│
├── app/                    # Páginas Next.js
├── components/            # Componentes React
│   └── agri-map-dashboard.tsx
├── src/
│   └── api/              # Serviços de API
│       └── agriMapApi.js
├── public/               # Arquivos estáticos
├── package.json          # Dependências
└── README.md            # Este arquivo
```

## 🛠️ Instalação

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd Agrimap-dash
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Execute o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

O dashboard estará disponível em: `http://localhost:3000`

## 🔗 Integração com Backend

O frontend se conecta com a API backend em `http://127.0.0.1:8001`:

- **NDVI:** `/ndvi` - Dados de vegetação
- **Weather:** `/weather` - Dados meteorológicos  
- **Alerts:** `/alerts` - Alertas do sistema

## 🗺️ Funcionalidades do Mapa

- **3 Fazendas** com coordenadas reais do Brasil
- **Marcadores interativos** com ícones personalizados
- **Popups informativos** ao clicar nos marcadores
- **Seleção de fazenda** para visualizar dados específicos

## 📊 Componentes Principais

- **Mapa Interativo** - Visualização das fazendas
- **Cards de Métricas** - NDVI, umidade, alertas
- **Gráfico de Linha** - Histórico de NDVI
- **Card de Precipitação** - Dados de chuva

## 🔧 Tecnologias Utilizadas

- **Next.js 15** - Framework React
- **React 19** - Biblioteca de interface
- **React Leaflet** - Mapas interativos
- **Recharts** - Gráficos e visualizações
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **HeroUI** - Componentes UI

## 🎨 Características Visuais

- **Design responsivo** com Tailwind CSS
- **Tema verde** inspirado na agricultura
- **Animações suaves** e transições
- **Efeito fade** durante atualizações
- **Cards com hover effects**

## 📱 Responsividade

- **Desktop:** Layout em grid 3 colunas
- **Tablet:** Layout adaptativo
- **Mobile:** Layout em coluna única

## 🚀 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Verificação de código
```

## 📝 Licença

Este projeto está sob a licença MIT.
