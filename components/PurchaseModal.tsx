'use client';

import React from 'react';
import { Lot } from '@/types';
import { usePurchaseForm } from '@/hooks/usePurchaseForm';
import { useAuth } from '@/contexts/AuthContext';

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
  { label: 'Financiamento', value: 'financing', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
  const { user } = useAuth();
  
  // Estados simplificados - apenas preços dos lotes
  const [lotPrices] = React.useState<Record<string, number | null>>(
    lots.reduce((acc, lot) => ({ ...acc, [lot.id]: lot.price }), {})
  );
  
  const { formData, setFormData, isSubmitting, error, handleSubmit } = usePurchaseForm(lots, onSuccess, lotPrices, {}, {}, user?.id);
  const [cpfError, setCpfError] = React.useState<string>('');
  const [sellerCpfError, setSellerCpfError] = React.useState<string>('');

  // Calcular preço total e área
  const totalPrice = Object.values(lotPrices).reduce((sum: number, price) => sum + (price || 0), 0);
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

  return (
    <div className="fixed inset-0 bg-[var(--foreground)]/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-[var(--card-bg)] rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] my-auto overflow-y-auto shadow-[var(--shadow-xl)] border border-[var(--border)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="sticky top-0 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white p-4 sm:p-6 rounded-t-2xl shadow-[var(--shadow-md)] z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold">Manifestar Interesse</h2>
                <p className="text-white opacity-90 text-xs sm:text-sm">
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

        <div className="p-4 sm:p-6">
          {/* Informações dos lotes selecionados - APENAS VISUALIZAÇÃO */}
          <div className="bg-blue-500/30 border-2 border-blue-400 rounded-2xl p-3 sm:p-5 mb-4 sm:mb-6 shadow-lg">
            <h3 className="text-base font-bold text-[var(--foreground)] mb-3">
              {lots.length === 1 ? 'Lote Selecionado' : 'Lotes Selecionados'}
            </h3>
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {lots.map((lot) => (
                <div key={lot.id} className="rounded-lg p-3 border border-blue-300/50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--foreground)]">Lote {lot.lotNumber}</span>
                      {lot.blockName && (
                        <span className="text-xs text-[var(--foreground)] opacity-80 bg-white/20 px-2 py-0.5 rounded">
                          Quadra: {lot.blockName}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-[var(--foreground)]">{lot.size}m²</span>
                  </div>
                  
                  {lot.price && (
                    <div className="mt-2 text-right">
                      <span className="text-xs text-[var(--foreground)] opacity-70">R$ </span>
                      <span className="text-sm font-semibold text-[var(--foreground)]">
                        {lot.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl p-3 border border-blue-300/50">
                <p className="text-xs font-medium text-[var(--foreground)] opacity-70 mb-1">Área Total</p>
                <p className="text-lg font-bold text-[var(--foreground)]">{totalArea}m²</p>
              </div>
              <div className="rounded-xl p-3 border border-blue-300/50">
                <p className="text-xs font-medium text-[var(--foreground)] opacity-70 mb-1">Preço Total</p>
                <p className="text-lg font-bold text-[var(--foreground)]">R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Dados do Cliente
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[var(--foreground)] opacity-80 text-sm font-semibold mb-2">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--surface)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] placeholder:text-gray-400"
                    placeholder="Nome do cliente"
                  />
                </div>

                <div>
                  <label className="block text-[var(--foreground)] opacity-80 text-sm font-semibold mb-2">CPF</label>
                  <input
                    type="text"
                    value={formData.customerCPF}
                    onChange={handleCPFChange}
                    className={`w-full px-4 py-2.5 bg-[var(--surface)] border-2 rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] font-mono placeholder:text-gray-400 ${
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

            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Dados do Vendedor
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[var(--foreground)] opacity-80 text-sm font-semibold mb-2">Nome do Vendedor *</label>
                  <input
                    type="text"
                    required
                    value={formData.sellerName || ''}
                    onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--surface)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] placeholder:text-gray-400"
                    placeholder="Nome do vendedor"
                  />
                </div>

                <div>
                  <label className="block text-[var(--foreground)] opacity-80 text-sm font-semibold mb-2">CPF do Vendedor</label>
                  <input
                    type="text"
                    value={formData.sellerCPF || ''}
                    onChange={handleSellerCPFChange}
                    className={`w-full px-4 py-2.5 bg-[var(--surface)] border-2 rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] font-mono placeholder:text-gray-400 ${
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
          </form>

            <div className="sticky bottom-0 bg-[var(--card-bg)] border-t border-[var(--border)] p-4 sm:p-6 flex flex-col sm:flex-row gap-3 rounded-b-2xl">
              <button
                type="submit"
                disabled={isSubmitting || cpfError !== '' || sellerCpfError !== ''}
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e as any);
                }}
                className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 bg-[var(--success)] text-white rounded-xl hover:bg-[var(--success)]/90 font-semibold text-sm sm:text-base shadow-[var(--shadow-md)] transition-all hover:shadow-[var(--shadow-lg)] disabled:bg-[var(--foreground)]/20 disabled:cursor-not-allowed disabled:hover:shadow-[var(--shadow-md)] cursor-pointer"
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
                className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] rounded-xl hover:bg-[var(--foreground)]/5 font-semibold text-sm sm:text-base shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancelar
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}
