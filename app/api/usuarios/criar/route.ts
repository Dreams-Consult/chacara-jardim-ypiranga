import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import crypto from 'crypto';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'maia',
  password: 'ForTheHorde!',
  database: 'vale_dos_carajas',
};

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const {
      name,
      email,
      cpf,
      phone,
      creci,
      role = 'vendedor',
      status = 'pending',
      password,
      first_login = true,
    } = body;

    if (!name || !email || !cpf || !phone || !password) {
      return NextResponse.json(
        { error: 'Dados obrigatórios: name, email, cpf, phone, password' },
        { status: 400 }
      );
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Hash MD5 da senha
    const hashedPassword = crypto
      .createHash('md5')
      .update(password)
      .digest('hex');

    connection = await mysql.createConnection(dbConfig);

    // Verificar se CPF ou email já existe
    const [existing] = await connection.execute(
      'SELECT COUNT(*) as count FROM users WHERE cpf = ? OR email = ?',
      [cleanCpf, email]
    );

    if (Array.isArray(existing) && existing[0] && (existing[0] as any).count > 0) {
      return NextResponse.json(
        { error: 'CPF ou email já cadastrado', message: 'Este CPF ou email já está cadastrado no sistema' },
        { status: 409 }
      );
    }

    // Inserir novo usuário
    const [result] = await connection.execute(
      `INSERT INTO users (
        name, email, cpf, phone, creci, role, status,
        password, first_login, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        name,
        email,
        cleanCpf,
        cleanPhone,
        creci || null,
        role,
        status,
        hashedPassword,
        first_login ? 1 : 0,
      ]
    );

    const userId = (result as any).insertId;

    const newUser = {
      id: userId,
      name,
      email,
      cpf: cleanCpf,
      phone: cleanPhone,
      creci: creci || null,
      role,
      status,
      first_login,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('[API /usuarios/criar] ✅ Usuário criado:', email, '- ID:', userId);
    return NextResponse.json(
      { 
        message: 'Usuário criado com sucesso. Aguarde aprovação do administrador.',
        user: newUser 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('[API /usuarios/criar] ❌ Erro:', error);
    
    // Verificar se é erro de duplicação do MySQL
    if ((error as any).code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'CPF ou email já cadastrado', message: 'Este CPF ou email já está cadastrado no sistema' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao criar usuário', message: 'Ocorreu um erro ao processar seu cadastro. Tente novamente.' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
