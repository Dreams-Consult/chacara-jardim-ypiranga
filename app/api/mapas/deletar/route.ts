import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Forçar rota dinâmica
export const dynamic = 'force-dynamic';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'maia',
  password: 'ForTheHorde!',
  database: 'vale_dos_carajas',
};

export async function DELETE(request: NextRequest) {
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

    await connection.execute(
      'DELETE FROM maps WHERE id = ?',
      [mapId]
    );

    console.log('[API /mapas/deletar] Mapa deletado:', mapId);
    return NextResponse.json(
      { message: 'Mapa deletado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API /mapas/deletar] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar mapa' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
