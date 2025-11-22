-- ============================================
-- MIGRAÇÃO: Adicionar Suporte a Quadras/Blocos
-- Data: 2024-11-21
-- ============================================

-- 1. Criar tabela de quadras/blocos
CREATE TABLE IF NOT EXISTS blocks (
  id VARCHAR(50) PRIMARY KEY,
  mapId VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (mapId) REFERENCES maps(id) ON DELETE CASCADE,
  INDEX idx_mapId (mapId),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Adicionar coluna blockId na tabela lots
ALTER TABLE lots
ADD COLUMN blockId VARCHAR(50) DEFAULT NULL,
ADD COLUMN blockName VARCHAR(255) DEFAULT NULL;

-- 3. Adicionar foreign key com ON DELETE SET NULL
-- Isso garante que se uma quadra for deletada, os lotes não serão deletados,
-- apenas terão blockId definido como NULL
ALTER TABLE lots
ADD CONSTRAINT fk_lots_blockId
FOREIGN KEY (blockId) REFERENCES blocks(id) ON DELETE SET NULL;

-- 4. Criar índice para melhorar performance de queries por quadra
CREATE INDEX idx_lots_blockId ON lots(blockId);

-- 5. Criar índice composto para queries comuns
CREATE INDEX idx_lots_map_block ON lots(mapId, blockId);

-- ============================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ============================================

-- Exemplo: Criar quadras para um mapa existente
-- Substitua '1762192028364' pelo ID do seu mapa

INSERT INTO blocks (id, mapId, name, description, createdAt, updatedAt) VALUES
('1732194000001', '1762192028364', 'Quadra A', 'Quadra próxima à entrada principal', NOW(), NOW()),
('1732194000002', '1762192028364', 'Quadra B', 'Quadra com vista para o lago', NOW(), NOW()),
('1732194000003', '1762192028364', 'Quadra C', 'Quadra nos fundos do terreno', NOW(), NOW());

-- Exemplo: Atribuir quadras aos lotes existentes
-- Atualizar lotes 1-10 para Quadra A
UPDATE lots
SET blockId = '1732194000001', blockName = 'Quadra A', updatedAt = NOW()
WHERE mapId = '1762192028364' AND lotNumber BETWEEN '1' AND '10';

-- Atualizar lotes 11-20 para Quadra B
UPDATE lots
SET blockId = '1732194000002', blockName = 'Quadra B', updatedAt = NOW()
WHERE mapId = '1762192028364' AND lotNumber BETWEEN '11' AND '20';

-- Atualizar lotes 21-30 para Quadra C
UPDATE lots
SET blockId = '1732194000003', blockName = 'Quadra C', updatedAt = NOW()
WHERE mapId = '1762192028364' AND lotNumber BETWEEN '21' AND '30';

-- ============================================
-- QUERIES ÚTEIS PARA VALIDAÇÃO
-- ============================================

-- Verificar estrutura da tabela blocks
DESCRIBE blocks;

-- Verificar estrutura da tabela lots (deve ter blockId e blockName)
DESCRIBE lots;

-- Listar todas as quadras
SELECT * FROM blocks ORDER BY name;

-- Contar lotes por quadra
SELECT
  b.name AS quadra,
  COUNT(l.id) AS total_lotes
FROM blocks b
LEFT JOIN lots l ON b.id = l.blockId
GROUP BY b.id, b.name
ORDER BY b.name;

-- Listar lotes sem quadra
SELECT id, lotNumber, mapId
FROM lots
WHERE blockId IS NULL;

-- Verificar integridade referencial
SELECT
  l.id,
  l.lotNumber,
  l.blockId,
  b.name AS block_name
FROM lots l
LEFT JOIN blocks b ON l.blockId = b.id
WHERE l.blockId IS NOT NULL;

-- ============================================
-- ROLLBACK (SE NECESSÁRIO)
-- ============================================

-- ATENÇÃO: Use apenas se precisar reverter a migração

-- 1. Remover foreign key
-- ALTER TABLE lots DROP FOREIGN KEY fk_lots_blockId;

-- 2. Remover índices
-- DROP INDEX idx_lots_blockId ON lots;
-- DROP INDEX idx_lots_map_block ON lots;

-- 3. Remover colunas
-- ALTER TABLE lots DROP COLUMN blockId, DROP COLUMN blockName;

-- 4. Deletar tabela blocks
-- DROP TABLE IF EXISTS blocks;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
1. BACKUP: Sempre faça backup do banco antes de executar migrações

2. FOREIGN KEY com ON DELETE SET NULL:
   - Se uma quadra for deletada, os lotes não serão deletados
   - O blockId dos lotes será definido como NULL
   - Isso evita perda de dados acidental

3. ÍNDICES:
   - idx_mapId: Para listar quadras de um mapa rapidamente
   - idx_lots_blockId: Para filtrar lotes por quadra
   - idx_lots_map_block: Para queries que filtram por mapa E quadra

4. COMPATIBILIDADE:
   - Lotes existentes terão blockId = NULL
   - Eles continuarão funcionando normalmente
   - Você pode atribuir quadras depois

5. VALIDAÇÃO:
   - Após a migração, teste criar, editar e deletar quadras
   - Verifique se os lotes mantêm a referência correta
   - Teste o filtro por quadra no frontend

6. PERFORMANCE:
   - Para mapas com muitos lotes (1000+), os índices são essenciais
   - Considere particionar a tabela se tiver milhões de registros
*/
