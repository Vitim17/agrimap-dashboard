import { MapContainer, TileLayer, GeoJSON, Tooltip, useMap, ImageOverlay } from "react-leaflet";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import * as L from "leaflet";
import { Layers, Satellite, Image as ImageIcon } from "lucide-react";

interface MapaLavourasProps {
  lavouras: any[];
  onSelectLavoura?: (data: any) => void;
  alertasCriticos?: {
    nome: string;
    ndvi?: number;
    umidade?: number;
    chuva?: number;
  }[];
}

// Componente para controlar zoom automático
function MapController({ lavouras }: { lavouras: any[] }) {
  const map = useMap();

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

export default function MapaLavouras({ lavouras, onSelectLavoura, alertasCriticos = [] }: MapaLavourasProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [visualizationType, setVisualizationType] = useState<string>('none');

  const getColorByNDVI = (ndvi: number) => {
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
    const ndvi = props.ndvi ?? parseFloat((Math.random() * 0.5 + 0.5).toFixed(2));
    const temAlerta = temAlertaCritico(props.nome, ndvi);

    // Estilo inicial
    const estiloBase = {
      color: temAlerta ? "#DC2626" : getColorByNDVI(ndvi),
      weight: temAlerta ? 4 : 2,
      fillOpacity: 0.5,
      dashArray: temAlerta ? "10, 5" : "",
    };

    layer.setStyle(estiloBase);

    // Animação piscante para alertas críticos
    if (temAlerta) {
      let piscar = true;
      const intervalo = setInterval(() => {
        if (layer._map) {
          layer.setStyle({
            ...estiloBase,
            weight: piscar ? 6 : 4,
            color: piscar ? "#EF4444" : "#DC2626",
            fillOpacity: piscar ? 0.4 : 0.6,
          });
          piscar = !piscar;
        } else {
          clearInterval(intervalo);
        }
      }, 800);
    }

    layer.on({
      mouseover: () => {
        setHovered(props.nome);
        layer.setStyle({
          weight: temAlerta ? 6 : 4,
          fillOpacity: 0.7,
          color: temAlerta ? "#EF4444" : "#2E7D32",
        });
      },
      mouseout: () => {
        setHovered(null);
        if (active !== props.nome) {
          layer.setStyle({
            weight: temAlerta ? 4 : 2,
            fillOpacity: 0.5,
            color: temAlerta ? "#DC2626" : getColorByNDVI(ndvi),
          });
        }
      },
      click: () => {
        setActive(props.nome);
        if (onSelectLavoura) {
          onSelectLavoura({
            nome: props.nome,
            area: props.area_ha,
            ndvi: ndvi,
            umidade: Math.floor(Math.random() * 40 + 60),
            chuva: (Math.random() * 20).toFixed(1),
            temperatura: Math.floor(Math.random() * 10 + 20),
          });
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
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Controle de zoom automático */}
        <MapController lavouras={lavouras} />
        
        {/* Overlay de imagens de satélite */}
        <SatelliteImageOverlay lavouras={lavouras} visualizationType={visualizationType} />
        
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

      {/* Legenda de alertas */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="absolute top-3 right-3 bg-white rounded-lg shadow-md p-3 z-[1000]"
      >
        <p className="text-xs font-semibold text-gray-700 mb-2">Legenda</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 rounded" style={{ backgroundColor: "#1B5E20" }}></div>
            <span className="text-xs text-gray-600">Saudável</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 rounded" style={{ backgroundColor: "#F9A825" }}></div>
            <span className="text-xs text-gray-600">Atenção</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 rounded border-2 border-red-600 animate-pulse"></div>
            <span className="text-xs font-semibold text-red-600">⚠️ Crítico</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

