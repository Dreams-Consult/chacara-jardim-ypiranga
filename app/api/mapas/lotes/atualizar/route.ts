import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { dbConfig } from '@/lib/db';

export async function PATCH(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const {
      id,
      mapId,
      blockId,
      lotNumber,
      status,
      price,
      size,
      description,
      features,
    } = body;

    if (!id || !mapId) {
      return NextResponse.json(
        { error: 'id e mapId são obrigatórios' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      `UPDATE lots SET
        block_id = ?,
        lot_number = ?,
        status = ?,
        price = ?,
        size = ?,
        description = ?,
        features = ?,
        updated_at = NOW()
      WHERE id = ? AND map_id = ?`,
      [
        blockId !== undefined ? blockId : null,
        lotNumber,
        status,
        price,
        size,
        description,
        features ? JSON.stringify(features) : null,
        id,
        mapId,
      ]
    );

    const updatedLot = {
      id,
      mapId,
      blockId: blockId !== undefined ? blockId : null,
      lotNumber,
      status,
      price,
      size,
      description,
      features,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updatedLot, { status: 200 });
  } catch (error) {
    console.error('[API /mapas/lotes PATCH] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar lote' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
