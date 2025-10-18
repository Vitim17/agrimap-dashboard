// app/api/sentinel/token/route.ts
import { NextResponse } from 'next/server';

// Cache do token
let cachedToken: string | null = null;
let tokenExpiration: number | null = null;

export async function GET() {
  try {
    const clientId = process.env.NEXT_PUBLIC_SENTINEL_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_SENTINEL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Credenciais do Sentinel Hub não configuradas' },
        { status: 500 }
      );
    }

    // Retorna token em cache se ainda válido (com 5min de margem)
    if (cachedToken && tokenExpiration && Date.now() < tokenExpiration - 300000) {
      return NextResponse.json({ 
        access_token: cachedToken,
        from_cache: true 
      });
    }

    // Obtém novo token
    const response = await fetch(
      'https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Erro ao obter token Sentinel Hub:', error);
      return NextResponse.json(
        { error: 'Falha na autenticação com Sentinel Hub' },
        { status: response.status }
      );
    }

    const data = await response.json();
    cachedToken = data.access_token;
    tokenExpiration = Date.now() + (data.expires_in * 1000);

    console.log('✅ Token Sentinel Hub obtido com sucesso (server-side)');

    return NextResponse.json({
      access_token: data.access_token,
      expires_in: data.expires_in,
      from_cache: false
    });

  } catch (error) {
    console.error('Erro no endpoint /api/sentinel/token:', error);
    return NextResponse.json(
      { error: 'Erro interno ao obter token' },
      { status: 500 }
    );
  }
}

