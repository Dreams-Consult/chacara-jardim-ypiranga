-- Script para ajustar constraints e AUTO_INCREMENT
-- Data: 2025-11-22
-- Objetivo:
-- 1. Permitir lot_number repetidos em quadras diferentes (unique por map_id, block_id, lot_number)
-- 2. Permitir name de quadras repetidos em mapas diferentes (unique por mapId, name)
-- 3. Adicionar AUTO_INCREMENT em todos os IDs

USE vale_dos_carajas;

-- ============================================
-- TABELA LOTS
-- ============================================

-- Remover constraint antiga de lotes (se existir)
-- Sintaxe correta para MySQL 8.0
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
               WHERE table_schema = 'vale_dos_carajas' 
               AND table_name = 'lots' 
               AND index_name = 'unique_lot_per_map') > 0,
              'ALTER TABLE lots DROP INDEX unique_lot_per_map', 
              'SELECT "Index does not exist"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar constraint UNIQUE composta para lotes
-- Permite mesmo lot_number em quadras diferentes
ALTER TABLE lots 
ADD CONSTRAINT unique_lot_per_block 
UNIQUE KEY (map_id, block_id, lot_number);

-- Garantir AUTO_INCREMENT no ID de lots
ALTER TABLE lots 
MODIFY COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT;

-- ============================================
-- TABELA BLOCKS (QUADRAS)
-- ============================================

-- Remover constraint antiga de quadras (se existir)
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
               WHERE table_schema = 'vale_dos_carajas' 
               AND table_name = 'blocks' 
               AND index_name = 'unique_block_name') > 0,
              'ALTER TABLE blocks DROP INDEX unique_block_name', 
              'SELECT "Index does not exist"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
               WHERE table_schema = 'vale_dos_carajas' 
               AND table_name = 'blocks' 
               AND index_name = 'name') > 0,
              'ALTER TABLE blocks DROP INDEX name', 
              'SELECT "Index does not exist"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar constraint UNIQUE composta para quadras
-- Permite mesmo name em mapas diferentes
ALTER TABLE blocks 
ADD CONSTRAINT unique_block_per_map 
UNIQUE KEY (mapId, name);

-- Garantir AUTO_INCREMENT no ID de blocks
ALTER TABLE blocks 
MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;

-- ============================================
-- TABELA MAPS
-- ============================================

-- Transformar maps.id de VARCHAR para INT AUTO_INCREMENT
-- ATENÇÃO: Isso requer migração de dados e atualização de foreign keys

-- Passo 1: Adicionar nova coluna temporária
ALTER TABLE maps ADD COLUMN new_id INT NOT NULL AUTO_INCREMENT UNIQUE FIRST;

-- Passo 2: Criar mapeamento temporário para referências
CREATE TEMPORARY TABLE IF NOT EXISTS map_id_mapping AS
SELECT id as old_id, new_id FROM maps;

-- Passo 3: Atualizar foreign keys na tabela blocks
ALTER TABLE blocks DROP FOREIGN KEY blocks_ibfk_1;
ALTER TABLE blocks ADD COLUMN new_mapId INT;
UPDATE blocks b 
INNER JOIN map_id_mapping m ON b.mapId = m.old_id 
SET b.new_mapId = m.new_id;

-- Passo 4: Atualizar foreign keys na tabela lots  
ALTER TABLE lots ADD COLUMN new_map_id INT;
UPDATE lots l
INNER JOIN map_id_mapping m ON l.map_id = m.old_id
SET l.new_map_id = m.new_id;

-- Passo 5: Remover colunas antigas e renomear novas
ALTER TABLE blocks DROP COLUMN mapId;
ALTER TABLE blocks CHANGE COLUMN new_mapId mapId INT NOT NULL;

ALTER TABLE lots DROP COLUMN map_id;
ALTER TABLE lots CHANGE COLUMN new_map_id map_id INT NOT NULL;

-- Passo 6: Remover chave primária antiga e configurar nova
ALTER TABLE maps DROP PRIMARY KEY;
ALTER TABLE maps DROP COLUMN id;
ALTER TABLE maps CHANGE COLUMN new_id id INT NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST;

-- Passo 7: Recriar foreign keys
ALTER TABLE blocks 
ADD CONSTRAINT blocks_ibfk_1 
FOREIGN KEY (mapId) REFERENCES maps(id) ON DELETE CASCADE;

ALTER TABLE lots
ADD CONSTRAINT lots_ibfk_1
FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE;

-- ============================================
-- TABELA PURCHASE_REQUESTS
-- ============================================

-- Garantir AUTO_INCREMENT no ID de purchase_requests (se existir)
ALTER TABLE purchase_requests 
MODIFY COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT;

-- ============================================
-- TABELA USERS
-- ============================================

-- Garantir AUTO_INCREMENT no ID de users (se existir)
ALTER TABLE users 
MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar constraints de lots
SHOW INDEX FROM lots WHERE Key_name = 'unique_lot_per_block';

-- Verificar constraints de blocks
SHOW INDEX FROM blocks WHERE Key_name = 'unique_block_per_map';

-- Verificar AUTO_INCREMENT de todas as tabelas
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    COLUMN_TYPE,
    EXTRA
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'vale_dos_carajas'
  AND COLUMN_NAME = 'id'
ORDER BY TABLE_NAME;

-- ============================================
-- TESTES SUGERIDOS
-- ============================================

-- Teste 1: Criar lote com número repetido em quadras diferentes (DEVE FUNCIONAR)
-- INSERT INTO lots (block_id, map_id, lot_number, size, price, status, description) 
-- VALUES (6, '1763788909834', '1', 1.00, 1.00, 'available', 'Lote 1 da Quadra 6');

-- Teste 2: Criar lote duplicado na mesma quadra (DEVE FALHAR)
-- INSERT INTO lots (block_id, map_id, lot_number, size, price, status, description) 
-- VALUES (5, '1763788909834', '1', 1.00, 1.00, 'available', 'Duplicado');

-- Teste 3: Criar quadra com nome repetido em mapas diferentes (DEVE FUNCIONAR)
-- INSERT INTO blocks (mapId, name, identifier) 
-- VALUES ('OUTRO_MAP_ID', '1', 'Quadra 1 de outro mapa');

-- Teste 4: Criar quadra com nome duplicado no mesmo mapa (DEVE FALHAR)
-- INSERT INTO blocks (mapId, name, identifier) 
-- VALUES ('1763788909834', '1', 'Duplicado');

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- ✅ LOTS: Lote "1" pode existir em Block 5 e Block 6 do mesmo mapa
-- ❌ LOTS: Lote "1" não pode ser duplicado no Block 5
-- ✅ BLOCKS: Quadra "1" pode existir em Map A e Map B
-- ❌ BLOCKS: Quadra "1" não pode ser duplicada no Map A
-- ✅ Todos os IDs com AUTO_INCREMENT funcionando
