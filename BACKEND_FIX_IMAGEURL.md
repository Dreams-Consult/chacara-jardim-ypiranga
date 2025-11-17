# 🔧 Correção Necessária no Backend - ImageUrl

## Problema Identificado

O endpoint `GET /mapas/lotes?mapId={id}` **NÃO está retornando o campo `imageUrl`**, o que impede a renderização da imagem do mapa na página de gerenciamento de lotes.

## Diagnóstico

### Logs do Frontend:
```
=== DEBUG LOAD DATA ===
Dados recebidos: {...}
ImageUrl recebida: undefined  ← PROBLEMA AQUI
Tipo de imageUrl: undefined
Tamanho da imageUrl: 0
```

### Resposta Atual do Backend:
```json
{
  "mapId": "1762455471299",
  "name": "Mapa 1762455471299",
  "description": "",
  "imageUrl": null,  ← OU undefined, ou campo ausente
  "lots": []
}
```

### Resposta Esperada:
```json
{
  "mapId": "1762455471299",
  "name": "Mapa 1762455471299",
  "description": "",
  "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...",  ← DEVE CONTER A IMAGEM EM BASE64
  "width": 1920,
  "height": 1080,
  "createdAt": "2025-11-06T18:01:10.000Z",
  "updatedAt": "2025-11-06T18:01:10.000Z",
  "lots": []
}
```

## Solução

### 1. Verificar se o campo `imageUrl` existe no banco de dados

Execute uma query para verificar se o mapa tem a imagem salva:

```sql
SELECT mapId, name, imageUrl, width, height
FROM maps
WHERE mapId = '1762455471299';
```

Se o campo `imageUrl` estiver vazio ou NULL, você precisa:
- Criar um novo mapa com imagem via `/admin/maps`
- Ou atualizar o mapa existente com uma imagem

### 2. Corrigir a Query do Endpoint

O endpoint `GET /mapas/lotes` deve incluir o campo `imageUrl` no SELECT:

```sql
-- Exemplo de query correta
SELECT
  m.mapId,
  m.name,
  m.description,
  m.imageUrl,      -- ← CERTIFIQUE-SE QUE ESTÁ INCLUÍDO
  m.width,
  m.height,
  m.createdAt,
  m.updatedAt
FROM maps m
WHERE m.mapId = ?
```

### 3. Verificar o Mapeamento da Resposta

Se você estiver usando algum ORM ou mapeador de objetos, certifique-se de que o campo `imageUrl` está sendo incluído no objeto de resposta.

#### Exemplo em Node.js (Express):

```javascript
app.get('/mapas/lotes', async (req, res) => {
  const { mapId } = req.query;

  // Buscar mapa com imageUrl
  const map = await db.query(
    'SELECT mapId, name, description, imageUrl, width, height, createdAt, updatedAt FROM maps WHERE mapId = ?',
    [mapId]
  );

  // Buscar lotes
  const lots = await db.query(
    'SELECT * FROM lots WHERE mapId = ?',
    [mapId]
  );

  // Retornar resposta completa
  res.json({
    mapId: map[0].mapId,
    name: map[0].name,
    description: map[0].description,
    imageUrl: map[0].imageUrl,  // ← ESSENCIAL
    width: map[0].width,
    height: map[0].height,
    createdAt: map[0].createdAt,
    updatedAt: map[0].updatedAt,
    lots: lots
  });
});
```

### 4. Testar a Resposta

Após a correção, teste o endpoint diretamente:

```bash
curl "http://localhost:5678/webhook-test/loteamento/mapas/lotes?mapId=1762455471299"
```

A resposta deve incluir:
```json
{
  "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

## Verificação Adicional

### Tamanho da ImageUrl

A string Base64 de uma imagem costuma ser muito grande. Verifique se:

1. **O banco de dados suporta campos grandes**
   - Use `LONGTEXT` no MySQL
   - Use `TEXT` ou `CLOB` em outros bancos

2. **Não há limite de tamanho na resposta HTTP**
   - Verifique se não há middleware truncando a resposta

3. **A imagem foi salva corretamente**
   - Teste criando um novo mapa via `/admin/maps`
   - Faça upload de uma imagem pequena (< 1MB) para teste

## Como Testar se Funcionou

1. Corrija o backend conforme as instruções acima
2. Acesse: `http://localhost:3000/admin/lot-management?mapId=SEU_MAP_ID`
3. Abra o Console do navegador (F12)
4. Você **NÃO** deve ver mais:
   ```
   ImageUrl recebida: undefined
   ```
5. A imagem do mapa deve aparecer no lugar do placeholder

## Checklist de Verificação

- [ ] Campo `imageUrl` existe no banco de dados
- [ ] Campo `imageUrl` é do tipo `LONGTEXT` (MySQL) ou equivalente
- [ ] Query SQL inclui `SELECT imageUrl`
- [ ] Mapeamento da resposta inclui `imageUrl`
- [ ] Endpoint retorna `imageUrl` com Base64 completo
- [ ] Teste com `curl` ou Postman confirma presença do campo
- [ ] Frontend renderiza a imagem corretamente

## Referência

Veja `API_REQUESTS.md` linhas 170-250 para detalhes completos da estrutura esperada.
