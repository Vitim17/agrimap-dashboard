"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { TrendingUp, Search } from "lucide-react";

interface Fazenda {
  id: string;
  nome: string;
  ndvi: number;
  umidade: number;
  ira?: number;
  area?: number;
}

interface RankingFazendasProps {
  fazendas: Fazenda[];
  onSelectFazenda?: (fazenda: Fazenda) => void;
}

export default function RankingFazendas({ fazendas, onSelectFazenda }: RankingFazendasProps) {
  const [filtro, setFiltro] = useState<"ira" | "ndvi" | "umidade">("ira");
  const [busca, setBusca] = useState("");

  const fazendasFiltradas = useMemo(() => {
    return fazendas
      .filter((f) => f.nome.toLowerCase().includes(busca.toLowerCase()))
      .sort((a, b) => {
        const valorA = a[filtro] ?? 0;
        const valorB = b[filtro] ?? 0;
        return valorB - valorA;
      });
  }, [filtro, busca, fazendas]);

  const getColor = (valor: number) => {
    if (valor < 40) return "bg-red-500";
    if (valor < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getColorIRA = (ira: number) => {
    if (ira < 40) return { bg: "bg-red-100", text: "text-red-700", bar: "bg-red-500" };
    if (ira < 70) return { bg: "bg-yellow-100", text: "text-yellow-700", bar: "bg-yellow-500" };
    return { bg: "bg-green-100", text: "text-green-700", bar: "bg-green-500" };
  };

  const getNomeMetrica = () => {
    if (filtro === "ira") return "IRA";
    if (filtro === "ndvi") return "NDVI";
    return "Umidade";
  };

  if (!fazendas || fazendas.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-semibold">Nenhuma fazenda disponível</p>
            <p className="text-sm mt-1">Carregue um GeoJSON para ver o ranking</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-6 h-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-800">Ranking de Fazendas</h2>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="🔍 Buscar fazenda..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filtro} onValueChange={(value) => setFiltro(value as any)}>
          <SelectTrigger className="w-full md:w-56">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ira">📊 IRA (Índice de Risco)</SelectItem>
            <SelectItem value="ndvi">🌿 NDVI</SelectItem>
            <SelectItem value="umidade">💧 Umidade</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contador */}
      <div className="text-sm text-gray-600">
        {fazendasFiltradas.length} {fazendasFiltradas.length === 1 ? "fazenda encontrada" : "fazendas encontradas"}
      </div>

      {/* Lista de Fazendas */}
      <div className="grid gap-3">
        {fazendasFiltradas.map((f, i) => {
          const valor = f[filtro] ?? 0;
          const cores = filtro === "ira" && f.ira ? getColorIRA(f.ira) : null;
          
          return (
            <motion.div
              key={f.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card 
                className={`hover:shadow-lg transition-all cursor-pointer border-l-4 ${
                  cores ? cores.bg : ""
                } ${valor < 40 ? "border-l-red-500" : valor < 70 ? "border-l-yellow-500" : "border-l-green-500"}`}
                onClick={() => onSelectFazenda?.(f)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    {/* Informações da Fazenda */}
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-gray-500 font-bold text-lg">#{i + 1}</span>
                        <h3 className="font-semibold text-lg text-gray-800">{f.nome}</h3>
                      </div>
                      
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>🌿 NDVI: <strong>{f.ndvi?.toFixed(2) ?? "N/A"}</strong></span>
                        <span>💧 Umidade: <strong>{f.umidade ?? "N/A"}%</strong></span>
                        {f.area && <span>📏 {f.area} ha</span>}
                      </div>
                    </div>

                    {/* Score e Barra */}
                    <div className="text-right">
                      <p className={`font-bold text-2xl ${cores?.text ?? "text-gray-800"}`}>
                        {filtro === "ndvi" ? valor.toFixed(2) : Math.round(valor)}
                        {filtro === "umidade" && "%"}
                      </p>
                      <p className="text-xs text-gray-500 mb-1">{getNomeMetrica()}</p>
                      
                      {/* Barra de progresso */}
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ 
                            width: filtro === "ndvi" ? `${valor * 100}%` : `${valor}%` 
                          }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                          className={cores?.bar ?? getColor(valor)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Mensagem quando não há resultados */}
      {fazendasFiltradas.length === 0 && busca && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <Search className="w-10 h-10 mx-auto mb-2 text-gray-400" />
            <p className="font-semibold">Nenhuma fazenda encontrada</p>
            <p className="text-sm mt-1">Tente outro termo de busca</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

