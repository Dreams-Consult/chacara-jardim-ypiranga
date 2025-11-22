import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'maia',
  password: 'ForTheHorde!',
  database: 'vale_dos_carajas',
};

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const mapId = searchParams.get('mapId');

    if (!mapId) {
      return NextResponse.json(
        { error: 'mapId é obrigatório' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // Contar lotes reservados ou vendidos neste mapa
    const [results] = await connection.execute<any[]>(
      `SELECT COUNT(*) as count 
       FROM lots 
       WHERE map_id = ? AND status IN ('reserved', 'sold')`,
      [mapId]
    );

    const count = results[0]?.count || 0;

    console.log(`[API /mapas/verificar-lotes-reservados] Mapa ${mapId}: ${count} lote(s) reservado(s)/vendido(s)`);
    
    return NextResponse.json(
      { 
        hasReservedOrSoldLots: count > 0,
        count: count
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API /mapas/verificar-lotes-reservados] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar lotes' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
