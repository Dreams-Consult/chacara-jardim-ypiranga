# Template Excel - Importação de Loteamento

Este arquivo serve como modelo para importação de loteamentos via Excel.

## 📥 Gerar Planilha de Exemplo

**Forma mais fácil:**

```bash
npm run generate:excel
```

Isso criará automaticamente o arquivo `template-importacao-loteamento.xlsx` com:
- ✅ Aba "Info" configurada
- ✅ Quadra A com 8 lotes (exemplo completo com reservas)
- ✅ Quadra B com 5 lotes (exemplo simples)
- ✅ Aba de instruções detalhadas

## 📊 Como Criar a Planilha Manualmente

### Instruções:

1. Abra um novo arquivo no **Microsoft Excel**, **Google Sheets** ou **LibreOffice Calc**

2. **Crie a primeira aba chamada "Info"** com:
   ```
   A1: Nome do Loteamento
   B1: [Digite o nome do seu loteamento aqui]
   ```

3. **Crie abas adicionais** (uma para cada quadra):
   - Nome da aba = Nome da quadra (ex: "Quadra A", "Quadra 1", etc.)
   - Primeira linha = Cabeçalho com os nomes das colunas

4. **Preencha os dados** seguindo o modelo abaixo

---

## 📊 Estrutura das Abas de Quadras

### Cabeçalho (Primeira linha):

```
Número | Status | Preço | Área | Descrição | Características | Cliente | Email | Telefone | CPF | Pagamento | Observações
```

### Exemplo de Dados:

**Para lotes DISPONÍVEIS:**
```
01 | disponível | 50000 | 250 | Lote de esquina | Esquina, Frente norte | | | | | |
```

**Para lotes RESERVADOS:**
```
02 | reservado | 45000 | 240 | Lote reservado | Meio de quadra | João Silva | joao@email.com | (11) 98765-4321 | 12345678900 | financiamento | Cliente aprovado
```

**Para lotes VENDIDOS:**
```
03 | vendido | 48000 | 260 | Lote vendido | Frente sul | Maria Santos | maria@email.com | (11) 91234-5678 | 98765432100 | dinheiro | Pagamento à vista
```

**Para lotes BLOQUEADOS:**
```
04 | bloqueado | 47000 | 240 | Em manutenção | | | | | | |
```

---

## 🔤 Valores Aceitos

### Status:
- `disponível`, `disponivel`, `livre`, `available`
- `reservado`, `reserved`
- `vendido`, `sold`
- `bloqueado`, `blocked`

### Pagamento:
- `dinheiro`, `à vista`, `avista`, `cash`
- `financiamento`, `financing`
- `parcelado`, `parcelas`, `installments`

---

## ✅ Exemplo Completo

### Aba: Info
| A | B |
|---|---|
| Nome do Loteamento | Loteamento Jardim das Flores |

### Aba: Quadra A
| Número | Status | Preço | Área | Descrição | Características | Cliente | Email | Telefone | CPF | Pagamento | Observações |
|--------|--------|-------|------|-----------|----------------|---------|-------|----------|-----|-----------|-------------|
| 01 | disponível | 50000 | 250 | Lote de esquina | Esquina, Frente norte | | | | | | |
| 02 | reservado | 45000 | 240 | Lote reservado | Meio de quadra | João Silva | joao@email.com | (11) 98765-4321 | 12345678900 | financiamento | Aprovado pelo banco |
| 03 | vendido | 48000 | 260 | Lote vendido | Frente sul | Maria Santos | maria@email.com | (11) 91234-5678 | 98765432100 | dinheiro | Pagamento à vista |
| 04 | bloqueado | 47000 | 240 | Em manutenção | | | | | | | |
| 05 | disponível | 52000 | 270 | Próximo à entrada | Acesso fácil | | | | | | |

### Aba: Quadra B
| Número | Status | Preço | Área | Descrição | Características |
|--------|--------|-------|------|-----------|----------------|
| 01 | disponível | 55000 | 280 | Lote amplo | Frente principal |
| 02 | disponível | 52000 | 270 | Boa localização | Meio de quadra |
| 03 | disponível | 50000 | 250 | Próximo à praça | Vista privilegiada |
| 04 | disponível | 48000 | 240 | Lote padrão | |

---

## 🚀 Depois de Criar

1. Salve o arquivo como `.xlsx`
2. Acesse `/admin/import-map` no sistema
3. Selecione "Planilha Excel"
4. Faça upload do arquivo
5. Revise o JSON gerado
6. Clique em "Importar Loteamento"

---

## 💡 Dicas Importantes

✅ **Use a primeira linha para cabeçalhos** - O sistema ignora a primeira linha
✅ **Números de lotes únicos** - Cada lote deve ter um número único na quadra
✅ **Formatação de valores** - Aceita `50000`, `R$ 50.000,00`, `50.000,00`
✅ **CPF opcional** - Pode deixar em branco para lotes disponíveis
✅ **Teste primeiro** - Comece com poucos lotes para validar o formato

---

Para mais informações, consulte: [EXCEL_IMPORT_GUIDE.md](./EXCEL_IMPORT_GUIDE.md)
