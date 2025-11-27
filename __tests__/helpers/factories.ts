import { LotStatus } from '@/types'

/**
 * API Response Types for Testing
 */
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

/**
 * Mock Lot Data Factory
 */
export const createMockLot = (overrides = {}) => ({
  id: '1',
  lotNumber: '1',
  mapId: 'map1',
  size: 300,
  price: 150000,
  status: LotStatus.AVAILABLE,
  pricePerM2: 500,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

/**
 * Mock Block Data Factory
 */
export const createMockBlock = (overrides = {}) => ({
  id: '1',
  mapId: 'map1',
  name: 'Quadra A',
  description: '',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

/**
 * Mock Map Data Factory
 */
export const createMockMap = (overrides = {}) => ({
  id: 'map1',
  name: 'Mapa Principal',
  imageUrl: '/maps/map1.jpg',
  imageType: 'image' as const,
  width: 1920,
  height: 1080,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

/**
 * Mock User Data Factory
 */
export const createMockUser = (overrides = {}) => ({
  id: 'user1',
  name: 'Test User',
  email: 'test@example.com',
  cpf: '111.444.777-35',
  role: 'admin' as const,
  status: 'approved' as const,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

/**
 * Mock Purchase Request Data Factory
 */
export const createMockPurchaseRequest = (overrides = {}) => ({
  id: 'pr1',
  lotId: '1',
  customerName: 'João Silva',
  customerEmail: 'joao@example.com',
  customerPhone: '(11) 98765-4321',
  status: 'pending' as const,
  createdAt: new Date('2024-01-01'),
  ...overrides,
})

/**
 * Wait for async updates
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

/**
 * Create mock axios response
 */
export const createAxiosResponse = <T>(data: T) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any,
})

/**
 * Create mock axios error
 */
export const createAxiosError = (message: string, status = 400) => ({
  response: {
    data: { error: message },
    status,
    statusText: 'Error',
    headers: {},
    config: {} as any,
  },
  isAxiosError: true,
  toJSON: () => ({}),
  name: 'AxiosError',
  message,
})
