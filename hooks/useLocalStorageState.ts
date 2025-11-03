import { useState, useEffect } from 'react';

/**
 * Hook para gerenciar estado sincronizado com localStorage
 * Segue o princípio de Responsabilidade Única: gerencia apenas estado + localStorage
 */
export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
  deserialize: (data: string) => T = JSON.parse
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(initialValue);

  // Carregar dados iniciais
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loadData = () => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          setState(deserialize(stored));
        }
      } catch (error) {
        console.error(`Erro ao carregar ${key}:`, error);
      }
    };

    loadData();
  }, [key, deserialize]);

  return [state, setState];
}
