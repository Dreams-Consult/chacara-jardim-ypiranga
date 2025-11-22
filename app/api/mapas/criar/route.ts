import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Forçar rota dinâmica
export const dynamic = 'force-dynamic';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'maia',
  password: 'ForTheHorde!',
  database: 'vale_dos_carajas',
};

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const { name, description, imageUrl, width = 800, height = 600 } = body;

    if (!name || !imageUrl) {
      return NextResponse.json(
        { error: 'Nome e imagem são obrigatórios' },
        { status: 400 }
      );
    }

    // Gerar ID baseado em timestamp (tabela não tem AUTO_INCREMENT)
    const mapId = Date.now().toString();
    
    // Extrair tipo MIME da imagem
    let imageType = '';
    if (imageUrl && imageUrl.startsWith('data:')) {
      const match = imageUrl.match(/^data:(.*?);base64,/);
      imageType = match ? match[1] : '';
    }

    connection = await mysql.createConnection(dbConfig);

    // INSERT com id fornecido
    await connection.execute(
      `INSERT INTO maps (id, name, description, image_url, image_type, width, height, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [mapId, name, description || '', imageUrl, imageType, width, height]
    );

    const newMap = {
      mapId,
      id: mapId,
      name,
      description: description || '',
      imageUrl,
      width,
      height,
    };

    console.log('[API /mapas/criar] Mapa criado:', newMap.mapId);
    return NextResponse.json(newMap, { status: 201 });
  } catch (error) {
    console.error('[API /mapas/criar] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao criar mapa' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
