import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { dbConfig } from '@/lib/db';

// Forçar rota dinâmica
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    console.log('[API /usuarios GET] Buscando usuários...');

    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      'SELECT id, cpf, name, email, phone, creci, role, status, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    return NextResponse.json(rows || [], { status: 200 });
  } catch (error) {
    console.error('[API /usuarios GET] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
