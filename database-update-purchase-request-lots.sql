-- Adicionar colunas map_id e block_id na tabela purchase_request_lots
ALTER TABLE purchase_request_lots
ADD COLUMN map_id VARCHAR(255) NULL COMMENT 'ID do mapa associado ao lote',
ADD COLUMN block_id VARCHAR(255) NULL COMMENT 'ID da quadra associada ao lote';

-- Verificar a estrutura atualizada
DESCRIBE purchase_request_lots;
