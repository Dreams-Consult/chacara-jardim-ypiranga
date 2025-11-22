-- Script simples para ajustar constraints
-- Data: 2025-11-22

USE vale_dos_carajas;

-- ============================================
-- PASSO 1: REMOVER CONSTRAINTS ANTIGAS
-- ============================================

-- Verificar e remover unique_lot_per_map de lots
DROP INDEX unique_lot_per_map ON lots;

-- ============================================
-- PASSO 2: ADICIONAR NOVAS CONSTRAINTS
-- ============================================

-- Adicionar constraint única para lots (map_id, block_id, lot_number)
ALTER TABLE lots 
ADD UNIQUE KEY unique_lot_per_block (map_id, block_id, lot_number);

-- Adicionar constraint única para blocks (mapId, name)
ALTER TABLE blocks 
ADD UNIQUE KEY unique_block_per_map (mapId, name);

-- ============================================
-- PASSO 3: VERIFICAR RESULTADO
-- ============================================

SHOW INDEX FROM lots WHERE Key_name = 'unique_lot_per_block';
SHOW INDEX FROM blocks WHERE Key_name = 'unique_block_per_map';

SELECT 'MIGRAÇÃO CONCLUÍDA!' AS Status;
