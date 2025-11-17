# 🔍 Validação de Disponibilidade de Lote

## Visão Geral

Endpoint para verificar se um lote está disponível antes de processar uma reserva.
Previne **reservas duplicadas** e melhora a experiência do usuário.

---

## 📍 Endpoint

```
GET /api/lots/valido?idLote={loteId}
```

**Backend (n8n):**
```
GET {API_URL}/mapas/lotes/valido?idLote={loteId}
```

---

## 📥 Request

### Query Parameters

| Parâmetro | Tipo   | Obrigatório | Descrição                    |
|-----------|--------|-------------|------------------------------|
| `idLote`  | string | ✅ Sim      | ID único do lote a verificar |

### Exemplo

```bash
GET /api/lots/valido?idLote=1730678400000
```

---

## 📤 Response

### Estrutura da Resposta

```typescript
{
  isAvailable: 0 | 1  // 0 = indisponível, 1 = disponível
}
```

### Exemplos

**✅ Lote Disponível**
```json
{
  "isAvailable": 1
}
```

**❌ Lote Indisponível**
```json
{
  "isAvailable": 0
}
```

---

## 🔢 Códigos de Status

| Código | Descrição                                    |
|--------|----------------------------------------------|
| 200    | ✅ Verificação realizada com sucesso         |
| 400    | ❌ Parâmetro `idLote` não fornecido          |
| 500    | ❌ Erro interno ao verificar disponibilidade |

---

## 🚀 Implementação Frontend

### Hook usePurchaseForm.ts

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError(null);

  // 1. Validar CPFs
  if (!validateCPF(formData.customerCPF)) {
    setError('CPF do cliente inválido');
    setIsSubmitting(false);
    return;
  }

  if (!validateCPF(formData.sellerCPF)) {
    setError('CPF do vendedor inválido');
    setIsSubmitting(false);
    return;
  }

  try {
    // 2. 🔍 VERIFICAR DISPONIBILIDADE DO LOTE
    console.log(`🔍 Verificando lote ${lot.id}...`);

    const checkResponse = await axios.get(`/api/lots/valido?idLote=${lot.id}`);

    if (checkResponse.data.isAvailable === 0) {
      setError('Este lote não está mais disponível. Escolha outro lote.');
      setIsSubmitting(false);
      return;
    }

    console.log(`✅ Lote ${lot.id} disponível, prosseguindo...`);

    // 3. Enviar reserva
    const response = await axios.post(`${API_URL}/mapas/lotes/reservar`, requestData);

    onSuccess();
  } catch (err) {
    // Tratamento de erros...
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 🔧 Implementação Backend (n8n)

### Workflow Recomendado

```
┌─────────────────────────────────────────────────┐
│ 1. Webhook GET /mapas/lotes/valido             │
│    - Recebe: idLote (query param)              │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 2. MySQL Query                                  │
│    SELECT status FROM lots WHERE id = :idLote  │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 3. Verificar Status                             │
│    IF status = 'available'                      │
│      → isAvailable = 1                          │
│    ELSE                                         │
│      → isAvailable = 0                          │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 4. Response                                     │
│    { "isAvailable": 0 | 1 }                     │
└─────────────────────────────────────────────────┘
```

### Query SQL

```sql
SELECT
  CASE
    WHEN status = 'available' THEN 1
    ELSE 0
  END AS isAvailable
FROM lots
WHERE id = {{ $json.query.idLote }};
```

### Alternativa com IF no n8n

```javascript
// No nó "Function" do n8n
const status = $input.first().json.status;

return [{
  json: {
    isAvailable: status === 'available' ? 1 : 0
  }
}];
```

---

## 🎯 Casos de Uso

### Caso 1: Lote Disponível ✅

**Request:**
```
GET /api/lots/valido?idLote=123456
```

**Backend verifica:**
- Lote existe ✅
- Status = 'available' ✅

**Response:**
```json
{ "isAvailable": 1 }
```

**Frontend:**
- ✅ Prossegue com a reserva
- Envia POST para `/mapas/lotes/reservar`

---

### Caso 2: Lote Já Reservado ❌

**Request:**
```
GET /api/lots/valido?idLote=123456
```

**Backend verifica:**
- Lote existe ✅
- Status = 'reserved' ❌

**Response:**
```json
{ "isAvailable": 0 }
```

**Frontend:**
- ❌ Cancela a operação
- Exibe: "Este lote não está mais disponível. Por favor, escolha outro lote."
- Usuário NÃO perde os dados preenchidos

---

### Caso 3: Lote Não Existe ❌

**Request:**
```
GET /api/lots/valido?idLote=999999
```

**Backend verifica:**
- Lote não encontrado ❌

**Response:**
```json
{ "isAvailable": 0 }
```

**Frontend:**
- ❌ Cancela a operação
- Exibe mensagem de erro

---

## 🛡️ Segurança

### Validações Backend

```sql
-- 1. Verificar se ID é válido
WHERE id = :idLote AND id REGEXP '^[0-9]+$'

-- 2. Verificar se não está deletado (se usar soft delete)
WHERE id = :idLote AND deleted_at IS NULL

-- 3. Verificar se pertence ao mapa correto
WHERE id = :idLote AND map_id = :mapId
```

### Rate Limiting

Implementar no n8n ou usar Redis:
- **10 requests por minuto** por IP
- **50 requests por hora** por IP

---

## 📊 Logs e Monitoramento

### Frontend Console Logs

```
[usePurchaseForm] 🔍 Verificando disponibilidade do lote 123456...
[usePurchaseForm] ✅ Lote 123456 está disponível, prosseguindo com a reserva...
[usePurchaseForm] ✅ Reserva enviada com sucesso
```

ou

```
[usePurchaseForm] 🔍 Verificando disponibilidade do lote 123456...
[usePurchaseForm] ❌ Lote 123456 não está disponível
```

### Backend Logs (n8n)

```
[Webhook] GET /mapas/lotes/valido?idLote=123456
[MySQL] Query executada: SELECT status FROM lots WHERE id = '123456'
[MySQL] Resultado: status = 'available'
[Response] { "isAvailable": 1 }
```

---

## 🧪 Testes

### Teste Manual com cURL

```bash
# Teste 1: Lote disponível
curl -X GET "http://localhost:3001/api/lots/valido?idLote=1730678400000"

# Teste 2: Lote inexistente
curl -X GET "http://localhost:3001/api/lots/valido?idLote=999999"

# Teste 3: Sem parâmetro (deve retornar erro 400)
curl -X GET "http://localhost:3001/api/lots/valido"
```

### Teste com Postman

1. **Método:** GET
2. **URL:** `http://localhost:3001/api/lots/valido`
3. **Query Params:**
   - Key: `idLote`
   - Value: `1730678400000`

### Teste com JavaScript

```javascript
// Teste unitário
describe('checkLotAvailability', () => {
  it('deve retornar true para lote disponível', async () => {
    const response = await fetch('/api/lots/valido?idLote=123');
    const data = await response.json();
    expect(data.isAvailable).toBe(1);
  });

  it('deve retornar false para lote indisponível', async () => {
    const response = await fetch('/api/lots/valido?idLote=456');
    const data = await response.json();
    expect(data.isAvailable).toBe(0);
  });
});
```

---

## 🔄 Fluxo Completo de Reserva

```
┌──────────────────────────────────────────────────┐
│ 1. Usuário preenche formulário                  │
│    - Dados do cliente                            │
│    - Dados do vendedor                           │
│    - Mensagem (opcional)                         │
└───────────────────┬──────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│ 2. Validações Frontend                           │
│    ✅ CPF cliente (matemática + formato)         │
│    ✅ CPF vendedor (matemática + formato)        │
│    ✅ Email válido                               │
│    ✅ Telefone com máscara                       │
└───────────────────┬──────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│ 3. 🔍 Verificar Disponibilidade                  │
│    GET /api/lots/valido?idLote={id}             │
└───────────────────┬──────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
   isAvailable=0          isAvailable=1
        │                       │
        ▼                       ▼
┌──────────────────┐   ┌──────────────────────────┐
│ ❌ Mostrar Erro  │   │ 4. Enviar Reserva        │
│ Cancelar         │   │ POST /mapas/lotes/reservar│
└──────────────────┘   └───────────┬───────────────┘
                                   │
                                   ▼
                        ┌──────────────────────────┐
                        │ 5. Backend Processa      │
                        │ - Valida novamente       │
                        │ - Salva purchase_request │
                        │ - Atualiza lots          │
                        └───────────┬───────────────┘
                                   │
                                   ▼
                        ┌──────────────────────────┐
                        │ 6. ✅ Sucesso            │
                        │ - Fecha modal            │
                        │ - Recarrega dados        │
                        │ - Mantém mapa selecionado│
                        └──────────────────────────┘
```

---

## ⚠️ Observações Importantes

1. **Race Condition:** Mesmo com validação prévia, pode haver race condition entre a verificação e a reserva. O backend DEVE validar novamente no endpoint de reserva.

2. **Timeout:** A verificação tem timeout de 10 segundos (padrão do axios no hook).

3. **Cache:** Use `cache: 'no-store'` no fetch para garantir dados atualizados.

4. **Feedback ao Usuário:** Sempre mostre mensagem clara quando o lote não estiver disponível.

5. **Double Check:** Backend deve validar disponibilidade tanto em `/valido` quanto em `/reservar`.

---

## 📝 Checklist de Implementação

### Frontend ✅
- [x] Criar endpoint `/api/lots/valido/route.ts`
- [x] Adicionar verificação em `usePurchaseForm.ts`
- [x] Tratar erro de indisponibilidade
- [x] Adicionar logs console
- [x] Melhorar feedback visual

### Backend (n8n) ⏳
- [ ] Criar workflow GET `/mapas/lotes/valido`
- [ ] Adicionar query SQL no MySQL
- [ ] Retornar `{ isAvailable: 0 | 1 }`
- [ ] Validar parâmetro `idLote`
- [ ] Adicionar logs
- [ ] Testar com diferentes status

### Documentação ✅
- [x] Documentar endpoint
- [x] Adicionar exemplos de uso
- [x] Documentar fluxo completo
- [x] Criar guia de implementação backend

---

## 🎓 Referências

- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Documentação completa da API
- [usePurchaseForm.ts](./hooks/usePurchaseForm.ts) - Hook de formulário de compra
- [route.ts](./app/api/lots/valido/route.ts) - Implementação do endpoint
- [database-update.sql](./database-update.sql) - Schema do banco de dados
