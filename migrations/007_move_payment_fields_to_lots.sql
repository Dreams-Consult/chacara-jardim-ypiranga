-- Migration: Move payment fields to lots
-- Created: 2024-11-29T00:00:00.000Z
-- Description: Move campos first_payment e installments para purchase_request_lots

-- ==========================================
-- UP Migration
-- ==========================================

-- Adicionar colunas first_payment e installments na tabela purchase_request_lots
ALTER TABLE `purchase_request_lots`
ADD COLUMN IF NOT EXISTS `first_payment` DECIMAL(10,2) DEFAULT NULL COMMENT 'Valor de entrada específico para este lote',
ADD COLUMN IF NOT EXISTS `installments` INT DEFAULT NULL COMMENT 'Número de parcelas específico para este lote';

-- Migrar dados existentes se a coluna existir em purchase_requests
-- Esta parte será executada apenas se as colunas existirem
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'purchase_requests' 
  AND COLUMN_NAME = 'first_payment');

-- Se as colunas existem em purchase_requests, migrar os dados
UPDATE `purchase_request_lots` prl
INNER JOIN `purchase_requests` pr ON prl.purchase_request_id = pr.id
SET 
    prl.first_payment = pr.first_payment,
    prl.installments = pr.installments
WHERE pr.first_payment IS NOT NULL OR pr.installments IS NOT NULL;

-- Remover as colunas antigas da tabela purchase_requests se existirem
ALTER TABLE `purchase_requests`
DROP COLUMN IF EXISTS `first_payment`,
DROP COLUMN IF EXISTS `installments`;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_first_payment ON purchase_request_lots(first_payment);
CREATE INDEX IF NOT EXISTS idx_installments ON purchase_request_lots(installments);
