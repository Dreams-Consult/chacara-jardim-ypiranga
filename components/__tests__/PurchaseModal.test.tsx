import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import PurchaseModal from '../PurchaseModal'
import { Lot, LotStatus } from '@/types'

// Mock do hook usePurchaseForm
jest.mock('@/hooks/usePurchaseForm', () => ({
  usePurchaseForm: jest.fn(() => ({
    formData: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerCPF: '',
      sellerName: '',
      sellerEmail: '',
      sellerPhone: '',
      sellerCPF: '',
      message: '',
      paymentMethod: '',
      otherPayment: '',
      firstPayment: 0,
      installments: 0,
    },
    setFormData: jest.fn(),
    isSubmitting: false,
    error: '',
    handleSubmit: jest.fn((e) => e.preventDefault()),
  })),
}))

describe('PurchaseModal', () => {
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

  const mockProps = {
    lots: [mockLot],
    onClose: jest.fn(),
    onSuccess: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render modal with lot information', () => {
    render(<PurchaseModal {...mockProps} />)
    
    expect(screen.getByText(/Manifestar Interesse/i)).toBeInTheDocument()
    // "Lote 1" pode aparecer múltiplas vezes no modal
    const loteTexts = screen.getAllByText(/Lote 1/i)
    expect(loteTexts.length).toBeGreaterThan(0)
  })

  it('should display customer form fields', () => {
    render(<PurchaseModal {...mockProps} />)
    
    expect(screen.getByPlaceholderText(/Nome do cliente/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email@cliente.com/i)).toBeInTheDocument()
  })

  it('should display seller form fields', () => {
    render(<PurchaseModal {...mockProps} />)
    
    expect(screen.getByPlaceholderText(/Nome do vendedor/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email@vendedor.com/i)).toBeInTheDocument()
  })

  it('should display payment method options', () => {
    render(<PurchaseModal {...mockProps} />)
    
    expect(screen.getByText('Pix')).toBeInTheDocument()
    expect(screen.getByText('Cartão')).toBeInTheDocument()
    expect(screen.getByText('Dinheiro')).toBeInTheDocument()
    expect(screen.getByText('Carnê')).toBeInTheDocument()
    expect(screen.getByText('Financiamento')).toBeInTheDocument()
  })

  it('should display total price', () => {
    render(<PurchaseModal {...mockProps} />)
    
    expect(screen.getByText(/R\$ 150\.000,00/i)).toBeInTheDocument()
  })

  it('should display total area', () => {
    render(<PurchaseModal {...mockProps} />)
    
    // Usar getAllByText porque pode aparecer múltiplas vezes
    const areaElements = screen.getAllByText(/300m²/i)
    expect(areaElements.length).toBeGreaterThan(0)
  })

  it('should call onClose when cancel button is clicked', () => {
    render(<PurchaseModal {...mockProps} />)
    
    const cancelButton = screen.getByText('Cancelar')
    fireEvent.click(cancelButton)
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when close icon is clicked', () => {
    render(<PurchaseModal {...mockProps} />)
    
    const closeButtons = screen.getAllByRole('button')
    const closeIcon = closeButtons.find(btn => btn.getAttribute('type') === 'button')
    
    if (closeIcon) {
      fireEvent.click(closeIcon)
    }
    
    expect(mockProps.onClose).toHaveBeenCalled()
  })

  it('should show required field markers', () => {
    render(<PurchaseModal {...mockProps} />)
    
    expect(screen.getByText(/Nome Completo \*/i)).toBeInTheDocument()
    expect(screen.getByText(/Nome do Vendedor \*/i)).toBeInTheDocument()
  })

  it('should render with multiple lots', () => {
    const multipleLots = [
      mockLot,
      { ...mockLot, id: '2', lotNumber: '2' },
    ]
    
    render(<PurchaseModal {...mockProps} lots={multipleLots} />)
    
    expect(screen.getByText(/2 Lotes Selecionados/i)).toBeInTheDocument()
  })

  it('should display editable lot prices', () => {
    render(<PurchaseModal {...mockProps} />)
    
    const priceInputs = screen.getAllByPlaceholderText('0,00')
    expect(priceInputs.length).toBeGreaterThan(0)
  })
})
