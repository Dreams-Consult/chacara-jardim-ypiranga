-- Schema completo do banco vale_dos_carajas
-- Data: 2025-11-22
-- Sistema de Gerenciamento de Loteamentos

DROP DATABASE IF EXISTS vale_dos_carajas;
CREATE DATABASE vale_dos_carajas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vale_dos_carajas;

-- ============================================
-- TABELA USERS
-- ============================================
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `first_name` VARCHAR(50) DEFAULT NULL,
  `last_name` VARCHAR(50) DEFAULT NULL,
  `role` ENUM('admin', 'user') DEFAULT 'user',
  `first_login` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_username` (`username`),
  UNIQUE KEY `unique_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA MAPS (Mapas/Loteamentos)
-- ============================================
CREATE TABLE `maps` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `location` VARCHAR(255) DEFAULT NULL,
  `total_area` DECIMAL(10,2) DEFAULT NULL,
  `pdf_url` VARCHAR(500) DEFAULT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `status` ENUM('active', 'inactive', 'sold_out') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA BLOCKS (Quadras)
-- ============================================
CREATE TABLE `blocks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `mapId` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `identifier` VARCHAR(50) NOT NULL,
  `description` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_block_per_map` (`mapId`, `name`),
  KEY `idx_mapId` (`mapId`),
  KEY `idx_name` (`name`),
  CONSTRAINT `blocks_ibfk_1` FOREIGN KEY (`mapId`) REFERENCES `maps` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA LOTS (Lotes)
-- ============================================
CREATE TABLE `lots` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `block_id` INT NOT NULL,
  `map_id` INT NOT NULL,
  `lot_number` VARCHAR(50) NOT NULL,
  `size` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('available', 'reserved', 'sold', 'unavailable') DEFAULT 'available',
  `description` TEXT,
  `features` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_lot_per_block` (`map_id`, `block_id`, `lot_number`),
  KEY `idx_block_id` (`block_id`),
  KEY `idx_map_id` (`map_id`),
  KEY `idx_status` (`status`),
  KEY `idx_lot_number` (`lot_number`),
  CONSTRAINT `lots_ibfk_1` FOREIGN KEY (`map_id`) REFERENCES `maps` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lots_ibfk_2` FOREIGN KEY (`block_id`) REFERENCES `blocks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lots_chk_1` CHECK ((`size` >= 0)),
  CONSTRAINT `lots_chk_2` CHECK (json_valid(`features`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA PURCHASE_REQUESTS (Solicitações de Compra)
-- ============================================
CREATE TABLE `purchase_requests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `lot_id` BIGINT UNSIGNED NOT NULL,
  `map_id` INT NOT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_email` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `customer_cpf` VARCHAR(14) DEFAULT NULL,
  `customer_address` TEXT,
  `payment_method` ENUM('cash', 'financing', 'installments') DEFAULT 'cash',
  `status` ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
  `notes` TEXT,
  `contract` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lot_id` (`lot_id`),
  KEY `idx_map_id` (`map_id`),
  KEY `idx_status` (`status`),
  KEY `idx_customer_email` (`customer_email`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `purchase_requests_ibfk_1` FOREIGN KEY (`lot_id`) REFERENCES `lots` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchase_requests_ibfk_2` FOREIGN KEY (`map_id`) REFERENCES `maps` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA PURCHASE_REQUEST_LOTS (Relacionamento Múltiplos Lotes)
-- ============================================
CREATE TABLE `purchase_request_lots` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `purchase_request_id` BIGINT UNSIGNED NOT NULL,
  `lot_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_request_lot` (`purchase_request_id`, `lot_id`),
  KEY `idx_purchase_request_id` (`purchase_request_id`),
  KEY `idx_lot_id` (`lot_id`),
  CONSTRAINT `purchase_request_lots_ibfk_1` FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchase_request_lots_ibfk_2` FOREIGN KEY (`lot_id`) REFERENCES `lots` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Inserir usuário admin padrão (senha: admin123)
INSERT INTO `users` (`username`, `password`, `email`, `first_name`, `last_name`, `role`, `first_login`) 
VALUES ('admin', MD5('admin123'), 'admin@example.com', 'Administrador', 'Sistema', 'admin', 0);

-- ============================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ============================================

-- Índice composto para busca rápida de lotes disponíveis por mapa
CREATE INDEX idx_map_status ON lots(map_id, status);

-- Índice para busca de reservas por período
CREATE INDEX idx_purchase_created ON purchase_requests(created_at, status);

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View para estatísticas de lotes por mapa
CREATE OR REPLACE VIEW vw_map_statistics AS
SELECT 
    m.id AS map_id,
    m.name AS map_name,
    COUNT(l.id) AS total_lots,
    SUM(CASE WHEN l.status = 'available' THEN 1 ELSE 0 END) AS available_lots,
    SUM(CASE WHEN l.status = 'reserved' THEN 1 ELSE 0 END) AS reserved_lots,
    SUM(CASE WHEN l.status = 'sold' THEN 1 ELSE 0 END) AS sold_lots,
    SUM(l.size) AS total_area,
    SUM(l.price) AS total_value,
    COUNT(DISTINCT b.id) AS total_blocks
FROM maps m
LEFT JOIN lots l ON m.id = l.map_id
LEFT JOIN blocks b ON m.id = b.mapId
GROUP BY m.id, m.name;

-- View para detalhes completos de lotes
CREATE OR REPLACE VIEW vw_lot_details AS
SELECT 
    l.id,
    l.lot_number,
    l.size,
    l.price,
    l.status,
    l.description,
    l.features,
    b.id AS block_id,
    b.name AS block_name,
    b.identifier AS block_identifier,
    m.id AS map_id,
    m.name AS map_name,
    m.location AS map_location,
    l.created_at,
    l.updated_at
FROM lots l
INNER JOIN blocks b ON l.block_id = b.id
INNER JOIN maps m ON l.map_id = m.id;

-- ============================================
-- TRIGGERS PARA AUDITORIA
-- ============================================

-- Trigger para atualizar status do lote ao criar reserva
DELIMITER $$
CREATE TRIGGER after_purchase_request_insert
AFTER INSERT ON purchase_requests
FOR EACH ROW
BEGIN
    IF NEW.status = 'approved' THEN
        UPDATE lots SET status = 'reserved' WHERE id = NEW.lot_id;
    END IF;
END$$

-- Trigger para atualizar status do lote ao mudar status da reserva
CREATE TRIGGER after_purchase_request_update
AFTER UPDATE ON purchase_requests
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE lots SET status = 'sold' WHERE id = NEW.lot_id;
    ELSEIF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        UPDATE lots SET status = 'available' WHERE id = NEW.lot_id;
    ELSEIF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        UPDATE lots SET status = 'reserved' WHERE id = NEW.lot_id;
    END IF;
END$$

DELIMITER ;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Mostrar todas as tabelas criadas
SHOW TABLES;

-- Verificar AUTO_INCREMENT
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    COLUMN_TYPE,
    EXTRA
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'vale_dos_carajas'
  AND COLUMN_NAME = 'id'
ORDER BY TABLE_NAME;

-- Verificar constraints UNIQUE
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY ORDINAL_POSITION) AS columns
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'vale_dos_carajas'
  AND CONSTRAINT_NAME LIKE 'unique%'
GROUP BY TABLE_NAME, CONSTRAINT_NAME
ORDER BY TABLE_NAME;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- ✅ Todas as tabelas com AUTO_INCREMENT nos IDs
-- ✅ LOTS: Unique por (map_id, block_id, lot_number)
-- ✅ BLOCKS: Unique por (mapId, name)
-- ✅ Foreign keys configuradas com ON DELETE CASCADE
-- ✅ Índices para performance otimizada
-- ✅ Views para relatórios
-- ✅ Triggers para automação de status
-- ✅ Usuário admin criado (username: admin, password: admin123)
