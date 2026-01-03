'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole, UserStatus } from '@/types';
import axios from 'axios';

const API_URL = '/api';

interface AuthContextType {
  user: User | null;
  login: (cpf: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  canAccessUsers: boolean;
  updateUserTheme: (theme: 'light' | 'dark') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  // Marcar como montado e restaurar usuário do localStorage
  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          console.error('[AuthContext] Erro ao recuperar usuário:', e);
          localStorage.removeItem('currentUser');
        }
      }
    }
  }, []);

  // Validar sessão ao montar o componente
  useEffect(() => {
    if (!mounted) return;

    // Verificar se há dados de sessão no localStorage
    const validateSession = () => {
      if (typeof window === 'undefined') return;

      const storedUser = localStorage.getItem('currentUser');

      // Se não há usuário no estado mas há no localStorage, restaurar
      if (!user && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          console.error('[AuthContext] Erro ao restaurar sessão:', e);
          localStorage.removeItem('currentUser');
          localStorage.removeItem('userData');
        }
      }
    };

    // Validar imediatamente
    validateSession();

    // Validar a cada 30 segundos (opcional - para detectar se outro tab limpou a sessão)
    const intervalId = setInterval(validateSession, 30000);

    return () => clearInterval(intervalId);
  }, [user, mounted]);

  const login = async (cpf: string, password: string): Promise<boolean> => {
    try {

      // Normalizar o CPF removendo formatação
      const normalizedCpf = cpf.replace(/\D/g, '');

      // Enviar credenciais para o backend via query params
      const response = await axios.get(`${API_URL}/usuarios/login?cpf=${normalizedCpf}&password=${encodeURIComponent(password)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      // A API pode retornar os dados diretamente ou dentro de um objeto 'user'
      const foundUser = response.data.user || response.data;

      if (foundUser && foundUser.id) {
        // Verificar se o usuário está aprovado (apenas para vendedores)
        if (foundUser.status === UserStatus.PENDING && foundUser.role === UserRole.VENDEDOR) {
          throw new Error('PENDING');
        }

        if (foundUser.status === UserStatus.REJECTED) {
          throw new Error('REJECTED');
        }

        // Remover senha antes de armazenar
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = foundUser;
        
        // Verificar se já existe preferência de tema salva localmente
        const storedUser = localStorage.getItem('currentUser');
        let finalUser = userWithoutPassword;
        
        if (storedUser) {
          try {
            const parsedStoredUser = JSON.parse(storedUser);
            // Se o usuário já tem uma preferência local E é o mesmo usuário, manter a preferência local
            if (parsedStoredUser.id === userWithoutPassword.id && parsedStoredUser.theme_preference) {
              finalUser = { ...userWithoutPassword, theme_preference: parsedStoredUser.theme_preference };
            }
          } catch (e) {
            console.error('[AuthContext] Erro ao verificar tema local:', e);
          }
        }
        
        setUser(finalUser as User);

        // Salvar no localStorage para persistir sessão após reload
        localStorage.setItem('currentUser', JSON.stringify(finalUser));
        localStorage.setItem('userData', JSON.stringify(finalUser));

        return true;
      }

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
  };

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    if (user.role === UserRole.DEV) return true; // Dev tem acesso a tudo
    return user.role === role;
  };

  const canAccessUsers = user?.role === UserRole.DEV || user?.role === UserRole.ADMIN;

  // Função para atualizar tema do usuário
  const updateUserTheme = (theme: 'light' | 'dark') => {
    if (user) {
      const updatedUser = { ...user, theme_preference: theme };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
        canAccessUsers,
        updateUserTheme,
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
