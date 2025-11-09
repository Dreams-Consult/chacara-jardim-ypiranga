-- =====================================================
-- Script de Atualização do Banco de Dados
-- Chácara Jardim Ypiranga
-- Data: 2025-11-08
-- =====================================================

-- Adicionar campos de vendedor na tabela purchase_requests
-- Usa procedimento condicional para evitar erros se as colunas já existirem

DELIMITER $$

-- Adiciona seller_name se não existir
DROP PROCEDURE IF EXISTS AddSellerNameColumn$$
CREATE PROCEDURE AddSellerNameColumn()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'purchase_requests'
        AND COLUMN_NAME = 'seller_name'
    ) THEN
        ALTER TABLE `purchase_requests`
        ADD COLUMN `seller_name` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
        COMMENT 'Nome completo do vendedor/corretor responsável pela venda'
        AFTER `message`;
    END IF;
END$$

-- Adiciona seller_email se não existir
DROP PROCEDURE IF EXISTS AddSellerEmailColumn$$
CREATE PROCEDURE AddSellerEmailColumn()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'purchase_requests'
        AND COLUMN_NAME = 'seller_email'
    ) THEN
        ALTER TABLE `purchase_requests`
        ADD COLUMN `seller_email` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
        COMMENT 'Email do vendedor/corretor para contato'
        AFTER `seller_name`;
    END IF;
END$$

-- Adiciona seller_phone se não existir
DROP PROCEDURE IF EXISTS AddSellerPhoneColumn$$
CREATE PROCEDURE AddSellerPhoneColumn()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'purchase_requests'
        AND COLUMN_NAME = 'seller_phone'
    ) THEN
        ALTER TABLE `purchase_requests`
        ADD COLUMN `seller_phone` VARCHAR(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL
        COMMENT 'Telefone do vendedor/corretor no formato (XX) XXXXX-XXXX'
        AFTER `seller_email`;
    END IF;
END$$

-- Adiciona seller_cpf se não existir
DROP PROCEDURE IF EXISTS AddSellerCpfColumn$$
CREATE PROCEDURE AddSellerCpfColumn()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'purchase_requests'
        AND COLUMN_NAME = 'seller_cpf'
    ) THEN
        ALTER TABLE `purchase_requests`
        ADD COLUMN `seller_cpf` VARCHAR(14) COLLATE utf8mb4_unicode_ci DEFAULT NULL
        COMMENT 'CPF do vendedor/corretor no formato XXX.XXX.XXX-XX'
        AFTER `seller_phone`;
    END IF;
END$$

-- Adiciona índice seller_email se não existir
DROP PROCEDURE IF EXISTS AddSellerEmailIndex$$
CREATE PROCEDURE AddSellerEmailIndex()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'purchase_requests'
        AND INDEX_NAME = 'idx_seller_email'
    ) THEN
        CREATE INDEX `idx_seller_email` ON `purchase_requests` (`seller_email`);
    END IF;
END$$

-- Adiciona índice seller_cpf se não existir
DROP PROCEDURE IF EXISTS AddSellerCpfIndex$$
CREATE PROCEDURE AddSellerCpfIndex()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'purchase_requests'
        AND INDEX_NAME = 'idx_seller_cpf'
    ) THEN
        CREATE INDEX `idx_seller_cpf` ON `purchase_requests` (`seller_cpf`);
    END IF;
END$$

DELIMITER ;

-- Executa os procedimentos
CALL AddSellerNameColumn();
CALL AddSellerEmailColumn();
CALL AddSellerPhoneColumn();
CALL AddSellerCpfColumn();
CALL AddSellerEmailIndex();
CALL AddSellerCpfIndex();

-- Remove os procedimentos temporários
DROP PROCEDURE IF EXISTS AddSellerNameColumn;
DROP PROCEDURE IF EXISTS AddSellerEmailColumn;
DROP PROCEDURE IF EXISTS AddSellerPhoneColumn;
DROP PROCEDURE IF EXISTS AddSellerCpfColumn;
DROP PROCEDURE IF EXISTS AddSellerEmailIndex;
DROP PROCEDURE IF EXISTS AddSellerCpfIndex;

-- =====================================================
-- Adicionar campos de vendedor na tabela lots
-- Para rastrear qual vendedor está responsável pelo lote
-- =====================================================

DELIMITER $$

-- Adiciona seller_name na tabela lots se não existir
DROP PROCEDURE IF EXISTS AddLotsSellerNameColumn$$
CREATE PROCEDURE AddLotsSellerNameColumn()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'lots'
        AND COLUMN_NAME = 'seller_name'
    ) THEN
        ALTER TABLE `lots`
        ADD COLUMN `seller_name` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
        COMMENT 'Nome do vendedor responsável pela última reserva/venda'
        AFTER `status`;
    END IF;
END$$

-- Adiciona seller_email na tabela lots se não existir
DROP PROCEDURE IF EXISTS AddLotsSellerEmailColumn$$
CREATE PROCEDURE AddLotsSellerEmailColumn()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'lots'
        AND COLUMN_NAME = 'seller_email'
    ) THEN
        ALTER TABLE `lots`
        ADD COLUMN `seller_email` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
        COMMENT 'Email do vendedor responsável'
        AFTER `seller_name`;
    END IF;
END$$

-- Adiciona seller_phone na tabela lots se não existir
DROP PROCEDURE IF EXISTS AddLotsSellerPhoneColumn$$
CREATE PROCEDURE AddLotsSellerPhoneColumn()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'lots'
        AND COLUMN_NAME = 'seller_phone'
    ) THEN
        ALTER TABLE `lots`
        ADD COLUMN `seller_phone` VARCHAR(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL
        COMMENT 'Telefone do vendedor responsável'
        AFTER `seller_email`;
    END IF;
END$$

-- Adiciona seller_cpf na tabela lots se não existir
DROP PROCEDURE IF EXISTS AddLotsSellerCpfColumn$$
CREATE PROCEDURE AddLotsSellerCpfColumn()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'lots'
        AND COLUMN_NAME = 'seller_cpf'
    ) THEN
        ALTER TABLE `lots`
        ADD COLUMN `seller_cpf` VARCHAR(14) COLLATE utf8mb4_unicode_ci DEFAULT NULL
        COMMENT 'CPF do vendedor responsável'
        AFTER `seller_phone`;
    END IF;
END$$

-- Adiciona índice seller_email na tabela lots se não existir
DROP PROCEDURE IF EXISTS AddLotsSellerEmailIndex$$
CREATE PROCEDURE AddLotsSellerEmailIndex()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'lots'
        AND INDEX_NAME = 'idx_lots_seller_email'
    ) THEN
        CREATE INDEX `idx_lots_seller_email` ON `lots` (`seller_email`);
    END IF;
END$$

-- Adiciona índice seller_cpf na tabela lots se não existir
DROP PROCEDURE IF EXISTS AddLotsSellerCpfIndex$$
CREATE PROCEDURE AddLotsSellerCpfIndex()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'lots'
        AND INDEX_NAME = 'idx_lots_seller_cpf'
    ) THEN
        CREATE INDEX `idx_lots_seller_cpf` ON `lots` (`seller_cpf`);
    END IF;
END$$

DELIMITER ;

-- Executa os procedimentos para tabela lots
CALL AddLotsSellerNameColumn();
CALL AddLotsSellerEmailColumn();
CALL AddLotsSellerPhoneColumn();
CALL AddLotsSellerCpfColumn();
CALL AddLotsSellerEmailIndex();
CALL AddLotsSellerCpfIndex();

-- Remove os procedimentos temporários da tabela lots
DROP PROCEDURE IF EXISTS AddLotsSellerNameColumn;
DROP PROCEDURE IF EXISTS AddLotsSellerEmailColumn;
DROP PROCEDURE IF EXISTS AddLotsSellerPhoneColumn;
DROP PROCEDURE IF EXISTS AddLotsSellerCpfColumn;
DROP PROCEDURE IF EXISTS AddLotsSellerEmailIndex;
DROP PROCEDURE IF EXISTS AddLotsSellerCpfIndex;

-- =====================================================
-- Validação do Schema Atualizado
-- =====================================================

-- Exibe a estrutura da tabela purchase_requests para conferência
SELECT 'Estrutura da tabela purchase_requests:' AS '';
DESCRIBE `purchase_requests`;

-- Exibe os índices da tabela purchase_requests
SELECT 'Índices da tabela purchase_requests:' AS '';
SHOW INDEX FROM `purchase_requests`;

-- Exibe a estrutura da tabela lots para conferência
SELECT 'Estrutura da tabela lots:' AS '';
DESCRIBE `lots`;

-- Exibe os índices da tabela lots
SELECT 'Índices da tabela lots:' AS '';
SHOW INDEX FROM `lots`;

-- =====================================================
-- Observações Importantes
-- =====================================================

/*
CAMPOS ADICIONADOS:

📋 TABELA: purchase_requests (DADOS PRINCIPAIS DA COMPRA)
- seller_name: Nome completo do vendedor (máx 255 caracteres)
- seller_email: Email do vendedor (máx 255 caracteres)
- seller_phone: Telefone com máscara (XX) XXXXX-XXXX (máx 20 caracteres)
- seller_cpf: CPF com máscara XXX.XXX.XXX-XX (máx 14 caracteres)

⚠️ TODOS OS DADOS DA COMPRA FICAM EM purchase_requests:
  - Dados do cliente (customer_*)
  - Dados do vendedor (seller_*)
  - Dados do lote (lot_id, map_id)
  - Status da requisição
  - Mensagem opcional

� TABELA: lots (REFERÊNCIA DO VENDEDOR)
- seller_name: Cópia do nome do vendedor (para consulta rápida)
- seller_email: Cópia do email do vendedor
- seller_phone: Cópia do telefone do vendedor
- seller_cpf: Cópia do CPF do vendedor

⚠️ Os dados em lots são apenas REFERÊNCIA do último vendedor que reservou
   Os dados COMPLETOS e HISTÓRICO ficam em purchase_requests

VALIDAÇÕES NO FRONTEND (OBRIGATÓRIOS):
✅ seller_name: Obrigatório
✅ seller_email: Obrigatório, formato de email válido
✅ seller_phone: Obrigatório, máscara automática (XX) XXXXX-XXXX
✅ seller_cpf: Obrigatório, validação matemática de CPF

ESTRUTURA DO REQUEST (FRONTEND → BACKEND):
{
  lot: { ...dados do lote... },
  customer: {
    name: string,
    email: string,
    phone: string,
    cpf: string,
    message: string
  },
  seller: {
    name: string,     // ← NOVO
    email: string,    // ← NOVO
    phone: string,    // ← NOVO
    cpf: string       // ← NOVO
  },
  purchaseRequest: {
    id: string,
    lotId: string,
    status: 'pending',
    createdAt: string
  }
}

VALIDAÇÕES NO BACKEND (n8n):
1. ✅ Verificar se todos os campos obrigatórios foram enviados
2. ✅ Validar formato de email (customer + seller)
3. ✅ Validar CPF com algoritmo de dígitos (customer + seller)
4. ✅ Validar formato de telefone (customer + seller)
5. ⚠️ SALVAR TUDO EM purchase_requests com os campos seller_*
6. 🔄 OPCIONAL: Copiar seller_* para lots (apenas referência)

ÍNDICES CRIADOS (para buscas otimizadas):
📊 purchase_requests:
  - idx_seller_email: Buscar compras por email do vendedor
  - idx_seller_cpf: Buscar compras por CPF do vendedor
  - idx_customer_email: Buscar compras por email do cliente (já existia)

📊 lots:
  - idx_lots_seller_email: Buscar lotes por vendedor atual
  - idx_lots_seller_cpf: Buscar lotes por CPF do vendedor atual

QUERIES ÚTEIS:
-- Ver todas as vendas de um vendedor específico
SELECT * FROM purchase_requests
WHERE seller_email = 'vendedor@example.com';

-- Ver histórico completo de um lote
SELECT * FROM purchase_requests
WHERE lot_id = 'ID_DO_LOTE'
ORDER BY created_at DESC;

-- Ver vendedor atual de um lote
SELECT seller_name, seller_email, seller_phone, seller_cpf
FROM lots
WHERE id = 'ID_DO_LOTE';

COMPATIBILIDADE:
- O script usa stored procedures com validação condicional
- Compatível com MySQL 5.7+ e MariaDB 10.2+
- Mantém charset utf8mb4 para suporte completo a caracteres especiais
- Pode ser executado múltiplas vezes sem causar erros (idempotente)

MIGRAÇÃO DE DADOS:
- Registros antigos terão seller_* como NULL
- Novas requisições devem preencher todos os campos de vendedor
- O backend (n8n) deve salvar seller_* em purchase_requests

FLUXO DE DADOS COMPLETO:
1. 👤 Cliente preenche formulário (PurchaseModal)
2. 📤 Frontend envia para backend:
   - Dados do cliente (customer)
   - Dados do vendedor (seller) ← NOVO
   - Dados do lote
3. 💾 Backend salva em purchase_requests:
   - customer_name, customer_email, customer_phone, customer_cpf
   - seller_name, seller_email, seller_phone, seller_cpf ← NOVO
   - lot_id, map_id, message, status
4. 🔄 Backend OPCIONALMENTE atualiza lots:
   - seller_* (apenas para referência rápida)
5. ✅ Todos os dados históricos ficam preservados em purchase_requests

CPF DE DESENVOLVIMENTO:
- O frontend aceita CPF '999.999.999-98' para testes
- Backend deve validar CPFs em produção
*/
