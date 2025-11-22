import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'ForTheHorde!',
  database: 'vale_dos_carajas',
};

export async function PUT(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const { reservationId, status, lotStatus } = body;

    if (!reservationId || !status || !lotStatus) {
      return NextResponse.json(
        { error: 'reservationId, status e lotStatus são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'status deve ser "completed" ou "cancelled"' },
        { status: 400 }
      );
    }

    if (!['sold', 'available'].includes(lotStatus)) {
      return NextResponse.json(
        { error: 'lotStatus deve ser "sold" ou "available"' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    try {
      // Buscar reserva e lote associado
      const [reservations] = await connection.execute(
        'SELECT lot_id FROM purchase_requests WHERE id = ?',
        [reservationId]
      );

      if (!Array.isArray(reservations) || reservations.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { error: 'Reserva não encontrada' },
          { status: 404 }
        );
      }

      const lotId = (reservations[0] as any).lot_id;

      // Atualizar status da reserva
      await connection.execute(
        'UPDATE purchase_requests SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, reservationId]
      );

      // Atualizar status do lote
      await connection.execute(
        'UPDATE lots SET status = ?, updated_at = NOW() WHERE id = ?',
        [lotStatus, lotId]
      );

      await connection.commit();

      console.log('[API /reserva/confirmacao] Reserva atualizada:', reservationId);
      return NextResponse.json(
        {
          message: 'Reserva atualizada com sucesso',
          reservationId,
          status,
          lotStatus,
        },
        { status: 200 }
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('[API /reserva/confirmacao] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar reserva' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
