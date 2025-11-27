-- Adicionar coluna agreed_price na tabela purchase_request_lots
-- Esta coluna armazenará o preço acordado na hora da reserva para cada lote

ALTER TABLE purchase_request_lots 
ADD COLUMN agreed_price DECIMAL(15,2) NULL COMMENT 'Preço acordado para este lote na reserva';

-- Adicionar coluna installments na tabela purchase_requests
-- Esta coluna armazenará o número de parcelas escolhidas pelo cliente

ALTER TABLE purchase_requests 
ADD COLUMN installments INT NULL DEFAULT NULL COMMENT 'Número de parcelas para pagamento';

-- Verificar as alterações
DESCRIBE purchase_request_lots;
DESCRIBE purchase_requests;
