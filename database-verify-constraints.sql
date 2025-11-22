-- Verificar constraints e AUTO_INCREMENT
USE vale_dos_carajas;

-- Verificar constraint de lots (unique_lot_per_block)
SELECT 
    'LOTS - unique_lot_per_block' AS Tabela,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS Colunas
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'vale_dos_carajas' 
  AND TABLE_NAME = 'lots'
  AND INDEX_NAME = 'unique_lot_per_block'
GROUP BY INDEX_NAME;

-- Verificar constraint de blocks (unique_block_per_map)
SELECT 
    'BLOCKS - unique_block_per_map' AS Tabela,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS Colunas
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'vale_dos_carajas' 
  AND TABLE_NAME = 'blocks'
  AND INDEX_NAME = 'unique_block_per_map'
GROUP BY INDEX_NAME;

-- Verificar AUTO_INCREMENT em todas as tabelas
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    COLUMN_TYPE,
    EXTRA
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'vale_dos_carajas'
  AND COLUMN_NAME = 'id'
ORDER BY TABLE_NAME;
