# Guia Rápido - Setup Inicial

## ✅ Plataforma pronta e funcionando!

O servidor está rodando em: **http://localhost:3000**

## 📍 Estrutura de URLs

- **Página Pública**: http://localhost:3000
- **Admin - Gerenciar Mapas**: http://localhost:3000/admin/maps
- **Admin - Gerenciar Lotes**: http://localhost:3000/admin/lots/[mapId]

## 🚀 Primeiros Passos

### 1. Acessar Painel Admin
Abra seu navegador e vá para:
```
http://localhost:3000/admin/maps
```

### 2. Fazer Upload do Mapa
1. Clique em **"Novo Mapa"**
2. Preencha:
   - **Nome**: "Chácara Jardim Ypiranga - Projeto 02"
   - **Descrição**: "Loteamento com XX lotes disponíveis"
3. Clique em **"Upload de Imagem ou PDF"**
4. Selecione o arquivo: `/home/maiasb/codes/dreams/teste-chacara-copilot/lot-mapping-platform/NOVO PROJETO REVISADO 02 IMAGEM -Model.pdf`

> **Nota**: Se o PDF não funcionar diretamente, converta para imagem primeiro:
> - Abra o PDF em um visualizador
> - Tire um screenshot em alta resolução
> - Ou use ferramentas como: `pdftoppm`, `ImageMagick`, etc.

### 3. Criar Lotes no Mapa
1. Após upload, clique em **"Gerenciar Lotes"** no card do mapa
2. Clique em **"Novo Lote"**
3. Preencha as informações:
   ```
   Número: 01
   Área: 300 (m²)
   Preço: 50000
   Status: Disponível
   Descrição: Lote com vista para...
   Características: Água, Luz, Portaria
   ```
4. **IMPORTANTE**: Clique nos cantos do lote no mapa para desenhar a área
   - Mínimo 3 pontos
   - Clique para adicionar cada ponto
   - O polígono será desenhado automaticamente
5. Clique em **"Finalizar Área"**
6. Clique em **"Salvar"**
7. Repita para todos os lotes

### 4. Testar na Página Pública
1. Vá para http://localhost:3000
2. Você verá o mapa interativo com os lotes coloridos
3. Passe o mouse sobre os lotes para ver informações
4. Clique em um lote disponível (verde) para abrir o formulário de interesse

## 🎨 Dicas para Desenhar Áreas

### Ordem recomendada dos cliques:
1. Canto superior esquerdo do lote
2. Canto superior direito
3. Canto inferior direito
4. Canto inferior esquerdo
5. (Clique em "Finalizar Área" - não precisa fechar o polígono)

### Se errar:
- Clique em **"Cancelar"** para recomeçar
- Ou edite o lote depois

## 🔄 Fluxo de Trabalho Completo

```
1. Upload do Mapa
   ↓
2. Criar Lotes (desenhar áreas)
   ↓
3. Configurar preços e informações
   ↓
4. Publicar (compartilhar URL pública)
   ↓
5. Receber interessados
   ↓
6. Atualizar status (Reservado/Vendido)
```

## 📊 Visualizar Interessados

Os dados ficam no localStorage. Para ver:

1. Abra o **DevTools** (F12)
2. Vá na aba **Console**
3. Digite:
```javascript
JSON.parse(localStorage.getItem('lot_platform_purchases'))
```

Ou crie uma função helper:
```javascript
function verInteressados() {
  const purchases = JSON.parse(localStorage.getItem('lot_platform_purchases')) || [];
  console.table(purchases);
}
verInteressados();
```

## ⚠️ Notas Importantes

1. **Dados no localStorage**:
   - Os dados são salvos no navegador
   - Não limpe o cache/cookies do navegador
   - Para produção, implemente um backend

2. **Qualidade da Imagem**:
   - Use imagens de alta resolução
   - PDFs podem ter limitações
   - Recomendado: PNG ou JPG de boa qualidade

3. **Precisão das Áreas**:
   - Zoom no navegador pode ajudar
   - Desenhe com calma
   - Pode editar depois se necessário

## 🐛 Solução de Problemas

### PDF não aparece
- Converta para imagem (PNG/JPG)
- Use ferramenta online ou:
```bash
pdftoppm -png -r 300 "NOVO PROJETO REVISADO 02 IMAGEM -Model.pdf" mapa
```

### Não consigo clicar no mapa
- Verifique se está no modo "Novo Lote" ou "Editar"
- Recarregue a página
- Limpe o cache do navegador

### Lotes não aparecem coloridos
- Verifique se a área foi desenhada (mínimo 3 pontos)
- Verifique se o lote foi salvo
- Recarregue a página

## 📞 Próximo Passo

Depois de criar alguns lotes de teste:
1. Teste a página pública
2. Simule um interesse
3. Verifique os dados salvos
4. Ajuste cores, textos e layouts conforme necessário

---

**Status**: ✅ Sistema funcionando em http://localhost:3000

Para parar o servidor: `Ctrl+C` no terminal
Para reiniciar: `npm run dev`
