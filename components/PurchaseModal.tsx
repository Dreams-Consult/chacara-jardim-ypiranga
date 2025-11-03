'use client';

import React, { useState } from 'react';
import { Lot } from '@/types';
import { savePurchaseRequest } from '@/lib/storage';

interface PurchaseModalProps {
  lot: Lot;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PurchaseModal({ lot, onClose, onSuccess }: PurchaseModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerCPF: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const purchaseRequest = {
      id: Date.now().toString(),
      lotId: lot.id,
      ...formData,
      status: 'pending' as const,
      createdAt: new Date(),
    };

    savePurchaseRequest(purchaseRequest);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Manifestar Interesse - Lote {lot.lotNumber}</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Área</p>
                <p className="font-bold">{lot.size}m²</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Preço</p>
                <p className="font-bold">R$ {lot.price.toLocaleString('pt-BR')}</p>
              </div>
            </div>
            {lot.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Descrição</p>
                <p className="text-sm">{lot.description}</p>
              </div>
            )}
            {lot.features && lot.features.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Características</p>
                <div className="flex flex-wrap gap-2">
                  {lot.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome Completo *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                required
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Telefone *</label>
              <input
                type="tel"
                required
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">CPF</label>
              <input
                type="text"
                value={formData.customerCPF}
                onChange={(e) => setFormData({ ...formData, customerCPF: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="000.000.000-00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mensagem</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={4}
                placeholder="Deixe uma mensagem ou dúvida"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Enviar Interesse
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-medium"
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
