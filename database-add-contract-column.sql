-- ============================================
-- Adiciona coluna 'contract' na tabela purchase_requests
-- Data: 2025-11-27
-- ============================================

-- Adicionar coluna contract (contrato)
ALTER TABLE `purchase_requests` 
ADD COLUMN `contract` TEXT AFTER `notes`;

-- Adicionar índice se necessário buscar por informações do contrato
-- ALTER TABLE `purchase_requests` ADD FULLTEXT INDEX `idx_contract` (`contract`);

-- Verificar a estrutura atualizada
DESCRIBE `purchase_requests`;
