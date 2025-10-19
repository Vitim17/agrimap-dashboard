"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { MapPin } from "lucide-react";

interface Fazenda {
  id: string;
  nome: string;
  ndvi: number;
  umidade: number;
  ira?: number;
  area?: number;
  historico?: number[];
}

interface RankingFazendasAvancadoProps {
  fazendas: Fazenda[];
  onVerNoMapa?: (fazenda: Fazenda) => void;
}

export default function RankingFazendasAvancado({ fazendas, onVerNoMapa }: RankingFazendasAvancadoProps) {
  const [filtro, setFiltro] = useState("ira");
  const [busca, setBusca] = useState("");

  const fazendasFiltradas = useMemo(() => {
    return fazendas
      .filter((f) => f.nome.toLowerCase().includes(busca.toLowerCase()))
      .sort((a, b) => {
        const valA = a[filtro as keyof Fazenda] ?? (filtro === 'ira' ? -Infinity : 0);
        const valB = b[filtro as keyof Fazenda] ?? (filtro === 'ira' ? -Infinity : 0);
        return (valB as number) - (valA as number);
      });
  }, [filtro, busca, fazendas]);

  const getColor = (valor: number | undefined) => {
    if (valor === undefined) return "bg-gray-400";
    if (valor < 40) return "bg-red-500";
    if (valor < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row gap-3 mb-5 justify-between items-center">
        <Input
          placeholder="🔍 Buscar fazenda..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full md:w-1/3"
        />

        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ira">IRA (Risco Agrícola)</SelectItem>
            <SelectItem value="ndvi">NDVI</SelectItem>
            <SelectItem value="umidade">Umidade</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {fazendasFiltradas.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">Nenhuma fazenda encontrada.</p>
        ) : (
          fazendasFiltradas.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:shadow-md transition-all cursor-pointer border border-gray-100">
                <CardContent className="p-5 flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-lg">{f.nome}</h3>
                    <p className="text-sm text-gray-500">
                      NDVI: {f.ndvi?.toFixed(2) ?? 'N/A'} | Umidade: {f.umidade ?? 'N/A'}% | IRA: {f.ira ?? 'N/A'}
                    </p>

                    {/* mini gráfico histórico */}
                    {f.historico && f.historico.length > 0 && (
                      <div className="h-12 w-40 mt-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={f.historico.map((v, i) => ({ dia: i, valor: v }))}>
                            <Line
                              type="monotone"
                              dataKey="valor"
                              stroke="#2563eb"
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className={`h-2 w-28 rounded-full ${getColor(f[filtro as keyof Fazenda] as number)}`} />
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => onVerNoMapa?.(f)}
                    >
                      <MapPin size={16} /> Ver no mapa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

