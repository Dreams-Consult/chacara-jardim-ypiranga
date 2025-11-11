'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, UserStatus } from '@/types';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface AuthContextType {
  user: User | null;
  login: (cpf: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  canAccessUsers: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Inicializar com usuário do localStorage para persistir sessão
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch (e) {
          console.error('[AuthContext] Erro ao recuperar usuário:', e);
          localStorage.removeItem('currentUser');
        }
      }
    }
    return null;
  });

  const login = async (cpf: string, password: string): Promise<boolean> => {
    try {
      console.log('[AuthContext] Tentando login...');

      // Normalizar o CPF removendo formatação
      const normalizedCpf = cpf.replace(/\D/g, '');

      // Enviar credenciais para o backend via query params
      const response = await axios.get(`${API_URL}/usuarios/login?cpf=${normalizedCpf}&password=${encodeURIComponent(password)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log('[AuthContext] ✅ Resposta do login:', response.data);

      // A API pode retornar os dados diretamente ou dentro de um objeto 'user'
      const foundUser = response.data.user || response.data;

      if (foundUser && foundUser.id) {
        // Verificar se o usuário está aprovado (apenas para vendedores)
        if (foundUser.status === UserStatus.PENDING && foundUser.role === UserRole.VENDEDOR) {
          console.log('[AuthContext] ⚠️ Usuário PENDING');
          throw new Error('PENDING');
        }

        if (foundUser.status === UserStatus.REJECTED) {
          console.log('[AuthContext] ❌ Usuário REJECTED');
          throw new Error('REJECTED');
        }

        // Remover senha antes de armazenar
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword as User);

        // Salvar no localStorage para persistir sessão após reload
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        localStorage.setItem('userData', JSON.stringify(userWithoutPassword));

        console.log('[AuthContext] ✅ Login realizado com sucesso');
        console.log('[AuthContext] 💾 Dados salvos no localStorage');
        return true;
      }

      console.log('[AuthContext] ❌ Usuário não encontrado');
      return false;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'PENDING') {
          throw error;
        }
        if (error.message === 'REJECTED') {
          throw error;
        }
      }

      // Tratar erros da API
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log('[AuthContext] ❌ Credenciais inválidas');
        return false;
      }

      console.error('[AuthContext] ❌ Erro no login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userData');
    console.log('[AuthContext] 🚪 Logout realizado - dados removidos do localStorage');
  };

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    if (user.role === UserRole.DEV) return true; // Dev tem acesso a tudo
    return user.role === role;
  };

  const canAccessUsers = user?.role === UserRole.DEV || user?.role === UserRole.ADMIN;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
        canAccessUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
