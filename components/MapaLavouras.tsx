import { MapContainer, TileLayer, GeoJSON, Tooltip, useMap, ImageOverlay } from "react-leaflet";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import * as L from "leaflet";
import { Layers, Satellite, Image as ImageIcon, CloudRain } from "lucide-react";

/**
 * Calcula o Índice de Risco Agrícola (IRA)
 * Score de 0-100 baseado em múltiplos fatores
 */
const calcularIRA = (ndvi: number, umidade: number, chuva: number, temp: number) => {
  let score = 0;

  // NDVI (peso alto - 40%)
  score += ndvi * 40;

  // Umidade (peso médio - 25%)
  score += (umidade / 100) * 25;

  // Chuva (ideal entre 10 e 40 mm - 20%)
  score += Math.min(1, chuva / 40) * 20;

  // Temperatura (ideal entre 20°C e 30°C - 15%)
  const fatorTemp = temp < 15 || temp > 35 ? 0.3 : 1 - Math.abs(25 - temp) / 25;
  score += fatorTemp * 15;

  return Math.round(score);
};

interface MapaLavourasProps {
  lavouras: any[];
  onSelectLavoura?: (data: any) => void;
  fazendaParaFocar?: any; // GeoJSON da fazenda para centralizar
  alertasCriticos?: {
    nome: string;
    ndvi?: number;
    umidade?: number;
    chuva?: number;
  }[];
}

// Componente para controlar zoom automático
function MapController({ lavouras, fazendaParaFocar }: { lavouras: any[]; fazendaParaFocar?: any }) {
  const map = useMap();

  // Effect para zoom inicial em todas as lavouras
  useEffect(() => {
    if (lavouras && lavouras.length > 0) {
      try {
        // Cria um FeatureGroup com todas as camadas
        const bounds: L.LatLngBounds[] = [];
        
        lavouras.forEach((geojson) => {
          const geoJsonLayer = L.geoJSON(geojson);
          const layerBounds = geoJsonLayer.getBounds();
          if (layerBounds.isValid()) {
            bounds.push(layerBounds);
          }
        });

        // Se temos bounds válidos, ajusta o mapa
        if (bounds.length > 0) {
          const group = L.featureGroup(bounds.map(b => L.rectangle(b)));
          const groupBounds = group.getBounds();
          
          // Calcula centro e área
          const center = groupBounds.getCenter();
          console.log(`🎯 Ajustando mapa para: [${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}]`);
          
          // Faz zoom suave para mostrar toda a área
          map.fitBounds(groupBounds, {
            padding: [50, 50], // Margem de 50px
            maxZoom: 16, // Zoom máximo
            animate: true,
            duration: 1.5 // Animação de 1.5 segundos
          });
        }
      } catch (error) {
        console.error('Erro ao calcular bounds:', error);
      }
    }
  }, [lavouras, map]);

  // Effect para focar em uma fazenda específica
  useEffect(() => {
    if (fazendaParaFocar) {
      try {
        const geoJsonLayer = L.geoJSON(fazendaParaFocar);
        const bounds = geoJsonLayer.getBounds();
        
        if (bounds.isValid()) {
          console.log('🎯 Focando em fazenda:', fazendaParaFocar.properties?.nome);
          map.flyToBounds(bounds, { 
            maxZoom: 14,
            padding: [50, 50],
            duration: 1.5 
          });
        }
      } catch (error) {
        console.error('Erro ao focar em fazenda:', error);
      }
    }
  }, [fazendaParaFocar, map]);

  return null;
}

// Componente para overlay de imagens de satélite
function SatelliteImageOverlay({ 
  lavouras, 
  visualizationType 
}: { 
  lavouras: any[]; 
  visualizationType: string;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);

  useEffect(() => {
    if (lavouras && lavouras.length > 0 && visualizationType !== 'none') {
      try {
        // Calcula bounds de todas as áreas
        const allBounds: L.LatLngBounds[] = [];
        
        lavouras.forEach((geojson) => {
          const geoJsonLayer = L.geoJSON(geojson);
          const layerBounds = geoJsonLayer.getBounds();
          if (layerBounds.isValid()) {
            allBounds.push(layerBounds);
          }
        });

        if (allBounds.length > 0) {
          const group = L.featureGroup(allBounds.map(b => L.rectangle(b)));
          const groupBounds = group.getBounds();
          
          // Constrói URL da API
          const params = new URLSearchParams({
            west: groupBounds.getWest().toString(),
            south: groupBounds.getSouth().toString(),
            east: groupBounds.getEast().toString(),
            north: groupBounds.getNorth().toString(),
            type: visualizationType,
            width: '1024',
            height: '1024',
          });

          const url = `/api/sentinel/image?${params}`;
          setImageUrl(url);
          setBounds(groupBounds);
          
          console.log(`🛰️ Carregando imagem Sentinel: ${visualizationType}`);
        }
      } catch (error) {
        console.error('Erro ao carregar imagem de satélite:', error);
      }
    } else {
      setImageUrl(null);
      setBounds(null);
    }
  }, [lavouras, visualizationType]);

  if (!imageUrl || !bounds || visualizationType === 'none') {
    return null;
  }

  return (
    <ImageOverlay
      url={imageUrl}
      bounds={bounds}
      opacity={0.7}
      zIndex={100}
    />
  );
}

export default function MapaLavouras({ lavouras, onSelectLavoura, fazendaParaFocar, alertasCriticos = [] }: MapaLavourasProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [visualizationType, setVisualizationType] = useState<string>('none');
  const [showPrecipitation, setShowPrecipitation] = useState<boolean>(false);

  // Cor baseada no IRA (mais intuitivo)
  const getColorByIRA = (ira: number | null) => {
    if (ira === null) return "#666666"; // cinza para sem dados
    if (ira < 40) return "#dc2626"; // vermelho (crítico)
    if (ira < 70) return "#eab308"; // amarelo (atenção)
    return "#16a34a"; // verde (ideal)
  };

  // Cor baseada no NDVI (fallback)
  const getColorByNDVI = (ndvi: number | null) => {
    if (ndvi === null) return "#666666"; // cinza para sem dados
    if (ndvi >= 0.75) return "#1B5E20"; // verde escuro
    if (ndvi >= 0.5) return "#F9A825"; // amarelo médio
    return "#C62828"; // vermelho
  };

  const temAlertaCritico = (nome: string, ndvi: number) => {
    // Verifica se há alerta crítico baseado no NDVI
    return ndvi < 0.5;
  };

  const onEachFeature = (feature: any, layer: any) => {
    const props = feature.properties;
    const ndvi = props.ndvi ?? null;
    const ira = props.ira ?? null;

    // Adiciona classes CSS baseado no IRA ou NDVI
    if (ira !== null) {
      if (ira < 40) {
        layer._path?.classList.add("alerta-critico");
      } else if (ira < 70) {
        layer._path?.classList.add("alerta-moderado");
      }
    } else if (ndvi !== null) {
      if (ndvi < 0.5) {
        layer._path?.classList.add("alerta-critico");
      } else if (ndvi < 0.7) {
        layer._path?.classList.add("alerta-moderado");
      }
    }

    // Estilo inicial - prioriza IRA, fallback para NDVI
    const estiloBase = {
      color: ira !== null ? getColorByIRA(ira) : (ndvi !== null ? getColorByNDVI(ndvi) : "#666666"),
      weight: 3,
      fillOpacity: 0.35,
    };

    layer.setStyle(estiloBase);

    // Tooltip - prioriza IRA
    let tooltipContent = `<strong>${props.nome}</strong>`;
    if (ira !== null) {
      tooltipContent += `<br>IRA: ${ira} pontos`;
    } else if (ndvi !== null) {
      tooltipContent += `<br>NDVI: ${ndvi.toFixed(2)}`;
        } else {
      tooltipContent += `<br>Clique para mais informações`;
    }
    
    layer.bindTooltip(tooltipContent, { direction: "top" });

    layer.on({
      mouseover: () => {
        setHovered(props.nome);
        layer.setStyle({
          weight: 4,
          fillOpacity: 0.7,
          color: "#2E7D32",
        });
      },
      mouseout: () => {
        setHovered(null);
        if (active !== props.nome) {
          layer.setStyle({
            weight: 3,
            fillOpacity: 0.35,
            color: ira !== null ? getColorByIRA(ira) : (ndvi !== null ? getColorByNDVI(ndvi) : "#666666"),
          });
        }
      },
      click: async () => {
        setActive(props.nome);
        layer.bringToFront(); // Traz o polígono clicado para frente
        
        if (onSelectLavoura) {
          // Dados base do GeoJSON
          const dadosBase: any = {
            id: props.id,
            nome: props.nome,
            area: props.area_ha || props.area,
            ndvi: props.ndvi,
            umidade: props.umidade,
            chuva: props.chuva,
            temperatura: props.temperatura,
            latitude: props.latitude,
            longitude: props.longitude,
          };

          console.log(`📍 Fazenda selecionada:`, dadosBase);

          try {
            // 1. Busca histórico de NDVI (se houver ID)
            if (props.id) {
              console.log(`🔍 Buscando histórico NDVI da fazenda ${props.id}...`);
              
              const historicoResponse = await fetch(`/api/lavouras/${props.id}/historico`);
              
              if (historicoResponse.ok) {
                const historicoNDVI = await historicoResponse.json();
                console.log(`✅ Histórico NDVI carregado:`, historicoNDVI);
                dadosBase.historicoNDVI = historicoNDVI;
              } else {
                console.warn('⚠️ Histórico NDVI não disponível');
              }
            }

            // 2. Busca dados climáticos do OpenWeather (se houver coordenadas)
            if (props.latitude && props.longitude) {
              console.log(`🌤️ Buscando dados climáticos (lat: ${props.latitude}, lon: ${props.longitude})...`);
              
              const OPENWEATHER_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
              
              if (OPENWEATHER_KEY) {
                const climaUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${props.latitude}&lon=${props.longitude}&appid=${OPENWEATHER_KEY}&units=metric&lang=pt_br`;
                
                const climaResponse = await fetch(climaUrl);
                
                if (climaResponse.ok) {
                  const climaData = await climaResponse.json();
                  
                  // Processa dados das próximas 24h (8 registros de 3h cada)
                  const proximasHoras = climaData.list.slice(0, 8);
                  
                  const tempMedia = (
                    proximasHoras.reduce((acc: number, item: any) => acc + item.main.temp, 0) / 
                    proximasHoras.length
                  ).toFixed(1);
                  
                  const chuvaTotal = proximasHoras.reduce(
                    (acc: number, item: any) => acc + (item.rain?.['3h'] || 0), 
                    0
                  ).toFixed(1);
                  
                  const condicao = proximasHoras[0]?.weather[0]?.description || 'N/A';
                  const umidadeAtual = proximasHoras[0]?.main?.humidity;
                  
                  dadosBase.clima = {
                    temperatura: parseFloat(tempMedia),
                    chuva: parseFloat(chuvaTotal),
                    condicao: condicao,
                    umidade: umidadeAtual,
                  };
                  
                  // Atualiza dados base com clima real (se não existirem)
                  if (!dadosBase.temperatura) dadosBase.temperatura = parseFloat(tempMedia);
                  if (!dadosBase.chuva) dadosBase.chuva = parseFloat(chuvaTotal);
                  if (!dadosBase.umidade) dadosBase.umidade = umidadeAtual;
                  
                  console.log(`✅ Dados climáticos carregados:`, dadosBase.clima);
                } else {
                  console.warn('⚠️ Erro ao buscar dados do OpenWeather:', climaResponse.status);
                }
              } else {
                console.warn('⚠️ NEXT_PUBLIC_OPENWEATHER_API_KEY não configurada');
              }
            } else {
              console.warn('⚠️ Coordenadas não disponíveis no GeoJSON');
            }
            
          } catch (error) {
            console.error('❌ Erro ao buscar dados:', error);
          }

          // Calcula IRA automaticamente se houver todos os dados necessários
          if (dadosBase.ndvi && dadosBase.umidade && dadosBase.chuva && dadosBase.temperatura) {
            const ira = calcularIRA(
              dadosBase.ndvi,
              typeof dadosBase.umidade === 'number' ? dadosBase.umidade : parseFloat(String(dadosBase.umidade)),
              typeof dadosBase.chuva === 'number' ? dadosBase.chuva : parseFloat(String(dadosBase.chuva)),
              dadosBase.temperatura
            );
            dadosBase.ira = ira;
            console.log(`📊 IRA calculado: ${ira} pontos`);
          } else {
            console.warn('⚠️ Dados insuficientes para calcular IRA');
          }

          // Envia dados (com ou sem dados das APIs)
          onSelectLavoura(dadosBase);
        }
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="rounded-2xl overflow-hidden shadow-lg relative"
    >
      <MapContainer
        center={[-15.78, -47.93]}
        zoom={9}
        style={{ height: "700px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Controle de zoom automático */}
        <MapController lavouras={lavouras} fazendaParaFocar={fazendaParaFocar} />
        
        {/* Overlay de imagens de satélite */}
        <SatelliteImageOverlay lavouras={lavouras} visualizationType={visualizationType} />
        
        {/* Camada de Precipitação (OpenWeather) */}
        {showPrecipitation && (
          <TileLayer
            url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`}
            opacity={0.4}
            zIndex={500}
          />
        )}
        
        {lavouras.map((geo: any, i: number) => (
          <GeoJSON key={i} data={geo} onEachFeature={onEachFeature}>
            <Tooltip direction="top" sticky>
              {hovered === geo.features[0]?.properties?.nome &&
                `${geo.features[0].properties.nome} (${geo.features[0].properties.area_ha} ha)`}
            </Tooltip>
          </GeoJSON>
        ))}
      </MapContainer>
      
      {/* Controle de Visualização de Satélite */}
      {lavouras.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute top-3 left-3 bg-white rounded-lg shadow-md p-3 z-[1000]"
        >
          <div className="flex items-center gap-2 mb-2">
            <Satellite className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-semibold text-gray-700">Visualização Satélite</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => setVisualizationType('none')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${
                visualizationType === 'none' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Layers className="w-3 h-3" />
              Polígonos
            </button>
            <button
              onClick={() => setVisualizationType('true-color')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${
                visualizationType === 'true-color' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ImageIcon className="w-3 h-3" />
              True Color
            </button>
            <button
              onClick={() => setVisualizationType('ndvi')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${
                visualizationType === 'ndvi' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
              NDVI Colorido
            </button>
            <button
              onClick={() => setVisualizationType('false-color')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${
                visualizationType === 'false-color' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Satellite className="w-3 h-3" />
              False Color
            </button>
          </div>
          {visualizationType !== 'none' && (
            <p className="text-[10px] text-gray-500 mt-2">
              🛰️ Sentinel-2 L2A
            </p>
          )}
        </motion.div>
      )}

      {/* Legenda IRA */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="absolute top-3 right-3 bg-white rounded-lg shadow-md p-3 z-[1000]"
      >
        <p className="text-xs font-semibold text-gray-700 mb-2">Índice de Risco (IRA)</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 rounded" style={{ backgroundColor: "#16a34a" }}></div>
            <span className="text-xs text-gray-600">Ideal (≥70)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 rounded" style={{ backgroundColor: "#eab308" }}></div>
            <span className="text-xs text-gray-600">Atenção (40-69)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 rounded" style={{ backgroundColor: "#dc2626" }}></div>
            <span className="text-xs font-semibold text-red-600">⚠️ Crítico (&lt;40)</span>
          </div>
        </div>
        
        {/* Controle de Precipitação */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={() => setShowPrecipitation(!showPrecipitation)}
            className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs transition-colors ${
              showPrecipitation
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CloudRain className="w-3 h-3" />
            Precipitação
          </button>
          {showPrecipitation && (
            <p className="text-[10px] text-gray-500 mt-1 text-center">
              🌧️ Tempo real
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

