'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Map } from '@/types';
import { useMapOperations } from '@/hooks/useMapOperations';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

export default function MapManagement() {
  const { maps, isLoading, deleteMapById, processFileUpload, loadMaps } = useMapOperations();
  const [isCreating, setIsCreating] = useState(false);
  const [editingMap, setEditingMap] = useState<Map | null>(null);

  // Atualiza a lista de mapas a cada 3 segundos para todos os clientes
  useRealtimeUpdates(() => {
    loadMaps();
  }, 3000);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await processFileUpload(file, editingMap);
      setIsCreating(false);
      setEditingMap(null);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este mapa e todos os lotes associados?')) {
      try {
        await deleteMapById(id);
      } catch (err) {
        console.error('Erro ao deletar:', err);
        alert('Erro ao deletar mapa. Tente novamente.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Gerenciamento de Mapas</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="px-5 py-2.5 bg-[var(--accent)] text-[#1c1c1c] font-semibold rounded-xl hover:bg-[var(--accent-light)] shadow-[var(--shadow-md)] transition-all hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 cursor-pointer"
        >
          Novo Mapa
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--accent)]/20 rounded-full mb-4 shadow-md">
            <svg className="w-8 h-8 text-[var(--accent)] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-white font-semibold">Carregando mapas...</p>
        </div>
      ) : maps.length === 0 && !isCreating ? (
        <div className="text-center py-12 bg-[var(--card-bg)] rounded-2xl border-2 border-dashed border-[var(--accent)]/40 shadow-[var(--shadow-md)]">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--accent)]/20 rounded-full mb-4 shadow-md">
            <svg className="w-8 h-8 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-white text-lg font-semibold mb-2">Nenhum mapa cadastrado</p>
          <p className="text-white/70 text-sm font-medium">Clique em &quot;Novo Mapa&quot; para começar</p>
        </div>
      ) : null}

      {isCreating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl border-2 border-[var(--primary)]/30">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Novo Mapa
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Nome</label>
                <input
                  type="text"
                  value={editingMap?.name || ''}
                  onChange={(e) =>
                    setEditingMap({ ...editingMap, name: e.target.value } as Map)
                  }
                  className="w-full px-4 py-2.5 bg-white border-2 border-[var(--border)] rounded-xl text-[var(--foreground)] font-medium focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] shadow-[var(--shadow-sm)]"
                  placeholder="Nome do mapa"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Descrição</label>
                <textarea
                  value={editingMap?.description || ''}
                  onChange={(e) =>
                    setEditingMap({ ...editingMap, description: e.target.value } as Map)
                  }
                  className="w-full px-4 py-2.5 bg-white border-2 border-[var(--border)] rounded-xl text-[var(--foreground)] font-medium focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] shadow-[var(--shadow-sm)]"
                  placeholder="Descrição do mapa"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-2">
                  Upload de Imagem ou PDF
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="w-full text-[var(--foreground)] font-medium file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary)]/10 file:text-[var(--primary)] hover:file:bg-[var(--primary)]/20"
                />
                <p className="text-xs text-[var(--warning-dark)] mt-2 bg-[var(--warning)]/10 p-3 rounded-xl border-2 border-[var(--warning)]/30 font-medium">
                  ⚠️ <span className="font-bold">Tamanho máximo recomendado: 4MB.</span> A imagem será automaticamente comprimida.
                  Para PDFs grandes, converta para imagem primeiro usando o script convert-pdf.sh
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingMap(null);
                }}
                className="flex-1 px-4 py-2.5 bg-[var(--surface)] text-[var(--foreground)] font-semibold rounded-xl hover:bg-[var(--surface-hover)] transition-colors shadow-[var(--shadow-sm)] cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {maps.map((map) => (
          <div key={map.id} className="bg-white border-2 border-[var(--primary)]/30 rounded-2xl overflow-hidden shadow-[var(--shadow-lg)] hover:shadow-[var(--shadow-xl)] transition-shadow">
            <div className="h-48 bg-gradient-to-br from-[var(--surface)] to-[var(--surface-hover)] flex items-center justify-center overflow-hidden">
              {map.imageUrl && map.imageUrl.trim() !== '' ? (
                map.imageType === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={map.imageUrl}
                    alt={map.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-[var(--foreground)] font-bold">PDF: {map.name}</div>
                )
              ) : (
                <div className="text-[var(--foreground)]/60 text-center p-4">
                  <svg className="w-16 h-16 mx-auto mb-2 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-semibold">Sem imagem</p>
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg text-[var(--surface)] mb-2">{map.name}</h3>
              {map.description && (
                <p className="text-sm text-[var(--surface)] font-medium mb-3">{map.description}</p>
              )}
              <div className="space-y-1 mb-4">
                <p className="text-xs text-[var(--surface)]/80 font-semibold">
                  <span className="font-bold">Dimensões:</span> {map.width} x {map.height}px
                </p>
                <p className="text-xs text-[var(--foreground)]/60 font-mono bg-[var(--surface)] px-2 py-1 rounded">
                  ID: {map.id}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/lot-management?mapId=${map.id}`}
                  className="flex-1 px-4 py-2.5 bg-[var(--success)] text-white font-semibold rounded-xl hover:bg-[var(--success-dark)] text-center transition-all shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 cursor-pointer"
                >
                  Gerenciar Lotes
                </Link>
                <button
                  onClick={() => handleDelete(map.id)}
                  className="px-4 py-2.5 bg-[var(--danger)] text-white font-semibold rounded-xl hover:bg-[var(--danger-dark)] transition-all shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 cursor-pointer"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {maps.length === 0 && !isCreating && (
        <div className="text-center py-12">
          <p className="text-[var(--foreground)] text-lg font-semibold">Nenhum mapa cadastrado. Clique em &ldquo;Novo Mapa&rdquo; para começar.</p>
        </div>
      )}
    </div>
  );
}
