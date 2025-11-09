import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/lots/valido?idLote={loteId}
 * Verifica se um lote está disponível para reserva
 * Retorna: { isAvailable: 0 | 1 }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const idLote = searchParams.get('idLote');

    // Validação do parâmetro
    if (!idLote) {
      return NextResponse.json(
        {
          error: 'Parâmetro idLote é obrigatório',
          isAvailable: 0
        },
        { status: 400 }
      );
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    if (!API_URL) {
      console.error('[API] NEXT_PUBLIC_API_URL não configurada');
      return NextResponse.json(
        {
          error: 'Configuração de API não encontrada',
          isAvailable: 0
        },
        { status: 500 }
      );
    }

    console.log(`[API] 🔍 Verificando disponibilidade do lote: ${idLote}`);

    // Chama o backend (n8n) para verificar se o lote está disponível
    const response = await fetch(
      `${API_URL}/mapas/lotes/valido?idLote=${encodeURIComponent(idLote)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Sempre busca dados atualizados
      }
    );

    if (!response.ok) {
      console.error(`[API] ❌ Erro ao verificar lote: ${response.status}`);
      return NextResponse.json(
        {
          error: 'Erro ao verificar disponibilidade do lote',
          isAvailable: 0
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Garante que o retorno tenha a estrutura esperada
    const isAvailable = data.isAvailable === 1 ? 1 : 0;

    console.log(`[API] ${isAvailable ? '✅' : '❌'} Lote ${idLote} - Disponível: ${isAvailable}`);

    return NextResponse.json({ isAvailable });

  } catch (error) {
    console.error('[API] ❌ Erro ao verificar disponibilidade do lote:', error);
    return NextResponse.json(
      {
        error: 'Erro interno ao verificar lote',
        isAvailable: 0
      },
      { status: 500 }
    );
  }
}
