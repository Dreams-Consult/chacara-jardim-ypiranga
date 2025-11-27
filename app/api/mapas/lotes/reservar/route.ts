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
      lotDetails,
      firstPayment,
      installments,
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
      paymentMethod,
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

      // 1. Criar um único registro em purchase_requests
      // Tenta com installments, se não existir, usa formato antigo
      let purchaseResult;
      try {
        [purchaseResult] = await connection.execute(
          `INSERT INTO purchase_requests (
            seller_id, customer_name, customer_email, customer_phone,
            customer_cpf, message, payment_method, seller_name, seller_email, 
            seller_phone, seller_cpf, first_payment, installments, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
          [
            sellerId || null,
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
            firstPayment || null,
            installments || null,
          ]
        );
      } catch (colError: any) {
        // Se a coluna installments não existir, tenta sem ela
        if (colError.code === 'ER_BAD_FIELD_ERROR') {
          console.log('[API /mapas/lotes/reservar] ⚠️ Coluna installments não existe, usando formato antigo');
          [purchaseResult] = await connection.execute(
            `INSERT INTO purchase_requests (
              seller_id, customer_name, customer_email, customer_phone,
              customer_cpf, message, payment_method, seller_name, seller_email, 
              seller_phone, seller_cpf, first_payment, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
            [
              sellerId || null,
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
              firstPayment || null,
            ]
          );
        } else {
          throw colError;
        }
      }

      console.log('[API /mapas/lotes/reservar] ✅ Dados do vendedor salvos:', {
        seller_id: sellerId,
        seller_name: sellerName,
        seller_email: sellerEmail,
        seller_phone: sellerPhone,
        seller_cpf: sellerCPF
      });

      const purchaseRequestId = (purchaseResult as any).insertId;

      // 2. Criar registros em purchase_request_lots para cada lote com agreed_price
      // Tenta inserir com agreed_price, se a coluna não existir, usa formato antigo
      for (const lotDetail of lotDetails) {
        try {
          await connection.execute(
            `INSERT INTO purchase_request_lots (
              purchase_request_id, lot_id, agreed_price
            ) VALUES (?, ?, ?)`,
            [
              purchaseRequestId,
              lotDetail.lotId,
              lotDetail.price || null
            ]
          );
        } catch (colError: any) {
          // Se a coluna agreed_price não existir, tenta sem ela
          if (colError.code === 'ER_BAD_FIELD_ERROR') {
            console.log('[API /mapas/lotes/reservar] ⚠️ Coluna agreed_price não existe, usando formato antigo');
            await connection.execute(
              `INSERT INTO purchase_request_lots (
                purchase_request_id, lot_id
              ) VALUES (?, ?)`,
              [
                purchaseRequestId,
                lotDetail.lotId
              ]
            );
          } else {
            throw colError;
          }
        }
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
