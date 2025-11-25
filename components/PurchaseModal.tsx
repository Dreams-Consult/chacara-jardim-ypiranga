'use client';

import React from 'react';
import { Lot } from '@/types';
import { usePurchaseForm } from '@/hooks/usePurchaseForm';

interface PurchaseModalProps {
  lots: Lot[]; // Mudado de lot: Lot para lots: Lot[]
  onClose: () => void;
  onSuccess: () => void;
}

// Funções auxiliares para validação e máscara de CPF
const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
};

const validateCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '');

  // CPF de desenvolvimento
  if (numbers === '99999999998') return true;

  if (numbers.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(numbers)) return false; // Todos os dígitos iguais

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(numbers.charAt(9))) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(numbers.charAt(10))) return false;

  return true;
};

const paymentOptions = [
  { label: 'Pix', value: 'pix', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth={2} />
      <path d="M8 12h8" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  ) },
  { label: 'Cartão', value: 'cartao', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="6" width="20" height="12" rx="3" stroke="currentColor" strokeWidth={2} />
      <path d="M2 10h20" stroke="currentColor" strokeWidth={2} />
    </svg>
  ) },
  { label: 'Dinheiro', value: 'dinheiro', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth={2} />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2} />
    </svg>
  ) },
  { label: 'Carnê', value: 'carne', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ) },
  { label: 'Outro', value: 'outro', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} />
      <path d="M8 12h8" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  ) },
];

export default function PurchaseModal({ lots, onClose, onSuccess }: PurchaseModalProps) {
  const { formData, setFormData, isSubmitting, error, handleSubmit } = usePurchaseForm(lots, onSuccess);
  const [cpfError, setCpfError] = React.useState<string>('');
  const [sellerCpfError, setSellerCpfError] = React.useState<string>('');
  const [lotPrices, setLotPrices] = React.useState<Record<string, number>>(
    lots.reduce((acc, lot) => ({ ...acc, [lot.id]: lot.price }), {})
  );

  // Calcular preço total com base nos valores editáveis
  const totalPrice = Object.values(lotPrices).reduce((sum, price) => sum + price, 0);
  const totalArea = lots.reduce((sum, lot) => sum + lot.size, 0);

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData({ ...formData, customerCPF: formatted });

    // Validar CPF quando tiver 14 caracteres (formato completo)
    if (formatted.length === 14) {
      if (!validateCPF(formatted)) {
        setCpfError('CPF inválido');
      } else {
        setCpfError('');
      }
    } else {
      setCpfError('');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numbers = e.target.value.replace(/\D/g, '');
    let formatted = numbers;

    if (numbers.length <= 2) {
      formatted = numbers;
    } else if (numbers.length <= 6) {
      formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }

    setFormData({ ...formData, customerPhone: formatted });
  };

  const handleSellerPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numbers = e.target.value.replace(/\D/g, '');
    let formatted = numbers;

    if (numbers.length <= 2) {
      formatted = numbers;
    } else if (numbers.length <= 6) {
      formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }

    setFormData({ ...formData, sellerPhone: formatted });
  };

  const handleSellerCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData({ ...formData, sellerCPF: formatted });

    if (formatted.length === 14) {
      if (!validateCPF(formatted)) {
        setSellerCpfError('CPF inválido');
      } else {
        setSellerCpfError('');
      }
    } else {
      setSellerCpfError('');
    }
  };

  const handleLotPriceChange = (lotId: string, newPrice: number) => {
    setLotPrices(prev => ({ ...prev, [lotId]: newPrice }));
  };

  // Função auxiliar para atualizar paymentMethod e limpar otherPayment se necessário
  const handlePaymentMethodChange = (value: string) => {
  if (value !== 'outro') {
    setFormData({ ...formData, paymentMethod: value, otherPayment: '' });
  } else {
    setFormData({ ...formData, paymentMethod: value });
  }
}

  return (
    <div className="fixed inset-0 bg-[var(--foreground)]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-[var(--card-bg)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[var(--shadow-xl)] border border-[var(--border)]">
        <div className="sticky top-0 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white p-6 rounded-t-2xl shadow-[var(--shadow-md)] z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Manifestar Interesse</h2>
                <p className="text-white/90 text-sm">
                  {lots.length === 1 ? `Lote ${lots[0].lotNumber}` : `${lots.length} Lotes Selecionados`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Informações dos lotes selecionados */}
          <div className="bg-gradient-to-br from-[var(--primary)]/5 to-[var(--primary-light)]/10 border border-[var(--primary)]/15 rounded-2xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
              {lots.length === 1 ? 'Lote Selecionado' : 'Lotes Selecionados'}
            </h3>
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {lots.map((lot) => (
                <div key={lot.id} className="bg-white/80 rounded-lg p-3 border border-[var(--border)]">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-[var(--surface)]">Lote {lot.lotNumber}</span>
                    <span className="text-sm text-[var(--surface)]">{lot.size}m²</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--surface)]">Valor:</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={lotPrices[lot.id]}
                      onChange={(e) => handleLotPriceChange(lot.id, parseFloat(e.target.value) || 0)}
                      className="flex-1 px-2 py-1 text-sm border border-[var(--border)] rounded text-[var(--surface)] bg-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 rounded-xl p-3 border border-[var(--border)]">
                <p className="text-xs font-medium text-[var(--surface)] mb-1">Área Total</p>
                <p className="text-lg font-bold text-[var(--surface)]">{totalArea}m²</p>
              </div>
              <div className="bg-white/80 rounded-xl p-3 border border-[var(--border)]">
                <p className="text-xs font-medium text-[var(--surface)] mb-1">Preço Total</p>
                <p className="text-lg font-bold text-[var(--surface)]">R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-xl p-4 mb-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-[var(--danger)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[var(--danger)] text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 mb-6">
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Dados do Cliente
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl text-[var(--foreground)] bg-white focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                    placeholder="Nome do cliente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl text-[var(--foreground)] bg-white focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                    placeholder="email@cliente.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Telefone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.customerPhone}
                    onChange={handlePhoneChange}
                    className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl text-[var(--foreground)] bg-white focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">CPF *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerCPF}
                    onChange={handleCPFChange}
                    className={`w-full px-4 py-2.5 border rounded-xl text-[var(--foreground)] bg-white focus:ring-2 focus:ring-[var(--primary)]/30 transition-all ${
                      cpfError ? 'border-red-500 focus:border-red-500' : 'border-[var(--border)] focus:border-[var(--primary)]'
                    }`}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                  {cpfError && (
                    <p className="text-red-600 text-sm mt-1">❌ {cpfError}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 mb-6">
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Dados do Vendedor
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Nome do Vendedor *</label>
                  <input
                    type="text"
                    required
                    value={formData.sellerName || ''}
                    onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl text-[var(--foreground)] bg-white focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                    placeholder="Nome do vendedor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Email do Vendedor *</label>
                  <input
                    type="email"
                    required
                    value={formData.sellerEmail || ''}
                    onChange={(e) => setFormData({ ...formData, sellerEmail: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl text-[var(--foreground)] bg-white focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                    placeholder="email@vendedor.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Telefone do Vendedor *</label>
                  <input
                    type="tel"
                    required
                    value={formData.sellerPhone || ''}
                    onChange={handleSellerPhoneChange}
                    className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl text-[var(--foreground)] bg-white focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">CPF do Vendedor *</label>
                  <input
                    type="text"
                    required
                    value={formData.sellerCPF || ''}
                    onChange={handleSellerCPFChange}
                    className={`w-full px-4 py-2.5 border rounded-xl text-[var(--foreground)] bg-white focus:ring-2 focus:ring-[var(--primary)]/30 transition-all ${
                      sellerCpfError ? 'border-red-500 focus:border-red-500' : 'border-[var(--border)] focus:border-[var(--primary)]'
                    }`}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                  {sellerCpfError && (
                    <p className="text-red-600 text-sm mt-1">❌ {sellerCpfError}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Mensagem</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl text-[var(--foreground)] bg-white focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                rows={4}
                placeholder="Deixe uma mensagem ou dúvida"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Forma de Pagamento *</label>
              <div className="flex gap-3">
                {paymentOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors font-medium
                      ${formData.paymentMethod === option.value
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                        : 'bg-white text-[var(--surface)] border-[var(--border)] hover:text-white hover:bg-[var(--primary)]/10'}
                    `}
                    onClick={() => handlePaymentMethodChange(option.value)}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>

              <input type="hidden" name="paymentMethod" value={formData.paymentMethod || ''} required />
              {!formData.paymentMethod && (
                <p className="text-red-600 text-sm mt-1">❌ Selecione uma forma de pagamento</p>
              )}

              {formData.paymentMethod === 'outro' && (
                <div className="mt-3">
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                    Especifique a forma de pagamento *
                  </label>
                  <input
                    maxLength={30}
                    type="text"
                    required
                    value={formData.otherPayment || ''}
                    onChange={e => setFormData({ ...formData, otherPayment: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl text-[var(--foreground)] bg-white focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                    placeholder="Descreva a forma de pagamento"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || cpfError !== '' || sellerCpfError !== ''}
                className="flex-1 px-5 py-3 bg-[var(--success)] text-white rounded-xl hover:bg-[var(--success)]/90 font-semibold shadow-[var(--shadow-md)] transition-all hover:shadow-[var(--shadow-lg)] disabled:bg-[var(--foreground)]/20 disabled:cursor-not-allowed disabled:hover:shadow-[var(--shadow-md)] cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </span>
                ) : 'Criar Reserva'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-5 py-3 bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] rounded-xl hover:bg-[var(--foreground)]/5 font-semibold shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
