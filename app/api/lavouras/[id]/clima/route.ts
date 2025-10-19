import { NextRequest, NextResponse } from 'next/server';

/**
 * API: Dados climáticos da lavoura
 * 
 * GET /api/lavouras/:id/clima
 * 
 * Busca dados meteorológicos reais usando OpenWeather ou outra API
 * 
 * @param id - ID da lavoura
 * @returns Dados climáticos {temperatura, umidade, chuva}
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // NOTA: Aqui você deve implementar a lógica real para buscar dados
    // Opções:
    // 1. Buscar coordenadas da fazenda do banco de dados
    // 2. Fazer chamada ao OpenWeather com as coordenadas reais
    // 3. Buscar dados do seu backend Python
    
    const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    
    if (!OPENWEATHER_API_KEY) {
      return NextResponse.json(
        { error: 'API key do OpenWeather não configurada' },
        { status: 500 }
      );
    }

    // TODO: Buscar coordenadas reais da fazenda do banco de dados
    // Por enquanto, usando coordenadas padrão (Brasília)
    const lat = -15.78;
    const lon = -47.93;

    // Busca dados do OpenWeather
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;
    
    const response = await fetch(weatherUrl);
    
    if (!response.ok) {
      throw new Error(`Erro na API OpenWeather: ${response.status}`);
    }
    
    const data = await response.json();

    // Formata dados para o formato esperado
    const dadosClimaticos = {
      temperatura: Math.round(data.main.temp),
      umidade: data.main.humidity,
      chuva: data.rain?.['1h'] ? (data.rain['1h'] * 24 * 7) : 0, // Estimativa semanal
      descricao: data.weather[0]?.description || '',
      vento: data.wind?.speed || 0,
      pressao: data.main.pressure,
      nuvens: data.clouds?.all || 0,
    };

    console.log(`✅ Dados climáticos retornados para lavoura ${id}:`, dadosClimaticos);

    return NextResponse.json(dadosClimaticos, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('❌ Erro ao buscar dados climáticos:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao buscar dados climáticos',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

