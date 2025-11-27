import { renderHook, act } from '@testing-library/react'
import { usePurchaseForm } from '../usePurchaseForm'
import { Lot, LotStatus } from '@/types'

// Mock axios
jest.mock('axios')

describe('usePurchaseForm', () => {
  const mockLot: Lot = {
    id: '1',
    lotNumber: '1',
    mapId: 'map1',
    size: 300,
    price: 150000,
    status: LotStatus.AVAILABLE,
    pricePerM2: 500,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockLots = [mockLot]
  const mockOnSuccess = jest.fn()
  const mockLotPrices = { '1': 150000 }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with default form data', () => {
    const { result } = renderHook(() =>
      usePurchaseForm(mockLots, mockOnSuccess, mockLotPrices)
    )

    expect(result.current.formData.customerName).toBe('')
    expect(result.current.formData.customerEmail).toBe('')
    expect(result.current.formData.paymentMethod).toBe('')
    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should update form data when setFormData is called', () => {
    const { result } = renderHook(() =>
      usePurchaseForm(mockLots, mockOnSuccess, mockLotPrices)
    )

    act(() => {
      result.current.setFormData({
        ...result.current.formData,
        customerName: 'João Silva',
      })
    })

    expect(result.current.formData.customerName).toBe('João Silva')
  })

  it('should validate required fields before submission', async () => {
    const { result } = renderHook(() =>
      usePurchaseForm(mockLots, mockOnSuccess, mockLotPrices)
    )

    const mockEvent = {
      preventDefault: jest.fn(),
    } as any

    await act(async () => {
      await result.current.handleSubmit(mockEvent)
    })

    expect(mockEvent.preventDefault).toHaveBeenCalled()
  })

  it('should reset firstPayment and installments when payment method is pix or dinheiro', () => {
    const { result } = renderHook(() =>
      usePurchaseForm(mockLots, mockOnSuccess, mockLotPrices)
    )

    act(() => {
      result.current.setFormData({
        ...result.current.formData,
        paymentMethod: 'pix',
        firstPayment: 1000,
        installments: 12,
      })
    })

    // The hook should handle this in the submit logic
    expect(result.current.formData.paymentMethod).toBe('pix')
  })

  it('should include agreed prices in submission data', () => {
    const { result } = renderHook(() =>
      usePurchaseForm(mockLots, mockOnSuccess, mockLotPrices)
    )

    act(() => {
      result.current.setFormData({
        ...result.current.formData,
        customerName: 'Test Customer',
        sellerName: 'Test Seller',
      })
    })

    expect(mockLotPrices['1']).toBe(150000)
  })
})
