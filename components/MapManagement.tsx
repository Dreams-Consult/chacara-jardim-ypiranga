'use client';

import React, { useState, useEffect } from 'react';
import { Map } from '@/types';
import { getMaps, saveMap, deleteMap } from '@/lib/storage';
import { compressImage, getBase64Size } from '@/lib/imageUtils';

export default function MapManagement() {
  const [maps, setMaps] = useState<Map[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingMap, setEditingMap] = useState<Map | null>(null);

  useEffect(() => {
    const loadMaps = () => {
      setMaps(getMaps());
    };
    loadMaps();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;

      try {
        // Criar uma imagem temporária para obter dimensões
        if (file.type.startsWith('image/')) {
          // Comprimir imagem antes de salvar
          const compressedDataUrl = await compressImage(dataUrl, 1920, 1080, 0.7);
          const size = getBase64Size(compressedDataUrl);
          
          console.log(`Tamanho da imagem: ${size.toFixed(2)} MB`);
          
          if (size > 4) {
            alert('Imagem muito grande! Por favor, use uma imagem menor ou de menor qualidade.');
            return;
          }

          const img = new Image();
          img.onload = () => {
            try {
              const newMap: Map = {
                id: Date.now().toString(),
                name: editingMap?.name || file.name,
                description: editingMap?.description || '',
                imageUrl: compressedDataUrl,
                imageType: 'image',
                width: img.width,
                height: img.height,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              saveMap(newMap);
              setMaps(getMaps());
              setIsCreating(false);
              setEditingMap(null);
            } catch (error) {
              console.error('Erro ao salvar mapa:', error);
              alert(error instanceof Error ? error.message : 'Erro ao salvar mapa. Tente com uma imagem menor.');
            }
          };
          img.src = compressedDataUrl;
        } else if (file.type === 'application/pdf') {
          const size = getBase64Size(dataUrl);
          console.log(`Tamanho do PDF: ${size.toFixed(2)} MB`);
          
          if (size > 4) {
            alert('PDF muito grande! Por favor, converta para imagem primeiro usando o script convert-pdf.sh ou use uma ferramenta online.');
            return;
          }

          // Para PDFs, usar dimensões padrão
          try {
            const newMap: Map = {
              id: Date.now().toString(),
              name: editingMap?.name || file.name,
              description: editingMap?.description || '',
              imageUrl: dataUrl,
              imageType: 'pdf',
              width: 1920,
              height: 1080,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            saveMap(newMap);
            setMaps(getMaps());
            setIsCreating(false);
            setEditingMap(null);
          } catch (error) {
            console.error('Erro ao salvar PDF:', error);
            alert(error instanceof Error ? error.message : 'Erro ao salvar PDF. Converta para imagem primeiro.');
          }
        }
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        alert('Erro ao processar arquivo. Por favor, tente novamente com um arquivo menor.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este mapa e todos os lotes associados?')) {
      deleteMap(id);
      setMaps(getMaps());
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciamento de Mapas</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Novo Mapa
        </button>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Novo Mapa</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome</label>
                <input
                  type="text"
                  value={editingMap?.name || ''}
                  onChange={(e) =>
                    setEditingMap({ ...editingMap, name: e.target.value } as Map)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Nome do mapa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <textarea
                  value={editingMap?.description || ''}
                  onChange={(e) =>
                    setEditingMap({ ...editingMap, description: e.target.value } as Map)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Descrição do mapa"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload de Imagem ou PDF
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ Tamanho máximo recomendado: 4MB. A imagem será automaticamente comprimida.
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
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {maps.map((map) => (
          <div key={map.id} className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
              {map.imageType === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={map.imageUrl}
                  alt={map.name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-gray-500">PDF: {map.name}</div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{map.name}</h3>
              {map.description && (
                <p className="text-sm text-gray-600 mb-2">{map.description}</p>
              )}
              <p className="text-xs text-gray-500 mb-1">
                {map.width} x {map.height}px
              </p>
              <p className="text-xs text-gray-400 mb-4 font-mono">
                ID: {map.id}
              </p>
              <div className="flex gap-2">
                <a
                  href={`/admin/lots/${map.id}`}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center"
                >
                  Gerenciar Lotes
                </a>
                <button
                  onClick={() => handleDelete(map.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {maps.length === 0 && !isCreating && (
        <div className="text-center py-12 text-gray-500">
          <p>Nenhum mapa cadastrado. Clique em &ldquo;Novo Mapa&rdquo; para começar.</p>
        </div>
      )}
    </div>
  );
}
