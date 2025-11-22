import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'ForTheHorde!',
  database: 'vale_dos_carajas',
};

export async function PUT(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const { idUsuario, status } = body;

    if (!idUsuario || !status) {
      return NextResponse.json(
        { error: 'idUsuario e status são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'status deve ser "approved" ou "rejected"' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, idUsuario]
    );

    console.log('[API /usuarios/aprovar] Status atualizado:', idUsuario, status);
    return NextResponse.json(
      {
        message: 'Status do usuário atualizado com sucesso',
        userId: idUsuario,
        status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API /usuarios/aprovar] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar status do usuário' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
