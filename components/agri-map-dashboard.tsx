import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Leaf, CloudSun, AlertTriangle, TrendingUp, Thermometer, Upload, Info, Droplets } from "lucide-react";
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

// Componente Progress Ring para indicadores
function ProgressRing({ 
  value, 
  maxValue, 
  size = 120, 
  strokeWidth = 8,
  color = "#10b981"
}: {
  value: number;
  maxValue: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#E5E7EB"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
    </svg>
  );
}

// Componente de Card animado com Progress Ring
function DataCard({ 
  title, 
  value, 
  suffix = "",
  icon,
  iconBgColor = "bg-emerald-100",
  valueColor = "text-emerald-700",
  delay = 0,
  showProgress = false,
  maxValue = 100,
  progressColor = "#10b981"
}: { 
  title: string;
  value: string | number;
  suffix?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  valueColor?: string;
  delay?: number;
  showProgress?: boolean;
  maxValue?: number;
  progressColor?: string;
}) {
  const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <Card className="border-0 shadow-none">
        <CardContent className="p-6">
          {showProgress ? (
            // Layout com Progress Ring
            <div className="flex flex-col items-center">
              <div className="relative">
                <ProgressRing 
                  value={numericValue} 
                  maxValue={maxValue}
                  size={140}
                  strokeWidth={10}
                  color={progressColor}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {icon && (
                    <div className={`mb-2 ${iconBgColor} p-3 rounded-full`}>
                      {icon}
                    </div>
                  )}
                  <motion.h3 
                    className={`text-3xl font-bold ${valueColor}`}
                    key={value}
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {value ?? "—"}{suffix}
                  </motion.h3>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-700 mt-3">{title}</p>
            </div>
          ) : (
            // Layout tradicional (sem progress ring)
            <div className="flex items-center gap-4">
              {icon && (
                <motion.div 
                  className={`p-4 ${iconBgColor} rounded-xl flex items-center justify-center`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {icon}
                </motion.div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                <motion.h3 
                  className={`text-3xl font-bold ${valueColor}`}
                  key={value}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {value ?? "—"}{suffix}
                </motion.h3>
              </div>
            </div>
          )}
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
    <div className="min-h-screen bg-[#F9F9F9] text-gray-800 transition-all">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 bg-green-700 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">🌾 AgriMap Dashboard</h1>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex items-center gap-2 bg-blue-500 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md"
          >
            <CloudSun className="w-4 h-4" />
            OpenWeather Ativo
          </motion.div>
        </div>
        <Button variant="secondary" className="bg-white text-green-700 font-semibold hover:bg-green-50 shadow-md px-6">
          + Nova Lavoura
        </Button>
      </header>

      {/* Main grid */}
      <main className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
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
              <div className="flex items-center justify-center h-[700px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                <div className="text-center">
                  <Upload className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold text-lg">Faça upload de um arquivo</p>
                  <p className="text-sm text-gray-400 mt-2">GeoJSON ou Shapefile (.zip)</p>
                </div>
              </div>
            )}
          </CardContent>
        </section>

        {/* Right side - Cards */}
        <section className={`flex flex-col gap-6 transition-opacity duration-700 ${fade ? "opacity-50" : "opacity-100"}`}>
          {/* NDVI com Progress Ring */}
          <DataCard
            title="NDVI Atual"
            value={selectedFarmData?.ndvi ?? ndviData?.ndvi_atual ?? "—"}
            icon={<Leaf className="text-green-600" />}
            iconBgColor="bg-green-50"
            valueColor="text-green-600"
            delay={0}
            showProgress={true}
            maxValue={1}
            progressColor="#16a34a"
          />

          {/* Umidade com Progress Ring */}
          <DataCard
            title="Umidade do Solo"
            value={selectedFarmData?.umidade ?? weather?.umidade_solo ?? "—"}
            suffix="%"
            icon={<Droplets className="text-blue-600" />}
            iconBgColor="bg-blue-50"
            valueColor="text-blue-600"
            delay={0.1}
            showProgress={true}
            maxValue={100}
            progressColor="#2563eb"
          />

          {/* Temperatura sem Progress Ring */}
          <DataCard
            title="Temperatura"
            value={selectedFarmData?.temperatura ?? weather?.temperatura ?? "—"}
            suffix="°C"
            icon={<Thermometer className="text-orange-600" />}
            iconBgColor="bg-orange-50"
            valueColor="text-orange-600"
            delay={0.2}
          />

          {/* Card de Alertas com destaque visual */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white p-6 rounded-2xl shadow-md border-2 border-yellow-200 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Alertas da Lavoura</h3>
            </div>
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
      <section className={`grid grid-cols-1 md:grid-cols-2 gap-8 px-8 pb-8 transition-opacity duration-700 ${fade ? "opacity-50" : "opacity-100"}`}>
        {/* Gráfico NDVI */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-green-600 text-lg">
                <TrendingUp className="w-6 h-6" /> Histórico NDVI
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ndviData?.historico || []}>
                  <XAxis dataKey="data" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis domain={[0, 1]} stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ndvi" 
                    stroke="#16a34a" 
                    strokeWidth={3} 
                    dot={{ fill: '#16a34a', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card Precipitação */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-blue-600 text-lg">
                <Droplets className="w-6 h-6" /> Precipitação (mm)
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-center items-center h-[250px]">
              <motion.div 
                className="text-center"
                key={selectedFarmData?.chuva ?? weather?.chuva_semana}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-6xl font-bold text-blue-600">
                  {selectedFarmData?.chuva ?? weather?.chuva_semana ?? "—"}
                </p>
                <p className="text-2xl font-semibold text-blue-400 mt-2">mm</p>
              </motion.div>
              <p className="text-sm font-medium text-gray-600 mt-4">
                {selectedFarmData ? "Área selecionada" : "Chuva acumulada na semana"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Gráfico de Produtividade */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-amber-600 text-lg">
                <TrendingUp className="w-6 h-6" /> Histórico de Produtividade
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              {yieldData && yieldData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yieldData}>
                    <XAxis dataKey="ano" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="produtividade" 
                      fill="#d97706" 
                      barSize={40}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <TrendingUp className="w-16 h-16 text-gray-300 mb-3" />
                  <p className="text-gray-500 font-semibold text-lg">Dados em Coleta</p>
                  <p className="text-gray-400 text-sm mt-2">Histórico de Produtividade em Breve</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
