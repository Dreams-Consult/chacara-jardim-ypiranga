import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { dbConfig } from '@/lib/db';

// Forçar rota dinâmica
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);

    const { searchParams } = new URL(request.url);
    const mapId = searchParams.get('mapId');

    if (!mapId) {
      return NextResponse.json(
        { error: 'mapId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar contagem de lotes por status
    const [stats] = await connection.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'reserved' THEN 1 ELSE 0 END) as reserved,
        SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold,
        SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked
      FROM lots 
      WHERE map_id = ?`,
      [mapId]
    );

    const result = (stats as any[])[0];

    return NextResponse.json({
      total: Number(result.total) || 0,
      available: Number(result.available) || 0,
      reserved: Number(result.reserved) || 0,
      sold: Number(result.sold) || 0,
      blocked: Number(result.blocked) || 0,
    }, { status: 200 });
  } catch (error) {
    console.error('[API /mapas/estatisticas GET] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas do mapa' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
