import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import { dbConfig } from '@/lib/db';

// Forçar rota dinâmica
export const dynamic = 'force-dynamic';

/**
 * GET /api/usuarios/login?cpf=12345678900&password=senha123
 * Endpoint de autenticação com hash MD5
 */
export async function GET(request: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get('cpf');
    const password = searchParams.get('password');

    if (!cpf || !password) {
      return NextResponse.json(
        { error: 'CPF e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Remover formatação do CPF
    const cleanCpf = cpf.replace(/\D/g, '');

    // Gerar hash MD5 da senha (mesmo algoritmo do n8n)
    const hashedPassword = crypto
      .createHash('md5')
      .update(password)
      .digest('hex');

    console.log('[API /usuarios/login] Tentativa de login:', cleanCpf);

    // Conectar ao banco de dados
    connection = await mysql.createConnection(dbConfig);

    // Buscar usuário no banco
    const [rows] = await connection.execute(
      `SELECT id, cpf, name, email, phone, first_login, creci, role, status, created_at, updated_at 
       FROM users 
       WHERE cpf = ? AND password = ?`,
      [cleanCpf, hashedPassword]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      console.log('[API /usuarios/login] ❌ Credenciais inválidas');
      return NextResponse.json(
        { error: 'CPF ou senha inválidos' },
        { status: 401 }
      );
    }

    const user = rows[0] as any;

    // Verificar se o usuário está aprovado
    if (user.status !== 'approved') {
      console.log('[API /usuarios/login] ❌ Usuário não aprovado:', user.status);
      return NextResponse.json(
        { error: 'Usuário aguardando aprovação ou foi rejeitado' },
        { status: 403 }
      );
    }

    // Formatar resposta (mantendo snake_case para compatibilidade com AuthContext)
    const userData = {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      phone: user.phone || '',
      creci: user.creci || '',
      role: user.role,
      status: user.status,
      first_login: Boolean(user.first_login), // Converte TINYINT(1) para booleano
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    console.log('[API /usuarios/login] ✅ Login bem-sucedido:', cleanCpf);
    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    console.error('[API /usuarios/login] ❌ Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
