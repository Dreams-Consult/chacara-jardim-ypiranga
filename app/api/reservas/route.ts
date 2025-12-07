import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { dbConfig } from '@/lib/db';

// Forçar rota dinâmica
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);

    const { searchParams } = new URL(request.url);
    const minimal = searchParams.get('minimal') === 'true';
    const mapId = searchParams.get('mapId');
    const blockId = searchParams.get('blockId');

    if (minimal) {
      // Retornar apenas campos essenciais para tooltip em /maps/
      let query = 'SELECT id, customer_name, seller_name, status, created_at FROM purchase_requests';
      let params: any[] = [];

      // Filtrar por quadra (mais específico) ou por mapa
      if (blockId) {
        query += ' WHERE id IN (SELECT DISTINCT purchase_request_id FROM purchase_request_lots prl INNER JOIN lots l ON prl.lot_id = l.id WHERE l.block_id = ?)';
        params.push(blockId);
      } else if (mapId) {
        query += ' WHERE id IN (SELECT DISTINCT purchase_request_id FROM purchase_request_lots prl INNER JOIN lots l ON prl.lot_id = l.id WHERE l.map_id = ?)';
        params.push(mapId);
      }

      query += ' ORDER BY created_at DESC';

      const [reservations] = await connection.execute(query, params);

      // Para cada reserva, buscar IDs dos lotes e agreed_price
      const reservationsWithLots = await Promise.all(
        (reservations as any[]).map(async (reservation) => {
          try {
            // Filtrar lotes por quadra ou mapa
            let lotQuery = 'SELECT lot_id as id, agreed_price FROM purchase_request_lots WHERE purchase_request_id = ?';
            let lotParams: any[] = [reservation.id];

            if (blockId) {
              lotQuery = `SELECT prl.lot_id as id, prl.agreed_price 
                          FROM purchase_request_lots prl 
                          INNER JOIN lots l ON prl.lot_id = l.id 
                          WHERE prl.purchase_request_id = ? AND l.block_id = ?`;
              lotParams.push(blockId);
            } else if (mapId) {
              lotQuery = `SELECT prl.lot_id as id, prl.agreed_price 
                          FROM purchase_request_lots prl 
                          INNER JOIN lots l ON prl.lot_id = l.id 
                          WHERE prl.purchase_request_id = ? AND l.map_id = ?`;
              lotParams.push(mapId);
            }

            const [lots] = await connection!.execute(lotQuery, lotParams);
            
            return {
              id: reservation.id,
              customer_name: reservation.customer_name,
              seller_name: reservation.seller_name,
              status: reservation.status,
              created_at: reservation.created_at,
              lots: lots || [],
            };
          } catch (error) {
            console.error(`[API /reservas GET] Erro ao buscar lotes da reserva ${reservation.id}:`, error);
            return {
              id: reservation.id,
              customer_name: reservation.customer_name,
              seller_name: reservation.seller_name,
              status: reservation.status,
              created_at: reservation.created_at,
              lots: [],
            };
          }
        })
      );

      return NextResponse.json(reservationsWithLots || [], { status: 200 });
    }

    // Buscar todas as reservas (modo completo)
    const [reservations] = await connection.execute(
      'SELECT * FROM purchase_requests ORDER BY created_at DESC'
    );

    // Para cada reserva, buscar os lotes associados com agreed_price, first_payment e installments
    const reservationsWithLots = await Promise.all(
      (reservations as any[]).map(async (reservation) => {
        try {
          // Primeiro tenta com blocks e maps, se falhar, tenta sem blocks
          let lots;
          try {
            [lots] = await connection!.execute(
              `SELECT l.*, prl.purchase_request_id, prl.agreed_price, prl.first_payment, prl.installments, 
                      b.name as block_name, m.name as map_name 
               FROM purchase_request_lots prl
               INNER JOIN lots l ON prl.lot_id = l.id
               LEFT JOIN blocks b ON l.block_id = b.id
               LEFT JOIN maps m ON l.map_id = m.id
               WHERE prl.purchase_request_id = ?`,
              [reservation.id]
            );
          } catch (blockError) {
            // Fallback sem blocks
            console.warn('[API /reservas GET] Tabela blocks não encontrada, usando fallback');
            [lots] = await connection!.execute(
              `SELECT l.*, prl.purchase_request_id, prl.agreed_price, prl.first_payment, prl.installments,
                      m.name as map_name
               FROM purchase_request_lots prl
               INNER JOIN lots l ON prl.lot_id = l.id
               LEFT JOIN maps m ON l.map_id = m.id
               WHERE prl.purchase_request_id = ?`,
              [reservation.id]
            );
          }

          return {
            ...reservation,
            lots: lots || [],
          };
        } catch (lotError) {
          console.error(`[API /reservas GET] Erro ao buscar lotes da reserva ${reservation.id}:`, lotError);
          return {
            ...reservation,
            lots: [],
          };
        }
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
