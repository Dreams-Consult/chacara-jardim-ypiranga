'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Map, Block, Lot, LotStatus } from '@/types';
import { useBlockOperations } from '@/hooks/useBlockOperations';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { loadPdfJs } from '@/lib/pdfjs-wrapper';
import LotSelector from '@/components/LotSelector';

const API_URL = '/api';

// Componente para renderizar preview de PDF com zoom
function PDFPreview({ pdfUrl, mapName }: { pdfUrl: string; mapName: string }) {
  const [pdfImageUrl, setPdfImageUrl] = useState<string>('');
  const [isConverting, setIsConverting] = useState(true);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const convertPDF = async () => {
      try {
        const pdfjsLib = await loadPdfJs();

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        const scale = 2;
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
      <div className="text-center p-8">
        <svg className="w-16 h-16 mx-auto mb-3 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <p className="text-sm font-semibold text-gray-600">Convertendo PDF...</p>
        <p className="text-xs text-gray-500 mt-1">Por favor, aguarde</p>
      </div>
    );
  }

  if (pdfImageUrl) {
    return (
      <div className="relative">
        <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
          <button
            onClick={() => setZoom(Math.min(zoom + 0.25, 3))}
            className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-3 rounded-lg shadow-lg border border-gray-200"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => setZoom(Math.max(zoom - 0.25, 0.5))}
            className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-3 rounded-lg shadow-lg border border-gray-200"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={() => setZoom(1)}
            className="bg-white hover:bg-gray-100 text-gray-800 font-medium text-xs py-2 px-3 rounded-lg shadow-lg border border-gray-200"
            title="Reset"
          >
            {Math.round(zoom * 100)}%
          </button>
        </div>
        <div className="overflow-auto max-h-[800px] rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pdfImageUrl}
            alt={mapName}
            className="rounded-lg shadow-md"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', transition: 'transform 0.2s' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="text-center p-8">
      <svg className="w-16 h-16 mx-auto mb-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
      <p className="text-sm font-bold text-gray-700">Erro ao carregar PDF</p>
    </div>
  );
}

export default function MapDetails() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mapId = searchParams.get('mapId') || '';

  const [map, setMap] = useState<Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger para forçar refresh dos cards
  
  // Estados para modais
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [isAddingLot, setIsAddingLot] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [selectedBlockForLot, setSelectedBlockForLot] = useState<string>('');
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { blocks, loadBlocks, createBlock, updateBlock, deleteBlock } = useBlockOperations();

  // Função para carregar lotes de uma quadra específica
  const loadLotsForBlock = useCallback(async (blockId: string) => {
    if (!mapId) return [];

    try {
      console.log(`[MapDetails] 🔄 Carregando lotes da quadra ${blockId}...`);
      const response = await axios.get(`${API_URL}/mapas/lotes`, {
        params: { mapId, blockId },
        timeout: 10000,
      });

      const data = response.data[0];
      if (data && data.lots && Array.isArray(data.lots)) {
        return data.lots.map((lot: Lot) => ({
          ...lot,
          mapId: data.mapId || mapId,
          createdAt: new Date(lot.createdAt),
          updatedAt: new Date(lot.updatedAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('[MapDetails] ❌ Erro ao buscar lotes da quadra:', error);
      return [];
    }
  }, [mapId]);

  const loadMapData = useCallback(async () => {
    if (!mapId) {
      setIsLoading(false);
      return;
    }

    try {
      console.log(`[MapDetails] 🔄 Carregando dados do mapa ${mapId}...`);
      const response = await axios.get(`${API_URL}/mapas`, {
        timeout: 10000,
      });

      // Buscar o mapa específico pelo ID
      const data = response.data.find((m: any) => m.mapId === mapId || m.id === mapId);
      
      if (data) {
        const mapObj: Map = {
          id: data.mapId || data.id || mapId,
          name: data.name || `Mapa ${data.mapId || mapId}`,
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          imageType: 'image',
          width: data.width || 800,
          height: data.height || 600,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
        };
        setMap(mapObj);
      } else {
        // Se não encontrou o mapa, cria um padrão
        const defaultMap: Map = {
          id: mapId,
          name: `Mapa ${mapId}`,
          description: '',
          imageUrl: '',
          imageType: 'image',
          width: 800,
          height: 600,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setMap(defaultMap);
      }
    } catch (error) {
      console.error('[MapDetails] ❌ Erro ao buscar dados:', error);
      // Em caso de erro, cria um mapa padrão
      const defaultMap: Map = {
        id: mapId,
        name: `Mapa ${mapId}`,
        description: '',
        imageUrl: '',
        imageType: 'image',
        width: 800,
        height: 600,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setMap(defaultMap);
    } finally {
      setIsLoading(false);
    }
  }, [mapId]);

  useEffect(() => {
    if (mapId) {
      loadMapData();
      loadBlocks(mapId);
    }
  }, [mapId, loadMapData, loadBlocks]);

  useRealtimeUpdates(() => {
    if (mapId) {
      loadMapData();
      loadBlocks(mapId);
    }
  }, 10000);

  const handleAddBlock = () => {
    setEditingBlock({
      id: '',
      mapId,
      name: '',
      description: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setIsAddingBlock(true);
  };

  const handleSaveBlock = async () => {
    if (!editingBlock) return;

    if (!editingBlock.name || editingBlock.name.trim() === '') {
      alert('❌ Nome da quadra é obrigatório');
      return;
    }

    try {
      if (editingBlock.id) {
        await updateBlock(editingBlock);
      } else {
        await createBlock({
          mapId: editingBlock.mapId,
          name: editingBlock.name,
          description: editingBlock.description,
        });
      }
      setIsAddingBlock(false);
      setEditingBlock(null);
    } catch (error) {
      console.error('Erro ao salvar quadra:', error);
      alert('Erro ao salvar quadra. Tente novamente.');
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    try {
      // Busca lotes da quadra para informar o usuário
      const lotsInBlock = await loadLotsForBlock(blockId);
      
      const message = lotsInBlock.length > 0
        ? `Esta quadra possui ${lotsInBlock.length} lote(s) cadastrado(s) que serão excluídos.\n\nTem certeza que deseja continuar?`
        : 'Tem certeza que deseja excluir esta quadra?';

      if (confirm(message)) {
        await deleteBlock(blockId, mapId);
        alert('✅ Quadra excluída com sucesso!');
      }
    } catch (error: any) {
      console.error('Erro ao deletar quadra:', error);
      
      // Tratar erro de lotes reservados/vendidos
      if (error.error && error.count) {
        alert(
          `❌ Não é possível excluir esta quadra\n\n` +
          `Existem ${error.count} lote(s) com reservas ou vendas ativas.\n\n` +
          `📋 O que fazer:\n` +
          `1. Acesse a página de Reservas\n` +
          `2. Cancele as reservas/vendas dos lotes desta quadra\n` +
          `3. Tente excluir a quadra novamente\n\n` +
          `💡 Dica: Você pode identificar os lotes pelos status "Reservado" ou "Vendido"`
        );
      } else if (error.error) {
        alert(`❌ Erro ao excluir quadra\n\n${error.error}`);
      } else {
        alert('❌ Erro ao deletar quadra. Verifique sua conexão e tente novamente.');
      }
    }
  };

  const handleAddLotToBlock = (blockId: string) => {
    setSelectedBlockForLot(blockId);
    setIsAddingLot(true);
  };

  const handleSaveLot = async (lot: Lot) => {
    try {
      console.log('[MapDetails] 📤 Salvando lote:', lot);
      
      if (!lot.lotNumber || lot.lotNumber.trim() === '') {
        alert('❌ Número do lote é obrigatório');
        return;
      }

      if (!lot.size || lot.size <= 0) {
        alert('❌ Informe o tamanho do lote (m²)');
        return;
      }

      if (!lot.price || lot.price <= 0) {
        alert('❌ O preço total do lote deve ser maior que zero');
        return;
      }

      const lotToSave = {
        id: lot.id,
        mapId: mapId,
        blockId: lot.blockId || selectedBlockForLot || null,
        lotNumber: lot.lotNumber,
        status: lot.status,
        price: lot.price,
        pricePerM2: lot.pricePerM2,
        size: lot.size,
        description: lot.description || '',
        features: lot.features || [],
      };

      if (lot.id && lot.id !== '') {
        console.log('[MapDetails] 🔄 Atualizando lote existente:', lotToSave);
        const response = await axios.patch(`${API_URL}/mapas/lotes/atualizar`, lotToSave, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        });
        console.log('[MapDetails] ✅ Lote atualizado:', response.data);
      } else {
        console.log('[MapDetails] ➕ Criando novo lote:', lotToSave);
        const response = await axios.post(`${API_URL}/mapas/lotes/criar`, {
          ...lotToSave,
          id: Date.now().toString(),
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        });
        console.log('[MapDetails] ✅ Lote criado:', response.data);
      }

      // Força refresh apenas dos cards de quadra
      setRefreshTrigger(prev => prev + 1);
      setIsAddingLot(false);
      setSelectedBlockForLot('');
      alert('✅ Lote salvo com sucesso!');
    } catch (error: any) {
      console.error('[MapDetails] ❌ Erro ao salvar lote:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao salvar lote. Tente novamente.';
      alert(`❌ ${errorMessage}`);
    }
  };

  const handleEditLot = async (lot: Lot) => {
    await handleSaveLot(lot);
    // Força refresh dos cards após editar lote
    setRefreshTrigger(prev => prev + 1);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo (imagem ou PDF)
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    
    if (!isImage && !isPDF) {
      alert('Por favor, selecione uma imagem (JPG, PNG, GIF) ou um arquivo PDF');
      return;
    }

    // Validar tamanho (máximo 50MB para PDF, 10MB para imagem)
    const maxSize = isPDF ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`O arquivo deve ter no máximo ${isPDF ? '50MB' : '10MB'}`);
      return;
    }

    setImageFile(file);
    
    // Criar preview (apenas para imagens)
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Para PDF, mostrar ícone
      setImagePreview('PDF');
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile || !mapId) return;

    setIsUploadingImage(true);

    try {
      const isPDF = imageFile.type === 'application/pdf';
      
      // Converter arquivo para base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;

        try {
          if (isPDF) {
            // Para PDF, enviar direto sem verificar dimensões
            await axios.post(`${API_URL}/mapas/atualizar-imagem`, {
              mapId,
              imageUrl: base64Data,
              width: 800,  // Valor padrão para PDFs
              height: 600, // Valor padrão para PDFs
            }, {
              headers: {
                'Content-Type': 'application/json',
              },
              timeout: 120000,
            });

            console.log('[MapDetails] ✅ PDF atualizado');
            alert('✅ PDF atualizado com sucesso!');
            setIsEditingImage(false);
            setImageFile(null);
            setImagePreview('');
            setIsUploadingImage(false);
            loadMapData();
          } else {
            // Para imagem, obter dimensões
            const img = new Image();
            img.onload = async () => {
              const width = img.width;
              const height = img.height;

              await axios.post(`${API_URL}/mapas/atualizar-imagem`, {
                mapId,
                imageUrl: base64Data,
                width,
                height,
              }, {
                headers: {
                  'Content-Type': 'application/json',
                },
                timeout: 30000,
              });

              console.log('[MapDetails] ✅ Imagem atualizada');
              alert('✅ Imagem atualizada com sucesso!');
              setIsEditingImage(false);
              setImageFile(null);
              setImagePreview('');
              setIsUploadingImage(false);
              loadMapData();
            };
            img.onerror = () => {
              alert('Erro ao processar imagem');
              setIsUploadingImage(false);
            };
            img.src = base64Data;
          }
        } catch (err: any) {
          console.error('[MapDetails] ❌ Erro ao enviar arquivo:', err);
          alert(err.response?.data?.error || 'Erro ao fazer upload do arquivo');
          setIsUploadingImage(false);
        }
      };
      reader.onerror = () => {
        alert('Erro ao ler arquivo');
        setIsUploadingImage(false);
      };
      reader.readAsDataURL(imageFile);
    } catch (err) {
      console.error('[MapDetails] ❌ Erro:', err);
      alert('Erro ao processar arquivo');
      setIsUploadingImage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--accent)]/20 rounded-full mb-4 shadow-md">
            <svg className="w-8 h-8 text-[var(--accent)] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-white font-semibold">Carregando dados do mapa...</p>
        </div>
      </div>
    );
  }

  if (!map) {
    return (
      <div className="min-h-screen bg-[var(--background)] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4 shadow-md">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-white font-semibold mb-2">Erro ao carregar mapa</p>
          <button
            onClick={() => router.push('/admin/map-management')}
            className="px-4 py-2 bg-[var(--accent)] text-[#1c1c1c] font-semibold rounded-lg hover:bg-[var(--accent-light)] transition-colors"
          >
            Voltar para Gerência de Loteamentos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/map-management')}
          className="text-[var(--accent)] hover:text-[var(--accent-light)] font-medium hover:underline mb-4 transition-colors cursor-pointer"
        >
          ← Voltar para Gerência de Loteamentos
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">{map.name}</h1>
            {map.description && <p className="text-white/70 mt-1">{map.description}</p>}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditingImage(true)}
              className="px-5 py-2.5 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 shadow-[var(--shadow-md)] transition-all hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {map.imageUrl ? 'Editar Imagem' : 'Adicionar Imagem'}
            </button>
            <button
              onClick={handleAddBlock}
              className="px-5 py-2.5 bg-[var(--accent)] text-[#1c1c1c] font-semibold rounded-xl hover:bg-[var(--accent-light)] shadow-[var(--shadow-md)] transition-all hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 cursor-pointer"
            >
              + Adicionar Quadra
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Quadras */}
      <div className="space-y-6 mb-8">
        {!blocks || blocks.length === 0 ? (
          <div className="text-center py-12 bg-[var(--card-bg)] rounded-2xl border-2 border-dashed border-[var(--accent)]/40 shadow-[var(--shadow-md)]">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--accent)]/20 rounded-full mb-4 shadow-md">
              <svg className="w-8 h-8 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-white text-lg font-semibold mb-2">Nenhuma quadra cadastrada</p>
            <p className="text-white/70 text-sm font-medium">Clique em "Adicionar Quadra" para começar a organizar seus lotes</p>
          </div>
        ) : (
          blocks.map((block) => (
            <BlockCard
              key={`${block.id}-${refreshTrigger}`}
              block={block}
              mapId={mapId}
              loadLotsForBlock={loadLotsForBlock}
              handleAddLotToBlock={handleAddLotToBlock}
              handleEditLot={handleEditLot}
              handleDeleteBlock={handleDeleteBlock}
              setEditingBlock={setEditingBlock}
              setIsAddingBlock={setIsAddingBlock}
              allBlocks={blocks}
              refreshTrigger={refreshTrigger}
            />
          ))
        )}
      </div>

      {/* Visualização da Imagem/PDF do Mapa */}
      {map && map.imageUrl && map.imageUrl.trim() !== '' && (
        <div className="bg-white border-2 border-[var(--primary)]/30 rounded-2xl overflow-hidden shadow-[var(--shadow-lg)] p-6">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Imagem do Mapa
          </h2>
          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center">
            {map.imageUrl.startsWith('data:application/pdf') ? (
              <PDFPreview pdfUrl={map.imageUrl} mapName={map.name} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={map.imageUrl}
                alt={map.name}
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            )}
          </div>
        </div>
      )}

      {/* Modal de Adicionar/Editar Quadra */}
      {isAddingBlock && editingBlock && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl border-2 border-[var(--primary)]/30">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {editingBlock.id ? 'Editar Quadra' : 'Adicionar Quadra'}
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-2">
                  Nome da Quadra *
                </label>
                <input
                  type="text"
                  value={editingBlock.name}
                  onChange={(e) => setEditingBlock({ ...editingBlock, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border-2 border-[var(--border)] rounded-xl text-[var(--foreground)] font-medium focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] shadow-[var(--shadow-sm)]"
                  placeholder="Ex: Quadra A, Quadra 1, Setor Norte"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-2">
                  Descrição
                </label>
                <textarea
                  value={editingBlock.description || ''}
                  onChange={(e) => setEditingBlock({ ...editingBlock, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border-2 border-[var(--border)] rounded-xl text-[var(--foreground)] font-medium focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] shadow-[var(--shadow-sm)]"
                  placeholder="Descrição opcional da quadra"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setIsAddingBlock(false);
                  setEditingBlock(null);
                }}
                className="flex-1 px-4 py-2.5 bg-[var(--surface)] text-[var(--foreground)] font-semibold rounded-xl hover:bg-[var(--surface-hover)] transition-colors shadow-[var(--shadow-sm)] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveBlock}
                className="flex-1 px-4 py-2.5 bg-[var(--primary)] text-white font-semibold rounded-xl hover:bg-[var(--primary-dark)] transition-all shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] cursor-pointer"
              >
                {editingBlock.id ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar Lote */}
      {isAddingLot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white p-4 sm:p-6 rounded-2xl w-full max-w-md shadow-2xl border-2 border-[var(--primary)]/30 my-4 max-h-[95vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-4 sm:mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              Adicionar Lote
            </h2>
            <LotForm
              blockId={selectedBlockForLot}
              blockName={blocks.find(b => b.id === selectedBlockForLot)?.name || ''}
              onSave={handleSaveLot}
              onCancel={() => {
                setIsAddingLot(false);
                setSelectedBlockForLot('');
              }}
            />
          </div>
        </div>
      )}

      {/* Modal de Adicionar/Editar Imagem */}
      {isEditingImage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-2xl border-2 border-blue-500/30">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {map.imageUrl ? 'Editar Imagem do Mapa' : 'Adicionar Imagem do Mapa'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-2">
                  Selecionar Arquivo
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleImageSelect}
                  disabled={isUploadingImage}
                  className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-900 cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white file:font-semibold hover:file:bg-blue-600 transition-colors disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos aceitos: JPG, PNG, GIF, PDF. Tamanho máximo: 10MB (imagens) ou 50MB (PDF)
                </p>
              </div>

              {imagePreview && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
                  {imagePreview === 'PDF' ? (
                    <div className="w-full h-40 bg-gray-100 rounded-lg border-2 border-blue-500 flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-red-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <p className="text-gray-700 font-semibold">{imageFile?.name}</p>
                      <p className="text-gray-500 text-sm">Arquivo PDF selecionado</p>
                    </div>
                  ) : (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-64 object-contain bg-gray-100 rounded-lg border-2 border-blue-500"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setIsEditingImage(false);
                  setImageFile(null);
                  setImagePreview('');
                }}
                disabled={isUploadingImage}
                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleUploadImage}
                disabled={!imageFile || isUploadingImage}
                className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isUploadingImage ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Salvar Imagem
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de formulário de lote
interface LotFormProps {
  blockId: string;
  blockName: string;
  onSave: (lot: Lot) => void;
  onCancel: () => void;
}

function LotForm({ blockId, blockName, onSave, onCancel }: LotFormProps) {
  const [lotNumber, setLotNumber] = useState('');
  const [size, setSize] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [priceDisplay, setPriceDisplay] = useState<string>('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<LotStatus>(LotStatus.AVAILABLE);

  const handleSubmit = () => {
    const pricePerM2 = size > 0 ? totalPrice / size : 0;
    
    const lot: Lot = {
      id: '',
      mapId: '',
      blockId,
      lotNumber,
      status,
      price: totalPrice,
      pricePerM2,
      size,
      description,
      features: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onSave(lot);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
        <p className="text-xs sm:text-sm text-blue-800">
          <strong>Quadra:</strong> {blockName || 'Não identificada'}
        </p>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-bold text-[var(--foreground)] mb-1.5 sm:mb-2">
          Número do Lote *
        </label>
        <input
          type="text"
          value={lotNumber}
          onChange={(e) => setLotNumber(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-[var(--border)] rounded-xl text-[var(--foreground)] font-medium focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] text-sm sm:text-base"
          placeholder="Ex: 01, A1, etc"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-bold text-[var(--foreground)] mb-1.5 sm:mb-2">
          Área (m²) *
        </label>
        <input
          type="number"
          value={size || ''}
          onChange={(e) => setSize(parseFloat(e.target.value) || 0)}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-[var(--border)] rounded-xl text-[var(--foreground)] font-medium focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] text-sm sm:text-base"
          placeholder="300"
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-bold text-[var(--foreground)] mb-1.5 sm:mb-2">
          Preço Total (R$) *
        </label>
        <input
          type="text"
          value={priceDisplay}
          onChange={(e) => {
            let value = e.target.value;
            
            // Remove tudo exceto dígitos
            value = value.replace(/\D/g, '');
            
            if (value === '') {
              setPriceDisplay('');
              setTotalPrice(0);
              return;
            }
            
            // Adiciona zeros à esquerda se necessário
            value = value.padStart(3, '0');
            
            // Separa centavos dos reais
            const cents = value.slice(-2);
            const reais = value.slice(0, -2);
            
            // Formata com separador de milhar
            const formattedReais = parseInt(reais).toLocaleString('pt-BR');
            const formattedValue = `${formattedReais},${cents}`;
            
            setPriceDisplay(formattedValue);
            
            // Converte para número decimal
            const numericValue = parseFloat(`${reais}.${cents}`);
            setTotalPrice(numericValue);
          }}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-[var(--border)] rounded-xl text-[var(--foreground)] font-medium focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] text-sm sm:text-base"
          placeholder="0,00"
        />
        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">💡 Preencha manualmente o valor do lote</p>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-bold text-[var(--foreground)] mb-1.5 sm:mb-2">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as LotStatus)}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-[var(--border)] rounded-xl text-[var(--foreground)] font-medium cursor-pointer focus:ring-2 focus:ring-[var(--primary)] text-sm sm:text-base"
        >
          <option value={LotStatus.AVAILABLE}>Disponível</option>
          <option value={LotStatus.BLOCKED}>Bloqueado</option>
        </select>
        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">💡 Para reservar ou vender, use a página de Reservas</p>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-bold text-[var(--foreground)] mb-1.5 sm:mb-2">
          Descrição
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-[var(--border)] rounded-xl text-[var(--foreground)] font-medium focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] text-sm sm:text-base"
          placeholder="Informações adicionais sobre o lote"
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-2 sm:pt-4">
        <button
          onClick={onCancel}
          className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-[var(--surface)] text-[var(--foreground)] font-semibold rounded-xl hover:bg-[var(--surface-hover)] transition-colors cursor-pointer text-sm sm:text-base"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-[var(--primary)] text-white font-semibold rounded-xl hover:bg-[var(--primary-dark)] transition-all cursor-pointer text-sm sm:text-base"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}

// Componente de Card de Quadra com carregamento dinâmico de lotes
interface BlockCardProps {
  block: Block;
  mapId: string;
  loadLotsForBlock: (blockId: string) => Promise<Lot[]>;
  handleAddLotToBlock: (blockId: string) => void;
  handleEditLot: (lot: Lot) => Promise<void>;
  handleDeleteBlock: (blockId: string) => Promise<void>;
  setEditingBlock: (block: Block) => void;
  setIsAddingBlock: (isAdding: boolean) => void;
  allBlocks: Block[];
  refreshTrigger: number;
}

function BlockCard({
  block,
  mapId,
  loadLotsForBlock,
  handleAddLotToBlock,
  handleEditLot,
  handleDeleteBlock,
  setEditingBlock,
  setIsAddingBlock,
  allBlocks,
  refreshTrigger,
}: BlockCardProps) {
  const [blockLots, setBlockLots] = useState<Lot[]>([]);
  const [isLoadingLots, setIsLoadingLots] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  // Verificar se existem lotes reservados ou vendidos
  const hasReservedOrSoldLots = blockLots.some(
    lot => lot.status === LotStatus.RESERVED || lot.status === LotStatus.SOLD
  );
  const reservedOrSoldCount = blockLots.filter(
    lot => lot.status === LotStatus.RESERVED || lot.status === LotStatus.SOLD
  ).length;

  useEffect(() => {
    const fetchLots = async () => {
      setIsLoadingLots(true);
      const lots = await loadLotsForBlock(block.id);
      setBlockLots(lots);
      setIsLoadingLots(false);
    };

    fetchLots();
  }, [block.id, loadLotsForBlock, refreshTrigger]);

  return (
    <div
      className="bg-white border-2 border-[var(--primary)]/30 rounded-2xl overflow-hidden shadow-[var(--shadow-lg)] hover:shadow-[var(--shadow-xl)] transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header da Quadra */}
      <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] p-5 relative">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{block.name}</h3>
            {block.description && (
              <p className="text-white/80 text-sm">{block.description}</p>
            )}
            <p className="text-white/70 text-sm mt-2">
              {isLoadingLots ? (
                'Carregando lotes...'
              ) : (
                `${blockLots.length} ${blockLots.length === 1 ? 'lote cadastrado' : 'lotes cadastrados'}`
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleAddLotToBlock(block.id)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-all backdrop-blur-sm flex items-center gap-2"
              title="Adicionar lote nesta quadra"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Lote
            </button>
            <button
              onClick={() => {
                setEditingBlock(block);
                setIsAddingBlock(true);
              }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-all backdrop-blur-sm"
            >
              Editar
            </button>
            {!hasReservedOrSoldLots ? (
              <button
                onClick={() => handleDeleteBlock(block.id)}
                disabled={isLoadingLots}
                className="px-4 py-2 bg-[var(--danger)] hover:bg-[var(--danger-dark)] text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--danger)]"
              >
                Excluir
              </button>
            ) : (
              <div className="px-4 py-2 bg-orange-500/90 text-white font-semibold rounded-lg cursor-not-allowed flex items-center gap-2" title={`Esta quadra possui ${reservedOrSoldCount} lote(s) reservado(s) ou vendido(s). Cancele as reservas/vendas para poder excluir.`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Bloqueado
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lotes da Quadra */}
      <div className="p-5">
        {hasReservedOrSoldLots && (
          <div className="mb-4 bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold text-orange-800 text-sm mb-1">⚠️ Quadra com lotes reservados/vendidos</p>
                <p className="text-orange-700 text-sm">
                  Esta quadra possui <strong>{reservedOrSoldCount} lote(s)</strong> com reservas ou vendas ativas.
                  Para excluir esta quadra, cancele primeiro as reservas/vendas na página de <strong>Reservas</strong>.
                </p>
              </div>
            </div>
          </div>
        )}
        {isLoadingLots ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-3">
              <svg className="w-6 h-6 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-gray-600 text-sm">Carregando lotes...</p>
          </div>
        ) : blockLots && blockLots.length > 0 ? (
          <LotSelector
            lots={blockLots}
            blocks={allBlocks}
            onLotEdit={handleEditLot}
            selectedLotIds={[]}
            allowMultipleSelection={false}
            lotsPerRow={15}
          />
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-600 font-medium mb-2">Nenhum lote cadastrado nesta quadra</p>
            <p className="text-gray-500 text-sm mb-4">Passe o mouse sobre a quadra e clique em "+ Lote"</p>
          </div>
        )}
      </div>
    </div>
  );
}
