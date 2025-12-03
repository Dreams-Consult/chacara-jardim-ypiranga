import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { dbConfig } from '@/lib/db';

// Forçar rota dinâmica
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    console.log('[API /mapas GET] Buscando mapas...');

    // Conectar ao banco de dados
    connection = await mysql.createConnection(dbConfig);

    // Verificar se é requisição do dashboard (sem imagem) ou filtro por ID
    const { searchParams } = new URL(request.url);
    const minimal = searchParams.get('minimal') === 'true';
    const mapId = searchParams.get('id');

    // Construir query baseada nos parâmetros
    let query: string;
    let params: any[] = [];

    if (mapId) {
      // Buscar mapa específico por ID (sempre com imageUrl)
      query = `SELECT id, name, description, image_url, width, height, created_at, updated_at FROM maps WHERE id = ?`;
      params = [mapId];
    } else if (minimal) {
      // Buscar todos sem image_url
      query = `SELECT id, name, description, width, height, created_at, updated_at FROM maps ORDER BY created_at DESC`;
    } else {
      // Buscar todos com image_url
      query = `SELECT id, name, description, image_url, width, height, created_at, updated_at FROM maps ORDER BY created_at DESC`;
    }

    const [rows] = await connection.execute(query, params);

    if (!Array.isArray(rows)) {
      return NextResponse.json([], { status: 200 });
    }

    // Formatar resposta (mesmo formato do n8n)
    const formattedMaps = rows.map((map: any) => {
      const base: any = {
        mapId: map.id?.toString() || '',
        name: map.name || '',
        description: map.description || '',
        width: map.width ? Number(map.width) : null,
        height: map.height ? Number(map.height) : null,
        createdAt: map.created_at
          ? map.created_at.toISOString().replace('T', ' ').slice(0, 19)
          : null,
        updatedAt: map.updated_at
          ? map.updated_at.toISOString().replace('T', ' ').slice(0, 19)
          : null,
      };
      
      // Apenas incluir imageUrl se não for requisição minimal
      if (!minimal) {
        base.imageUrl = map.image_url || '';
      }
      
      return base;
    });

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
