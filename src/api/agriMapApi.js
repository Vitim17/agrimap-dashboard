// src/api/agriMapApi.js
import { config, defaultCoordinates, defaultBoundingBox } from '../config/env';

const API_BASE_URL = config.apiBaseUrl;

// Cache do token Sentinel Hub
let sentinelToken = null;
let tokenExpiration = null;

// ============================================
// OpenWeather API - Dados Meteorológicos Reais
// ============================================

/**
 * Busca dados meteorológicos do OpenWeather API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<object>} Dados climáticos
 */
export async function getOpenWeatherData(lat = defaultCoordinates.lat, lon = defaultCoordinates.lon) {
  try {
    const url = `${config.openWeatherBaseUrl}/weather?lat=${lat}&lon=${lon}&appid=${config.openWeatherApiKey}&units=metric&lang=pt_br`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro na API OpenWeather: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Formata os dados para o formato do dashboard
    return {
      temperatura: Math.round(data.main.temp),
      umidade_solo: data.main.humidity, // Umidade do ar como proxy
      chuva_semana: data.rain?.['1h'] ? (data.rain['1h'] * 24 * 7) : 0, // Estimativa semanal
      descricao: data.weather[0]?.description || '',
      vento: data.wind?.speed || 0,
      pressao: data.main.pressure,
      sensacao_termica: Math.round(data.main.feels_like),
      nuvens: data.clouds?.all || 0,
    };
  } catch (error) {
    console.error('Erro ao buscar dados do OpenWeather:', error);
    // Retorna dados de fallback
    return {
      temperatura: 25,
      umidade_solo: 70,
      chuva_semana: 15,
      descricao: 'Dados indisponíveis',
      vento: 0,
      pressao: 1013,
      sensacao_termica: 25,
      nuvens: 0,
    };
  }
}

/**
 * Busca previsão do tempo para os próximos dias
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<object>} Previsão do tempo
 */
export async function getOpenWeatherForecast(lat = defaultCoordinates.lat, lon = defaultCoordinates.lon) {
  try {
    const url = `${config.openWeatherBaseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${config.openWeatherApiKey}&units=metric&lang=pt_br&cnt=7`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro na API OpenWeather Forecast: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      previsoes: data.list.map(item => ({
        data: new Date(item.dt * 1000).toLocaleDateString('pt-BR'),
        temperatura: Math.round(item.main.temp),
        descricao: item.weather[0]?.description || '',
        chuva: item.rain?.['3h'] || 0,
      }))
    };
  } catch (error) {
    console.error('Erro ao buscar previsão do OpenWeather:', error);
    return { previsoes: [] };
  }
}

// ============================================
// Sentinel Hub API - Imagens de Satélite e NDVI Real
// ============================================

/**
 * Obtém token OAuth2 do Sentinel Hub via API Route (server-side)
 * @returns {Promise<string>} Access token
 */
async function getSentinelToken() {
  // Verifica se há credenciais configuradas
  if (!config.sentinelClientId || !config.sentinelClientSecret) {
    console.warn('Credenciais do Sentinel Hub não configuradas');
    return null;
  }

  try {
    // Chama API Route server-side para evitar CORS
    const response = await fetch('/api/sentinel/token');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao obter token');
    }

    const data = await response.json();
    console.log('✅ Token Sentinel Hub obtido com sucesso (via API Route)');
    return data.access_token;
  } catch (error) {
    console.error('Erro ao autenticar no Sentinel Hub:', error);
    return null;
  }
}

/**
 * Calcula NDVI real usando Sentinel-2 via API Route
 * @param {object} bbox - Bounding box {west, south, east, north}
 * @param {string} date - Data no formato YYYY-MM-DD
 * @returns {Promise<object>} Dados de NDVI
 */
export async function getSentinelNDVI(bbox = defaultBoundingBox, date = null) {
  // Verifica se há credenciais configuradas
  if (!config.sentinelClientId || !config.sentinelClientSecret) {
    console.warn('Sentinel Hub não configurado');
    return null;
  }

  try {
    // Chama API Route server-side
    const params = new URLSearchParams({
      west: bbox.west.toString(),
      south: bbox.south.toString(),
      east: bbox.east.toString(),
      north: bbox.north.toString(),
    });

    const response = await fetch(`/api/sentinel/ndvi?${params}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar NDVI');
    }

    const data = await response.json();
    console.log('✅ NDVI do Sentinel Hub calculado:', data.ndvi_atual);

    return data;

  } catch (error) {
    console.error('Erro ao calcular NDVI do Sentinel:', error);
    return null;
  }
}

/**
 * Obtém imagem True Color (RGB) da área
 * TODO: Implementar API Route server-side para evitar CORS
 * @param {object} bbox - Bounding box
 * @param {string} date - Data
 * @returns {Promise<string>} URL da imagem ou base64
 */
export async function getSentinelTrueColorImage(bbox = defaultBoundingBox, date = null) {
  console.log('Função getSentinelTrueColorImage ainda não implementada (requer API Route)');
  return null;
}

// ============================================
// Backend API - NDVI e dados da lavoura
// ============================================

export async function getNDVI() {
  // Tenta Sentinel Hub primeiro se configurado
  if (config.sentinelClientId && config.sentinelClientSecret) {
    try {
      const sentinelData = await getSentinelNDVI();
      if (sentinelData) {
        return {
          ndvi_atual: sentinelData.ndvi_atual,
          fonte: 'Sentinel-2',
          historico: [
            { data: '01/01', ndvi: 0.7 },
            { data: '01/02', ndvi: 0.72 },
            { data: '01/03', ndvi: sentinelData.ndvi_atual },
          ]
        };
      }
    } catch (error) {
      console.warn('Sentinel Hub falhou, tentando backend:', error);
    }
  }

  // Fallback para backend
  try {
    const res = await fetch(`${API_BASE_URL}/ndvi`);
    return res.json();
  } catch (error) {
    console.error('Erro ao buscar NDVI:', error);
    // Dados de fallback
    return {
      ndvi_atual: 0.75,
      fonte: 'simulado',
      historico: [
        { data: '01/01', ndvi: 0.7 },
        { data: '01/02', ndvi: 0.72 },
        { data: '01/03', ndvi: 0.75 },
      ]
    };
  }
}

export async function getWeather() {
  try {
  const res = await fetch(`${API_BASE_URL}/weather`);
  return res.json();
  } catch (error) {
    console.error('Erro ao buscar clima do backend:', error);
    // Tenta OpenWeather como fallback
    return await getOpenWeatherData();
  }
}

export async function getAlerts() {
  try {
  const res = await fetch(`${API_BASE_URL}/alerts`);
  return res.json();
  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    return { alertas: [] };
  }
}

export async function getYield() {
  try {
  const res = await fetch(`${API_BASE_URL}/yield`);
  return res.json();
  } catch (error) {
    console.error('Erro ao buscar produtividade:', error);
    return {};
  }
}