"use client"

import { useState } from "react"
import MapView from "@/components/map-view"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Leaf, CloudSun, AlertTriangle, TrendingUp } from "lucide-react"

export default function AgriMapDashboard() {
  const [areaSelecionada, setAreaSelecionada] = useState("Fazenda São José")

  const ndviData = [
    { data: "Ago", ndvi: 0.82 },
    { data: "Set", ndvi: 0.79 },
    { data: "Out", ndvi: 0.65 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 text-gray-800">
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
            <CardTitle className="text-lg font-semibold">{areaSelecionada}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[450px]">
            <MapView center={[-15.78, -47.93]} zoom={5} />
          </CardContent>
        </section>

        {/* Right side - Cards */}
        <section className="flex flex-col gap-4">
          {/* NDVI atual */}
          <Card className="shadow-md hover:shadow-lg transition">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Leaf className="text-green-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">NDVI Atual</p>
                <h3 className="text-2xl font-bold text-green-700">0.82</h3>
              </div>
            </CardContent>
          </Card>

          {/* Umidade do solo */}
          <Card className="shadow-md hover:shadow-lg transition">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <CloudSun className="text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Umidade do Solo</p>
                <h3 className="text-2xl font-bold text-blue-700">68%</h3>
              </div>
            </CardContent>
          </Card>

          {/* Alertas */}
          <Card className="shadow-md hover:shadow-lg transition">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="text-yellow-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Alertas</p>
                <h3 className="text-xl font-bold text-yellow-700">1 (baixa umidade)</h3>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Bottom charts */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* NDVI Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <TrendingUp className="w-5 h-5" /> Histórico NDVI
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ndviData}>
                <XAxis dataKey="data" />
                <YAxis domain={[0, 1]} />
                <Tooltip />
                <Line type="monotone" dataKey="ndvi" stroke="#16a34a" strokeWidth={3} dot />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Placeholder for rainfall chart */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-blue-700">Precipitação (mm)</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center text-gray-400 h-[250px]">
            <p>⛅ Dados meteorológicos em breve...</p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
