'use client';

import React from 'react';
import { Lot } from '@/types';
import { usePurchaseForm } from '@/hooks/usePurchaseForm';

interface PurchaseModalProps {
  lot: Lot;
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

export default function PurchaseModal({ lot, onClose, onSuccess }: PurchaseModalProps) {
  const { formData, setFormData, isSubmitting, error, handleSubmit } = usePurchaseForm(lot, onSuccess);
  const [cpfError, setCpfError] = React.useState<string>('');

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
                <p className="text-white/90 text-sm">Lote {lot.lotNumber}</p>
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
          <div className="bg-gradient-to-br from-[var(--primary)]/5 to-[var(--primary-light)]/10 border border-[var(--primary)]/15 rounded-2xl p-5 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/80 rounded-xl p-3 border border-[var(--border)]">
                <p className="text-xs font-medium text-[var(--surface)] mb-1">Área</p>
                <p className="text-lg font-bold text-[var(--surface)]">{lot.size}m²</p>
              </div>
              <div className="bg-white/80 rounded-xl p-3 border border-[var(--border)]">
                <p className="text-xs font-medium text-[var(--surface)] mb-1">Preço Total</p>
                <p className="text-lg font-bold text-[var(--surface)]">R$ {lot.price.toLocaleString('pt-BR')}</p>
                {lot.pricePerM2 && (
                  <p className="text-xs text-[var(--surface)]/70 mt-1">R$ {lot.pricePerM2.toLocaleString('pt-BR')}/m²</p>
                )}
              </div>
            </div>
            {lot.description && (
              <div className="bg-white/80 rounded-xl p-3 border border-[var(--border)] mb-4">
                <p className="text-xs font-medium text-[var(--surface)] mb-2">Descrição</p>
                <p className="text-sm text-[var(--surface)] leading-relaxed">{lot.description}</p>
              </div>
            )}
            {lot.features && lot.features.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--foreground)] mb-2">Características</p>
                <div className="flex flex-wrap gap-2">
                  {lot.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-white/80 border border-[var(--primary)]/20 text-[var(--primary)] text-xs font-medium rounded-lg"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Nome Completo *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl text-[var(--foreground)] bg-white focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                placeholder="Seu nome completo"
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
                placeholder="seu@email.com"
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

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || cpfError !== ''}
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
                ) : 'Enviar Interesse'}
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
