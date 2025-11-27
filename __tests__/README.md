# Testes Unitários

Este diretório contém todos os testes unitários da aplicação.

## Estrutura de Testes

```
__tests__/
├── helpers/          # Utilitários e factories para testes
│   ├── factories.ts  # Factories para criar dados mockados
│   └── factories.test.ts
├── components/       # Testes de componentes React
│   ├── PurchaseModal.test.tsx
│   └── LotSelector.test.tsx
├── hooks/            # Testes de React hooks
│   ├── usePurchaseForm.test.ts
│   ├── useBlockOperations.test.ts
│   ├── useMapSelection.test.ts
│   └── useLotOperations.test.ts
├── contexts/         # Testes de contextos React
│   └── AuthContext.test.tsx
├── lib/              # Testes de utilitários
│   └── utils.test.ts
└── types/            # Testes de tipos/enums
    └── index.test.ts
```

## Executando os Testes

### Executar todos os testes
```bash
npm test
```

### Executar testes em modo watch
```bash
npm run test:watch
```

### Executar testes com cobertura
```bash
npm run test:coverage
```

### Executar testes específicos
```bash
npm test -- PurchaseModal
npm test -- hooks/usePurchaseForm
```

## Cobertura de Testes

A configuração atual coleta cobertura de:
- `components/**`
- `hooks/**`
- `lib/**`
- `contexts/**`
- `app/**`

## Escrevendo Testes

### Estrutura Básica

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('should handle click events', () => {
    const mockFn = jest.fn()
    render(<MyComponent onClick={mockFn} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(mockFn).toHaveBeenCalled()
  })
})
```

### Usando Factories

```typescript
import { createMockLot, createMockBlock } from '@/__tests__/helpers/factories'

const lot = createMockLot({ lotNumber: '10', price: 200000 })
const block = createMockBlock({ name: 'Quadra B' })
```

### Mockando APIs

```typescript
import axios from 'axios'
import { createAxiosResponse, createAxiosError } from '@/__tests__/helpers/factories'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Sucesso
mockedAxios.get.mockResolvedValueOnce(createAxiosResponse(data))

// Erro
mockedAxios.post.mockRejectedValueOnce(createAxiosError('Failed'))
```

### Testando Hooks

```typescript
import { renderHook, act } from '@testing-library/react'

const { result } = renderHook(() => useMyHook())

act(() => {
  result.current.doSomething()
})

expect(result.current.value).toBe(expected)
```

## Ferramentas e Bibliotecas

- **Jest**: Framework de testes
- **@testing-library/react**: Testes de componentes React
- **@testing-library/jest-dom**: Matchers personalizados para DOM
- **@testing-library/user-event**: Simulação de interações do usuário

## Boas Práticas

1. **Nome descritivo**: Use nomes claros que descrevam o que está sendo testado
2. **Arrange-Act-Assert**: Organize os testes em três partes
3. **Teste comportamento, não implementação**: Foque no que o usuário vê/faz
4. **Evite testes frágeis**: Não teste detalhes de implementação
5. **Use factories**: Reutilize dados mockados com factories
6. **Limpe após cada teste**: Use `beforeEach` e `afterEach`

## Exemplos de Testes

### Componente com interação
```typescript
it('should update input value on change', () => {
  render(<MyForm />)
  const input = screen.getByPlaceholderText('Enter name')
  
  fireEvent.change(input, { target: { value: 'John' } })
  
  expect(input).toHaveValue('John')
})
```

### Hook com estado assíncrono
```typescript
it('should fetch data on mount', async () => {
  const mockData = [createMockLot()]
  mockedAxios.get.mockResolvedValueOnce(createAxiosResponse(mockData))

  const { result } = renderHook(() => useMyHook())

  await waitFor(() => {
    expect(result.current.data).toEqual(mockData)
  })
})
```

### Validação de formulário
```typescript
it('should show error for invalid CPF', () => {
  render(<CustomerForm />)
  const cpfInput = screen.getByPlaceholderText('000.000.000-00')
  
  fireEvent.change(cpfInput, { target: { value: '12345678901' } })
  fireEvent.blur(cpfInput)
  
  expect(screen.getByText('CPF inválido')).toBeInTheDocument()
})
```

## Troubleshooting

### Erro: Cannot find module
- Verifique se o path alias `@/` está configurado corretamente no `jest.config.js`

### Erro: window.matchMedia is not a function
- O mock está configurado em `jest.setup.js`

### Erro: useRouter is not defined
- O mock do Next.js está configurado em `jest.setup.js`

### Testes assíncronos não funcionam
- Use `await waitFor()` ou `await act(async () => {})`

## Recursos Adicionais

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing/jest)
