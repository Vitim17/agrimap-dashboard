import { motion } from "framer-motion";
import { AlertTriangle, Droplet, CloudRain, Leaf } from "lucide-react";

interface AlertasLavouraProps {
  dados?: {
    ndvi?: number;
    umidade?: number;
    chuva?: number;
  };
}

interface Alerta {
  tipo: string;
  msg: string;
  cor: string;
  icon: React.ReactNode;
}

export function AlertasLavoura({ dados }: AlertasLavouraProps) {
  if (!dados) return null;

  const alertas: Alerta[] = [];

  if (dados.ndvi !== undefined && dados.ndvi < 0.5) {
    alertas.push({
      tipo: "NDVI Baixo",
      msg: "Possível estresse vegetativo",
      cor: "bg-yellow-100 text-yellow-700",
      icon: <Leaf className="w-5 h-5 text-yellow-600" />,
    });
  }

  if (dados.umidade !== undefined && dados.umidade < 60) {
    alertas.push({
      tipo: "Umidade Baixa",
      msg: "Solo com baixa umidade",
      cor: "bg-blue-100 text-blue-700",
      icon: <Droplet className="w-5 h-5 text-blue-600" />,
    });
  }

  if (dados.chuva !== undefined && dados.chuva < 10) {
    alertas.push({
      tipo: "Pouca Chuva",
      msg: "Baixa precipitação recente",
      cor: "bg-gray-100 text-gray-700",
      icon: <CloudRain className="w-5 h-5 text-gray-600" />,
    });
  }

  if (alertas.length === 0) {
    alertas.push({
      tipo: "Tudo Ok",
      msg: "Condições ideais",
      cor: "bg-green-100 text-green-700",
      icon: <AlertTriangle className="w-5 h-5 text-green-600" />,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-2"
    >
      {alertas.map((alerta, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`flex items-center gap-3 p-3 rounded-xl shadow-sm ${alerta.cor}`}
        >
          {alerta.icon}
          <div>
            <p className="font-semibold">{alerta.tipo}</p>
            <p className="text-sm">{alerta.msg}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

