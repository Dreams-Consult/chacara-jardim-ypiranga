# Chácara Jardim Ypiranga - Plataforma de Gerenciamento de Lotes

Plataforma completa para gerenciamento e venda de lotes com mapas interativos e áreas clicáveis.

## 🚀 Funcionalidades

### Para Administradores
- **Gerenciamento de Mapas**
  - Upload de imagens ou PDFs como mapas
  - Visualização e exclusão de mapas
  - Acesso em `/admin/maps`

- **Gerenciamento de Lotes**
  - Criação de lotes com delimitação de áreas clicáveis
  - Desenhar polígonos personalizados no mapa
  - Editar informações: número, área (m²), preço, status, descrição
  - Status: Disponível, Reservado, Vendido
  - Adicionar características aos lotes
  - Acesso em `/admin/lots/[mapId]`

### Para Clientes
- **Visualização Pública**
  - Mapa interativo com lotes coloridos por status
  - Hover para ver informações rápidas
  - Clique em lotes disponíveis para manifestar interesse
  - Estatísticas em tempo real
  - Acesso na página principal `/`

- **Manifestação de Interesse**
  - Formulário de contato ao clicar em lote disponível
  - Campos: nome, email, telefone, CPF, mensagem
  - Dados salvos para follow-up

## 📋 Requisitos

- Node.js 18+
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório (se necessário)
2. Instale as dependências:

```bash
npm install
```

## 🏃 Como Usar

### 1. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse http://localhost:3000

### 2. Configurar o Sistema

#### Passo 1: Adicionar Mapas
1. Acesse `/admin/maps`
2. Clique em "Novo Mapa"
3. Preencha nome e descrição
4. Faça upload de uma imagem ou PDF do mapa
5. O mapa será processado e salvo

#### Passo 2: Criar Lotes
1. Na listagem de mapas, clique em "Gerenciar Lotes"
2. Clique em "Novo Lote"
3. Preencha as informações do lote:
   - Número do lote (Ex: 01, A1, etc)
   - Área em m²
   - Preço
   - Status (Disponível/Reservado/Vendido)
   - Descrição
   - Características (separadas por vírgula)
4. **Desenhe a área no mapa**: Clique nos pontos do mapa para criar um polígono
5. Clique em "Finalizar Área" quando terminar (mínimo 3 pontos)
6. Clique em "Salvar"

#### Passo 3: Visualização Pública
1. Acesse a página principal `/`
2. Os clientes podem:
   - Ver todos os lotes com cores indicando status
   - Passar o mouse para ver informações
   - Clicar em lotes disponíveis para manifestar interesse

### 3. Gerenciar Interessados

Os dados de interesse são salvos no localStorage. Para acessá-los:
1. Abra o console do navegador (F12)
2. Execute:

```javascript
JSON.parse(localStorage.getItem('lot_platform_purchases'))
```

## 🎨 Legenda de Cores

- **Verde**: Lote disponível para compra
- **Amarelo**: Lote reservado
- **Vermelho**: Lote vendido

## 📁 Estrutura do Projeto

```
├── app/
│   ├── page.tsx                    # Página pública
│   ├── admin/
│   │   ├── maps/
│   │   │   └── page.tsx           # Gerenciamento de mapas
│   │   └── lots/
│   │       └── [mapId]/
│   │           └── page.tsx       # Gerenciamento de lotes
├── components/
│   ├── InteractiveMap.tsx         # Componente de mapa interativo
│   ├── MapManagement.tsx          # CRUD de mapas
│   ├── LotManagement.tsx          # CRUD de lotes
│   └── PurchaseModal.tsx          # Modal de interesse
├── lib/
│   └── storage.ts                 # Funções de persistência
└── types/
    └── index.ts                   # Tipos TypeScript
```

## 💾 Armazenamento de Dados

Os dados são armazenados no **localStorage** do navegador:
- `lot_platform_maps`: Mapas cadastrados
- `lot_platform_lots`: Lotes cadastrados
- `lot_platform_purchases`: Solicitações de compra

> **Nota**: Para produção, recomenda-se implementar uma API backend com banco de dados real.

## 🔄 Workflow Recomendado

1. **Preparação**
   - Tenha o PDF ou imagem do mapa em alta qualidade
   - Liste todos os lotes com suas informações

2. **Configuração Inicial**
   - Faça upload do mapa
   - Crie todos os lotes, desenhando suas áreas
   - Configure preços e características

3. **Publicação**
   - Compartilhe o link da página principal com clientes
   - Monitore os interessados através do localStorage

4. **Atualização**
   - Altere status dos lotes conforme vendas
   - Edite informações quando necessário

## 🛠️ Tecnologias

- **Next.js 16** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Canvas API** - Renderização do mapa interativo
- **localStorage** - Persistência de dados

## 📝 Próximos Passos (Melhorias Futuras)

- [ ] Integração com backend (API REST ou GraphQL)
- [ ] Autenticação para área administrativa
- [ ] Exportação de relatórios de interessados
- [ ] Integração com WhatsApp/Email para notificações
- [ ] Suporte a múltiplas imagens por lote
- [ ] Sistema de reserva temporária
- [ ] Painel de analytics

## 🐛 Solução de Problemas

### O mapa não aparece
- Verifique se a imagem foi carregada corretamente
- Tente com uma imagem menor (< 5MB)

### Não consigo desenhar áreas
- Certifique-se de estar no modo "Novo Lote"
- Clique diretamente no canvas do mapa
- Mínimo de 3 pontos necessários

### Dados perdidos após refresh
- Dados estão no localStorage
- Limpar cache do navegador apaga os dados
- Para produção, implemente backend

## 📞 Suporte

Para questões técnicas ou sugestões, entre em contato através do email configurado na plataforma.
