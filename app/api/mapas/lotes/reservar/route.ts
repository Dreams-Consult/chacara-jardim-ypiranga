import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { dbConfig } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const {
      lotIds,
      lotDetails, // Cada item terá: { lotId, price, firstPayment, installments }
      customerName,
      customerEmail,
      customerPhone,
      customerCPF,
      message,
      sellerId,
      userId,
      sellerName,
      sellerEmail,
      sellerPhone,
      sellerCPF,
      paymentMethod,
      contract,
    } = body;

    if (!lotIds || !Array.isArray(lotIds) || lotIds.length === 0) {
      return NextResponse.json(
        { error: 'lotIds é obrigatório e deve ser um array' },
        { status: 400 }
      );
    }

    if (!customerName) {
      return NextResponse.json(
        { error: 'Nome do cliente é obrigatório' },
        { status: 400 }
      );
    }

    if (!sellerName) {
      return NextResponse.json(
        { error: 'Nome do vendedor é obrigatório' },
        { status: 400 }
      );
    }

    // Log dos dados recebidos
    console.log('[API /mapas/lotes/reservar] 📥 Dados recebidos:', {
      lotIds,
      customerName,
      customerEmail,
      sellerId,
      sellerName,
      sellerEmail,
      sellerPhone,
      sellerCPF
    });

    connection = await mysql.createConnection(dbConfig);
    
    // Iniciar transação
    await connection.beginTransaction();

    try {
      // Verificar se todos os lotes estão disponíveis e pegar map_id
      const placeholders = lotIds.map(() => '?').join(',');
      const [lotsCheck] = await connection.execute(
        `SELECT id, status, map_id, block_id FROM lots WHERE id IN (${placeholders})`,
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

      if (lotsArray.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { error: 'Nenhum lote encontrado' },
          { status: 404 }
        );
      }

      // Pegar o map_id do primeiro lote (todos devem ser do mesmo mapa)
      const firstLot = lotsArray[0];
      const mapId = firstLot.map_id;

      // 1. Criar um único registro em purchase_requests (sem first_payment e installments)
      const [purchaseResult] = await connection.execute(
        `INSERT INTO purchase_requests (
          user_id, customer_name, customer_email, customer_phone,
          customer_cpf, message, payment_method, seller_name, seller_email, 
          seller_phone, seller_cpf, contract, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
        [
          userId || null,
          customerName,
          customerEmail || null,
          customerPhone ? customerPhone.replace(/\D/g, '') : null,
          customerCPF ? customerCPF.replace(/\D/g, '') : null,
          message || null,
          paymentMethod || null,
          sellerName,
          sellerEmail || null,
          sellerPhone ? sellerPhone.replace(/\D/g, '') : null,
          sellerCPF ? sellerCPF.replace(/\D/g, '') : null,
          contract || null,
        ]
      );

      console.log('[API /mapas/lotes/reservar] ✅ Dados do vendedor salvos:', {
        seller_id: sellerId,
        seller_name: sellerName,
        seller_email: sellerEmail,
        seller_phone: sellerPhone,
        seller_cpf: sellerCPF
      });

      const purchaseRequestId = (purchaseResult as any).insertId;

      // 2. Criar registros em purchase_request_lots para cada lote com agreed_price, first_payment e installments
      for (const lotDetail of lotDetails) {
        await connection.execute(
          `INSERT INTO purchase_request_lots (
            purchase_request_id, lot_id, agreed_price, first_payment, installments
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            purchaseRequestId,
            lotDetail.lotId,
            lotDetail.price || null,
            lotDetail.firstPayment || null,
            lotDetail.installments || null
          ]
        );
      }

      // 3. Atualizar status dos lotes para 'reserved'
      await connection.execute(
        `UPDATE lots SET status = 'reserved', updated_at = NOW() WHERE id IN (${placeholders})`,
        lotIds
      );

      // Commit da transação
      await connection.commit();

      return NextResponse.json(
        {
          message: `Reserva criada com sucesso para ${lotIds.length} lote(s)`,
          purchaseRequestId,
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
    console.error('[API /mapas/lotes/reservar] ❌ Erro ao criar reserva:', error);
    return NextResponse.json(
      { error: 'Erro ao criar reserva', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
