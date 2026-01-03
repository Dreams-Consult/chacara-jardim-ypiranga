-- Migration: Initial database schema
-- Created: 2024-01-01T00:00:00.000Z
-- Description: Cria todas as tabelas iniciais do sistema

-- ==========================================
-- TABELA USERS
-- ==========================================
CREATE TABLE IF NOT EXISTS `users` (
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

-- ==========================================
-- TABELA MAPS (Mapas/Loteamentos)
-- ==========================================
CREATE TABLE IF NOT EXISTS `maps` (
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

-- ==========================================
-- TABELA BLOCKS (Quadras)
-- ==========================================
CREATE TABLE IF NOT EXISTS `blocks` (
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

-- ==========================================
-- TABELA LOTS (Lotes)
-- ==========================================
CREATE TABLE IF NOT EXISTS `lots` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `block_id` INT NOT NULL,
  `map_id` INT NOT NULL,
  `lot_number` VARCHAR(50) NOT NULL,
  `size` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `price` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
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

-- ==========================================
-- TABELA PURCHASE_REQUESTS (Solicitações de Compra)
-- ==========================================
CREATE TABLE IF NOT EXISTS `purchase_requests` (
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

-- ==========================================
-- TABELA PURCHASE_REQUEST_LOTS (Relacionamento Múltiplos Lotes)
-- ==========================================
CREATE TABLE IF NOT EXISTS `purchase_request_lots` (
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

-- ==========================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_map_status ON lots(map_id, status);
CREATE INDEX IF NOT EXISTS idx_purchase_created ON purchase_requests(created_at, status);

-- ==========================================
-- VIEWS ÚTEIS
-- ==========================================
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
