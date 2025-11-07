'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Map } from '@/types';
import { useMapOperations } from '@/hooks/useMapOperations';

export default function MapManagement() {
  const { maps, isLoading, deleteMapById, processFileUpload } = useMapOperations();
  const [isCreating, setIsCreating] = useState(false);
  const [editingMap, setEditingMap] = useState<Map | null>(null);

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Mapas</h1>
        <div className="flex gap-2">
          <a
            href="/admin/data"
            className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 shadow-md transition-all hover:shadow-lg"
          >
            📦 Exportar/Importar
          </a>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md transition-all hover:shadow-lg"
          >
            Novo Mapa
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Carregando mapas...</p>
        </div>
      ) : maps.length === 0 && !isCreating ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 text-lg mb-2">Nenhum mapa cadastrado</p>
          <p className="text-gray-500 text-sm">Clique em &quot;Novo Mapa&quot; para começar</p>
        </div>
      ) : null}

      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Novo Mapa</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Nome</label>
                <input
                  type="text"
                  value={editingMap?.name || ''}
                  onChange={(e) =>
                    setEditingMap({ ...editingMap, name: e.target.value } as Map)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nome do mapa"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Descrição</label>
                <textarea
                  value={editingMap?.description || ''}
                  onChange={(e) =>
                    setEditingMap({ ...editingMap, description: e.target.value } as Map)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descrição do mapa"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Upload de Imagem ou PDF
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="w-full text-gray-900"
                />
                <p className="text-xs text-amber-700 mt-2 bg-amber-50 p-2 rounded border border-amber-200">
                  ⚠️ <span className="font-medium">Tamanho máximo recomendado: 4MB.</span> A imagem será automaticamente comprimida.
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
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {maps.map((map) => (
          <div key={map.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
              {map.imageUrl && map.imageUrl.trim() !== '' ? (
                map.imageType === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={map.imageUrl}
                    alt={map.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-gray-600 font-medium">PDF: {map.name}</div>
                )
              ) : (
                <div className="text-gray-400 text-center p-4">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Sem imagem</p>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-900 mb-2">{map.name}</h3>
              {map.description && (
                <p className="text-sm text-gray-700 mb-3">{map.description}</p>
              )}
              <p className="text-xs text-gray-600 mb-1">
                <span className="font-medium">Dimensões:</span> {map.width} x {map.height}px
              </p>
              <p className="text-xs text-gray-500 mb-4 font-mono">
                ID: {map.id}
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/admin/lot-management?mapId=${map.id}`}
                  className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 text-center transition-colors shadow-sm hover:shadow-md"
                >
                  Gerenciar Lotes
                </Link>
                <button
                  onClick={() => handleDelete(map.id)}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
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
          <p className="text-gray-600 text-lg">Nenhum mapa cadastrado. Clique em &ldquo;Novo Mapa&rdquo; para começar.</p>
        </div>
      )}
    </div>
  );
}
