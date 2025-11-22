import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'maia',
  password: 'ForTheHorde!',
  database: 'vale_dos_carajas',
};

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
      message,
      seller_name,
      seller_email,
      seller_phone,
      seller_cpf
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID da reserva é obrigatório' },
        { status: 400 }
      );
    }

    if (!customer_name || !customer_email || !customer_phone) {
      return NextResponse.json(
        { error: 'Nome, email e telefone são obrigatórios' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // Atualizar reserva
    await connection.execute(
      `UPDATE purchase_requests SET
        customer_name = ?,
        customer_email = ?,
        customer_phone = ?,
        customer_cpf = ?,
        payment_method = ?,
        message = ?,
        seller_name = ?,
        seller_email = ?,
        seller_phone = ?,
        seller_cpf = ?
      WHERE id = ?`,
      [
        customer_name,
        customer_email,
        customer_phone,
        customer_cpf || null,
        payment_method || null,
        message || null,
        seller_name || 'Não informado',
        seller_email || 'nao-informado@exemplo.com',
        seller_phone || '00000000000',
        seller_cpf || '00000000000',
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
