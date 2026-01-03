# Migração: Preferência de Tema no Banco de Dados

## Data: 2025-12-10

## Descrição
Migração da preferência de tema (light/dark) do localStorage para o banco de dados, permitindo que o usuário tenha a mesma preferência em qualquer dispositivo que fizer login.

## Alterações Realizadas

### 1. Banco de Dados
**Arquivo:** `database-add-theme-preference.sql`

Adiciona a coluna `theme_preference` na tabela `users`:
```sql
ALTER TABLE users 
ADD COLUMN theme_preference ENUM('light', 'dark') DEFAULT 'light' AFTER active;

CREATE INDEX idx_theme_preference ON users(theme_preference);
```

**Executar SQL:**
```bash
mysql -u seu_usuario -p seu_banco < database-add-theme-preference.sql
```

### 2. API Endpoint - Atualizar Tema
**Arquivo:** `app/api/usuarios/theme/route.ts`

Novo endpoint para salvar preferência de tema:
- **PUT** `/api/usuarios/theme`
- Body: `{ userId: string, theme: 'light' | 'dark' }`

### 3. API Endpoint - Login
**Arquivo:** `app/api/usuarios/login/route.ts`

Modificações:
- Adiciona `theme_preference` na query SELECT
- Retorna `theme_preference` no objeto userData

### 4. Types
**Arquivo:** `types/index.ts`

Adiciona campo `theme_preference` na interface `User`:
```typescript
export interface User {
  // ... campos existentes
  theme_preference?: 'light' | 'dark';
  // ...
}
```

### 5. ThemeContext
**Arquivo:** `contexts/ThemeContext.tsx`

Modificações:
- Remove uso de `localStorage` para tema
- Usa `useAuth()` para obter o usuário logado
- Carrega tema do `user.theme_preference` do banco
- Salva alterações via API `/api/usuarios/theme`

### 6. AuthContext
**Arquivo:** `contexts/AuthContext.tsx`

Não precisa de modificações - já salva automaticamente `theme_preference` no localStorage junto com os outros dados do usuário (será usado como cache).

## Como Funciona

### Fluxo de Login:
1. Usuário faz login
2. API retorna dados do usuário incluindo `theme_preference`
3. AuthContext salva no estado e localStorage
4. ThemeContext detecta mudança no usuário e aplica o tema

### Fluxo de Alteração de Tema:
1. Usuário clica no botão de alternar tema
2. ThemeContext atualiza estado local imediatamente
3. ThemeContext chama API para salvar no banco
4. Na próxima vez que o usuário logar, o tema correto será carregado

### Vantagens:
- ✅ Tema sincronizado entre dispositivos
- ✅ Não depende de localStorage (funciona em modo privado)
- ✅ Melhor experiência multi-dispositivo
- ✅ Centralizado no perfil do usuário

### Compatibilidade:
- Para usuários não logados: usa tema padrão 'light'
- Para usuários existentes sem preferência: usa 'light' como padrão
- Migration automática: coluna tem DEFAULT 'light'

## Testes

### Teste 1: Login com tema salvo
1. Faça login com um usuário
2. Altere o tema para dark
3. Faça logout
4. Faça login novamente
5. ✅ Tema dark deve ser aplicado automaticamente

### Teste 2: Multi-dispositivo
1. Faça login no dispositivo A
2. Altere o tema para dark
3. Faça login no dispositivo B com o mesmo usuário
4. ✅ Tema dark deve ser aplicado

### Teste 3: Usuário novo
1. Crie um novo usuário
2. Faça login
3. ✅ Tema light deve ser aplicado (padrão)

## Rollback
Se necessário reverter:
```sql
ALTER TABLE users DROP COLUMN theme_preference;
DROP INDEX idx_theme_preference ON users;
```

E restaurar a versão anterior do ThemeContext que usa localStorage.
