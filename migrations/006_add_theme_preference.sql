-- Migration: Add theme preference to users
-- Created: 2024-12-10T00:00:00.000Z
-- Description: Adiciona coluna para preferência de tema (light/dark) do usuário

-- ==========================================
-- UP Migration
-- ==========================================
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS theme_preference ENUM('light', 'dark') DEFAULT 'light' AFTER active;

-- Índice para otimizar consultas (opcional)
CREATE INDEX IF NOT EXISTS idx_theme_preference ON users(theme_preference);
