#!/usr/bin/env node

/**
 * Script CLI para gerenciar migrations do banco de dados
 * 
 * Uso:
 *   npm run migrate           - Executa todas as migrations pendentes
 *   npm run migrate:status    - Mostra o status das migrations
 *   npm run migrate:create nome - Cria uma nova migration
 */

require('ts-node/register');
const path = require('path');
const fs = require('fs');

// Importar funções de migrations
const migrationsPath = path.join(__dirname, '..', 'lib', 'migrations.ts');
const migrations = require(migrationsPath);

const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  try {
    switch (command) {
      case 'run':
      case undefined:
        await migrations.runPendingMigrations();
        break;

      case 'status':
        await migrations.showMigrationsStatus();
        break;

      case 'create': {
        const name = args[0];
        if (!name) {
          console.error('❌ Erro: Nome da migration é obrigatório');
          console.log('Uso: npm run migrate:create <nome>');
          process.exit(1);
        }

        const timestamp = Date.now();
        const filename = `${timestamp}_${name}.sql`;
        const filepath = path.join(process.cwd(), 'migrations', filename);

        const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}
-- Description: 

-- ==========================================
-- UP Migration
-- ==========================================



-- ==========================================
-- Verification Queries
-- ==========================================

-- DESCRIBE table_name;
-- SHOW INDEX FROM table_name;
`;

        fs.writeFileSync(filepath, template);
        console.log(`✅ Migration criada: ${filename}`);
        break;
      }

      default:
        console.log('❌ Comando desconhecido:', command);
        console.log('\nComandos disponíveis:');
        console.log('  npm run migrate              - Executa migrations pendentes');
        console.log('  npm run migrate:status       - Mostra status das migrations');
        console.log('  npm run migrate:create <nome> - Cria nova migration');
        process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar comando:', error);
    process.exit(1);
  }
}

main();
