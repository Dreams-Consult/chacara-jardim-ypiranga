import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'ForTheHorde!',
  database: 'vale_dos_carajas',
};

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const {
      lotIds,
      customerName,
      customerEmail,
      customerPhone,
      customerCPF,
      message,
      sellerId,
      sellerName,
      sellerEmail,
      sellerPhone,
      sellerCPF,
    } = body;

    if (!lotIds || !Array.isArray(lotIds) || lotIds.length === 0) {
      return NextResponse.json(
        { error: 'lotIds é obrigatório e deve ser um array' },
        { status: 400 }
      );
    }

    if (!customerName || !customerEmail || !customerPhone || !customerCPF) {
      return NextResponse.json(
        { error: 'Dados do cliente incompletos' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);
    
    // Iniciar transação
    await connection.beginTransaction();

    try {
      // Verificar se todos os lotes estão disponíveis
      const placeholders = lotIds.map(() => '?').join(',');
      const [lotsCheck] = await connection.execute(
        `SELECT id, status FROM lots WHERE id IN (${placeholders})`,
        lotIds
      );

      const lotsArray = lotsCheck as any[];
      const unavailableLots = lotsArray.filter((lot: any) => lot.status !== 'available');
      
      if (unavailableLots.length > 0) {
        await connection.rollback();
        return NextResponse.json(
          { error: 'Um ou mais lotes não estão disponíveis', unavailableLots },
          { status: 409 }
        );
      }

      // Criar solicitações de compra para cada lote
      const purchaseIds = [];
      for (const lotId of lotIds) {
        const [result] = await connection.execute(
          `INSERT INTO purchase_requests (
            lot_id, seller_id, customer_name, customer_email, customer_phone,
            customer_cpf, message, seller_name, seller_email, seller_phone,
            seller_cpf, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
          [
            lotId,
            sellerId || null,
            customerName,
            customerEmail,
            customerPhone.replace(/\D/g, ''),
            customerCPF.replace(/\D/g, ''),
            message || null,
            sellerName || '',
            sellerEmail || '',
            sellerPhone ? sellerPhone.replace(/\D/g, '') : '',
            sellerCPF ? sellerCPF.replace(/\D/g, '') : '',
          ]
        );
        purchaseIds.push((result as any).insertId);
      }

      // Atualizar status dos lotes para 'reserved'
      await connection.execute(
        `UPDATE lots SET status = 'reserved', updated_at = NOW() WHERE id IN (${placeholders})`,
        lotIds
      );

      // Commit da transação
      await connection.commit();

      console.log('[API /mapas/lotes/reservar] Reservas criadas:', purchaseIds);
      return NextResponse.json(
        {
          message: `${purchaseIds.length} reserva(s) criada(s) com sucesso`,
          purchaseIds,
          lotIds,
        },
        { status: 201 }
      );
    } catch (error) {
      // Rollback em caso de erro
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('[API /mapas/lotes/reservar] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao criar reserva' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
