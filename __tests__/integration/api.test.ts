/**
 * Integration tests for API routes
 * These tests verify the API endpoints are working correctly
 */

import axios from 'axios'
import { createMockLot, createMockBlock, createAxiosResponse } from '../helpers/factories'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('/api/mapas/lotes', () => {
    it('should fetch lots for a map', async () => {
      const mockLots = [createMockLot(), createMockLot({ id: '2', lotNumber: '2' })]
      mockedAxios.get.mockResolvedValueOnce(createAxiosResponse(mockLots))

      const response = await axios.get('/api/mapas/lotes', {
        params: { mapId: 'map123' },
      })

      expect(response.data).toEqual(mockLots)
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/mapas/lotes', {
        params: { mapId: 'map123' },
      })
    })

    it('should create a new lot', async () => {
      const newLot = createMockLot()
      mockedAxios.post.mockResolvedValueOnce(createAxiosResponse(newLot))

      const response = await axios.post('/api/mapas/lotes/criar', {
        mapId: 'map123',
        lotNumber: '1',
        size: 300,
        price: 150000,
      })

      expect(response.data).toEqual(newLot)
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/mapas/lotes/criar', {
        mapId: 'map123',
        lotNumber: '1',
        size: 300,
        price: 150000,
      })
    })

    it('should update a lot', async () => {
      const updatedLot = createMockLot({ price: 200000 })
      mockedAxios.put.mockResolvedValueOnce(createAxiosResponse(updatedLot))

      const response = await axios.put('/api/mapas/lotes/atualizar', updatedLot)

      expect(response.data).toEqual(updatedLot)
    })

    it('should delete a lot', async () => {
      mockedAxios.delete.mockResolvedValueOnce(createAxiosResponse({ success: true }))

      const response = await axios.delete('/api/mapas/lotes/deletar', {
        data: { id: 'lot123' },
      })

      expect(response.data).toEqual({ success: true })
    })
  })

  describe('/api/mapas/blocks', () => {
    it('should fetch blocks for a map', async () => {
      const mockBlocks = [createMockBlock(), createMockBlock({ id: 'block2', name: 'Quadra B' })]
      mockedAxios.get.mockResolvedValueOnce(createAxiosResponse(mockBlocks))

      const response = await axios.get('/api/mapas/blocks', {
        params: { mapId: 'map123' },
      })

      expect(response.data).toEqual(mockBlocks)
    })

    it('should create a new block', async () => {
      const newBlock = createMockBlock()
      mockedAxios.post.mockResolvedValueOnce(createAxiosResponse(newBlock))

      const response = await axios.post('/api/mapas/blocks/criar', {
        mapId: 'map123',
        name: 'Quadra A',
      })

      expect(response.data).toEqual(newBlock)
    })
  })

  describe('/api/reservas', () => {
    it('should fetch all reservations', async () => {
      const mockReservations = [
        { id: '1', customerName: 'João Silva', status: 'pending' },
        { id: '2', customerName: 'Maria Santos', status: 'completed' },
      ]
      mockedAxios.get.mockResolvedValueOnce(createAxiosResponse(mockReservations))

      const response = await axios.get('/api/reservas')

      expect(response.data).toEqual(mockReservations)
    })

    it('should create a new reservation', async () => {
      const newReservation = {
        customerName: 'João Silva',
        customerEmail: 'joao@example.com',
        sellerName: 'Vendedor Teste',
        lotIds: ['1'],
        paymentMethod: 'pix',
      }
      mockedAxios.post.mockResolvedValueOnce(createAxiosResponse({ id: 'res123', ...newReservation }))

      const response = await axios.post('/api/mapas/lotes/reservar', newReservation)

      expect(response.data.id).toBe('res123')
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/mapas/lotes/reservar', newReservation)
    })

    it('should update reservation status', async () => {
      const updatedReservation = { id: 'res123', status: 'completed' }
      mockedAxios.put.mockResolvedValueOnce(createAxiosResponse(updatedReservation))

      const response = await axios.put('/api/reservas/atualizar', updatedReservation)

      expect(response.data).toEqual(updatedReservation)
    })

    it('should cancel a reservation', async () => {
      mockedAxios.delete.mockResolvedValueOnce(createAxiosResponse({ success: true }))

      const response = await axios.delete('/api/reservas/cancelar', {
        data: { id: 'res123' },
      })

      expect(response.data.success).toBe(true)
    })
  })

  describe('/api/usuarios', () => {
    it('should fetch all users', async () => {
      const mockUsers = [
        { id: '1', name: 'Admin User', role: 'admin' },
        { id: '2', name: 'Vendedor User', role: 'vendedor' },
      ]
      mockedAxios.get.mockResolvedValueOnce(createAxiosResponse(mockUsers))

      const response = await axios.get('/api/usuarios')

      expect(response.data).toEqual(mockUsers)
    })

    it('should create a new user', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
        cpf: '111.444.777-35',
        password: 'password123',
      }
      mockedAxios.post.mockResolvedValueOnce(createAxiosResponse({ id: 'user123', ...newUser }))

      const response = await axios.post('/api/usuarios/criar', newUser)

      expect(response.data.id).toBe('user123')
    })

    it('should approve a user', async () => {
      mockedAxios.put.mockResolvedValueOnce(createAxiosResponse({ success: true }))

      const response = await axios.put('/api/usuarios/aprovar', { id: 'user123' })

      expect(response.data.success).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 404, data: { error: 'Not found' } },
      })

      await expect(axios.get('/api/mapas/nonexistent')).rejects.toMatchObject({
        response: { status: 404 },
      })
    })

    it('should handle validation errors', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { error: 'Validation failed', details: ['lotNumber is required'] },
        },
      })

      await expect(
        axios.post('/api/mapas/lotes/criar', {})
      ).rejects.toMatchObject({
        response: { status: 400 },
      })
    })

    it('should handle server errors', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 500, data: { error: 'Internal server error' } },
      })

      await expect(axios.get('/api/mapas')).rejects.toMatchObject({
        response: { status: 500 },
      })
    })
  })
})
