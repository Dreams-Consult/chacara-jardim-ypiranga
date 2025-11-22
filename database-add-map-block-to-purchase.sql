-- Script para adicionar map_id e block_id na tabela purchase_requests_lots
-- Data: 2025-11-22

-- Adicionar colunas map_id e block_id
ALTER TABLE purchase_requests_lots
ADD COLUMN map_id VARCHAR(50) AFTER lot_id,
ADD COLUMN block_id INT AFTER map_id;

-- Atualizar os valores de map_id e block_id com base nos lotes existentes
UPDATE purchase_requests_lots prl
INNER JOIN lots l ON prl.lot_id = l.id
SET prl.map_id = l.map_id,
    prl.block_id = l.block_id;

-- Verificar se há registros sem map_id ou block_id
SELECT COUNT(*) AS registros_sem_dados
FROM purchase_requests_lots
WHERE map_id IS NULL OR block_id IS NULL;

-- Mostrar estrutura atualizada
DESCRIBE purchase_requests_lots;
