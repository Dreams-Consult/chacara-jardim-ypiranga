'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Lot, LotStatus } from '@/types';
import { savePurchaseRequest, saveLot } from '@/lib/storage';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Preparar dados completos para envio
      const requestData = {
        // Dados do lote
        lot: {
          id: lot.id,
          mapId: lot.mapId,
          lotNumber: lot.lotNumber,
          area: lot.area,
          status: lot.status,
          price: lot.price,
          size: lot.size,
          description: lot.description,
          features: lot.features,
          createdAt: lot.createdAt,
          updatedAt: lot.updatedAt,
        },
        // Dados do cliente
        customer: {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone,
          cpf: formData.customerCPF || null,
          message: formData.message || null,
        },
        // Metadados da requisição
        purchaseRequest: {
          id: Date.now().toString(),
          lotId: lot.id,
          status: 'pending',
          createdAt: new Date().toISOString(),
        }
      };

      // Fazer requisição POST para a API
      // IMPORTANTE: Substitua pela URL real da sua API
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      const response = await axios.post(`${API_URL}/reservar`, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 segundos
      });

      console.log('Resposta da API:', response.data);

      // Salvar localmente também (backup)
      const purchaseRequest = {
        id: requestData.purchaseRequest.id,
        lotId: lot.id,
        ...formData,
        status: 'pending' as const,
        createdAt: new Date(),
      };
      savePurchaseRequest(purchaseRequest);

      // Reservar o lote automaticamente
      const updatedLot = {
        ...lot,
        status: LotStatus.RESERVED,
        updatedAt: new Date(),
      };
      saveLot(updatedLot);

      onSuccess();
    } catch (err) {
      console.error('Erro ao enviar reserva:', err);

      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Erro da API (4xx, 5xx)
          setError(`Erro do servidor: ${err.response.data?.message || err.response.statusText}`);
        } else if (err.request) {
          // Sem resposta da API
          setError('Não foi possível conectar ao servidor. Verifique sua conexão.');
        } else {
          setError('Erro ao preparar requisição.');
        }
      } else {
        setError('Erro inesperado ao enviar reserva.');
      }

      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Manifestar Interesse - Lote {lot.lotNumber}</h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Área</p>
                <p className="font-bold text-gray-900">{lot.size}m²</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Preço</p>
                <p className="font-bold text-gray-900">R$ {lot.price.toLocaleString('pt-BR')}</p>
              </div>
            </div>
            {lot.description && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Descrição</p>
                <p className="text-sm text-gray-800">{lot.description}</p>
              </div>
            )}
            {lot.features && lot.features.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Características</p>
                <div className="flex flex-wrap gap-2">
                  {lot.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm font-medium">❌ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Nome Completo *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Email *</label>
              <input
                type="email"
                required
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Telefone *</label>
              <input
                type="tel"
                required
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">CPF</label>
              <input
                type="text"
                value={formData.customerCPF}
                onChange={(e) => setFormData({ ...formData, customerCPF: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="000.000.000-00"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Mensagem</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Deixe uma mensagem ou dúvida"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md transition-all hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:shadow-md"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Interesse'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
