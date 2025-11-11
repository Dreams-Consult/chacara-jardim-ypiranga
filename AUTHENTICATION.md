# Sistema de Autenticação e Controle de Acesso

## ✅ Implementação Concluída

O sistema agora possui autenticação completa com controle de acesso baseado em perfis de usuário e **página de cadastro público**.

## 📁 Arquivos Criados/Modificados

### Novos Arquivos

1. **contexts/AuthContext.tsx** - Context de autenticação com gerenciamento de usuários
2. **app/login/page.tsx** - Página de login com formulário e link para cadastro
3. **app/register/page.tsx** - Página de cadastro público (NOVO ✨)
4. **app/admin/users/page.tsx** - Página de gerenciamento de usuários (admin)
5. **USERS_SETUP.md** - Documentação para criar o primeiro usuário

### Arquivos Modificados

1. **app/layout.tsx** - Envolvido com AuthProvider
2. **app/page.tsx** - Redireciona para login ou dashboard conforme autenticação
3. **app/admin/layout.tsx** - Controle de acesso, informações do usuário e logout
4. **app/admin/reservations/page.tsx** - Filtro por CPF do vendedor
5. **types/index.ts** - Adicionados tipos User e UserRole

## 👥 Perfis de Usuário

### 🟣 DEV (Desenvolvedor)
- **Acesso:** Completo e irrestrito
- **Permissões:**
  - ✅ Acessa todas as páginas
  - ✅ Vê todas as reservas
  - ✅ Pode criar usuários DEV
  - ✅ Acessa página de Usuários
  - ✅ Sem filtros ou restrições

### 🔵 ADMIN (Administrador)
- **Acesso:** Administrativo
- **Permissões:**
  - ✅ Acessa todas as páginas
  - ✅ Vê todas as reservas
  - ✅ Pode criar usuários ADMIN e VENDEDOR
  - ✅ Acessa página de Usuários
  - ❌ Não pode criar usuários DEV

### 🟢 VENDEDOR
- **Acesso:** Restrito ao próprio CPF
- **Permissões:**
  - ✅ Acessa Mapas e Lotes
  - ✅ Vê apenas suas próprias reservas (filtradas por CPF)
  - ✅ Pode finalizar/reverter suas reservas
  - ❌ Não acessa página de Usuários
  - ❌ Não vê reservas de outros vendedores

## 🔑 Funcionalidades Implementadas

### 1. Autenticação
- Login com **CPF** e senha
- CPF pode ser digitado com ou sem formatação
- Logout com limpeza de sessão
- Persistência no localStorage
- Redirecionamento automático

### 2. Controle de Acesso
- Proteção de rotas (redireciona para login se não autenticado)
- Menu lateral condicional baseado no perfil
- Página de Usuários visível apenas para DEV e ADMIN

### 3. Filtro de Reservas
- Vendedores veem apenas reservas onde `reservedBy === user.cpf`
- DEV e ADMIN veem todas as reservas
- Indicador visual quando filtro está ativo

### 4. Gerenciamento de Usuários
- CRUD completo de usuários
- Formulário de cadastro com validação
- Tabela com listagem, edição e exclusão
- Badges coloridos por perfil
- Controle de criação de perfis (apenas DEV pode criar DEV)

### 5. Interface de Usuário
- Badge de perfil no sidebar
- Informações do usuário logado
- Botão de logout
- Avatar com inicial do nome
- Cores diferenciadas por perfil

## 🚀 Como Usar

### 1. Criar Conta (Novo Usuário)

**Opção 1: Cadastro Público (Recomendado)**

1. Acesse a página inicial (será redirecionado para `/login`)
2. Clique em "Criar conta"
3. Preencha o formulário:
   - Nome completo
   - Email (será usado para login)
   - CPF (formatação automática: 000.000.000-00)
   - Senha (mínimo 6 caracteres)
   - Confirmar senha
4. Clique em "Criar Conta"
5. Você será redirecionado para o login com mensagem de sucesso
6. Faça login com suas credenciais

**Nota:** Novos usuários são automaticamente cadastrados como **VENDEDOR**. Para ter perfil de administrador, solicite a um usuário DEV ou ADMIN que altere seu perfil.

**Opção 2: Criar o Primeiro Usuário DEV via Console**

Abra o console do navegador (F12) e execute:

```javascript
const devUser = {
  id: crypto.randomUUID(),
  name: 'Desenvolvedor',
  email: 'dev@chacara.com',
  cpf: '000.000.000-00',
  role: 'dev',
  password: 'dev123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
existingUsers.push(devUser);
localStorage.setItem('users', JSON.stringify(existingUsers));

console.log('✅ Usuário DEV criado!');
```

### 2. Fazer Login

**Via Interface:**

1. Acesse a página inicial (será redirecionado para `/login`)
2. Use suas credenciais:
   - **CPF**: Digite seu CPF (com ou sem formatação)
   - **Senha**: Digite sua senha
3. Clique em "Entrar"
4. Será redirecionado para o dashboard

**Exemplos de CPF válidos:**
- CPF com formatação: `123.456.789-00`
- CPF sem formatação: `12345678900`

**Nota:** O sistema aceita o CPF com ou sem formatação, facilitando o acesso dos usuários.

### 3. Criar Outros Usuários (Administração)

1. Após login como DEV ou ADMIN, acesse "Usuários" no menu lateral
2. Clique em "Novo Usuário"
3. Preencha o formulário:
   - Nome completo
   - Email
   - CPF (importante para vendedores!)
   - Perfil (dev/admin/vendedor)
   - Senha (mínimo 6 caracteres)
4. Clique em "Criar Usuário"

**Importante:** Use a página de cadastro (`/register`) para usuários comuns. A página de administração é apenas para gerenciar usuários existentes e alterar perfis.

### 4. Testar como Vendedor

1. Crie um usuário vendedor com CPF específico (ex: `123.456.789-00`)
2. Faça logout (botão "Sair" no sidebar)
3. Faça login com as credenciais do vendedor
4. Acesse "Minhas Reservas"
5. Verá apenas reservas onde o campo `reservedBy` corresponde ao seu CPF
6. Notará que "Usuários" não aparece no menu

## 🔒 Segurança

### ⚠️ Importante para Produção

O sistema atual usa localStorage e senhas em texto plano **apenas para desenvolvimento**. Para produção:

1. **Backend de Autenticação:**
   - Implementar API de autenticação com JWT
   - Hash de senhas com bcrypt
   - Tokens de refresh
   - Proteção contra CSRF

2. **Banco de Dados:**
   - Migrar usuários para banco de dados
   - Nunca armazenar senhas em texto plano
   - Implementar rate limiting

3. **HTTPS:**
   - Sempre usar HTTPS em produção
   - Cookies seguros e httpOnly
   - SameSite cookie policy

4. **Validação:**
   - Validar CPF no backend
   - Validar formato de email
   - Força de senha

## 📊 Estrutura de Dados

### User Interface
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  cpf: string; // Usado para filtrar reservas de vendedores
  role: UserRole;
  password?: string; // Removido após login
  createdAt: Date;
  updatedAt: Date;
}
```

### UserRole Enum
```typescript
enum UserRole {
  DEV = 'dev',
  ADMIN = 'admin',
  VENDEDOR = 'vendedor',
}
```

## 🎨 Páginas do Sistema

### Páginas Públicas (Sem Login)

1. **`/login`** - Página de login
   - Formulário com **CPF** e senha
   - Aceita CPF com ou sem formatação (000.000.000-00 ou 00000000000)
   - Link para criar conta
   - Mensagem de sucesso após cadastro
   - Informação sobre modo de desenvolvimento

2. **`/register`** - Página de cadastro (NOVO ✨)
   - Formulário completo de cadastro
   - Validação de CPF (formatação automática)
   - Validação de senha (mínimo 6 caracteres)
   - Confirmação de senha
   - Verifica duplicidade de email e CPF
   - Cria usuários com perfil VENDEDOR automaticamente
   - Link para fazer login

### Páginas Protegidas (Requer Login)

- **`/admin/dashboard`** - Dashboard principal
- **`/admin/maps`** - Mapas e lotes
- **`/admin/reservations`** - Minhas reservas (filtrado por CPF para vendedores)
- **`/admin/map-management`** - Gerenciar mapas (CRUD)
- **`/admin/lot-management`** - Editar lotes
- **`/admin/users`** - Gerenciar usuários (apenas DEV e ADMIN)
- **`/admin/data`** - Dados

## 🎨 Elementos Visuais

### Cores por Perfil

- **DEV:** Roxo/Purple (`purple-500`)
- **ADMIN:** Azul/Blue (`blue-500`)
- **VENDEDOR:** Verde/Green (`green-500`)

### Indicadores

- Badge de perfil no sidebar
- Avatar com inicial do nome
- Indicador de filtro ativo nas reservas
- Badges na tabela de usuários

## 📊 Fluxo de Autenticação

```
1. Usuário acessa / → Redireciona para /login
2. Usuário digita CPF + senha → Validação no localStorage
3. Sistema normaliza CPF (remove formatação) para comparação
4. Busca usuário por CPF (sem formatação)
5. Se válido → Redireciona para /admin/dashboard
6. Se inválido → Mostra erro "CPF ou senha inválidos"
7. Em cada página admin → Verifica isAuthenticated
8. Se não autenticado → Redireciona para /login
9. Logout → Remove dados e redireciona para /login
```

## 🔄 Integração com Reservas

Para que vendedores vejam apenas suas reservas, o campo `reservedBy` do lote deve ser preenchido com o **CPF do vendedor** ao fazer a reserva.

### Exemplo de Reserva
```typescript
const lot: Lot = {
  // ... outros campos
  status: LotStatus.RESERVED,
  reservedBy: '123.456.789-00', // CPF do vendedor
  reservedAt: new Date(),
};
```

## ✅ Build Concluído

- ✅ **14 páginas** geradas (incluindo `/register`)
- ✅ Sem erros TypeScript
- ✅ Sem erros de compilação
- ✅ Todas as rotas funcionando
- ✅ Suspense boundary implementado no login

## 🆕 Novidades na Página de Cadastro

### Recursos Implementados:

1. **Formatação Automática de CPF**
   - Digite apenas números
   - Formatação automática: 000.000.000-00
   - Validação de 11 dígitos

2. **Validações Robustas**
   - ✅ Nome obrigatório
   - ✅ Email válido (verifica @)
   - ✅ CPF com 11 dígitos
   - ✅ Senha mínima de 6 caracteres
   - ✅ Confirmação de senha
   - ✅ Verifica se email já existe
   - ✅ Verifica se CPF já existe

3. **Experiência do Usuário**
   - 🎨 Design consistente com página de login
   - 💬 Mensagens de erro claras
   - ✅ Feedback de sucesso no login após cadastro
   - 🔗 Links de navegação (login ↔ cadastro)
   - ℹ️ Informação sobre perfil padrão (VENDEDOR)

4. **Segurança**
   - Previne duplicidade de email
   - Previne duplicidade de CPF
   - Validação no cliente antes de salvar
   - Normalização de email (lowercase)

## 📊 Fluxo de Cadastro

```
1. Usuário acessa / → Redireciona para /login
2. Clica em "Criar conta" → Vai para /register
3. Preenche formulário → Validações executadas
4. Submete formulário → Verifica duplicidades
5. Se válido → Cria usuário como VENDEDOR
6. Salva no localStorage → Redireciona para /login?registered=true
7. Página de login mostra mensagem de sucesso
8. Usuário faz login com credenciais criadas
9. Redireciona para /admin/dashboard
```

## ✅ Build Concluído

- ✅ 14 páginas geradas
- ✅ Sem erros TypeScript
- ✅ Sem erros de compilação
- ✅ Todas as rotas funcionando

## 📚 Documentação Relacionada

- **USERS_SETUP.md** - Como criar usuários via console
- **API_DOCUMENTATION.md** - Documentação da API
- **QUICKSTART.md** - Guia rápido de início

## 🐛 Troubleshooting

### Erro: "CPF ou senha inválidos"
- Verifique se digitou o CPF corretamente (pode usar com ou sem formatação)
- Confirme que a senha está correta
- Certifique-se de que sua conta foi criada

### Erro: "Este email já está cadastrado"
- O email informado já existe no sistema
- Use um email diferente ou faça login se for você

### Erro: "Este CPF já está cadastrado"
- O CPF informado já existe no sistema
- Verifique se você não tem cadastro anterior
- Entre em contato com administrador se precisar redefinir

### Erro: "As senhas não coincidem"
- As senhas digitadas nos campos "Senha" e "Confirmar Senha" são diferentes
- Digite a mesma senha em ambos os campos

### Erro: "CPF deve ter 11 dígitos"
- Digite o CPF completo com 11 números
- Formato aceito: 000.000.000-00 (formatação automática)

### Erro: "Não consegue fazer login"
1. Verifique se o usuário foi criado corretamente
2. Abra o console e execute: `JSON.parse(localStorage.getItem('users'))`
3. Confirme que o email e senha estão corretos

### Erro: "Menu de Usuários não aparece"
- Isso é normal para perfil VENDEDOR
- Apenas DEV e ADMIN têm acesso

### Erro: "Não vejo minhas reservas"
1. Verifique se o campo `reservedBy` dos lotes está preenchido
2. Confirme que o CPF corresponde ao seu CPF de usuário
3. DEV e ADMIN veem todas as reservas

### Resetar Sistema
```javascript
// Remover todos os usuários
localStorage.removeItem('users');
localStorage.removeItem('currentUser');

// Recarregar página
location.reload();
```
