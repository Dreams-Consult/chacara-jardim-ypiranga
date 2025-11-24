import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { dbConfig } from '@/lib/db';

// Forçar rota dinâmica
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);

    // Buscar todas as reservas
    const [reservations] = await connection.execute(
      'SELECT * FROM purchase_requests ORDER BY created_at DESC'
    );

    // Para cada reserva, buscar os lotes associados
    const reservationsWithLots = await Promise.all(
      (reservations as any[]).map(async (reservation) => {
        const [lots] = await connection!.execute(
          `SELECT l.*, prl.purchase_request_id 
           FROM purchase_request_lots prl
           INNER JOIN lots l ON prl.lot_id = l.id
           WHERE prl.purchase_request_id = ?`,
          [reservation.id]
        );

        return {
          ...reservation,
          lots: lots || [],
        };
      })
    );

    return NextResponse.json(reservationsWithLots || [], { status: 200 });
  } catch (error) {
    console.error('[API /reservas GET] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar reservas' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
