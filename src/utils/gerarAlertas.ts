interface Fazenda {
  nome: string;
  ndvi?: number;
  umidade?: number;
  chuva?: number;
  temp?: number;
  temperatura?: number;
  historico?: number[];
  historicoNDVI?: Array<{
    data: string;
    ndvi: number;
  }>;
}

interface Alerta {
  tipo: "Crítico" | "Atenção" | "OK";
  mensagem: string;
  cor: "red" | "yellow" | "green";
}

export function gerarAlertas(fazenda: Fazenda): Alerta[] {
  const alertas: Alerta[] = [];

  // Normaliza temperatura (pode vir como 'temp' ou 'temperatura')
  const temperatura = fazenda.temp ?? fazenda.temperatura;

  // 1️⃣ Queda no NDVI
  if (fazenda.historico && fazenda.historico.length > 2) {
    const ndviAtual = fazenda.historico.at(-1);
    const ndviAnterior = fazenda.historico.at(-2);
    
    if (ndviAtual !== undefined && ndviAnterior !== undefined && ndviAnterior !== 0) {
      const variacao = ((ndviAtual - ndviAnterior) / ndviAnterior) * 100;

      if (variacao < -10) {
        alertas.push({
          tipo: "Crítico",
          mensagem: `NDVI caiu ${Math.abs(variacao.toFixed(1))}% nos últimos dias — possível estresse da vegetação 🌿`,
          cor: "red",
        });
      } else if (variacao < -5) {
        alertas.push({
          tipo: "Atenção",
          mensagem: `NDVI apresentou leve queda (${Math.abs(variacao.toFixed(1))}%) — monitorar irrigação.`,
          cor: "yellow",
        });
      }
    }
  }

  // 2️⃣ Umidade baixa
  if (fazenda.umidade !== undefined) {
    if (fazenda.umidade < 30) {
      alertas.push({
        tipo: "Crítico",
        mensagem: "Umidade do solo muito baixa (<30%) 💧 — risco de estresse hídrico.",
        cor: "red",
      });
    } else if (fazenda.umidade < 45) {
      alertas.push({
        tipo: "Atenção",
        mensagem: "Umidade em nível moderado — considerar irrigação leve.",
        cor: "yellow",
      });
    }
  }

  // 3️⃣ Chuva excessiva
  if (fazenda.chuva !== undefined && fazenda.chuva > 50) {
    alertas.push({
      tipo: "Atenção",
      mensagem: "Chuva intensa (>50mm) nas últimas 24h 🌧️ — risco de encharcamento.",
      cor: "yellow",
    });
  }

  // 4️⃣ Temperatura extrema
  if (temperatura !== undefined) {
    if (temperatura > 35) {
      alertas.push({
        tipo: "Crítico",
        mensagem: "Temperatura muito alta (>35°C) 🔥 — risco de evapotranspiração excessiva.",
        cor: "red",
      });
    } else if (temperatura < 10) {
      alertas.push({
        tipo: "Atenção",
        mensagem: "Temperatura muito baixa (<10°C) 🧊 — risco de estresse térmico.",
        cor: "yellow",
      });
    }
  }

  // Se não houver alertas graves, adicionar um "OK"
  if (alertas.length === 0) {
    alertas.push({
      tipo: "OK",
      mensagem: "Condições ideais 🌱 — sem riscos detectados.",
      cor: "green",
    });
  }

  return alertas;
}

