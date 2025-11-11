import { useState, useEffect } from 'react';
import axios from 'axios';
import { Lot } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface FormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCPF: string;
  message: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  sellerCPF: string;
}

export function usePurchaseForm(lot: Lot, onSuccess: () => void) {
  // Carregar dados do vendedor logado do localStorage
  const getSellerData = () => {
    if (typeof window === 'undefined') return null;

    const currentUser = localStorage.getItem('currentUser');
    const userData = localStorage.getItem('userData');

    if (currentUser) {
      try {
        return JSON.parse(currentUser);
      } catch (error) {
        console.error('[usePurchaseForm] Erro ao parsear currentUser:', error);
      }
    }

    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('[usePurchaseForm] Erro ao parsear userData:', error);
      }
    }

    return null;
  };

  const sellerData = getSellerData();

  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerCPF: '',
    message: '',
    sellerName: sellerData?.name || '',
    sellerEmail: sellerData?.email || '',
    sellerPhone: sellerData?.phone || '',
    sellerCPF: sellerData?.cpf || '',
  });

  // Atualizar dados do vendedor quando o componente montar
  useEffect(() => {
    const seller = getSellerData();
    if (seller) {
      console.log('[usePurchaseForm] ✅ Dados do vendedor carregados automaticamente:', {
        name: seller.name,
        email: seller.email,
        cpf: seller.cpf,
      });

      // React 19: usar Promise.resolve().then() para setState assíncrono
      Promise.resolve().then(() => {
        setFormData(prev => ({
          ...prev,
          sellerName: seller.name || prev.sellerName,
          sellerEmail: seller.email || prev.sellerEmail,
          sellerPhone: seller.phone || prev.sellerPhone,
          sellerCPF: seller.cpf || prev.sellerCPF,
        }));
      });
    }
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para validar CPF
  const validateCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');

    // CPF de desenvolvimento
    if (numbers === '99999999998') return true;

    if (numbers.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(numbers)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(numbers.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(numbers.charAt(10))) return false;

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validar CPF do cliente (obrigatório)
    if (!formData.customerCPF || !validateCPF(formData.customerCPF)) {
      setError('CPF do cliente é obrigatório e deve ser válido.');
      setIsSubmitting(false);
      return;
    }

    // Validar CPF do vendedor (obrigatório)
    if (!formData.sellerCPF || !validateCPF(formData.sellerCPF)) {
      setError('CPF do vendedor é obrigatório e deve ser válido.');
      setIsSubmitting(false);
      return;
    }

    try {
      // 🔍 VERIFICAR SE O LOTE ESTÁ DISPONÍVEL ANTES DE RESERVAR
      console.log(`[usePurchaseForm] 🔍 Verificando disponibilidade do lote ${lot.id}...`);

      const checkResponse = await axios.get(`${API_URL}/mapas/lotes/valido?idLote=${lot.id}`);

      if (checkResponse.data.isAvailable === 0) {
        setError('Este lote não está mais disponível. Por favor, escolha outro lote.');
        setIsSubmitting(false);
        console.log(`[usePurchaseForm] ❌ Lote ${lot.id} não está disponível`);
        return;
      }

      console.log(`[usePurchaseForm] ✅ Lote ${lot.id} está disponível, prosseguindo com a reserva...`);

      // Prosseguir com a reserva
      const requestData = {
        lot: {
          id: lot.id,
          mapId: lot.mapId,
          lotNumber: lot.lotNumber,
          area: lot.area,
          status: 'reserved',
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
          cpf: formData.customerCPF,
          message: formData.message || null,
        },
        seller: {
          name: formData.sellerName,
          email: formData.sellerEmail,
          phone: formData.sellerPhone,
          cpf: formData.sellerCPF,
        },
        purchaseRequest: {
          lotId: lot.id,
          status: 'pending',
          createdAt: new Date().toISOString(),
        }
      };

      const response = await axios.post(`${API_URL}/mapas/lotes/reservar`, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log('[usePurchaseForm] ✅ Reserva enviada com sucesso:', response.data);

      onSuccess();
    } catch (err) {
      console.error('[usePurchaseForm] ❌ Erro ao enviar reserva:', err);

      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Verifica se o erro é de lote indisponível
          if (err.response.status === 409 || err.response.data?.message?.includes('disponível')) {
            setError('Este lote não está mais disponível. Por favor, escolha outro lote.');
          } else {
            setError(`Erro do servidor: ${err.response.data?.message || err.response.statusText}`);
          }
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
