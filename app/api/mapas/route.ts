import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Forçar rota dinâmica
export const dynamic = 'force-dynamic';

// Configuração do banco de dados
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'maia',
  password: 'ForTheHorde!',
  database: 'vale_dos_carajas',
};

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    console.log('[API /mapas GET] Buscando mapas...');

    // Conectar ao banco de dados
    connection = await mysql.createConnection(dbConfig);

    // Buscar mapas
    const [rows] = await connection.execute(
      `SELECT
        id,
        name,
        description,
        image_url,
        width,
        height,
        created_at,
        updated_at
      FROM maps
      ORDER BY created_at DESC`
    );

    if (!Array.isArray(rows)) {
      return NextResponse.json([], { status: 200 });
    }

    // Formatar resposta (mesmo formato do n8n)
    const formattedMaps = rows.map((map: any) => ({
      mapId: map.id?.toString() || '',
      name: map.name || '',
      description: map.description || '',
      imageUrl: map.image_url || '',
      width: map.width ? Number(map.width) : null,
      height: map.height ? Number(map.height) : null,
      createdAt: map.created_at
        ? map.created_at.toISOString().replace('T', ' ').slice(0, 19)
        : null,
      updatedAt: map.updated_at
        ? map.updated_at.toISOString().replace('T', ' ').slice(0, 19)
        : null,
    }));

    console.log('[API /mapas GET] ✅ Mapas encontrados:', formattedMaps.length);
    return NextResponse.json(formattedMaps, { status: 200 });
  } catch (error) {
    console.error('[API /mapas GET] ❌ Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar mapas' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
