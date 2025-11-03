# Guia de Acesso - GitHub Pages

## 🔗 URLs Corretas

O projeto está hospedado no GitHub Pages e requer o prefixo `/chacara-jardim-ypiranga` nas URLs.

### URLs de Produção (GitHub Pages)

#### Página Pública
```
https://dreams-consult.github.io/chacara-jardim-ypiranga/
```

#### Páginas de Administração

**Gerenciamento de Mapas:**
```
https://dreams-consult.github.io/chacara-jardim-ypiranga/admin/maps/
```

**Gerenciamento de Lotes:**
```
https://dreams-consult.github.io/chacara-jardim-ypiranga/admin/lot-management/?mapId=SEU_MAP_ID
```

**Exportar/Importar Dados:**
```
https://dreams-consult.github.io/chacara-jardim-ypiranga/admin/data/
```

---

## 📦 Dados de Exemplo

O sistema agora inclui dados de exemplo que são carregados automaticamente na primeira vez que você acessa o site. Isso inclui:

- **1 Mapa de Exemplo** (ID: 1762192028364)
- **3 Lotes de Exemplo** (disponível, disponível, reservado)

### Para Testar com Dados Reais

1. **No Localhost:**
   - Crie seus mapas e lotes em `http://localhost:3000/admin/maps`
   - Vá para `http://localhost:3000/admin/data`
   - Clique em "Exportar Todos os Dados"
   - Baixe o arquivo JSON

2. **No GitHub Pages:**
   - Acesse `https://dreams-consult.github.io/chacara-jardim-ypiranga/admin/data/`
   - Selecione o arquivo JSON exportado ou cole o conteúdo
   - Clique em "Importar Dados"

---

## ⚠️ Importante

### URLs que NÃO funcionam (404):
```
❌ https://dreams-consult.github.io/admin/data
❌ https://dreams-consult.github.io/admin/maps
```

### URLs corretas:
```
✅ https://dreams-consult.github.io/chacara-jardim-ypiranga/admin/data/
✅ https://dreams-consult.github.io/chacara-jardim-ypiranga/admin/maps/
```

---

## 🚀 Deploy

Para fazer deploy de novas alterações:

```bash
yarn deploy
# ou
npm run deploy
```

O comando irá:
1. Fazer build do projeto (`next build`)
2. Publicar o diretório `/out` na branch `gh-pages`
3. GitHub Pages atualiza automaticamente em alguns minutos

---

## 🔧 Desenvolvimento Local

Para rodar localmente (sem o prefixo `/chacara-jardim-ypiranga`):

```bash
yarn dev
# ou
npm run dev
```

Acesse em:
```
http://localhost:3000/
```

**Nota:** No ambiente local, o `basePath` é automaticamente desabilitado para facilitar o desenvolvimento.

---

## 💾 Sistema de Armazenamento

O projeto usa **localStorage** para persistir dados. Isso significa:

- ✅ Dados ficam salvos no navegador
- ✅ Não precisa de banco de dados
- ⚠️ Dados são isolados por domínio (localhost ≠ GitHub Pages)
- ⚠️ Dados podem ser perdidos se limpar cache do navegador

**Solução:** Use o sistema de Exportar/Importar para transferir dados entre ambientes.

---

## 📝 Próximos Passos (APIs)

Futuramente, o sistema será integrado com APIs para:
- Persistência permanente em banco de dados
- Sincronização entre dispositivos
- Backup automático
- Sistema de autenticação

Por enquanto, o localStorage serve como solução temporária para testes.
