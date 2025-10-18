// app/api/sentinel/image/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const west = parseFloat(searchParams.get('west') || '-47.95');
    const south = parseFloat(searchParams.get('south') || '-15.80');
    const east = parseFloat(searchParams.get('east') || '-47.91');
    const north = parseFloat(searchParams.get('north') || '-15.76');
    const type = searchParams.get('type') || 'true-color'; // true-color, ndvi, false-color
    const width = parseInt(searchParams.get('width') || '1024');
    const height = parseInt(searchParams.get('height') || '1024');
    
    // Obtém token do endpoint interno
    const tokenResponse = await fetch(`${request.nextUrl.origin}/api/sentinel/token`);
    
    if (!tokenResponse.ok) {
      return NextResponse.json(
        { error: 'Falha ao obter token' },
        { status: 500 }
      );
    }

    const { access_token } = await tokenResponse.json();

    // Define período (últimos 30 dias)
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Evalscripts diferentes para cada tipo de visualização
    const evalscripts: { [key: string]: string } = {
      'true-color': `
        //VERSION=3
        function setup() {
          return {
            input: ["B04", "B03", "B02", "dataMask"],
            output: { bands: 4 }
          };
        }
        function evaluatePixel(sample) {
          return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02, sample.dataMask];
        }
      `,
      'ndvi': `
        //VERSION=3
        function setup() {
          return {
            input: ["B04", "B08", "dataMask"],
            output: { bands: 4 }
          };
        }
        
        // Colorir NDVI
        function colorBlend(val) {
          if (val < 0.0) return [0.5, 0.5, 0.5, 1]; // Água/Solo - Cinza
          if (val < 0.3) return [0.8, 0.4, 0.2, 1]; // Crítico - Marrom
          if (val < 0.5) return [0.9, 0.7, 0.3, 1]; // Baixo - Amarelo
          if (val < 0.7) return [0.7, 0.9, 0.3, 1]; // Médio - Verde claro
          return [0.1, 0.6, 0.1, 1]; // Alto - Verde escuro
        }
        
        function evaluatePixel(sample) {
          let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
          let color = colorBlend(ndvi);
          return [color[0], color[1], color[2], sample.dataMask];
        }
      `,
      'false-color': `
        //VERSION=3
        function setup() {
          return {
            input: ["B08", "B04", "B03", "dataMask"],
            output: { bands: 4 }
          };
        }
        function evaluatePixel(sample) {
          return [2.5 * sample.B08, 2.5 * sample.B04, 2.5 * sample.B03, sample.dataMask];
        }
      `
    };

    const evalscript = evalscripts[type] || evalscripts['true-color'];

    const requestBody = {
      input: {
        bounds: {
          bbox: [west, south, east, north],
          properties: { crs: 'http://www.opengis.net/def/crs/EPSG/0/4326' }
        },
        data: [
          {
            type: 'sentinel-2-l2a',
            dataFilter: {
              timeRange: {
                from: `${startDate}T00:00:00Z`,
                to: `${endDate}T23:59:59Z`
              },
              maxCloudCoverage: 30
            }
          }
        ]
      },
      output: {
        width: width,
        height: height,
        responses: [
          {
            identifier: 'default',
            format: { type: 'image/png' }
          }
        ]
      },
      evalscript: evalscript
    };

    const response = await fetch('https://services.sentinel-hub.com/api/v1/process', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Erro ao buscar imagem:', error);
      return NextResponse.json(
        { error: 'Falha ao processar imagem' },
        { status: response.status }
      );
    }

    // Retorna a imagem diretamente
    const imageBuffer = await response.arrayBuffer();
    
    console.log(`✅ Imagem Sentinel Hub obtida: ${type} (${width}x${height}px)`);

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
      },
    });

  } catch (error) {
    console.error('Erro no endpoint /api/sentinel/image:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar imagem' },
      { status: 500 }
    );
  }
}

