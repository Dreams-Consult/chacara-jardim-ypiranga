-- Adicionar coluna active na tabela users
-- Esta coluna permite ativar/desativar usuários sem excluí-los

ALTER TABLE users 
ADD COLUMN active TINYINT(1) DEFAULT 1 COMMENT 'Usuário ativo (1) ou inativo (0)';

-- Atualizar todos os usuários existentes para ativo
UPDATE users SET active = 1;

-- Verificar as alterações
DESCRIBE users;
SELECT id, name, email, role, active FROM users;
