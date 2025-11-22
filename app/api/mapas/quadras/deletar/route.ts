import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

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
    const blockId = searchParams.get('blockId');

    if (!blockId) {
      return NextResponse.json(
        { error: 'blockId é obrigatório' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // Primeiro deletar todos os lotes da quadra
    const [lotsResult]: any = await connection.execute(
      'DELETE FROM lots WHERE block_id = ?',
      [blockId]
    );
    console.log(`[API /mapas/quadras/deletar] ${lotsResult.affectedRows} lotes deletados da quadra ${blockId}`);

    // Depois deletar a quadra
    await connection.execute(
      'DELETE FROM blocks WHERE id = ?',
      [blockId]
    );

    console.log('[API /mapas/quadras/deletar] Quadra deletada:', blockId);
    return NextResponse.json(
      { message: 'Quadra deletada com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API /mapas/quadras/deletar] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar quadra' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
