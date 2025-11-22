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
    const { idUsuario, role } = body;

    if (!idUsuario || !role) {
      return NextResponse.json(
        { error: 'idUsuario e role são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['dev', 'admin', 'vendedor'].includes(role)) {
      return NextResponse.json(
        { error: 'role deve ser "dev", "admin" ou "vendedor"' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      'UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?',
      [role, idUsuario]
    );

    console.log('[API /usuarios/role] Cargo atualizado:', idUsuario, role);
    return NextResponse.json(
      {
        message: 'Cargo do usuário atualizado com sucesso',
        userId: idUsuario,
        role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API /usuarios/role] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar cargo do usuário' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
