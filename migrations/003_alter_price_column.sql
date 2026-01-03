-- Migration: Alter price column precision
-- Created: 2024-11-22T00:00:00.000Z
-- Description: Altera precisão da coluna price de DECIMAL(15,2) para DECIMAL(10,2)

-- ==========================================
-- UP Migration
-- ==========================================
ALTER TABLE lots 
MODIFY COLUMN price DECIMAL(10,2) NOT NULL;
