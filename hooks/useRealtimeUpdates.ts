import { useEffect } from 'react';

/**
 * Hook para receber atualizações em tempo real via polling
 * Verifica mudanças no servidor a cada X segundos
 */
export function useRealtimeUpdates(onUpdate: () => void, intervalMs: number = 5000) {
  useEffect(() => {
    const interval = setInterval(() => {
      onUpdate();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [onUpdate, intervalMs]);
}

/**
 * Hook alternativo usando Server-Sent Events (SSE)
 * Requer implementação no backend
 */
export function useSSE(endpoint: string, onMessage: (data: unknown) => void) {
  useEffect(() => {
    const eventSource = new EventSource(endpoint);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Erro ao processar mensagem SSE:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Erro na conexão SSE:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [endpoint, onMessage]);
}
