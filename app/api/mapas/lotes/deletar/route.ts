import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'ForTheHorde!',
  database: 'vale_dos_carajas',
};

export async function DELETE(request: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const lotId = searchParams.get('lotId');

    if (!lotId) {
      return NextResponse.json(
        { error: 'lotId é obrigatório' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      'DELETE FROM lots WHERE id = ?',
      [lotId]
    );

    console.log('[API /mapas/lotes/deletar] Lote deletado:', lotId);
    return NextResponse.json(
      { message: 'Lote deletado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API /mapas/lotes/deletar] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar lote' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
