import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface GraficoNDVIProps {
  dados?: Array<{
    data: string;
    ndvi: number;
  }>;
}

export function GraficoNDVI({ dados }: GraficoNDVIProps) {
  if (!dados || dados.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-2xl p-4 mt-5">
        <h3 className="text-gray-800 font-semibold mb-3">Histórico de NDVI (30 dias)</h3>
        <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
          Sem dados de NDVI disponíveis.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-2xl p-4 mt-5">
      <h3 className="text-gray-800 font-semibold mb-3">Histórico de NDVI (30 dias)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="data" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ 
              backgroundColor: "#fff", 
              borderRadius: "10px", 
              border: "1px solid #ddd" 
            }}
            formatter={(v: number) => v.toFixed(2)}
          />
          <Line
            type="monotone"
            dataKey="ndvi"
            stroke="#16a34a"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6, fill: "#22c55e" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

