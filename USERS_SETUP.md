# Criar Primeiro Usuário

Para criar o primeiro usuário DEV no sistema, abra o console do navegador (F12) e execute:

```javascript
// Criar usuário DEV
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

// Obter usuários existentes
const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');

// Adicionar novo usuário
existingUsers.push(devUser);

// Salvar no localStorage
localStorage.setItem('users', JSON.stringify(existingUsers));

console.log('✅ Usuário DEV criado com sucesso!');
console.log('Email: dev@chacara.com');
console.log('Senha: dev123');
```

## Criar Usuário Administrador

```javascript
const adminUser = {
  id: crypto.randomUUID(),
  name: 'Administrador',
  email: 'admin@chacara.com',
  cpf: '111.111.111-11',
  role: 'admin',
  password: 'admin123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
existingUsers.push(adminUser);
localStorage.setItem('users', JSON.stringify(existingUsers));

console.log('✅ Usuário ADMIN criado!');
console.log('Email: admin@chacara.com');
console.log('Senha: admin123');
```

## Criar Usuário Vendedor

```javascript
const vendedorUser = {
  id: crypto.randomUUID(),
  name: 'João Vendedor',
  email: 'vendedor@chacara.com',
  cpf: '123.456.789-00', // Este CPF será usado para filtrar as reservas
  role: 'vendedor',
  password: 'vendedor123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
existingUsers.push(vendedorUser);
localStorage.setItem('users', JSON.stringify(existingUsers));

console.log('✅ Usuário VENDEDOR criado!');
console.log('Email: vendedor@chacara.com');
console.log('Senha: vendedor123');
console.log('CPF:', vendedorUser.cpf);
```

## Listar Todos os Usuários

```javascript
const users = JSON.parse(localStorage.getItem('users') || '[]');
console.table(users.map(u => ({
  nome: u.name,
  email: u.email,
  cpf: u.cpf,
  role: u.role
})));
```

## Remover Todos os Usuários (Reset)

```javascript
localStorage.removeItem('users');
console.log('✅ Todos os usuários foram removidos');
```

## Funcionalidades por Perfil

### DEV (Desenvolvedor)
- Acesso total sem restrições
- Pode criar usuários DEV
- Pode acessar todas as ferramentas
- Vê todas as reservas

### ADMIN (Administrador)
- Pode criar usuários ADMIN e VENDEDOR
- Pode acessar todas as ferramentas
- Vê todas as reservas
- Acessa página de Usuários

### VENDEDOR
- Vê apenas suas próprias reservas (filtrado por CPF)
- Não tem acesso à página de Usuários
- Pode acessar Mapas e Lotes
- Pode finalizar ou reverter suas próprias reservas

## Notas Importantes

1. O CPF do vendedor é usado para filtrar as reservas na página "Minhas Reservas"
2. Ao fazer uma reserva, o campo `reservedBy` do lote deve ser preenchido com o CPF do vendedor
3. Perfil DEV tem acesso irrestrito a tudo
4. A senha é armazenada em texto plano no localStorage (apenas para desenvolvimento)
5. Em produção, implemente autenticação segura com backend e hash de senhas
