# Configuração de Deploy para GitHub Pages

Este projeto está configurado para fazer deploy automático no GitHub Pages.

## Como funciona

1. Quando você faz push para a branch `main`, o GitHub Actions automaticamente:
   - Instala as dependências
   - Faz o build do projeto Next.js (exportação estática)
   - Cria arquivo .nojekyll
   - Faz deploy na branch `gh-pages`

2. O site estará disponível em: https://Dreams-Consult.github.io/chacara-jardim-ypiranga

## Deploy Manual

Se precisar fazer deploy manualmente, use:

```bash
npm run deploy
```

## Configuração no GitHub

1. Vá em Settings > Pages no repositório
2. Em "Source", selecione "Deploy from a branch"
3. Em "Branch", selecione `gh-pages` e a pasta `/ (root)`
4. Clique em "Save"

## Estrutura do Projeto

- **Página Principal**: `/` - Mapa público para visualização de lotes
- **Admin - Mapas**: `/admin/maps` - Gerenciamento de mapas
- **Admin - Lotes**: `/admin/lot-management?mapId=ID` - Gerenciamento de lotes (usa query params)

## Observações Técnicas

- O projeto usa `output: 'export'` para gerar arquivos estáticos
- O `basePath` está configurado como `/chacara-jardim-ypiranga`
- Imagens são servidas sem otimização (`unoptimized: true`)
- Rotas dinâmicas foram substituídas por query parameters para compatibilidade com GitHub Pages
- A pasta `out/` contém os arquivos estáticos gerados após o build

## Limitações do GitHub Pages

- Não suporta rotas dinâmicas do Next.js (ex: `/lots/[id]`)
- Não suporta Server-Side Rendering (SSR)
- Não suporta API Routes
- Todas as funcionalidades rodam no lado do cliente (Client-Side Rendering)
- Dados são armazenados no localStorage do navegador
