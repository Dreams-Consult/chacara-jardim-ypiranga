-- ============================================
-- MIGRATION: Mover first_payment e installments para purchase_request_lots
-- Data: 2025-11-29
-- Descrição: Move os campos de entrada e parcelas da tabela purchase_requests
--            para purchase_request_lots, permitindo valores individuais por lote
-- ============================================

USE vale_dos_carajas;

-- Passo 1: Adicionar colunas first_payment e installments na tabela purchase_request_lots
ALTER TABLE `purchase_request_lots`
ADD COLUMN `first_payment` DECIMAL(10,2) DEFAULT NULL COMMENT 'Valor de entrada específico para este lote',
ADD COLUMN `installments` INT DEFAULT NULL COMMENT 'Número de parcelas específico para este lote';

-- Passo 2: Migrar dados existentes (se houver)
-- Para cada purchase_request que tinha first_payment/installments,
-- replicar esses valores para todos os lotes associados
UPDATE `purchase_request_lots` prl
INNER JOIN `purchase_requests` pr ON prl.purchase_request_id = pr.id
SET 
    prl.first_payment = pr.first_payment,
    prl.installments = pr.installments
WHERE pr.first_payment IS NOT NULL OR pr.installments IS NOT NULL;

-- Passo 3: Remover as colunas antigas da tabela purchase_requests
ALTER TABLE `purchase_requests`
DROP COLUMN `first_payment`,
DROP COLUMN `installments`;

-- Passo 4: Criar índices para melhor performance nas novas colunas
CREATE INDEX idx_first_payment ON purchase_request_lots(first_payment);
CREATE INDEX idx_installments ON purchase_request_lots(installments);

-- ============================================
-- VERIFICAÇÃO DA MIGRAÇÃO
-- ============================================

-- Verificar estrutura da tabela purchase_request_lots
DESCRIBE purchase_request_lots;

-- Verificar estrutura da tabela purchase_requests
DESCRIBE purchase_requests;

-- Contar registros com valores de first_payment
SELECT COUNT(*) as total_with_first_payment 
FROM purchase_request_lots 
WHERE first_payment IS NOT NULL;

-- Contar registros com valores de installments
SELECT COUNT(*) as total_with_installments 
FROM purchase_request_lots 
WHERE installments IS NOT NULL;

-- ============================================
-- ROLLBACK (caso necessário)
-- ============================================
-- Para reverter esta migração, execute os comandos abaixo:
/*
ALTER TABLE `purchase_requests`
ADD COLUMN `first_payment` DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN `installments` INT DEFAULT NULL;

UPDATE `purchase_requests` pr
INNER JOIN (
    SELECT purchase_request_id, AVG(first_payment) as avg_first_payment, AVG(installments) as avg_installments
    FROM purchase_request_lots
    GROUP BY purchase_request_id
) prl ON pr.id = prl.purchase_request_id
SET 
    pr.first_payment = prl.avg_first_payment,
    pr.installments = prl.avg_installments;

ALTER TABLE `purchase_request_lots`
DROP COLUMN `first_payment`,
DROP COLUMN `installments`;

DROP INDEX idx_first_payment ON purchase_request_lots;
DROP INDEX idx_installments ON purchase_request_lots;
*/

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- ✅ Tabela purchase_request_lots com colunas first_payment e installments
-- ✅ Tabela purchase_requests sem as colunas first_payment e installments
-- ✅ Dados migrados corretamente
-- ✅ Índices criados para performance

SELECT '✅ Migração concluída com sucesso!' AS status;
