# Suporte a PDFs Pesados

Este documento descreve as configurações necessárias para suportar PDFs mais pesados no sistema.

## Configurações Implementadas

### 1. Limites de Arquivo Frontend

**Arquivos modificados:**
- `components/MapDetails.tsx`
- `app/admin/import-map/page.tsx`

**Limites configurados:**
- **Imagens**: até 10MB
- **PDFs**: até 50MB

### 2. Timeouts de Request

**Timeout configurado:** 120 segundos (120000ms)

Aplicado em:
- Upload de imagem no MapDetails
- Upload de imagem no ImportMap

### 3. Next.js Body Size Limit

**Arquivo:** `next.config.ts`

```typescript
experimental: {
  serverActions: {
    bodySizeLimit: '50mb',
  },
}
```

## Configurações Adicionais Necessárias

### 4. MySQL/MariaDB

**Problema:** O campo `image_url` no banco pode ter limite de tamanho.

**Solução:** Verificar e ajustar o tipo da coluna:

```sql
-- Ver tipo atual
DESCRIBE maps;

-- Se for VARCHAR ou TEXT, alterar para LONGTEXT
ALTER TABLE maps MODIFY COLUMN image_url LONGTEXT;
ALTER TABLE maps MODIFY COLUMN image_type VARCHAR(50);
```

**Tipos de dados MySQL para Base64:**
- `TEXT`: ~64KB
- `MEDIUMTEXT`: ~16MB
- `LONGTEXT`: ~4GB

### 5. Nginx (se usar proxy reverso)

Adicionar no arquivo de configuração:

```nginx
# Aumentar limite de upload
client_max_body_size 50M;

# Aumentar timeouts
proxy_connect_timeout 120s;
proxy_send_timeout 120s;
proxy_read_timeout 120s;
```

### 6. Apache (se usar)

Adicionar no `.htaccess` ou `httpd.conf`:

```apache
# Aumentar limite de upload
LimitRequestBody 52428800

# Aumentar timeout
Timeout 120
```

### 7. Variáveis de Ambiente PHP (se usar)

Se houver algum middleware PHP:

```ini
upload_max_filesize = 50M
post_max_size = 50M
max_execution_time = 120
max_input_time = 120
memory_limit = 256M
```

### 8. Node.js Process

Se necessário, aumentar limite de memória do Node:

```bash
# No script de start
node --max-old-space-size=4096 .next/standalone/server.js
```

Ou no `package.json`:

```json
"scripts": {
  "start": "NODE_OPTIONS='--max-old-space-size=4096' next start"
}
```

## Performance e Otimização

### Conversão de PDF

O componente `InteractiveMap.tsx` converte PDFs para imagens usando `pdfjs-dist`:

**Configurações atuais:**
- Escala: 2x (para boa qualidade)
- Formato de saída: PNG
- Apenas primeira página renderizada

**Otimizações possíveis:**

1. **Reduzir escala para PDFs grandes:**
```typescript
const scale = file.size > 10 * 1024 * 1024 ? 1.5 : 2;
```

2. **Usar WebP em vez de PNG:**
```typescript
const imageData = canvas.toDataURL('image/webp', 0.9);
```

3. **Implementar cache do PDF convertido:**
```typescript
localStorage.setItem(`pdf-cache-${mapId}`, imageData);
```

### Compressão

Considerar compressão de imagens antes do upload:

```typescript
// Exemplo de compressão
import imageCompression from 'browser-image-compression';

const options = {
  maxSizeMB: 10,
  maxWidthOrHeight: 4096,
  useWebWorker: true,
};

const compressedFile = await imageCompression(imageFile, options);
```

## Troubleshooting

### Erro: "Request Entity Too Large"
- Verificar limites do Nginx/Apache
- Verificar `bodySizeLimit` do Next.js

### Erro: "Data truncated for column 'image_url'"
- Alterar coluna para `LONGTEXT` no MySQL

### Erro: "Timeout"
- Aumentar timeout do axios
- Aumentar timeout do proxy reverso
- Verificar processamento assíncrono

### PDF não renderiza
- Verificar se `pdfjs-dist` está instalado: `npm list pdfjs-dist`
- Verificar console do navegador
- Testar com PDF menor primeiro

### Alto uso de memória
- Reduzir escala de renderização
- Implementar liberação de memória após conversão
- Usar Web Workers para conversão

## Monitoramento

Adicionar logs para monitorar uploads:

```typescript
console.log(`[Upload] Tamanho: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
console.log(`[Upload] Tipo: ${file.type}`);
console.log(`[Conversão] Tempo: ${conversionTime}ms`);
```

## Recomendações

1. **Limitar tamanho na UI**: Mostrar aviso se PDF > 20MB
2. **Progresso de upload**: Adicionar barra de progresso
3. **Validação prévia**: Verificar PDF válido antes de enviar
4. **Fallback**: Permitir URL externa em vez de upload
5. **Compressão server-side**: Comprimir imagem no backend antes de salvar no DB
