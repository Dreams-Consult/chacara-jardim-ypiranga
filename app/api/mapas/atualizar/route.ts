import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

// Forçar rota dinâmica
export const dynamic = 'force-dynamic';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'maia',
  password: 'ForTheHorde!',
  database: 'vale_dos_carajas',
};

export async function PATCH(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const { id, name, description } = body;

    console.log('[PATCH /mapas/atualizar] Recebido:', { id, name, description });

    if (!id) {
      return NextResponse.json(
        { error: 'ID do mapa é obrigatório' },
        { status: 400 }
      );
    }

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nome do mapa é obrigatório' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // Verificar se o mapa existe
    const [maps] = await connection.query<RowDataPacket[]>(
      'SELECT id, name, description FROM maps WHERE id = ?',
      [id]
    );

    if (maps.length === 0) {
      console.error('[PATCH /mapas/atualizar] Mapa não encontrado:', id);
      return NextResponse.json(
        { error: 'Mapa não encontrado' },
        { status: 404 }
      );
    }

    console.log('[PATCH /mapas/atualizar] Mapa encontrado:', maps[0]);

    // Atualizar o mapa
    const [result] = await connection.query(
      'UPDATE maps SET name = ?, description = ? WHERE id = ?',
      [name.trim(), description?.trim() || '', id]
    );

    console.log('[PATCH /mapas/atualizar] Mapa atualizado com sucesso');

    return NextResponse.json({
      success: true,
      message: 'Mapa atualizado com sucesso',
      data: {
        id,
        name: name.trim(),
        description: description?.trim() || ''
      }
    });
  } catch (error: any) {
    console.error('[PATCH /mapas/atualizar] Erro:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar mapa' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
