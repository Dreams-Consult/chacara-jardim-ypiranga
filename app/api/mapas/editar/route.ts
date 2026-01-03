import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { dbConfig } from '@/lib/db';

// Forçar rota dinâmica
export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const { mapId, name, description } = body;

    if (!mapId) {
      return NextResponse.json(
        { error: 'ID do mapa é obrigatório' },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // Verificar se o mapa existe
    const [maps] = await connection.execute(
      'SELECT id FROM maps WHERE id = ?',
      [mapId]
    );

    if (!Array.isArray(maps) || maps.length === 0) {
      return NextResponse.json(
        { error: 'Mapa não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar nome e descrição
    await connection.execute(
      `UPDATE maps 
       SET name = ?, description = ?, updated_at = NOW()
       WHERE id = ?`,
      [name.trim(), description?.trim() || '', mapId]
    );

    return NextResponse.json({
      success: true,
      message: 'Mapa atualizado com sucesso',
      map: {
        id: mapId,
        name: name.trim(),
        description: description?.trim() || ''
      }
    });

  } catch (error) {
    console.error('Erro ao editar mapa:', error);
    return NextResponse.json(
      { error: 'Erro ao editar mapa' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
