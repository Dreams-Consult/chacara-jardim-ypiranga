'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Map } from '@/types';
import { useMapOperations } from '@/hooks/useMapOperations';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

// Componente para renderizar preview de PDF com zoom
function PDFPreview({ pdfUrl, mapName }: { pdfUrl: string; mapName: string }) {
  const [pdfImageUrl, setPdfImageUrl] = useState<string>('');
  const [isConverting, setIsConverting] = useState(true);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const convertPDF = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        const scale = 1;
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
          
          const imageData = canvas.toDataURL('image/png');
          setPdfImageUrl(imageData);
        }
      } catch (error) {
        console.error('[PDFPreview] Erro ao converter PDF:', error);
      } finally {
        setIsConverting(false);
      }
    };

    convertPDF();
  }, [pdfUrl]);

  if (isConverting) {
    return (
      <div className="text-center p-4">
        <svg className="w-12 h-12 mx-auto mb-2 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <p className="text-xs font-semibold text-gray-600">Carregando PDF...</p>
      </div>
    );
  }

  if (pdfImageUrl) {
    return (
      <div className="relative">
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <button
            onClick={() => setZoom(Math.min(zoom + 0.25, 3))}
            className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-1 px-2 rounded shadow"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => setZoom(Math.max(zoom - 0.25, 0.5))}
            className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-1 px-2 rounded shadow"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={() => setZoom(1)}
            className="bg-white hover:bg-gray-100 text-gray-800 text-xs py-1 px-2 rounded shadow"
            title="Reset"
          >
            {Math.round(zoom * 100)}%
          </button>
        </div>
        <div className="overflow-auto max-h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pdfImageUrl}
            alt={mapName}
            className="object-contain"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="text-center p-4">
      <svg className="w-16 h-16 mx-auto mb-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
      <p className="text-sm font-bold text-gray-700">Erro ao carregar PDF</p>
    </div>
  );
}

export default function MapManagement() {
  const router = useRouter();
  const { maps, isLoading, deleteMapById, processFileUpload, loadMaps } = useMapOperations();
  const [isCreating, setIsCreating] = useState(false);
  const [editingMap, setEditingMap] = useState<Map | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Atualiza a lista de mapas a cada 3 segundos para todos os clientes
  useRealtimeUpdates(() => {
    loadMaps();
  }, 3000);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    // Criar preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFilePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert('Por favor, selecione um arquivo');
      return;
    }

    if (!editingMap?.name?.trim()) {
      alert('Por favor, preencha o nome do mapa');
      return;
    }

    setIsSubmitting(true);
    try {
      await processFileUpload(selectedFile, editingMap);
      setIsCreating(false);
      setEditingMap(null);
      setSelectedFile(null);
      setFilePreview('');
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
    } finally {
      setIsSubmitting(false);
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white p-6 rounded-2xl w-full max-w-2xl shadow-2xl border-2 border-[var(--primary)]/30 my-4 max-h-[90vh] overflow-y-auto">
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
                  disabled={isSubmitting}
                  className="w-full text-[var(--foreground)] font-medium file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary)]/10 file:text-[var(--primary)] hover:file:bg-[var(--primary)]/20 disabled:opacity-50"
                />
                {!filePreview && (
                  <p className="text-xs text-[var(--warning-dark)] mt-2 bg-[var(--warning)]/10 p-3 rounded-xl border-2 border-[var(--warning)]/30 font-medium">
                    ⚠️ <span className="font-bold">Tamanho máximo recomendado: 4MB.</span> A imagem será automaticamente comprimida.
                    Para PDFs grandes, converta para imagem primeiro usando o script convert-pdf.sh
                  </p>
                )}
              </div>
              {filePreview && (
                <div>
                  <label className="block text-sm font-bold text-[var(--foreground)] mb-2">
                    Preview
                  </label>
                  <div className="border-2 border-[var(--border)] rounded-xl overflow-hidden bg-gray-50">
                    {selectedFile?.type === 'application/pdf' ? (
                      <div className="p-8 text-center">
                        <svg className="w-16 h-16 mx-auto mb-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-semibold text-gray-700 break-words px-2">{selectedFile?.name}</p>
                        <p className="text-xs text-gray-500 mt-1">Arquivo PDF selecionado</p>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={filePreview} alt="Preview" className="w-full max-h-64 object-contain" />
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingMap(null);
                  setSelectedFile(null);
                  setFilePreview('');
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-[var(--surface)] text-[var(--foreground)] font-semibold rounded-xl hover:bg-[var(--surface-hover)] transition-colors shadow-[var(--shadow-sm)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedFile || !editingMap?.name?.trim()}
                className="flex-1 px-4 py-3 bg-[var(--primary)] text-white font-semibold rounded-xl hover:bg-[var(--primary)]/90 transition-colors shadow-[var(--shadow-sm)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Criando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Criar Mapa
                  </>
                )}
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
                map.imageUrl.startsWith('data:application/pdf') ? (
                  <PDFPreview pdfUrl={map.imageUrl} mapName={map.name} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={map.imageUrl}
                    alt={map.name}
                    className="max-w-full max-h-full object-contain"
                  />
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
                <button
                  onClick={() => router.push(`/admin/map-details?mapId=${map.id}`)}
                  className="flex-1 px-4 py-2.5 bg-[var(--primary)] text-white font-semibold rounded-xl hover:bg-[var(--primary-dark)] text-center transition-all shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 cursor-pointer"
                >
                  Gerenciar
                </button>
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
