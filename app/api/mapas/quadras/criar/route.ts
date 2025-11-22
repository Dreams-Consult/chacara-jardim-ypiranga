import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Forçar rota dinâmica
export const dynamic = 'force-dynamic';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'maia',
  password: 'ForTheHorde!',
  database: 'vale_dos_carajas',
};

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const { mapId, name, description } = body;

    if (!mapId || !name) {
      return NextResponse.json(
        { error: 'mapId e name são obrigatórios' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // INSERT incluindo createdAt e updatedAt (campos obrigatórios)
    await connection.execute(
      'INSERT INTO blocks (mapId, name, description, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
      [mapId, name, description || '']
    );

    // Buscar o ID inserido
    const [rows] = await connection.execute(
      'SELECT LAST_INSERT_ID() as insertedId'
    );
    const insertedId = (rows as any)[0].insertedId;

    const newBlock = {
      id: insertedId.toString(),
      mapId,
      name,
      description: description || '',
    };

    console.log('[API /mapas/quadras/criar] Quadra criada:', newBlock.id);
    return NextResponse.json(newBlock, { status: 201 });
  } catch (error) {
    console.error('[API /mapas/quadras/criar] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao criar quadra' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
