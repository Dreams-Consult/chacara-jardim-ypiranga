-- Adicionar coluna first_payment na tabela purchase_requests
ALTER TABLE purchase_requests
ADD COLUMN first_payment DECIMAL(10, 2) NULL COMMENT 'Valor da entrada/primeira parcela';

-- Verificar a estrutura atualizada
DESCRIBE purchase_requests;
