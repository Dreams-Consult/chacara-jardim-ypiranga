# 🔒 Migração para Variáveis de Ambiente

## ✅ Concluído com Sucesso!

Este documento detalha a migração das credenciais do banco de dados de valores hardcoded para variáveis de ambiente.

## 📊 Resumo das Mudanças

### Arquivos Criados
1. **`.env.local`** - Arquivo com credenciais reais (NÃO commitado)
2. **`.env.example`** - Template de exemplo (pode ser commitado)
3. **`lib/db.ts`** - Módulo centralizado de configuração do banco

### Arquivos Modificados
- **28 arquivos de API** atualizados
- **1 arquivo de configuração** (next.config.ts)
- **1 arquivo de documentação** (README.md)

## 🎯 Estrutura de Arquivos

### lib/db.ts (Novo)
```typescript
import mysql from 'mysql2/promise';

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vale_dos_carajas',
};

export async function createConnection() {
  return await mysql.createConnection(dbConfig);
}

export async function executeQuery<T = any>(
  query: string,
  params?: any[]
): Promise<T> {
  const connection = await createConnection();
  try {
    const [rows] = await connection.execute(query, params);
    return rows as T;
  } finally {
    await connection.end();
  }
}
```

### .env.local (Não commitado)
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=ForTheHorde!
DB_NAME=vale_dos_carajas
NEXT_PUBLIC_API_URL=/api
```

### .env.example (Template)
```env
DB_HOST=your_production_host
DB_PORT=3306
DB_USER=your_production_user
DB_PASSWORD=your_production_password
DB_NAME=vale_dos_carajas
NEXT_PUBLIC_API_URL=/api
```

## 📁 Arquivos de API Atualizados (28 total)

### Usuários (6 arquivos)
- ✅ `app/api/usuarios/route.ts`
- ✅ `app/api/usuarios/role/route.ts`
- ✅ `app/api/usuarios/criar/route.ts`
- ✅ `app/api/usuarios/login/route.ts`
- ✅ `app/api/usuarios/aprovar/route.ts`
- ✅ `app/api/usuarios/atualizar/[id]/route.ts`

### Reservas (3 arquivos)
- ✅ `app/api/reservas/route.ts`
- ✅ `app/api/reservas/atualizar/route.ts`
- ✅ `app/api/reserva/confirmacao/route.ts`

### Senha (1 arquivo)
- ✅ `app/api/password/update/route.ts`

### Mapas Principais (8 arquivos)
- ✅ `app/api/mapas/route.ts`
- ✅ `app/api/mapas/completo/route.ts`
- ✅ `app/api/mapas/verificar-lotes-reservados/route.ts`
- ✅ `app/api/mapas/importar/route.ts`
- ✅ `app/api/mapas/deletar/route.ts`
- ✅ `app/api/mapas/criar/route.ts`
- ✅ `app/api/mapas/atualizar-imagem/route.ts`
- ✅ `app/api/mapas/atualizar/route.ts`

### Quadras (4 arquivos)
- ✅ `app/api/mapas/quadras/route.ts`
- ✅ `app/api/mapas/quadras/deletar/route.ts`
- ✅ `app/api/mapas/quadras/criar/route.ts`
- ✅ `app/api/mapas/quadras/atualizar/route.ts`

### Lotes (6 arquivos)
- ✅ `app/api/mapas/lotes/criar/route.ts`
- ✅ `app/api/mapas/lotes/route.ts`
- ✅ `app/api/mapas/lotes/valido/route.ts`
- ✅ `app/api/mapas/lotes/reservar/route.ts`
- ✅ `app/api/mapas/lotes/deletar/route.ts`
- ✅ `app/api/mapas/lotes/atualizar/route.ts`

## 🔄 Padrão de Mudança

### Antes (Hardcoded)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'maia',
  password: 'ForTheHorde!',
  database: 'vale_dos_carajas',
};
```

### Depois (Variáveis de Ambiente)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { dbConfig } from '@/lib/db';
```

## 🛡️ Segurança

### Proteções Implementadas
1. ✅ `.env.local` adicionado ao `.gitignore`
2. ✅ `.env.example` criado como template
3. ✅ Valores padrão seguros no `lib/db.ts`
4. ✅ Documentação atualizada no README.md

### Verificações
```bash
# Verificar que .env.local não está no git
git check-ignore .env.local
# Deve retornar: .env.local

# Verificar que não há credenciais hardcoded
grep -r "ForTheHorde" app/api/
# Não deve retornar resultados
```

## 🚀 Deploy

### Ambiente de Produção
Configure as variáveis de ambiente no seu provedor de hospedagem:

**Vercel**:
```bash
vercel env add DB_HOST
vercel env add DB_PORT
vercel env add DB_USER
vercel env add DB_PASSWORD
vercel env add DB_NAME
```

**Docker**:
```dockerfile
ENV DB_HOST=production-host
ENV DB_PORT=3306
ENV DB_USER=production-user
ENV DB_PASSWORD=secure-password
ENV DB_NAME=vale_dos_carajas
```

**Servidor Linux**:
```bash
# Adicionar ao .env.local ou .env.production
echo "DB_HOST=production-host" >> .env.local
echo "DB_USER=production-user" >> .env.local
echo "DB_PASSWORD=secure-password" >> .env.local
```

## ✅ Validação

### Build Bem-Sucedido
```
✓ Compiled successfully in 3.5s
✓ Finished TypeScript in 3.4s
✓ Collecting page data in 1556.2ms
✓ Generating static pages (23/23) in 901.1ms
✓ Finalizing page optimization in 7.0ms
```

### Verificações Completas
- ✅ Nenhum `const dbConfig = {` hardcoded encontrado
- ✅ Todos os 28 arquivos importam `{ dbConfig } from '@/lib/db'`
- ✅ Build do Next.js passa sem erros
- ✅ TypeScript não reporta erros
- ✅ `.gitignore` protege `.env.local`

## 📝 Instruções para Novos Desenvolvedores

1. Clone o repositório
2. Copie `.env.example` para `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Configure suas credenciais locais no `.env.local`
4. Instale dependências:
   ```bash
   npm install
   ```
5. Execute o projeto:
   ```bash
   npm run dev
   ```

## 🎉 Benefícios

- 🔒 **Segurança**: Credenciais não são mais expostas no código
- 📦 **Portabilidade**: Fácil configuração em diferentes ambientes
- 🔄 **Manutenção**: Mudanças centralizadas em um único arquivo
- 👥 **Colaboração**: Cada desenvolvedor usa suas próprias credenciais
- 🚀 **Deploy**: Simples configuração em produção

---

**Data da Migração**: 2024
**Status**: ✅ Concluído
**Build**: ✅ Passando
**Segurança**: ✅ Verificada
