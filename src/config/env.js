// src/config/env.js
// Configurações de ambiente para o projeto

export const config = {
  // OpenWeather API
  openWeatherApiKey: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '5fd5c3aa6ebb47e9a134c24c85f746b4',
  openWeatherBaseUrl: 'https://api.openweathermap.org/data/2.5',
  
  // Backend API
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8002',
  
  // Sentinel Hub OAuth2
  sentinelClientId: process.env.NEXT_PUBLIC_SENTINEL_CLIENT_ID || '',
  sentinelClientSecret: process.env.NEXT_PUBLIC_SENTINEL_CLIENT_SECRET || '',
  sentinelBaseUrl: 'https://services.sentinel-hub.com',
  sentinelTokenUrl: 'https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token',
};

// Coordenadas padrão (Brasília - pode ser ajustado)
export const defaultCoordinates = {
  lat: -15.78,
  lon: -47.93,
};

// Bounding box padrão para imagens de satélite (região de Brasília)
export const defaultBoundingBox = {
  west: -47.95,
  south: -15.80,
  east: -47.91,
  north: -15.76,
};

