-- Alteração do tipo da coluna price de decimal(15,2) para decimal(10,2)
-- Tabela: vale_dos_carajas.lots
-- Data: 2025-11-22

USE vale_dos_carajas;

-- Altera a coluna price para DECIMAL(10,2) (recomendado para valores monetários em reais)
-- Suporta valores até R$ 99.999.999,99
ALTER TABLE lots 
MODIFY COLUMN price DECIMAL(10,2) NOT NULL;

-- Verifica a alteração
DESCRIBE lots;
