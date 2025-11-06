import { useState } from 'react';
import axios from 'axios';
import { Lot } from '@/types';

interface FormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCPF: string;
  message: string;
}

export function usePurchaseForm(lot: Lot, onSuccess: () => void) {
  const [formData, setFormData] = useState<FormData>({
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
      const requestData = {
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
        customer: {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone,
          cpf: formData.customerCPF || null,
          message: formData.message || null,
        },
        purchaseRequest: {
          id: Date.now().toString(),
          lotId: lot.id,
          status: 'pending',
          createdAt: new Date().toISOString(),
        }
      };

      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      const response = await axios.post(`${API_URL}/reservardb`, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log('Resposta da API:', response.data);

      onSuccess();
    } catch (err) {
      console.error('Erro ao enviar reserva:', err);

      if (axios.isAxiosError(err)) {
        if (err.response) {
          setError(`Erro do servidor: ${err.response.data?.message || err.response.statusText}`);
        } else if (err.request) {
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

  return {
    formData,
    setFormData,
    isSubmitting,
    error,
    handleSubmit,
  };
}
