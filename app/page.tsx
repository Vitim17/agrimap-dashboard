"use client"

import dynamic from 'next/dynamic'

// Importa o componente com SSR desabilitado para evitar problemas com Leaflet e Recharts
const AgriMapDashboard = dynamic(
  () => import('@/components/agri-map-dashboard'),
  { ssr: false }
)

export default function Home() {
  return <AgriMapDashboard />
}
