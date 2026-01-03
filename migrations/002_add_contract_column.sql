-- Migration: Add contract column to purchase_requests
-- Created: 2024-11-27T00:00:00.000Z
-- Description: Adiciona coluna para armazenar informações do contrato

-- ==========================================
-- UP Migration
-- ==========================================
ALTER TABLE `purchase_requests` 
ADD COLUMN IF NOT EXISTS `contract` TEXT AFTER `notes`;
