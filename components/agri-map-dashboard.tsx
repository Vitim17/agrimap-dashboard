import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Leaf, CloudSun, AlertTriangle, TrendingUp } from "lucide-react";
import { getNDVI, getWeather, getAlerts } from "../src/api/agriMapApi";
import "leaflet/dist/leaflet.css";

// Ícones personalizados para o mapa
const farmIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
  iconSize: [30, 30],
});

export default function AgriMapDashboard() {
  const [selectedFarm, setSelectedFarm] = useState("Fazenda São José");
  const [ndviData, setNDVIData] = useState(null);
  const [weather, setWeather] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);

  const farms = [
    { nome: "Fazenda São José", coord: [-15.78, -47.93] },
    { nome: "Fazenda Santa Maria", coord: [-19.91, -43.94] },
    { nome: "Fazenda Boa Vista", coord: [-22.90, -43.20] }
  ];

  async function fetchAllData() {
    setFade(true);
    try {
      const ndvi = await getNDVI();
      const weatherData = await getWeather();
      const alertData = await getAlerts();
      setNDVIData(ndvi);
      setWeather(weatherData);
      setAlerts(alertData.alertas);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setFade(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5 * 60 * 1000); // Atualiza a cada 5 min
    return () => clearInterval(interval);
  }, []);

  if (loading) {
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
        <h1 className="text-2xl font-bold">🌾 AgriMap Dashboard</h1>
        <Button variant="secondary" className="bg-white text-green-700 font-semibold hover:bg-green-100">
          + Nova Lavoura
        </Button>
      </header>

      {/* Main grid */}
      <main className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Left side - Map */}
        <section className="md:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-lg font-semibold">{selectedFarm}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[450px]">
            <MapContainer center={[-15.78, -47.93]} zoom={5} className="h-full w-full">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
              />
              {farms.map((farm, index) => (
                <Marker
                  key={index}
                  position={farm.coord}
                  icon={farmIcon}
                  eventHandlers={{
                    click: () => setSelectedFarm(farm.nome),
                  }}
                >
                  <Popup>
                    <strong>{farm.nome}</strong>
                    <br />
                    Clique para visualizar dados
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </CardContent>
        </section>

        {/* Right side - Cards */}
        <section className={`flex flex-col gap-4 transition-opacity duration-700 ${fade ? "opacity-50" : "opacity-100"}`}>
          <Card className="shadow-md hover:shadow-lg transition">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Leaf className="text-green-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">NDVI Atual</p>
                <h3 className="text-2xl font-bold text-green-700">{ndviData.ndvi_atual}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <CloudSun className="text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Umidade do Solo</p>
                <h3 className="text-2xl font-bold text-blue-700">{weather.umidade_solo}%</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition">
            <CardContent className="flex flex-col gap-2 p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertTriangle className="text-yellow-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Alertas ativos</p>
                  <h3 className="text-xl font-bold text-yellow-700">{alerts.length}</h3>
                </div>
              </div>
              {alerts.map((a, i) => (
                <div key={i} className="pl-12 text-sm text-gray-600">
                  • {a.tipo} ({a.nivel})
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Bottom charts */}
      <section className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 transition-opacity duration-700 ${fade ? "opacity-50" : "opacity-100"}`}>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <TrendingUp className="w-5 h-5" /> Histórico NDVI
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ndviData.historico}>
                <XAxis dataKey="data" />
                <YAxis domain={[0, 1]} />
                <Tooltip />
                <Line type="monotone" dataKey="ndvi" stroke="#16a34a" strokeWidth={3} dot />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-blue-700">Precipitação (mm)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-center items-center h-[250px]">
            <p className="text-4xl font-bold text-blue-700">{weather.chuva_semana} mm</p>
            <p className="text-sm text-gray-500 mt-2">Chuva acumulada na semana</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
