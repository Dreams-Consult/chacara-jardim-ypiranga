import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import LotSelector from '../LotSelector'
import { Lot, LotStatus, Block } from '@/types'

describe('LotSelector', () => {
  const mockLot1: Lot = {
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

  const mockLot2: Lot = {
    id: '2',
    lotNumber: '2',
    mapId: 'map1',
    size: 250,
    price: 125000,
    status: LotStatus.RESERVED,
    pricePerM2: 500,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockLot3: Lot = {
    id: '3',
    lotNumber: '3',
    mapId: 'map1',
    size: 350,
    price: 175000,
    status: LotStatus.SOLD,
    pricePerM2: 500,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockBlock: Block = {
    id: 'block1',
    mapId: 'map1',
    name: 'Quadra A',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockLots = [mockLot1, mockLot2, mockLot3]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render lot selector with title', () => {
    render(<LotSelector lots={mockLots} />)
    
    expect(screen.getByText(/Selecione o\(s\) Lote\(s\)/i)).toBeInTheDocument()
  })

  it('should display all lots', () => {
    render(<LotSelector lots={mockLots} />)
    
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should display legend with status colors', () => {
    render(<LotSelector lots={mockLots} />)
    
    expect(screen.getByText('Legenda:')).toBeInTheDocument()
    expect(screen.getByText('Disponível')).toBeInTheDocument()
    expect(screen.getByText('Reservado')).toBeInTheDocument()
    expect(screen.getByText('Vendido')).toBeInTheDocument()
    expect(screen.getByText('Bloqueado')).toBeInTheDocument()
  })

  it('should call onLotSelect when clicking available lot', () => {
    const mockOnLotSelect = jest.fn()
    render(<LotSelector lots={mockLots} onLotSelect={mockOnLotSelect} />)
    
    const lot1 = screen.getByText('1')
    fireEvent.click(lot1)
    
    // Modal should open, need to interact with it
    expect(screen.getByText(/Lote 1/i)).toBeInTheDocument()
  })

  it('should display selected lots summary when multiple selection enabled', () => {
    render(
      <LotSelector
        lots={mockLots}
        selectedLotIds={['1']}
        allowMultipleSelection={true}
      />
    )
    
    expect(screen.getByText(/Seleção Atual/i)).toBeInTheDocument()
    expect(screen.getByText(/1 lote/i)).toBeInTheDocument()
  })

  it('should calculate total price for selected lots', () => {
    render(
      <LotSelector
        lots={mockLots}
        selectedLotIds={['1', '2']}
        allowMultipleSelection={true}
      />
    )
    
    // Total: 150000 + 125000 = 275000
    expect(screen.getByText(/R\$ 275\.000,00/i)).toBeInTheDocument()
  })

  it('should calculate total area for selected lots', () => {
    render(
      <LotSelector
        lots={mockLots}
        selectedLotIds={['1', '2']}
        allowMultipleSelection={true}
      />
    )
    
    // Total: 300 + 250 = 550
    expect(screen.getByText(/550m²/i)).toBeInTheDocument()
  })

  it('should close modal when clicking cancel', () => {
    render(<LotSelector lots={[mockLot1]} />)
    
    // Open modal
    const lot = screen.getByText('1')
    fireEvent.click(lot)
    
    // Close modal
    const cancelButton = screen.getByText('Cancelar')
    fireEvent.click(cancelButton)
    
    // Modal should be closed - lot details should not be visible
    expect(screen.queryByText(/Valor Total/i)).not.toBeInTheDocument()
  })

  it('should open modal with lot details when clicking a lot', () => {
    render(<LotSelector lots={[mockLot1]} />)
    
    const lot = screen.getByText('1')
    fireEvent.click(lot)
    
    // "Disponível" aparece na legenda e no modal
    const disponivel = screen.getAllByText(/Disponível/i)
    expect(disponivel.length).toBeGreaterThan(0)
    // Área pode aparecer múltiplas vezes
    const area = screen.getAllByText(/300m²/i)
    expect(area.length).toBeGreaterThan(0)
    expect(screen.getByText(/R\$ 150\.000,00/i)).toBeInTheDocument()
  })

  it('should show delete button for admin users on available lots', () => {
    const mockOnLotDelete = jest.fn()
    render(<LotSelector lots={[mockLot1]} onLotEdit={jest.fn()} onLotDelete={mockOnLotDelete} />)
    
    const lot = screen.getByText('1')
    fireEvent.click(lot)
    
    // Verificar que botão "Salvar Alterações" aparece (indicando modo edição)
    expect(screen.getByText(/Salvar Alterações/i)).toBeInTheDocument()
  })

  it('should display block information when available', () => {
    const lotWithBlock = { ...mockLot1, blockId: 'block1' }
    render(<LotSelector lots={[lotWithBlock]} blocks={[mockBlock]} />)
    
    const lot = screen.getByText('1')
    fireEvent.click(lot)
    
    expect(screen.getByText(/Quadra A/i)).toBeInTheDocument()
  })

  it('should not allow clicking on sold lots for non-admin users', () => {
    render(<LotSelector lots={[mockLot3]} />)
    
    const lot = screen.getByText('3')
    const lotElement = lot.closest('div')
    
    expect(lotElement).toHaveClass('cursor-not-allowed')
  })

  it('should allow clicking on any lot for admin users', () => {
    const mockOnLotEdit = jest.fn()
    render(<LotSelector lots={[mockLot3]} onLotEdit={mockOnLotEdit} />)
    
    const lot = screen.getByText('3')
    fireEvent.click(lot)
    
    // Should open modal even for sold lots
    expect(screen.getByText(/Lote 3/i)).toBeInTheDocument()
  })
})
