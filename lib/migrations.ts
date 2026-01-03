import { createConnection } from './db';
import fs from 'fs';
import path from 'path';

export interface Migration {
  id: number;
  name: string;
  executed_at: Date;
}

/**
 * Cria a tabela de controle de migrations se não existir
 */
export async function createMigrationsTable() {
  const connection = await createConnection();
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_executed_at (executed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tabela migrations criada/verificada');
  } finally {
    await connection.end();
  }
}

/**
 * Retorna as migrations já executadas
 */
export async function getExecutedMigrations(): Promise<string[]> {
  const connection = await createConnection();
  try {
    const [rows] = await connection.execute<any[]>(
      'SELECT name FROM migrations ORDER BY id ASC'
    );
    return rows.map((row: any) => row.name);
  } finally {
    await connection.end();
  }
}

/**
 * Lista todas as migrations disponíveis no diretório
 */
export function getAvailableMigrations(): string[] {
  const migrationsDir = path.join(process.cwd(), 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  return fs
    .readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
}

/**
 * Retorna as migrations pendentes (ainda não executadas)
 */
export async function getPendingMigrations(): Promise<string[]> {
  const available = getAvailableMigrations();
  const executed = await getExecutedMigrations();
  return available.filter(migration => !executed.includes(migration));
}

/**
 * Executa uma migration específica
 */
export async function executeMigration(filename: string): Promise<void> {
  const connection = await createConnection();
  try {
    const migrationsDir = path.join(process.cwd(), 'migrations');
    const filepath = path.join(migrationsDir, filename);
    const sql = fs.readFileSync(filepath, 'utf-8');

    // Dividir em statements individuais (separados por ;)
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Executar cada statement
    for (const statement of statements) {
      await connection.query(statement);
    }

    // Registrar migration como executada
    await connection.execute(
      'INSERT INTO migrations (name) VALUES (?)',
      [filename]
    );

    console.log(`✅ Migration executada: ${filename}`);
  } catch (error) {
    console.error(`❌ Erro ao executar migration ${filename}:`, error);
    throw error;
  } finally {
    await connection.end();
  }
}

/**
 * Executa todas as migrations pendentes
 */
export async function runPendingMigrations(): Promise<void> {
  console.log('🔍 Verificando migrations pendentes...');
  
  await createMigrationsTable();
  const pending = await getPendingMigrations();

  if (pending.length === 0) {
    console.log('✅ Nenhuma migration pendente');
    return;
  }

  console.log(`📋 ${pending.length} migration(s) pendente(s):`);
  pending.forEach(m => console.log(`  - ${m}`));

  for (const migration of pending) {
    await executeMigration(migration);
  }

  console.log('🎉 Todas as migrations foram executadas com sucesso!');
}

/**
 * Mostra o status das migrations
 */
export async function showMigrationsStatus(): Promise<void> {
  await createMigrationsTable();
  
  const available = getAvailableMigrations();
  const executed = await getExecutedMigrations();
  const pending = available.filter(m => !executed.includes(m));

  console.log('\n📊 Status das Migrations:');
  console.log('========================');
  console.log(`Total disponíveis: ${available.length}`);
  console.log(`Executadas: ${executed.length}`);
  console.log(`Pendentes: ${pending.length}`);

  if (executed.length > 0) {
    console.log('\n✅ Executadas:');
    executed.forEach(m => console.log(`  - ${m}`));
  }

  if (pending.length > 0) {
    console.log('\n⏳ Pendentes:');
    pending.forEach(m => console.log(`  - ${m}`));
  }
}
