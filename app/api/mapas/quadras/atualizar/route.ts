import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { dbConfig } from '@/lib/db';

// Forçar rota dinâmica
export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const { id, mapId, name, description } = body;

    if (!id || !mapId) {
      return NextResponse.json(
        { error: 'id e mapId são obrigatórios' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // UPDATE com updatedAt ao invés de updated_at
    await connection.execute(
      'UPDATE blocks SET name = ?, description = ?, updatedAt = NOW() WHERE id = ? AND mapId = ?',
      [name, description || '', id, mapId]
    );

    const updatedBlock = {
      id,
      mapId,
      name,
      description: description || '',
      updatedAt: new Date().toISOString(),
    };

    console.log('[API /mapas/quadras PATCH] Quadra atualizada:', id);
    return NextResponse.json(updatedBlock, { status: 200 });
  } catch (error) {
    console.error('[API /mapas/quadras PATCH] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar quadra' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
