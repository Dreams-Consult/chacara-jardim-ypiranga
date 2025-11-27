import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { dbConfig } from '@/lib/db';

export async function PUT(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const {
      id,
      customer_name,
      customer_email,
      customer_phone,
      customer_cpf,
      payment_method,
      first_payment,
      message,
      seller_name,
      seller_email,
      seller_phone,
      seller_cpf,
      created_at
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID da reserva é obrigatório' },
        { status: 400 }
      );
    }

    if (!customer_name) {
      return NextResponse.json(
        { error: 'Nome do cliente é obrigatório' },
        { status: 400 }
      );
    }

    if (!seller_name) {
      return NextResponse.json(
        { error: 'Nome do vendedor é obrigatório' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // Converter created_at para formato MySQL se fornecido
    let mysqlCreatedAt = null;
    if (created_at) {
      const date = new Date(created_at);
      mysqlCreatedAt = date.toISOString().slice(0, 19).replace('T', ' ');
    }

    // Atualizar reserva
    await connection.execute(
      `UPDATE purchase_requests SET
        customer_name = ?,
        customer_email = ?,
        customer_phone = ?,
        customer_cpf = ?,
        payment_method = ?,
        first_payment = ?,
        message = ?,
        seller_name = ?,
        seller_email = ?,
        seller_phone = ?,
        seller_cpf = ?,
        created_at = ?
      WHERE id = ?`,
      [
        customer_name,
        customer_email || null,
        customer_phone || null,
        customer_cpf || null,
        payment_method || null,
        first_payment || null,
        message || null,
        seller_name,
        seller_email || null,
        seller_phone || null,
        seller_cpf || null,
        mysqlCreatedAt,
        id
      ]
    );

    console.log('[API /reservas/atualizar] ✅ Reserva atualizada:', id);
    
    return NextResponse.json(
      { message: 'Reserva atualizada com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API /reservas/atualizar] ❌ Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar reserva' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
