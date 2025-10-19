"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { PainelLavoura } from "./PainelLavoura";
import "leaflet/dist/leaflet.css";

// Componente do mapa com SSR desabilitado
const MapaLavouras = dynamic(() => import("./MapaLavouras"), { ssr: false });

interface FarmData {
  id?: string;
  nome: string;
  ndvi: number;
  umidade: number;
  chuva: number | string;
  area?: number;
  temperatura?: number;
  historicoNDVI?: Array<{
    data: string;
    ndvi: number;
  }>;
}

/**
 * Componente Dashboard Simples
 * 
 * Layout alternativo com painel lateral que exibe dados da fazenda selecionada.
 * Mais simples e focado que o AgriMapDashboard completo.
 */
export function DashboardSimples() {
  const [selectedFarm, setSelectedFarm] = useState<FarmData | null>(null);
  const [layers, setLayers] = useState<any[]>([]);

  const handleSelectLavoura = (data: FarmData) => {
    console.log("Fazenda selecionada:", data);
    setSelectedFarm(data);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();

    try {
      if (fileName.endsWith('.geojson') || fileName.endsWith('.json')) {
        const text = await file.text();
        const geojson = JSON.parse(text);
        
        if (!geojson.type || (geojson.type !== 'FeatureCollection' && geojson.type !== 'Feature')) {
          alert('❌ Arquivo JSON não é um GeoJSON válido.');
          return;
        }
        
        setLayers([geojson]);
        alert('✅ GeoJSON carregado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao carregar arquivo:', error);
      alert('❌ Erro ao processar arquivo');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-700 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">🌾 AgriMap - Dashboard Simplificado</h1>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".geojson,.json"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload-simple"
            />
            <label htmlFor="file-upload-simple">
              <button
                className="bg-white text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-upload-simple')?.click()}
              >
                📁 Upload GeoJSON
              </button>
            </label>
            {layers.length > 0 && (
              <button
                onClick={() => {
                  setLayers([]);
                  setSelectedFarm(null);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                🗑️ Limpar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto h-[calc(100vh-120px)]">
        {/* Painel lateral */}
        <div className="col-span-1 bg-white shadow-lg rounded-2xl p-6 overflow-y-auto">
          <PainelLavoura lavoura={selectedFarm} />
        </div>

        {/* Mapa */}
        <div className="col-span-2 h-full bg-white shadow-lg rounded-2xl overflow-hidden">
          {layers.length > 0 ? (
            <MapaLavouras 
              lavouras={layers} 
              onSelectLavoura={handleSelectLavoura}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center px-6">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Nenhum mapa carregado
                </h3>
                <p className="text-gray-500">
                  Faça upload de um arquivo GeoJSON para começar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardSimples;

