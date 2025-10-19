import { NextRequest, NextResponse } from 'next/server';

/**
 * API: Histórico de NDVI de uma lavoura
 * 
 * GET /api/lavouras/:id/historico
 * 
 * TODO: Implementar busca real no banco de dados
 * - Conectar ao banco de dados (MongoDB, PostgreSQL, etc)
 * - Buscar histórico real da lavoura pelo ID
 * - Integrar com Sentinel Hub para dados satelitais
 * 
 * @param id - ID da lavoura
 * @returns Array com dados históricos {data: string, ndvi: number}
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // TODO: Implementar lógica real
    // Exemplo de implementação com banco de dados:
    // 
    // const lavoura = await db.lavouras.findOne({ id });
    // if (!lavoura) {
    //   return NextResponse.json({ error: 'Lavoura não encontrada' }, { status: 404 });
    // }
    // 
    // const historico = await db.ndviHistory.find({ 
    //   lavouraId: id,
    //   data: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    // }).sort({ data: 1 });

    console.warn(`⚠️ API de histórico ainda não implementada. Configure seu banco de dados.`);
    console.log(`📋 Lavoura solicitada: ${id}`);

    // Retorna erro informativo
    return NextResponse.json(
      { 
        error: 'API de histórico não implementada',
        message: 'Configure um banco de dados e implemente a busca real de histórico',
        hint: 'Veja os comentários no código para exemplo de implementação'
      },
      { status: 501 } // 501 Not Implemented
    );
  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao buscar histórico de NDVI',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// ============================================
// Exemplo de implementação com Sentinel Hub
// ============================================

/**
 * EXEMPLO: Buscar histórico real usando Sentinel Hub
 * 
 * async function buscarHistoricoSentinel(bbox, dias = 30) {
 *   const token = await getSentinelToken();
 *   const datas = [];
 *   const hoje = new Date();
 *   
 *   for (let i = 0; i < dias; i += 5) {
 *     const data = new Date(hoje);
 *     data.setDate(data.getDate() - i);
 *     datas.push(data.toISOString().split('T')[0]);
 *   }
 *   
 *   const historicoPromises = datas.map(data => 
 *     buscarNDVISentinel(bbox, data, token)
 *   );
 *   
 *   return Promise.all(historicoPromises);
 * }
 */

