import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { dbConfig } from '@/lib/db';

// Forçar rota dinâmica
export const dynamic = 'force-dynamic';

/**
 * PUT /api/usuarios/theme
 * Atualizar preferência de tema do usuário
 */
export async function PUT(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const { userId, theme } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    if (!theme || !['light', 'dark'].includes(theme)) {
      return NextResponse.json(
        { error: 'Tema inválido. Use "light" ou "dark"' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // Atualizar preferência de tema
    await connection.execute(
      'UPDATE users SET theme_preference = ? WHERE id = ?',
      [theme, userId]
    );

    return NextResponse.json(
      { success: true, theme },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API /usuarios/theme PUT] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar preferência de tema' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
