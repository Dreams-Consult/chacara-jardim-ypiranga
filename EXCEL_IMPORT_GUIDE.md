# Guia de Importação via Excel

Este documento explica como importar loteamentos usando planilhas Excel (.xlsx).

## 📋 Estrutura da Planilha

A planilha deve conter:

1. **Aba "Info"** - Informações gerais do loteamento
2. **Demais abas** - Uma aba para cada quadra

---

## 📊 Aba "Info"

Esta aba deve conter as informações gerais do loteamento.

### Estrutura:

| Coluna A | Coluna B |
|----------|----------|
| Nome do Loteamento | Chácara Jardim Ypiranga |

**Exemplo:**

```
A1: Nome do Loteamento    B1: Meu Loteamento Exemplo
```

---

## 🏘️ Abas de Quadras

Cada aba representa uma quadra. O **nome da aba** será o **nome da quadra**.

### Colunas Obrigatórias:

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| **Número** ou **Lote** | Número do lote | 01, 02, 03... |
| **Status** | Status do lote | disponível, reservado, vendido, bloqueado |
| **Preço** ou **Preco** | Valor do lote | 50000 ou R$ 50.000,00 |
| **Área** ou **Area** | Tamanho em m² | 250 ou 250.5 |

### Colunas Opcionais:

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| **Descrição** ou **Descricao** | Texto descritivo do lote | Lote de esquina |
| **Características** ou **Caracteristicas** | Lista separada por vírgulas | Esquina, Frente norte |

### Colunas para Lotes Reservados/Vendidos:

Quando o **Status** for `reservado` ou `vendido`, as seguintes colunas são necessárias:

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| **Cliente** | Nome completo | João da Silva |
| **Email** | Email do cliente | joao@email.com |
| **Telefone** | Telefone com DDD | (11) 98765-4321 |
| **CPF** | CPF do cliente (opcional) | 12345678900 |
| **Endereço** ou **Endereco** | Endereço completo (opcional) | Rua A, 123 - São Paulo/SP |
| **Pagamento** | Forma de pagamento | dinheiro, financiamento, parcelado |
| **Observações** ou **Observacoes** | Notas adicionais (opcional) | Cliente aprovado |

---

## ✅ Status Aceitos

O sistema aceita os seguintes valores para a coluna **Status** (case-insensitive):

### Disponível:
- `disponivel`
- `disponível`
- `livre`
- `available`

### Reservado:
- `reservado`
- `reserved`

### Vendido:
- `vendido`
- `sold`

### Bloqueado:
- `bloqueado`
- `blocked`

---

## 💰 Formas de Pagamento Aceitas

Para a coluna **Pagamento** (case-insensitive):

### À Vista:
- `dinheiro`
- `à vista`
- `avista`
- `cash`

### Financiamento:
- `financiamento`
- `financing`

### Parcelado:
- `parcelado`
- `parcelas`
- `installments`

---

## 📝 Exemplo de Planilha

### Aba "Info":

| A | B |
|---|---|
| Nome do Loteamento | Loteamento Jardim das Flores |

### Aba "Quadra A":

| Número | Status | Preço | Área | Descrição | Características | Cliente | Email | Telefone | CPF | Pagamento | Observações |
|--------|--------|-------|------|-----------|----------------|---------|-------|----------|-----|-----------|-------------|
| 01 | disponível | 50000 | 250 | Lote de esquina | Esquina, Frente norte | | | | | | |
| 02 | reservado | 45000 | 240 | Lote reservado | Meio de quadra | João Silva | joao@email.com | (11) 98765-4321 | 12345678900 | financiamento | Aprovado pelo banco |
| 03 | vendido | 48000 | 260 | Lote vendido | Frente sul | Maria Santos | maria@email.com | (11) 91234-5678 | 98765432100 | dinheiro | Pagamento à vista |
| 04 | bloqueado | 47000 | 240 | Em manutenção | | | | | | | |

### Aba "Quadra B":

| Número | Status | Preço | Área | Descrição |
|--------|--------|-------|------|-----------|
| 01 | disponível | 55000 | 280 | Lote amplo |
| 02 | disponível | 52000 | 270 | Boa localização |
| 03 | disponível | 50000 | 250 | Próximo à entrada |

---

## 🚀 Como Importar

1. **Prepare sua planilha** seguindo a estrutura acima
2. Acesse a página de importação: `/admin/import-map`
3. Selecione **"Planilha Excel"** como tipo de importação
4. Faça upload do arquivo `.xlsx`
5. O sistema converterá automaticamente para JSON
6. **Revise o JSON gerado** no editor de texto
7. Clique em **"Importar Loteamento"**
8. Aguarde o processamento

---

## ⚠️ Validações Importantes

### Obrigatório:
- ✅ Nome do loteamento na aba "Info"
- ✅ Pelo menos uma quadra (aba adicional)
- ✅ Colunas: Número, Status, Preço, Área

### Para lotes reservados/vendidos:
- ✅ Nome do cliente
- ✅ Telefone do cliente
- ⚠️ Email recomendado

### Formatação de valores:
- 💵 **Preço**: Aceita `50000`, `R$ 50.000,00`, `50.000,00`
- 📐 **Área**: Aceita `250`, `250.5`, `250,5 m²`
- 📱 **Telefone**: Formato livre: `(11) 98765-4321`, `11987654321`, etc.
- 🆔 **CPF**: Apenas números (11 dígitos) ou formatado `123.456.789-00`

---

## 🔍 Dicas

1. **Teste com poucos dados primeiro**: Crie uma planilha com 1-2 lotes para testar
2. **Copie o cabeçalho**: Use sempre os mesmos nomes de colunas
3. **Status e Pagamento**: Use sempre minúsculas para evitar erros
4. **Revise o JSON**: Antes de importar, revise o JSON gerado no editor
5. **Backup**: Sempre tenha um backup da planilha original

---

## 🐛 Solução de Problemas

### Erro: "Nome do mapa é obrigatório"
- Verifique se a aba "Info" existe
- Confirme que a célula A1 contém "Nome do Loteamento"
- Certifique-se de que B1 não está vazia

### Erro: "Pelo menos uma quadra é obrigatória"
- Verifique se há pelo menos uma aba além de "Info"
- Certifique-se de que a aba tem dados de lotes

### Lotes não aparecem
- Verifique se a coluna "Número" ou "Lote" está preenchida
- Confirme que as colunas obrigatórias existem
- Revise se há erros de digitação nos nomes das colunas

### Reservas não criadas
- Para status `reservado` ou `vendido`, preencha Cliente e Telefone
- Verifique se o nome das colunas está correto

---

## 📦 Exportar Modelo

Você pode gerar uma planilha modelo automaticamente executando:

```bash
npm run generate:excel
```

Isso criará o arquivo `template-importacao-loteamento.xlsx` na raiz do projeto com:
- ✅ Estrutura completa das abas
- ✅ Exemplos de lotes disponíveis
- ✅ Exemplos de lotes reservados/vendidos
- ✅ Instruções detalhadas
- ✅ Cabeçalhos prontos para uso

Ou você pode criar manualmente seguindo esta estrutura:

**Aba "Info":**
```
Nome do Loteamento | [Nome do seu loteamento]
```

**Aba "Quadra A":**
```
Número | Status | Preço | Área | Descrição | Características | Cliente | Email | Telefone | CPF | Pagamento | Observações
01 | disponível | 50000 | 250 | Lote de esquina | Esquina | | | | | |
```

---

## 📚 Referências

- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Documentação da API
- [IMPORT_WITH_RESERVATIONS.md](./IMPORT_WITH_RESERVATIONS.md) - Importação JSON com reservas
- [database-update.sql](./database-update.sql) - Schema do banco de dados
