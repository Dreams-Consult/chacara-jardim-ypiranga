-- Migration: Add agreed price and installments
-- Created: 2024-12-01T00:00:00.000Z
-- Description: Adiciona colunas para preço acordado em lotes e parcelas na reserva

-- ==========================================
-- UP Migration
-- ==========================================

-- Adiciona preço acordado na tabela purchase_request_lots
ALTER TABLE purchase_request_lots 
ADD COLUMN IF NOT EXISTS agreed_price DECIMAL(15,2) NULL COMMENT 'Preço acordado para este lote na reserva';

-- Adiciona número de parcelas na tabela purchase_requests
ALTER TABLE purchase_requests 
ADD COLUMN IF NOT EXISTS installments INT NULL DEFAULT NULL COMMENT 'Número de parcelas para pagamento';
