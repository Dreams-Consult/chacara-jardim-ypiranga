# Scripts Utilitários

Este diretório contém scripts auxiliares para o projeto.

## 📊 generate-excel-template.js

Gera uma planilha Excel de exemplo para importação de loteamentos.

### Uso:

```bash
npm run generate:excel
```

Ou diretamente:

```bash
node scripts/generate-excel-template.js
```

### O que é gerado:

Arquivo: `template-importacao-loteamento.xlsx`

**Estrutura:**
- **Aba "Info"**: Nome do loteamento
- **Aba "Quadra A"**: 8 lotes com exemplos completos (disponíveis, reservados, vendidos, bloqueados)
- **Aba "Quadra B"**: 5 lotes com exemplos simples
- **Aba "Instruções"**: Guia completo de uso

### Conteúdo de exemplo:

**Quadra A:**
- 10 lotes disponíveis
- Preços entre R$ 45.000,00 e R$ 55.000,00
- Áreas entre 235m² e 280m²
- Exemplos de diferentes descrições e características

**Quadra B:**
- 8 lotes disponíveis
- Preços entre R$ 48.000,00 e R$ 55.000,00
- Áreas entre 240m² e 280m²
- Exemplos variados de localização

**✨ Modelo simplificado**: Todos os lotes estão com status "disponível", facilitando a customização para seu loteamento.

### Para que serve:

1. **Modelo de referência**: Base para criar suas próprias planilhas
2. **Teste de importação**: Validar o sistema com dados de exemplo
3. **Documentação prática**: Ver exemplos reais de formatação

### Após gerar:

1. Abra o arquivo gerado
2. Edite conforme suas necessidades
3. Salve com novo nome
4. Importe em `/admin/import-map`

---

## 🔧 Adicionar Novos Scripts

Para adicionar um novo script:

1. Crie o arquivo `.js` neste diretório
2. Adicione comando no `package.json`:
   ```json
   "scripts": {
     "seu-comando": "node scripts/seu-script.js"
   }
   ```
3. Documente aqui no README

---

## 📚 Referências

- [EXCEL_IMPORT_GUIDE.md](../EXCEL_IMPORT_GUIDE.md) - Guia completo de importação
- [EXCEL_TEMPLATE.md](../EXCEL_TEMPLATE.md) - Template e estrutura
