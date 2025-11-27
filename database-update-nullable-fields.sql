-- Script para tornar campos opcionais na tabela purchase_requests
-- Apenas customer_name e seller_name permanecem obrigatórios (NOT NULL)

USE vale_dos_carajas;

-- Alterar colunas para permitir NULL (campos opcionais)
ALTER TABLE purchase_requests
  MODIFY COLUMN customer_email varchar(255) NULL,
  MODIFY COLUMN customer_phone varchar(20) NULL,
  MODIFY COLUMN customer_cpf varchar(14) NULL;

-- Verificar a estrutura atualizada
DESCRIBE purchase_requests;

-- Resultado esperado:
-- customer_name: varchar(255) NOT NULL (obrigatório)
-- customer_email: varchar(255) NULL (opcional)
-- customer_phone: varchar(20) NULL (opcional)
-- customer_cpf: varchar(14) NULL (opcional)
-- seller_name: varchar(100) NOT NULL (obrigatório)
-- seller_email: varchar(100) NULL (opcional)
-- seller_phone: varchar(20) NULL (opcional)
-- seller_cpf: varchar(20) NULL (opcional)
-- payment_method: varchar(30) NULL (opcional)
-- first_payment: decimal(10,2) NULL (opcional)
-- message: text NULL (opcional)
