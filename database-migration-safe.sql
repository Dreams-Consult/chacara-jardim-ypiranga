-- Script de migração seguro - Remove constraints antigas e adiciona novas
-- Data: 2025-11-22

USE vale_dos_carajas;

-- ============================================
-- LIMPAR CONSTRAINTS ANTIGAS
-- ============================================

-- Remover constraints antigas de lots (ignora erros se não existir)
SET @drop1 = 'ALTER TABLE lots DROP INDEX unique_lot_per_map';
SET @drop2 = 'ALTER TABLE lots DROP INDEX unique_lot_per_block';

-- Executar drops com tratamento de erro
SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.statistics 
     WHERE table_schema = 'vale_dos_carajas' 
     AND table_name = 'lots' 
     AND index_name = 'unique_lot_per_map') > 0,
    @drop1,
    'SELECT "unique_lot_per_map não existe" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.statistics 
     WHERE table_schema = 'vale_dos_carajas' 
     AND table_name = 'lots' 
     AND index_name = 'unique_lot_per_block') > 0,
    @drop2,
    'SELECT "unique_lot_per_block não existe" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Remover constraints antigas de blocks
SET @drop3 = 'ALTER TABLE blocks DROP INDEX unique_block_name';
SET @drop4 = 'ALTER TABLE blocks DROP INDEX unique_block_per_map';
SET @drop5 = 'ALTER TABLE blocks DROP INDEX name';

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.statistics 
     WHERE table_schema = 'vale_dos_carajas' 
     AND table_name = 'blocks' 
     AND index_name = 'unique_block_name') > 0,
    @drop3,
    'SELECT "unique_block_name não existe" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.statistics 
     WHERE table_schema = 'vale_dos_carajas' 
     AND table_name = 'blocks' 
     AND index_name = 'unique_block_per_map') > 0,
    @drop4,
    'SELECT "unique_block_per_map não existe" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.statistics 
     WHERE table_schema = 'vale_dos_carajas' 
     AND table_name = 'blocks' 
     AND index_name = 'name') > 0,
    @drop5,
    'SELECT "name index não existe" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- ADICIONAR NOVAS CONSTRAINTS
-- ============================================

-- Constraint para lots: unique por (map_id, block_id, lot_number)
ALTER TABLE lots 
ADD CONSTRAINT unique_lot_per_block 
UNIQUE KEY (map_id, block_id, lot_number);

-- Constraint para blocks: unique por (mapId, name)
ALTER TABLE blocks 
ADD CONSTRAINT unique_block_per_map 
UNIQUE KEY (mapId, name);

-- ============================================
-- GARANTIR AUTO_INCREMENT
-- ============================================

-- Lots
ALTER TABLE lots 
MODIFY COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT;

-- Blocks
ALTER TABLE blocks 
MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;

-- Purchase Requests
ALTER TABLE purchase_requests 
MODIFY COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT;

-- Users
ALTER TABLE users 
MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

SELECT 'CONSTRAINTS CRIADAS:' AS Status;

SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY ORDINAL_POSITION SEPARATOR ', ') AS Columns
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'vale_dos_carajas'
  AND CONSTRAINT_NAME IN ('unique_lot_per_block', 'unique_block_per_map')
GROUP BY TABLE_NAME, CONSTRAINT_NAME;

SELECT 'AUTO_INCREMENT CONFIGURADO:' AS Status;

SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    COLUMN_TYPE,
    EXTRA
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'vale_dos_carajas'
  AND COLUMN_NAME = 'id'
  AND EXTRA LIKE '%auto_increment%'
ORDER BY TABLE_NAME;
