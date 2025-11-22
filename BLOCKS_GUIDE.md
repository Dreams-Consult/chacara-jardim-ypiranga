# Sistema de Quadras/Blocos

## Visão Geral

O sistema de quadras permite organizar os lotes de um mapa em blocos/quadras distintos. Cada mapa pode ter várias quadras, e cada quadra pode conter vários lotes.

## Estrutura Hierárquica

```
Mapa
  ├── Quadra A
  │     ├── Lote A-01
  │     ├── Lote A-02
  │     └── Lote A-03
  ├── Quadra B
  │     ├── Lote B-01
  │     └── Lote B-02
  └── Quadra C
        └── Lote C-01
```

## Funcionalidades

### 1. Gerenciamento de Quadras

#### Criar Quadra
- Acesse um mapa no painel administrativo
- Clique em "Gerenciar Quadras"
- Clique em "Nova Quadra"
- Preencha nome e descrição (opcional)
- Salve

#### Editar Quadra
- Na lista de quadras, clique em "Editar"
- Altere o nome ou descrição
- Salve as alterações

#### Deletar Quadra
- Na lista de quadras, clique em "Excluir"
- ⚠️ **Importante**: Só é possível deletar quadras sem lotes
- Se a quadra tiver lotes, remova ou transfira os lotes primeiro

### 2. Gerenciamento de Lotes com Quadras

#### Criar Lote em uma Quadra
1. Acesse "Gerenciar Lotes" de um mapa
2. Selecione a quadra desejada no dropdown "Quadra para novo lote"
3. Clique em "Novo Lote"
4. O lote será criado automaticamente na quadra selecionada

#### Atribuir/Alterar Quadra de um Lote
1. Na lista de lotes, clique no lote desejado
2. Clique em "Editar Lote"
3. Selecione a quadra no dropdown "Quadra"
4. Salve as alterações

#### Filtrar Lotes por Quadra
1. Na tela de gerenciamento de lotes
2. Use o dropdown "Filtrar por quadra"
3. Selecione a quadra desejada
4. Apenas os lotes dessa quadra serão exibidos

### 3. Visualização de Lotes por Quadra

- Na lista de quadras, clique em "Ver Lotes"
- Você será direcionado para a lista de lotes filtrada por aquela quadra
- Todos os lotes da quadra serão exibidos

## Fluxo de Trabalho Recomendado

### Cenário 1: Novo Projeto

1. **Criar o Mapa**
   - Upload da imagem/PDF do mapa
   - Definir nome e descrição

2. **Criar as Quadras**
   - Identificar quantas quadras existem no mapa
   - Criar cada quadra com nome descritivo
   - Ex: "Quadra A", "Setor Norte", "Bloco 1"

3. **Cadastrar Lotes por Quadra**
   - Selecionar a quadra no dropdown
   - Criar lotes sequencialmente
   - Repetir para cada quadra

### Cenário 2: Projeto Existente

1. **Criar as Quadras**
   - Acessar "Gerenciar Quadras"
   - Criar as quadras necessárias

2. **Organizar Lotes Existentes**
   - Filtrar todos os lotes (sem filtro de quadra)
   - Editar cada lote individualmente
   - Atribuir a quadra correspondente

## Interface do Usuário

### Painel de Mapas
```
┌─────────────────────────────────────┐
│ Mapa: Loteamento Jardim Ypiranga   │
├─────────────────────────────────────┤
│ [Gerenciar Quadras]                 │
│ [Gerenciar Lotes]                   │
│ [Excluir]                           │
└─────────────────────────────────────┘
```

### Painel de Quadras
```
┌─────────────────────────────────────┐
│ Loteamento Jardim Ypiranga - Quadras│
│                    [+ Nova Quadra]  │
├─────────────────────────────────────┤
│ Quadra A                            │
│ 15 lotes cadastrados                │
│ [Ver Lotes] [Editar] [Excluir]     │
├─────────────────────────────────────┤
│ Quadra B                            │
│ 20 lotes cadastrados                │
│ [Ver Lotes] [Editar] [Excluir]     │
└─────────────────────────────────────┘
```

### Painel de Lotes
```
┌─────────────────────────────────────┐
│ Loteamento Jardim Ypiranga          │
│                                     │
│ Quadra para novo lote: [Quadra A▼] │
│                                     │
│ Filtrar por quadra: [Todas ▼]      │
│                                     │
│ Lotes Cadastrados                   │
│ [01] [02] [03] [04] [05]           │
│ [06] [07] [08] [09] [10]           │
└─────────────────────────────────────┘
```

## Regras de Negócio

### Criação de Quadras
✅ **Permitido:**
- Criar quantas quadras desejar em um mapa
- Nome da quadra pode ser repetido em mapas diferentes
- Descrição é opcional

❌ **Não Permitido:**
- Nome da quadra vazio
- Criar quadra em mapa inexistente

### Edição de Quadras
✅ **Permitido:**
- Alterar nome e descrição a qualquer momento
- Renomear quadras mesmo com lotes associados

❌ **Não Permitido:**
- Deixar nome vazio

### Deleção de Quadras
✅ **Permitido:**
- Deletar quadras sem lotes associados

❌ **Não Permitido:**
- Deletar quadras com lotes associados
- Para deletar, primeiro remova ou transfira os lotes

### Lotes e Quadras
✅ **Permitido:**
- Criar lotes sem quadra (blockId = null)
- Mover lotes entre quadras
- Remover lote de uma quadra (definir blockId = null)

❌ **Não Permitido:**
- Atribuir lote a quadra de outro mapa

## Casos de Uso

### Caso 1: Loteamento com 3 Quadras

**Contexto:** Loteamento com 90 lotes divididos em 3 quadras de 30 lotes cada.

**Solução:**
1. Criar mapa "Loteamento XYZ"
2. Criar 3 quadras:
   - Quadra A (lotes 1-30)
   - Quadra B (lotes 31-60)
   - Quadra C (lotes 61-90)
3. Cadastrar lotes em cada quadra
4. Usar filtro para gerenciar lotes por quadra

**Benefícios:**
- Facilita navegação (30 lotes por tela em vez de 90)
- Organização lógica do empreendimento
- Relatórios por quadra

### Caso 2: Loteamento sem Quadras

**Contexto:** Pequeno loteamento com 15 lotes, sem divisão em quadras.

**Solução:**
1. Criar mapa "Loteamento Pequeno"
2. NÃO criar quadras
3. Cadastrar 15 lotes diretamente no mapa
4. Todos os lotes terão blockId = null

**Benefícios:**
- Simplicidade para projetos pequenos
- Não força uso de quadras quando não necessário

### Caso 3: Reorganização Posterior

**Contexto:** Loteamento criado sem quadras, mas cresceu e agora precisa de organização.

**Solução:**
1. Acessar "Gerenciar Quadras"
2. Criar quadras necessárias
3. Editar lotes existentes e atribuir quadras
4. Pode fazer gradualmente (lotes sem quadra continuam funcionando)

**Benefícios:**
- Não é necessário recriar os lotes
- Migração gradual possível
- Sem perda de dados

## Permissões

| Ação                  | DEV | ADMIN | VENDEDOR |
|-----------------------|-----|-------|----------|
| Criar Quadra          | ✅   | ✅     | ❌        |
| Editar Quadra         | ✅   | ✅     | ❌        |
| Deletar Quadra        | ✅   | ✅     | ❌        |
| Ver Quadras           | ✅   | ✅     | ✅        |
| Filtrar Lotes Quadra  | ✅   | ✅     | ✅        |

**Nota:** Vendedores podem ver e filtrar por quadras, mas não podem criar/editar/deletar quadras.

## Migração de Dados Existentes

Se você já tem lotes cadastrados antes de implementar quadras:

1. **Todos os lotes existentes terão `blockId = null`**
   - Eles continuam funcionando normalmente
   - Aparecem quando filtro é "Todas as quadras"

2. **Você pode atribuir quadras aos lotes existentes**
   - Edite cada lote individualmente
   - Selecione a quadra desejada
   - Salve

3. **Não é obrigatório usar quadras**
   - Projetos pequenos podem não usar quadras
   - O sistema funciona com ou sem quadras

## Estrutura Técnica

### Arquivos Criados/Modificados

#### Novos Arquivos
- `types/index.ts` - Interface `Block` adicionada
- `hooks/useBlockOperations.ts` - Hook para operações CRUD de quadras
- `components/BlockManagement.tsx` - Componente de gerenciamento de quadras
- `app/admin/blocks/page.tsx` - Página admin de quadras
- `API_BLOCKS.md` - Documentação da API
- `database-blocks-migration.sql` - Script de migração do banco

#### Arquivos Modificados
- `types/index.ts` - Interface `Lot` com campos `blockId` e `blockName`
- `components/LotManagement.tsx` - Filtro e seleção de quadras
- `components/CinemaStyleLotSelector.tsx` - Suporte para editar quadra do lote
- `components/MapManagement.tsx` - Botão "Gerenciar Quadras"

### Banco de Dados

#### Nova Tabela: `blocks`
```sql
CREATE TABLE blocks (
  id VARCHAR(50) PRIMARY KEY,
  mapId VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (mapId) REFERENCES maps(id) ON DELETE CASCADE
);
```

#### Tabela Atualizada: `lots`
```sql
ALTER TABLE lots
ADD COLUMN blockId VARCHAR(50),
ADD COLUMN blockName VARCHAR(255),
ADD FOREIGN KEY (blockId) REFERENCES blocks(id) ON DELETE SET NULL;
```

## Endpoints da API

### Quadras
- `GET /api/mapas/quadras?mapId={id}` - Listar quadras
- `POST /api/mapas/quadras/criar` - Criar quadra
- `PATCH /api/mapas/quadras` - Atualizar quadra
- `DELETE /api/mapas/quadras/deletar?blockId={id}` - Deletar quadra

Veja `API_BLOCKS.md` para documentação completa.

## Troubleshooting

### Problema: Não consigo deletar uma quadra

**Causa:** A quadra tem lotes associados.

**Solução:**
1. Clique em "Ver Lotes" na quadra
2. Para cada lote, edite e remova a quadra (deixe "Sem quadra")
3. Ou transfira os lotes para outra quadra
4. Depois disso, a quadra pode ser deletada

### Problema: Lotes não aparecem ao filtrar por quadra

**Causa:** Os lotes não têm `blockId` definido.

**Solução:**
1. Desmarque o filtro (selecione "Todas as quadras")
2. Edite cada lote e atribua a quadra correta

### Problema: Quadra some da lista

**Causa:** Pode ter sido deletada ou o mapa foi alterado.

**Solução:**
1. Verifique se está no mapa correto
2. Recarregue a página
3. Se necessário, crie a quadra novamente

## Próximos Passos

- [ ] Implementar endpoints no backend (n8n)
- [ ] Executar migração do banco de dados
- [ ] Testar fluxo completo
- [ ] Treinar usuários
- [ ] Monitorar performance

## Suporte

Para dúvidas ou problemas, consulte:
- `API_BLOCKS.md` - Documentação da API
- `database-blocks-migration.sql` - Script de migração
- Logs do navegador (F12 > Console)
- Logs do backend
