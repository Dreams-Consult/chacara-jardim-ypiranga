import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import crypto from 'crypto';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'maia',
  password: 'ForTheHorde!',
  database: 'vale_dos_carajas',
};

export async function PUT(request: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const newPassword = searchParams.get('newPassword');

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'userId e newPassword são obrigatórios' },
        { status: 400 }
      );
    }

    // Hash MD5 da nova senha
    const hashedPassword = crypto
      .createHash('md5')
      .update(newPassword)
      .digest('hex');

    connection = await mysql.createConnection(dbConfig);

    // Atualizar senha e marcar first_login como false
    await connection.execute(
      'UPDATE users SET password = ?, first_login = 0, updated_at = NOW() WHERE id = ?',
      [hashedPassword, userId]
    );

    console.log('[API /password/update] Senha atualizada:', userId);
    return NextResponse.json(
      { message: 'Senha atualizada com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API /password/update] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar senha' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
