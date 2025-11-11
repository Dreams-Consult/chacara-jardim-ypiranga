# Página de Cadastro - Guia Rápido

## 🎯 Visão Geral

A página de cadastro (`/register`) permite que novos usuários criem suas contas no sistema sem precisar de um administrador.

## 📍 Acesso

- **URL:** `/register`
- **Acesso:** Público (sem login)
- **Link:** Disponível na página de login

## 📋 Campos do Formulário

### 1. Nome Completo
- Campo obrigatório
- Texto livre
- Exemplo: "João da Silva"

### 2. Email
- Campo obrigatório
- Deve conter @
- Usado apenas para identificação e contato
- Verificação de duplicidade
- Exemplo: "joao@email.com"
- **Nota:** O email não é usado para login, apenas o CPF

### 3. CPF
- Campo obrigatório
- **Formatação automática**
- Digite apenas números
- Formato final: 000.000.000-00
- Verificação de duplicidade
- **Importante:** Este CPF será usado para:
  - **Login no sistema** (única credencial aceita)
  - Filtrar suas reservas

### 4. Senha
- Campo obrigatório
- Mínimo de 6 caracteres
- Sem requisitos especiais
- Exemplo: "senha123"

### 5. Confirmar Senha
- Campo obrigatório
- Deve ser igual à senha
- Validação em tempo real

## ✅ Validações

### Antes de Enviar:
1. ✅ Todos os campos preenchidos
2. ✅ Email contém @
3. ✅ CPF tem 11 dígitos
4. ✅ Senha tem no mínimo 6 caracteres
5. ✅ Senhas coincidem

### No Servidor (localStorage):
1. ✅ Email não existe no sistema
2. ✅ CPF não existe no sistema

## 🎨 Fluxo Visual

```
┌─────────────────────────────────────┐
│                                     │
│    🏠 Chácara Jardim Ypiranga       │
│         Criar Conta                 │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Nome Completo                      │
│  ┌───────────────────────────────┐  │
│  │ João da Silva                 │  │
│  └───────────────────────────────┘  │
│                                     │
│  Email                              │
│  ┌───────────────────────────────┐  │
│  │ joao@email.com                │  │
│  └───────────────────────────────┘  │
│                                     │
│  CPF                                │
│  ┌───────────────────────────────┐  │
│  │ 123.456.789-00                │  │
│  └───────────────────────────────┘  │
│                                     │
│  Senha                              │
│  ┌───────────────────────────────┐  │
│  │ ••••••••                      │  │
│  └───────────────────────────────┘  │
│  Mínimo de 6 caracteres             │
│                                     │
│  Confirmar Senha                    │
│  ┌───────────────────────────────┐  │
│  │ ••••••••                      │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │      Criar Conta              │  │
│  └───────────────────────────────┘  │
│                                     │
│  Já tem uma conta? Fazer login      │
│                                     │
│  ℹ️ Novos usuários são cadastrados  │
│     como Vendedores                 │
│                                     │
└─────────────────────────────────────┘
```

## 🔄 Após o Cadastro

### Sucesso:
1. ✅ Usuário criado no localStorage
2. ✅ Perfil definido como VENDEDOR
3. ✅ Redirecionamento para `/login?registered=true`
4. ✅ Mensagem de sucesso exibida no login
5. ✅ Usuário faz login com seu **CPF**

**Opções de Login com CPF:**
- CPF formatado: `123.456.789-00`
- CPF sem formatação: `12345678900`

### Erro:
❌ Mensagem de erro exibida no formulário
❌ Usuário permanece na página de cadastro
❌ Pode corrigir e tentar novamente

## 🔐 Perfil Padrão

**Todos os novos usuários são criados como VENDEDOR:**

### Permissões do Vendedor:
- ✅ Acessa Mapas e Lotes
- ✅ Vê apenas suas próprias reservas (filtradas por CPF)
- ✅ Pode finalizar/reverter suas reservas
- ❌ Não acessa página de Usuários
- ❌ Não vê reservas de outros vendedores

### Como Alterar Perfil:
Para ter permissões de ADMIN ou DEV:
1. Entre em contato com um usuário DEV ou ADMIN
2. Solicite mudança de perfil
3. Admin acessa `/admin/users`
4. Edita seu usuário e altera o perfil

## 💡 Dicas de Uso

### Para Usuários:
1. **Use um email válido** - Você precisará lembrar dele para fazer login
2. **Guarde seu CPF** - Ele identifica suas vendas no sistema
3. **Escolha uma senha memorável** - Mínimo de 6 caracteres
4. **Confirme os dados** - Verifique email e CPF antes de enviar

### Para Administradores:
1. **Monitore novos cadastros** - Acesse `/admin/users` regularmente
2. **Altere perfis quando necessário** - Promova vendedores a admin se apropriado
3. **Verifique duplicidades** - Sistema já previne, mas monitore
4. **Oriente novos usuários** - Explique sobre o perfil VENDEDOR

## 🎯 Casos de Uso

### Caso 1: Novo Vendedor
```
1. Acessa /register
2. Preenche: João Silva / joao@email.com / 123.456.789-00 / senha123
3. Clica em "Criar Conta"
4. É redirecionado para login
5. Faz login usando CPF:
   a) CPF formatado: 123.456.789-00 / senha123
   OU
   b) CPF sem formatação: 12345678900 / senha123
6. Acessa dashboard como VENDEDOR
7. Vê apenas reservas do CPF 123.456.789-00
```

### Caso 2: Erro de Email Duplicado
```
1. Acessa /register
2. Preenche com email que já existe
3. Clica em "Criar Conta"
4. Recebe erro: "Este email já está cadastrado"
5. Altera email para um novo
6. Tenta novamente
7. Sucesso!
```

### Caso 3: Senhas Diferentes
```
1. Preenche formulário
2. Senha: "senha123"
3. Confirmar: "senha456"
4. Clica em "Criar Conta"
5. Erro: "As senhas não coincidem"
6. Corrige confirmação de senha
7. Sucesso!
```

## 🔗 Navegação

### Da Página de Login:
- Clique em "Criar conta"
- Vai para `/register`

### Da Página de Cadastro:
- Clique em "Fazer login"
- Volta para `/login`

### Após Cadastro:
- Redirecionamento automático para `/login?registered=true`
- Mensagem verde de sucesso exibida
- Pode fazer login imediatamente

## 🎨 Design

### Cores:
- Gradiente: Emerald (verde) → Teal (azul-esverdeado)
- Botão: Gradiente emerald-500 → teal-600
- Sucesso: Verde
- Erro: Vermelho
- Info: Azul

### Ícone:
- 🏠 Casa (representando chácara)
- Ícone de usuário com + para cadastro

### Responsividade:
- ✅ Mobile-first
- ✅ Centralizado em telas grandes
- ✅ Largura máxima: 28rem (448px)
- ✅ Padding responsivo

## 🚀 Tecnologias

- **Framework:** Next.js 16.0.1
- **Linguagem:** TypeScript
- **Estilo:** Tailwind CSS
- **Validação:** Cliente-side (JavaScript)
- **Armazenamento:** localStorage
- **Roteamento:** Next.js App Router

## 📱 Responsividade

### Mobile (< 768px):
- Formulário em largura total
- Campos empilhados verticalmente
- Botões 100% de largura
- Padding reduzido

### Desktop (≥ 768px):
- Formulário centralizado
- Largura máxima de 28rem
- Espaçamento confortável
- Sombra pronunciada

## 🔒 Segurança (Desenvolvimento)

⚠️ **Nota Importante:**
O sistema atual armazena dados no localStorage e senhas em texto plano. Isso é **apenas para desenvolvimento**.

### Para Produção:
1. Implementar backend de autenticação
2. Hash de senhas (bcrypt)
3. Tokens JWT
4. Banco de dados seguro
5. HTTPS obrigatório
6. Rate limiting
7. Validação server-side
8. CAPTCHA para prevenir bots
