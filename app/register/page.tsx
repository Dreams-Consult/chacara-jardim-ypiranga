'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserRole, UserStatus } from '@/types';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    creci: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData({ ...formData, cpf: formatted });
  };

  // Validar CPF
  const validateCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');

    if (numbers.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(numbers)) return false;

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

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Email válido é obrigatório');
      return false;
    }

    // Validar CPF completo
    if (!validateCPF(formData.cpf)) {
      setError('CPF inválido. Verifique o número digitado.');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Preparar dados do usuário para enviar ao backend
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        cpf: formData.cpf.replace(/\D/g, ''), // Remove formatação do CPF
        creci: formData.creci.trim() || null,
        role: UserRole.VENDEDOR,
        status: UserStatus.PENDING,
        password: formData.password,
      };

      console.log('[Register] Enviando dados do usuário:', userData);

      // Enviar para o backend
      const response = await axios.post(`${API_URL}/usuarios/criar`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log('[Register] ✅ Usuário criado com sucesso:', response.data);

      // Redirecionar para login com mensagem de aguardando aprovação
      router.push('/login?registered=pending');
    } catch (err) {
      console.error('[Register] ❌ Erro ao criar conta:', err);

      // Verificar se é erro de duplicação (email ou CPF já existe)
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 409 || err.response.data?.message?.includes('já existe')) {
          setError(err.response.data?.message || 'Este email ou CPF já está cadastrado');
        } else if (err.response.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Erro ao criar conta. Tente novamente.');
        }
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Criar Conta
            </h1>
            <p className="text-gray-600 mt-2">
              Chácara Jardim Ypiranga
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="João da Silva"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-2">
                CPF
              </label>
              <input
                id="cpf"
                type="text"
                value={formData.cpf}
                onChange={handleCPFChange}
                required
                maxLength={14}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="000.000.000-00"
              />
            </div>

            <div>
              <label htmlFor="creci" className="block text-sm font-medium text-gray-700 mb-2">
                CRECI <span className="text-gray-500 text-xs">(opcional)</span>
              </label>
              <input
                id="creci"
                type="text"
                value={formData.creci}
                onChange={(e) => setFormData({ ...formData, creci: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="CRECI 12345-F"
              />
              <p className="text-xs text-gray-500 mt-1">Número do registro no Conselho Regional de Corretores de Imóveis</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          {/* Link para Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                Fazer login
              </Link>
            </p>
          </div>

          {/* Informação sobre o perfil */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800 font-medium mb-1">⏳ Processo de Aprovação</p>
            <p className="text-xs text-amber-700 mb-2">
              Sua conta será criada com status <strong>PENDENTE</strong> e precisa ser aprovada por um administrador antes de você poder fazer login.
            </p>
            <p className="text-xs text-amber-700">
              💡 Após a aprovação, você receberá acesso e poderá fazer login usando seu <strong>CPF</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
