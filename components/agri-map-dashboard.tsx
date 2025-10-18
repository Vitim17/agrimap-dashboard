import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Leaf, CloudSun, AlertTriangle, TrendingUp, Thermometer, Upload, Info } from "lucide-react";
import { getNDVI, getWeather, getAlerts, getYield, getOpenWeatherData } from "../src/api/agriMapApi";
import { AlertasLavoura } from "./AlertasLavoura";
import "leaflet/dist/leaflet.css";

// Componente do mapa com SSR desabilitado
const MapaLavouras = dynamic(() => import("./MapaLavouras"), { ssr: false });

// Interfaces para os dados do dashboard
interface FarmData {
  nome: string;
  ndvi?: number;
  umidade?: number;
  temperatura?: number;
  chuva?: number;
}

interface NDVIData {
  ndvi_atual: number;
  historico: Array<{
    data: string;
    ndvi: number;
  }>;
}

interface WeatherData {
  umidade_solo: number;
  temperatura: number;
  chuva_semana: number;
}

interface Alert {
  tipo: string;
  nivel: string;
  data: string;
}

interface YieldData {
  ano: string;
  produtividade: number;
}

// Componente de Card animado
function DataCard({ 
  title, 
  value, 
  suffix = "",
  icon,
  iconBgColor = "bg-emerald-100",
  valueColor = "text-emerald-700",
  delay = 0
}: { 
  title: string;
  value: string | number;
  suffix?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  valueColor?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
    >
      <Card className="border-0 shadow-none">
        <CardContent className="flex items-center gap-4 p-4">
          {icon && (
            <motion.div 
              className={`p-3 ${iconBgColor} rounded-full`}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              {icon}
            </motion.div>
          )}
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <motion.h3 
              className={`text-2xl font-bold ${valueColor}`}
              key={value}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {value ?? "—"}{suffix}
            </motion.h3>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AgriMapDashboard() {
  const [selectedFarm, setSelectedFarm] = useState("Fazenda São José");
  const [selectedFarmData, setSelectedFarmData] = useState<FarmData | null>(null);
  const [ndviData, setNDVIData] = useState<NDVIData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [yieldData, setYieldData] = useState<YieldData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [layers, setLayers] = useState<any[]>([]);

  const renderGeoJSON = (geojson: any) => {
    setLayers([geojson]); // Substitui camadas anteriores
  };

  const handleSelectLavoura = (data: FarmData) => {
    console.log("Área selecionada:", data);
    setSelectedFarm(data.nome);
    setSelectedFarmData(data);
  };

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();

    try {
      // GeoJSON (.geojson, .json)
      if (fileName.endsWith('.geojson') || fileName.endsWith('.json')) {
        const text = await file.text();
        const geojson = JSON.parse(text);
        
        if (!geojson.type || (geojson.type !== 'FeatureCollection' && geojson.type !== 'Feature')) {
          alert('❌ Arquivo JSON não é um GeoJSON válido.');
          return;
        }
        
        renderGeoJSON(geojson);
        alert('✅ GeoJSON carregado com sucesso!');
        return;
      }
      
      // Shapefile (.zip) - envia para backend processar
      if (fileName.endsWith('.zip')) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('http://localhost:8002/upload_shapefile', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Erro ao processar shapefile');
        }
        
        const geojson = await response.json();
        renderGeoJSON(geojson);
        alert('✅ Shapefile carregado com sucesso!');
        return;
      }
      
      alert('❌ Formato não suportado. Use .geojson ou .zip contendo shapefile.');
      
    } catch (error) {
      console.error('Erro ao carregar arquivo:', error);
      alert('❌ Erro ao carregar arquivo. Verifique se o formato está correto.');
    }
  }

  async function fetchAllData() {
    setFade(true);
    try {
      const ndvi = await getNDVI();
      const weatherData = await getWeather();
      const alertData = await getAlerts();
      const yieldAll = await getYield();
      setNDVIData(ndvi);
      setWeather(weatherData);
      setAlerts(alertData.alertas);
      setYieldData(yieldAll[selectedFarm] || []);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setFade(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
    fetchAllData();
    const interval = setInterval(fetchAllData, 5 * 60 * 1000); // Atualiza a cada 5 min
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function updateYieldData() {
      try {
        const yieldAll = await getYield();
        setYieldData(yieldAll[selectedFarm] || []);
      } catch (err) {
        console.error("Erro ao atualizar dados de produtividade:", err);
      }
    }
    updateYieldData();
  }, [selectedFarm]);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl text-green-700">
        🌿 Carregando dados da fazenda...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 text-gray-800 transition-all">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-green-700 text-white shadow-md">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">🌾 AgriMap Dashboard</h1>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex items-center gap-2 bg-blue-500 px-3 py-1 rounded-full text-xs font-semibold"
          >
            <CloudSun className="w-4 h-4" />
            OpenWeather Ativo
          </motion.div>
        </div>
        <Button variant="secondary" className="bg-white text-green-700 font-semibold hover:bg-green-100">
          + Nova Lavoura
        </Button>
      </header>

      {/* Main grid */}
      <main className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Left side - Map */}
        <section className="md:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden">
          <CardHeader className="p-4 border-b">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg font-semibold">{selectedFarm}</CardTitle>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Formatos: GeoJSON (.json), Shapefile (.zip com .shp+.shx+.dbf)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".geojson,.json,.zip"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="geojson-upload"
                />
                <label htmlFor="geojson-upload">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    asChild
                  >
                    <span className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Shape
                    </span>
                  </Button>
                </label>
              {layers.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLayers([])}
                  className="text-red-600 hover:text-red-700"
                >
                  Limpar
                </Button>
              )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {layers.length > 0 ? (
              <MapaLavouras 
                lavouras={layers} 
                onSelectLavoura={handleSelectLavoura}
              />
            ) : (
              <div className="flex items-center justify-center h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                <div className="text-center">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Faça upload de um arquivo</p>
                  <p className="text-sm text-gray-400 mt-1">GeoJSON ou Shapefile (.zip)</p>
                </div>
              </div>
            )}
          </CardContent>
        </section>

        {/* Right side - Cards */}
        <section className={`flex flex-col gap-4 transition-opacity duration-700 ${fade ? "opacity-50" : "opacity-100"}`}>
          <DataCard
            title="NDVI Atual"
            value={selectedFarmData?.ndvi ?? ndviData?.ndvi_atual ?? "—"}
            icon={<Leaf className="text-green-700" />}
            iconBgColor="bg-green-100"
            valueColor="text-green-700"
            delay={0}
          />

          <DataCard
            title="Umidade do Solo"
            value={selectedFarmData?.umidade ?? weather?.umidade_solo ?? "—"}
            suffix="%"
            icon={<CloudSun className="text-blue-700" />}
            iconBgColor="bg-blue-100"
            valueColor="text-blue-700"
            delay={0.1}
          />

          <DataCard
            title="Temperatura"
            value={selectedFarmData?.temperatura ?? weather?.temperatura ?? "—"}
            suffix="°C"
            icon={<Thermometer className="text-orange-700" />}
            iconBgColor="bg-orange-100"
            valueColor="text-orange-700"
            delay={0.2}
          />

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white p-4 rounded-2xl shadow-md"
          >
            <h3 className="font-semibold text-gray-800 mb-3">Alertas</h3>
            <AlertasLavoura 
              dados={{
                ndvi: selectedFarmData?.ndvi ?? ndviData?.ndvi_atual,
                umidade: selectedFarmData?.umidade ?? weather?.umidade_solo,
                chuva: selectedFarmData?.chuva ?? weather?.chuva_semana
              }}
            />
          </motion.div>
        </section>
      </main>

      {/* Bottom charts */}
      <section className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 transition-opacity duration-700 ${fade ? "opacity-50" : "opacity-100"}`}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <TrendingUp className="w-5 h-5" /> Histórico NDVI
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ndviData?.historico || []}>
                  <XAxis dataKey="data" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="ndvi" stroke="#16a34a" strokeWidth={3} dot />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-blue-700">Precipitação (mm)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-center items-center h-[250px]">
              <motion.p 
                className="text-4xl font-bold text-blue-700"
                key={selectedFarmData?.chuva ?? weather?.chuva_semana}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {selectedFarmData?.chuva ?? weather?.chuva_semana ?? "—"} mm
              </motion.p>
              <p className="text-sm text-gray-500 mt-2">
                {selectedFarmData ? "Área selecionada" : "Chuva acumulada na semana"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-amber-700">Histórico de Produtividade</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yieldData}>
                  <XAxis dataKey="ano" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="produtividade" fill="#d97706" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
