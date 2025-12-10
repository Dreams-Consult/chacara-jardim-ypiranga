-- Adicionar coluna theme_preference na tabela users
-- Data: 2025-12-10
-- Descrição: Armazenar preferência de tema (light/dark) do usuário

ALTER TABLE users 
ADD COLUMN theme_preference ENUM('light', 'dark') DEFAULT 'light' AFTER active;

-- Índice para otimizar consultas (opcional)
CREATE INDEX idx_theme_preference ON users(theme_preference);
