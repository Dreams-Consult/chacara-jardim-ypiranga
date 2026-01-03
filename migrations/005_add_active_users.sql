-- Migration: Add active column to users
-- Created: 2024-12-05T00:00:00.000Z
-- Description: Adiciona coluna active para ativar/desativar usuários sem excluí-los

-- ==========================================
-- UP Migration
-- ==========================================
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS active TINYINT(1) DEFAULT 1 COMMENT 'Usuário ativo (1) ou inativo (0)';

-- Atualizar todos os usuários existentes para ativo
UPDATE users SET active = 1 WHERE active IS NULL;
