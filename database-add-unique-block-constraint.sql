-- Script para adicionar constraint UNIQUE composta na tabela lots
-- Permite lot_number repetidos em diferentes blocos do mesmo mapa
-- Data: 2025-11-22

USE vale_dos_carajas;

-- Verificar constraints existentes
SELECT CONSTRAINT_NAME, COLUMN_NAME, ORDINAL_POSITION
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'vale_dos_carajas' 
  AND TABLE_NAME = 'lots'
  AND CONSTRAINT_NAME LIKE 'unique%';

-- Remover constraint antiga se existir
ALTER TABLE lots DROP INDEX IF EXISTS unique_lot_per_map;

-- Adicionar nova constraint UNIQUE composta (map_id, block_id, lot_number)
-- Garante que cada lote seja único dentro da sua quadra
ALTER TABLE lots ADD CONSTRAINT unique_lot_per_block 
UNIQUE KEY (map_id, block_id, lot_number);

-- Verificar se a constraint foi criada corretamente
SHOW INDEX FROM lots WHERE Key_name = 'unique_lot_per_block';

-- Resultado esperado:
-- ✅ Permite: Lote "1" no Bloco 5 do Mapa X
-- ✅ Permite: Lote "1" no Bloco 6 do Mapa X (mesmo número, bloco diferente)
-- ✅ Permite: Lote "2" no Bloco 5 do Mapa X
-- ❌ Bloqueia: Lote "1" duplicado no Bloco 5 do Mapa X
