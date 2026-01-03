import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { dbConfig } from '@/lib/db';

export async function PUT(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const { userId, active } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    if (typeof active !== 'boolean') {
      return NextResponse.json(
        { error: 'O campo active deve ser true ou false' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // Verificar se o usuário existe
    const [users] = await connection.execute(
      'SELECT id, name FROM users WHERE id = ?',
      [userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar status do usuário
    await connection.execute(
      'UPDATE users SET active = ? WHERE id = ?',
      [active ? 1 : 0, userId]
    );

    const action = active ? 'ativado' : 'desativado';
    
    return NextResponse.json(
      { 
        message: `Usuário ${action} com sucesso`,
        userId,
        active
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API /usuarios/toggle-active] ❌ Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar status do usuário' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
