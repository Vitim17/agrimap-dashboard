import { AlertasLavoura } from "./AlertasLavoura";
import { GraficoNDVI } from "./GraficoNDVI";
import { motion } from "framer-motion";
import { MapPin, TrendingUp, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { gerarAlertas } from "@/src/utils/gerarAlertas";

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


interface PainelLavouraProps {
  lavoura?: {
    nome: string;
    ndvi: number;
    umidade: number;
    chuva: number | string;
    area?: number;
    temperatura?: number;
    temp?: number; // Alias para temperatura
    latitude?: number;
    longitude?: number;
    ira?: number; // Índice de Risco Agrícola (0-100)
    historico?: number[]; // Histórico simplificado de NDVI para gerarAlertas
    historicoNDVI?: Array<{
      data: string;
      ndvi: number;
    }>;
    clima?: {
      temperatura: number;
      chuva: number;
      condicao: string;
      umidade: number;
    };
  } | null;
}

export function PainelLavoura({ lavoura }: PainelLavouraProps) {
  if (!lavoura) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-full text-gray-400 text-center px-6 py-20"
      >
        <MapPin className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-500">
          Clique em uma fazenda no mapa
        </p>
        <p className="text-sm text-gray-400 mt-2">
          para ver os dados e alertas detalhados
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-600" />
          {lavoura.nome}
        </h2>
        {lavoura.area && (
          <p className="text-sm text-gray-500">Área: {lavoura.area} hectares</p>
        )}
      </div>

      {/* Índice de Risco Agrícola (IRA) */}
      {lavoura.ira !== undefined && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`rounded-xl p-4 ${
            lavoura.ira < 40
              ? "bg-red-100 text-red-700"
              : lavoura.ira < 70
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          <h3 className="text-lg font-semibold mb-1">Índice de Risco Agrícola (IRA)</h3>
          <p className="text-3xl font-bold">{lavoura.ira}</p>
          <p className="mt-2">
            {lavoura.ira < 40
              ? "⚠️ Condição crítica — risco alto de perda"
              : lavoura.ira < 70
              ? "🟡 Monitorar — condições moderadas"
              : "🟢 Condições ideais"}
          </p>
        </motion.div>
      )}

      {/* Dados principais */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <p className="text-sm text-gray-600 mb-1">🌿 NDVI</p>
          <p className="text-2xl font-bold text-green-700">
            {lavoura.ndvi.toFixed(2)}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">💧 Umidade</p>
          <p className="text-2xl font-bold text-blue-700">{lavoura.umidade}%</p>
        </div>

        <div className="bg-sky-50 p-4 rounded-xl border border-sky-200">
          <p className="text-sm text-gray-600 mb-1">🌧 Chuva (7 dias)</p>
          <p className="text-2xl font-bold text-sky-700">{lavoura.chuva} mm</p>
        </div>

        {lavoura.temperatura && (
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
            <p className="text-sm text-gray-600 mb-1">🌡️ Temperatura</p>
            <p className="text-2xl font-bold text-orange-700">
              {lavoura.temperatura}°C
            </p>
          </div>
        )}
      </motion.div>

      {/* Previsão Climática (se disponível) */}
      {lavoura.clima && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-50 p-4 rounded-xl shadow-sm"
        >
          <h3 className="font-semibold text-blue-800 mb-2">Previsão Climática 🌦️</h3>
          <p className="text-gray-700 mb-1">🌡️ Temperatura média: {lavoura.clima.temperatura} °C</p>
          <p className="text-gray-700 mb-1">🌧️ Chuva prevista (24h): {lavoura.clima.chuva} mm</p>
          <p className="text-gray-700 capitalize">☁️ Condição: {lavoura.clima.condicao}</p>
        </motion.div>
      )}

      {/* Alertas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="font-semibold text-gray-800 mb-3 text-lg flex items-center gap-2">
          ⚠️ Alertas e Recomendações
        </h3>
        <div className="space-y-3">
          {gerarAlertas(lavoura).map((a, i) => (
            <div
              key={i}
              className={`rounded-xl p-3 flex items-start gap-3 ${
                a.cor === "red"
                  ? "bg-red-100 text-red-700"
                  : a.cor === "yellow"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {a.cor === "red" && <AlertTriangle className="mt-1 flex-shrink-0" size={18} />}
              {a.cor === "yellow" && <Info className="mt-1 flex-shrink-0" size={18} />}
              {a.cor === "green" && <CheckCircle className="mt-1 flex-shrink-0" size={18} />}
              <p className="text-sm">{a.mensagem}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Gráfico de NDVI (opcional) */}
      {lavoura.historicoNDVI && lavoura.historicoNDVI.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <GraficoNDVI dados={lavoura.historicoNDVI} />
        </motion.div>
      )}
    </motion.div>
  );
}

