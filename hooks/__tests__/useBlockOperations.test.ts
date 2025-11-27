import { renderHook, act, waitFor } from '@testing-library/react'
import axios from 'axios'
import { useBlockOperations } from '../useBlockOperations'
import { createMockBlock, createAxiosResponse, createAxiosError } from '../../__tests__/helpers/factories'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

const mockMapId = 'map123'

describe('useBlockOperations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with empty blocks', () => {
    const { result } = renderHook(() => useBlockOperations())

    expect(result.current.blocks).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it('should fetch blocks on loadBlocks call', async () => {
    const mockBlocks = [createMockBlock({ id: '1', name: 'Quadra A', mapId: mockMapId })]

    mockedAxios.get.mockResolvedValueOnce({
      data: mockBlocks.map(b => ({
        id: b.id,
        mapId: b.mapId,
        name: b.name,
        description: b.description,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      }))
    })

    const { result } = renderHook(() => useBlockOperations())

    await act(async () => {
      await result.current.loadBlocks(mockMapId)
    })

    expect(result.current.blocks).toHaveLength(1)
    expect(result.current.blocks[0].name).toBe('Quadra A')
  })

  it('should handle fetch error gracefully', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'))

    const { result } = renderHook(() => useBlockOperations())

    await act(async () => {
      await result.current.loadBlocks(mockMapId)
    })

    expect(result.current.blocks).toEqual([])
  })

  it('should create a new block', async () => {
    mockedAxios.post.mockResolvedValueOnce(createAxiosResponse({ id: '2' }))
    mockedAxios.get.mockResolvedValueOnce({ data: [] })

    const { result } = renderHook(() => useBlockOperations())

    await act(async () => {
      await result.current.createBlock({
        mapId: mockMapId,
        name: 'Quadra B',
        description: 'New block',
      })
    })

    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/mapas/quadras/criar',
      expect.objectContaining({
        mapId: mockMapId,
        name: 'Quadra B',
        description: 'New block',
      }),
      { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
    )
  })

  it('should update an existing block', async () => {
    const blockToUpdate = createMockBlock({ id: '1', name: 'Quadra A Updated' })

    mockedAxios.patch.mockResolvedValueOnce(createAxiosResponse(blockToUpdate))
    mockedAxios.get.mockResolvedValueOnce({ data: [] })

    const { result } = renderHook(() => useBlockOperations())

    await act(async () => {
      await result.current.updateBlock(blockToUpdate)
    })

    expect(mockedAxios.patch).toHaveBeenCalledWith(
      '/api/mapas/quadras/atualizar',
      expect.objectContaining({
        id: '1',
        name: 'Quadra A Updated',
      }),
      { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
    )
  })

  it('should delete a block', async () => {
    mockedAxios.delete.mockResolvedValueOnce(createAxiosResponse({}))
    mockedAxios.get.mockResolvedValueOnce({ data: [] })

    const { result } = renderHook(() => useBlockOperations())

    await act(async () => {
      await result.current.deleteBlock('1', mockMapId)
    })

    expect(mockedAxios.delete).toHaveBeenCalledWith('/api/mapas/quadras/deletar', {
      params: { blockId: '1' },
      timeout: 10000,
    })
  })

  it('should handle create error', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Create failed'))

    const { result } = renderHook(() => useBlockOperations())

    await expect(
      act(async () => {
        await result.current.createBlock({
          mapId: mockMapId,
          name: 'Test',
        })
      })
    ).rejects.toThrow('Create failed')
  })

  it('should refetch blocks after operations', async () => {
    const initialBlocks = [createMockBlock({ id: '1', name: 'Quadra A' })]
    
    // Mock inicial: carrega blocos
    mockedAxios.get.mockResolvedValueOnce({
      data: initialBlocks.map(b => ({
        id: b.id,
        mapId: b.mapId,
        name: b.name,
        description: b.description,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      }))
    })

    const { result } = renderHook(() => useBlockOperations())

    // Carregar blocos iniciais
    await act(async () => {
      await result.current.loadBlocks(mockMapId)
    })

    expect(result.current.blocks).toHaveLength(1)

    // Mock para criar novo bloco
    mockedAxios.post.mockResolvedValueOnce(createAxiosResponse({ id: '2' }))
    
    // Mock para recarregar após criar (retorna 2 blocos)
    const updatedBlocks = [
      ...initialBlocks,
      createMockBlock({ id: '2', name: 'Quadra B' })
    ]
    mockedAxios.get.mockResolvedValueOnce({
      data: updatedBlocks.map(b => ({
        id: b.id,
        mapId: b.mapId,
        name: b.name,
        description: b.description,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      }))
    })

    // Criar novo bloco
    await act(async () => {
      await result.current.createBlock({
        mapId: mockMapId,
        name: 'Quadra B',
        description: 'New block',
      })
    })

    // Verificar que os blocos foram recarregados
    expect(result.current.blocks).toHaveLength(2)
  })
})
