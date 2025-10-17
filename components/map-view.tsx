"use client"

import { MapPin } from "lucide-react"

interface MapViewProps {
  center: [number, number]
  zoom: number
}

export default function MapView({ center, zoom }: MapViewProps) {
  const farms = [
    { name: "Fazenda São José", lat: -15.78, lng: -47.93, color: "fill-green-600" },
    { name: "Fazenda Santa Maria", lat: -16.2, lng: -48.5, color: "fill-blue-600" },
    { name: "Fazenda Boa Vista", lat: -15.3, lng: -47.5, color: "fill-yellow-600" },
  ]

  // Convert lat/lng to SVG coordinates (simplified projection)
  const latToY = (lat: number) => ((lat + 20) / 10) * 100
  const lngToX = (lng: number) => ((lng + 50) / 5) * 100

  return (
    <div className="relative h-full w-full bg-gradient-to-br from-green-50 to-blue-50 overflow-hidden">
      {/* Grid background */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgb(209 213 219)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Farm markers */}
        {farms.map((farm, idx) => {
          const x = lngToX(farm.lng)
          const y = latToY(farm.lat)
          return (
            <g key={idx}>
              {/* Pulse animation circle */}
              <circle cx={`${x}%`} cy={`${y}%`} r="20" className={farm.color} opacity="0.2">
                <animate attributeName="r" from="15" to="30" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
              {/* Main marker */}
              <circle cx={`${x}%`} cy={`${y}%`} r="8" className={farm.color} stroke="white" strokeWidth="2" />
            </g>
          )
        })}
      </svg>

      {/* Farm labels */}
      <div className="absolute inset-0 pointer-events-none">
        {farms.map((farm, idx) => (
          <div
            key={idx}
            className="absolute flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-md text-xs font-semibold"
            style={{
              left: `${lngToX(farm.lng)}%`,
              top: `${latToY(farm.lat)}%`,
              transform: "translate(-50%, -120%)",
            }}
          >
            <MapPin className="w-3 h-3" />
            {farm.name}
          </div>
        ))}
      </div>

      {/* Coordinates display */}
      <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded text-xs text-gray-600">
        Centro: {center[0].toFixed(2)}°, {center[1].toFixed(2)}°
      </div>
    </div>
  )
}
