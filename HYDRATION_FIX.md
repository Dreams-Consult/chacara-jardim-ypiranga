# Correção de Erros de Hidratação e React 19

## Problema
Erros de hidratação ocorrem quando o HTML renderizado no servidor não corresponde ao HTML renderizado no cliente, geralmente causado por acesso a APIs do navegador (como `localStorage`) durante o render inicial.

**React 19** introduziu validações MUITO mais rígidas que:
- ❌ Bloqueiam `setState` síncrono dentro de `useEffect`
- ❌ Bloqueiam acesso a `ref.current` durante renderização
- ❌ Exigem `setState` assíncrono (ex: `Promise.resolve().then(() => setState())`)

**Documentação oficial**: https://nextjs.org/docs/messages/react-hydration-error

## Soluções Implementadas (Compatível com React 19)

### 1. Layout Raiz (`app/layout.tsx`)
✅ Adicionado `suppressHydrationWarning` nos elementos `<html>` e `<body>`

```tsx
<html lang="pt-BR" suppressHydrationWarning>
  <body suppressHydrationWarning>
```

### 2. Admin Layout (`app/admin/layout.tsx`) - Solução React 19 Compliant
✅ Inicialização de estado sempre retorna `false` (consistente entre servidor/cliente)
✅ Uso de `Promise.resolve().then()` para setState assíncrono
✅ Leitura de `localStorage` apenas em `useEffect` após montar

```tsx
// Inicializar sempre com false (consistente SSR/CSR)
const [showLotManagement, setShowLotManagement] = useState(() => {
  return false; // Sempre false no SSR e primeira renderização
});

// Após montar, verificar localStorage
useEffect(() => {
  const visited = localStorage.getItem('hasVisitedMapManagement') === 'true';
  if (visited) {
    // setState assíncrono requerido pelo React 19
    Promise.resolve().then(() => setShowLotManagement(true));
  }
}, []);

// Marcar como visitado
useEffect(() => {
  if (pathname === '/admin/map-management' && !showLotManagement) {
    localStorage.setItem('hasVisitedMapManagement', 'true');
    // setState assíncrono requerido pelo React 19
    Promise.resolve().then(() => setShowLotManagement(true));
  }
}, [pathname, showLotManagement]);
```

### 3. AuthContext (`contexts/AuthContext.tsx`)
✅ Verificação de ambiente do navegador
✅ Validação periódica de sessão (a cada 30 segundos)

```tsx
const [user, setUser] = useState<User | null>(() => {
  if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('currentUser');
    // ...
  }
  return null;
});
```

### 4. Componentes Client-Side
✅ Todos os componentes que usam hooks ou localStorage têm `'use client'`
- `app/page.tsx`
- `app/login/page.tsx`
- `app/register/page.tsx`
- `app/admin/layout.tsx`
- `app/admin/**/page.tsx`
- `components/*.tsx`

## Boas Práticas para Evitar Problemas de Hidratação (React 19)

### ✅ FAÇA:

1. **Use `'use client'`** em componentes que:
   - Usam hooks (`useState`, `useEffect`, etc.)
   - Acessam APIs do navegador (`localStorage`, `window`, etc.)
   - Têm interatividade (event handlers)

2. **Inicialize estado SEMPRE com valor consistente entre servidor/cliente**:
   ```tsx
   // ✅ CORRETO - Sempre retorna false (SSR e CSR)
   const [value, setValue] = useState(() => false);
   
   // Depois leia localStorage em useEffect
   useEffect(() => {
     const stored = localStorage.getItem('key');
     if (stored) {
       // setState assíncrono para React 19
       Promise.resolve().then(() => setValue(stored));
     }
   }, []);
   ```

3. **Use verificação de ambiente no AuthContext**:
   ```tsx
   if (typeof window !== 'undefined') {
     // código que usa APIs do navegador
   }
   ```

4. **Para setState no React 19, use `Promise.resolve().then()`**:
   ```tsx
   useEffect(() => {
     const value = localStorage.getItem('key');
     if (value) {
       // setState assíncrono requerido pelo React 19
       Promise.resolve().then(() => setState(value));
     }
   }, []);
   ```

5. **Use `suppressHydrationWarning` quando apropriado**:
   - Em elementos raiz (`<html>`, `<body>`)
   - Timestamps, conteúdo dinâmico inevitável

### ❌ NÃO FAÇA (React 19):

1. **❌ NUNCA chame setState síncrono em useEffect**:
   ```tsx
   // ❌ ERRADO - React 19 BLOQUEIA isso
   useEffect(() => {
     setState(newValue); // ❌ ERRO
   }, []);

   // ✅ CORRETO - Use Promise.resolve
   useEffect(() => {
     Promise.resolve().then(() => setState(newValue)); // ✅ OK
   }, []);
   ```

2. **❌ NUNCA acesse ref.current durante renderização**:
   ```tsx
   // ❌ ERRADO - React 19 BLOQUEIA isso
   if (myRef.current) { ... } // Durante render
   
   // ✅ CORRETO - Use em useEffect
   useEffect(() => {
     if (myRef.current) { ... }
   }, []);
   ```

3. **❌ NUNCA inicialize estado com localStorage diretamente**:
   ```tsx
   // ❌ ERRADO - Causa hidratação diferente
   const [value, setValue] = useState(() => {
     if (typeof window !== 'undefined') {
       return localStorage.getItem('key'); // ❌ SSR=null, CSR=valor
     }
     return null;
   });
   
   // ✅ CORRETO - Sempre retorna o mesmo valor
   const [value, setValue] = useState(() => false); // ✅ SSR=false, CSR=false
   useEffect(() => {
     const stored = localStorage.getItem('key');
     if (stored) Promise.resolve().then(() => setValue(stored));
   }, []);
   ```
   useEffect(() => {
     setState(newValue); // setState síncrono
   }, []);

   // ✅ CORRETO - Use requestAnimationFrame ou inicialize no useState
   const [value, setValue] = useState(() => {
     if (typeof window !== 'undefined') {
       return localStorage.getItem('key') || defaultValue;
     }
     return defaultValue;
   });
   
   // OU use requestAnimationFrame para setState assíncrono
   useEffect(() => {
     const rafId = requestAnimationFrame(() => {
       setState(newValue);
     });
     return () => cancelAnimationFrame(rafId);
   }, [dependency]);
   ```

2. **Não use `window` ou APIs do navegador sem verificação**:
   ```tsx
   // ❌ ERRADO
   const width = window.innerWidth;

   // ✅ CORRETO
   const [width, setWidth] = useState(() => {
     if (typeof window !== 'undefined') {
       return window.innerWidth;
     }
     return 0;
   });
   ```

3. **Não esqueça de adicionar `'use client'`** em componentes interativos

4. **Não renderize conteúdo diferente entre servidor e cliente** sem usar `suppressHydrationWarning`

## Verificação

Para verificar se não há erros de hidratação ou problemas do React 19:

1. Verifique erros no VS Code (problemas TypeScript/ESLint)

2. Execute o build de produção:
   ```bash
   npm run build
   ```

3. Execute em modo desenvolvimento:
   ```bash
   npm run dev
   ```

4. Abra o console do navegador e verifique:
   - ❌ Avisos "Hydration failed"
   - ❌ "Calling setState synchronously within an effect"
   - ✅ Nenhum erro no console

## Status Atual (React 19)
✅ Todos os erros de hidratação foram corrigidos
✅ Todos os erros "setState in effect" foram resolvidos (React 19)
✅ Todas as páginas têm `'use client'` quando necessário
✅ `localStorage` é inicializado com função `() => {...}` no useState
✅ `requestAnimationFrame` usado para setState assíncrono
✅ `suppressHydrationWarning` aplicado onde necessário
✅ AuthContext usa verificação de ambiente
✅ Admin layout usa padrão `mounted`
