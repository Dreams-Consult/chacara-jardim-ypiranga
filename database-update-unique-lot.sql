-- Script para atualizar constraint UNIQUE na tabela lots
-- Permite lot_number repetidos desde que a combinação (map_id, block_id, lot_number) seja única
-- Data: 2025-11-22

USE vale_dos_carajas;

-- 1. Remover a constraint antiga que impedia lot_number repetido no mesmo mapa
ALTER TABLE lots DROP INDEX IF EXISTS unique_lot_per_map;

-- 2. Adicionar nova constraint UNIQUE composta
-- Permite mesmo lot_number em blocos diferentes do mesmo mapa
ALTER TABLE lots ADD CONSTRAINT unique_lot_per_block 
UNIQUE (map_id, block_id, lot_number);

-- Verificar as constraints
SHOW INDEX FROM lots WHERE Key_name = 'unique_lot_per_block';

-- Exemplos de uso:
-- ✅ PERMITIDO: Lote 1 no Bloco A e Lote 1 no Bloco B (mesmo mapa)
-- INSERT INTO lots (map_id, block_id, lot_number, status, price, size, created_at, updated_at)
-- VALUES ('123', 1, '1', 'available', 10000, 100, NOW(), NOW());
-- 
-- INSERT INTO lots (map_id, block_id, lot_number, status, price, size, created_at, updated_at)
-- VALUES ('123', 2, '1', 'available', 10000, 100, NOW(), NOW());

-- ❌ NEGADO: Lote 1 duplicado no mesmo bloco do mesmo mapa
-- INSERT INTO lots (map_id, block_id, lot_number, status, price, size, created_at, updated_at)
-- VALUES ('123', 1, '1', 'available', 10000, 100, NOW(), NOW());
-- Erro: Duplicate entry '123-1-1' for key 'lots.unique_lot_per_block'
