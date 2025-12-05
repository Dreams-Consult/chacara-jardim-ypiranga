'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Map, Block, Lot, LotStatus } from '@/types';
import { useBlockOperations } from '@/hooks/useBlockOperations';
import { loadPdfJs } from '@/lib/pdfjs-wrapper';
import LotSelector from '@/components/LotSelector';
import InteractiveMap from '@/components/InteractiveMap';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = '/api';

export default function MapDetails() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mapId = searchParams.get('mapId') || '';
  const { user } = useAuth();

  const [map, setMap] = useState<Map | null>(null);
  const [allMaps, setAllMaps] = useState<Map[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger para forçar refresh dos cards
  
  // Estados para modais
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [isAddingLot, setIsAddingLot] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [selectedBlockForLot, setSelectedBlockForLot] = useState<string>('');
  const [canSubmitLot, setCanSubmitLot] = useState(false);
  const [submitLotFn, setSubmitLotFn] = useState<(() => void) | null>(null);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [reservations, setReservations] = useState<any[]>([]);
  const [allLots, setAllLots] = useState<Lot[]>([]); // Todos os lotes do mapa para InteractiveMap

  const { blocks, loadBlocks, createBlock, updateBlock, deleteBlock } = useBlockOperations();

  // Função para buscar reservas
  const fetchReservations = async () => {
    try {
      const response = await axios.get('/api/reservas');
      setReservations(response.data);
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
    }
  };

  // Buscar reservas para mostrar informações nos modais
  useEffect(() => {
    fetchReservations();
  }, []);

  // Função para carregar lotes de uma quadra específica
  const loadLotsForBlock = useCallback(async (blockId: string) => {
    if (!mapId) return [];

    try {
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

  // Função para carregar TODOS os lotes do mapa
  const loadAllLots = useCallback(async () => {
    if (!mapId) return;

    try {
      const response = await axios.get(`${API_URL}/mapas/lotes`, {
        params: { mapId }, // Sem blockId = todos os lotes
        timeout: 10000,
      });

      const data = response.data[0];
      if (data && data.lots && Array.isArray(data.lots)) {
        const lotsWithMapId = data.lots.map((lot: Lot) => ({
          ...lot,
          mapId: data.mapId || mapId,
          createdAt: new Date(lot.createdAt),
          updatedAt: new Date(lot.updatedAt),
        }));
        setAllLots(lotsWithMapId);
      }
    } catch (error) {
      console.error('[MapDetails] ❌ Erro ao carregar todos os lotes:', error);
    }
  }, [mapId]);

  const loadMapData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/mapas`, {
        timeout: 10000,
      });

      const mapsData = response.data;
      const formattedMaps: Map[] = mapsData.map((m: any) => ({
        id: m.mapId || m.id,
        name: m.name || `Mapa ${m.mapId || m.id}`,
        description: m.description || '',
        imageUrl: m.imageUrl || '',
        imageType: 'image',
        width: m.width || 800,
        height: m.height || 600,
        createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
        updatedAt: m.updatedAt ? new Date(m.updatedAt) : new Date(),
      }));
      
      setAllMaps(formattedMaps);

      // Se tem mapId, buscar o mapa específico
      if (mapId) {
        const data = mapsData.find((m: any) => m.mapId === mapId || m.id === mapId);
        
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
          setMap(null);
        }
      } else {
        // Se não tem mapId, selecionar o primeiro mapa
        if (formattedMaps.length > 0) {
          const firstMap = formattedMaps[0];
          router.push(`/admin/map-details?mapId=${firstMap.id}`);
        } else {
          setMap(null);
        }
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
  }, [mapId, router]);

  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  useEffect(() => {
    if (mapId) {
      loadBlocks(mapId);
      loadAllLots(); // Carregar todos os lotes para o InteractiveMap
    }
  }, [mapId, loadBlocks, loadAllLots]);

  // Selecionar automaticamente a primeira quadra quando as quadras forem carregadas
  useEffect(() => {
    if (blocks && blocks.length > 0 && !selectedBlockId) {
      setSelectedBlockId(blocks[0].id);
    }
  }, [blocks, selectedBlockId]);

  // Polling automático removido - atualização manual apenas
  // useRealtimeUpdates(() => {
  //   if (mapId) {
  //     loadMapData();
  //     loadBlocks(mapId);
  //     fetchReservations(); // Recarregar reservas também
  //   }
  // }, 10000);

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
        const response = await axios.patch(`${API_URL}/mapas/lotes/atualizar`, lotToSave, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        });
      } else {
        const response = await axios.post(`${API_URL}/mapas/lotes/criar`, {
          ...lotToSave,
          id: Date.now().toString(),
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        });
      }

      // Força refresh apenas dos cards de quadra
      setRefreshTrigger(prev => prev + 1);
      // Recarregar todos os lotes para atualizar o InteractiveMap
      loadAllLots();
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
    // Recarregar todos os lotes para atualizar o InteractiveMap
    loadAllLots();
  };

  const handleToggleLotStatus = async (lotId: string, currentStatus: LotStatus) => {
    try {
      // Buscar o lote em todas as quadras
      let lot: Lot | undefined;
      for (const block of blocks) {
        const lotsInBlock = await loadLotsForBlock(block.id);
        lot = lotsInBlock.find((l: Lot) => l.id === lotId);
        if (lot) break;
      }

      if (!lot) {
        throw new Error('Lote não encontrado');
      }

      const newStatus = currentStatus === LotStatus.BLOCKED ? LotStatus.AVAILABLE : LotStatus.BLOCKED;

      // Atualizar via API
      await axios.patch(`${API_URL}/mapas/lotes/atualizar`, {
        id: lot.id,
        mapId: lot.mapId,
        blockId: lot.blockId,
        lotNumber: lot.lotNumber,
        status: newStatus,
        price: lot.price,
        size: lot.size,
        description: lot.description,
        features: lot.features,
      });

      // Força refresh dos cards após alterar status
      setRefreshTrigger(prev => prev + 1);
      // Recarregar todos os lotes para atualizar o InteractiveMap
      loadAllLots();
    } catch (error) {
      console.error('Erro ao alterar status do lote:', error);
      throw error;
    }
  };

  const handleDeleteLot = async (lotId: string) => {
    try {
      
      // Buscar o lote em todas as quadras para verificar status
      let lot: Lot | undefined;
      for (const block of blocks) {
        const lotsInBlock = await loadLotsForBlock(block.id);
        lot = lotsInBlock.find((l: Lot) => l.id === lotId);
        if (lot) break;
      }

      if (!lot) {
        throw new Error('Lote não encontrado.');
      }

      // Verificar se o lote está reservado ou vendido
      if (lot.status === LotStatus.RESERVED || lot.status === LotStatus.SOLD) {
        alert(
          `❌ Não é possível excluir este lote\n\n` +
          `O lote está ${lot.status === LotStatus.RESERVED ? 'reservado' : 'vendido'}.\n\n` +
          `📋 O que fazer:\n` +
          `1. Acesse a página de Reservas\n` +
          `2. Cancele a ${lot.status === LotStatus.RESERVED ? 'reserva' : 'venda'}\n` +
          `3. Tente excluir o lote novamente`
        );
        return;
      }

      const response = await axios.delete(`${API_URL}/mapas/lotes/deletar?lotId=${lotId}`, {
        timeout: 10000,
      });

      // Força refresh dos cards após excluir lote
      setRefreshTrigger(prev => prev + 1);
      // Recarregar todos os lotes para atualizar o InteractiveMap
      loadAllLots();
      alert('✅ Lote excluído com sucesso!');
    } catch (error: any) {
      console.error('[MapDetails] ❌ Erro ao excluir lote:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao excluir lote. Tente novamente.';
      alert(`❌ ${errorMessage}`);
      throw error;
    }
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--primary)] rounded-full mb-4 animate-pulse shadow-[var(--shadow-lg)]">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-[var(--foreground)] text-lg font-semibold">Carregando dados do mapa...</p>
        </div>
      </div>
    );
  }

  if (!map) {
    return (
      <div className="min-h-screen bg-[var(--background)] p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-6">Gerenciar Loteamentos</h1>
          
          {allMaps.length === 0 ? (
            <div className="text-center py-12 bg-[var(--card-bg)] rounded-2xl border-2 border-dashed border-[var(--accent)]/40 shadow-[var(--shadow-md)]">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--accent)]/20 rounded-full mb-4 shadow-md">
                <svg className="w-8 h-8 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <p className="text-[var(--foreground)] text-lg font-semibold mb-2">Nenhum loteamento cadastrado</p>
              <p className="text-[var(--foreground)]/80 text-sm font-medium mb-4">Importe ou crie um novo loteamento para começar</p>
              <button
                onClick={() => router.push('/admin/import-map')}
                className="px-6 py-3 bg-[var(--accent)] text-[#1c1c1c] font-semibold rounded-lg hover:bg-[var(--accent-light)] transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Importar Loteamento
              </button>
            </div>
          ) : (
            <div className="text-center py-12 bg-[var(--card-bg)] rounded-2xl shadow-[var(--shadow-md)]">
              <p className="text-white font-semibold mb-2">Selecione um loteamento para gerenciar</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      {/* Header com Seletor de Mapas */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">Gerenciar Loteamentos</h1>
            
            {/* Seletor de Mapas */}
            <div className="max-w-md">
              <label className="block text-sm font-bold text-[var(--foreground)] opacity-80 mb-2">
                Loteamento Selecionado
              </label>
              <select
                value={mapId}
                onChange={(e) => router.push(`/admin/map-details?mapId=${e.target.value}`)}
                className="w-full px-4 py-3 bg-[var(--surface)] text-[var(--foreground)] rounded-xl border-2 border-[var(--border)] focus:border-[var(--accent)] focus:outline-none transition-colors font-semibold cursor-pointer"
              >
                {allMaps.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setIsEditingImage(true)}
              className="px-5 py-2.5 bg-yellow-500 text-white font-semibold rounded-xl hover:bg-yellow-600 shadow-[var(--shadow-md)] transition-all hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {map.imageUrl ? 'Editar Imagem' : 'Adicionar Imagem'}
            </button>
            <button
              onClick={handleAddBlock}
              className="px-5 py-2.5 bg-[var(--success)] text-white font-semibold rounded-xl hover:bg-[var(--success-dark)] shadow-[var(--shadow-md)] transition-all hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 cursor-pointer"
            >
              + Adicionar Quadra
            </button>
          </div>
        </div>
        
        {map.description && (
          <p className="text-[var(--foreground)]/70 mt-2">{map.description}</p>
        )}
      </div>

      {/* Estatísticas de Status dos Lotes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-[var(--shadow-lg)]">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="text-white text-sm font-medium mb-1">Disponível</p>
          <p className="text-white text-4xl font-bold">
            {allLots.filter(lot => lot.status === LotStatus.AVAILABLE).length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-[var(--shadow-lg)]">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-white text-sm font-medium mb-1">Reservado</p>
          <p className="text-white text-4xl font-bold">
            {allLots.filter(lot => lot.status === LotStatus.RESERVED).length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-[var(--shadow-lg)]">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-white text-sm font-medium mb-1">Vendido</p>
          <p className="text-white text-4xl font-bold">
            {allLots.filter(lot => lot.status === LotStatus.SOLD).length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl p-6 shadow-[var(--shadow-lg)]">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
          <p className="text-white text-sm font-medium mb-1">Bloqueado</p>
          <p className="text-white text-4xl font-bold">
            {allLots.filter(lot => lot.status === LotStatus.BLOCKED).length}
          </p>
        </div>
      </div>

      {/* Seleção de Quadras com Botões (estilo maps/page.tsx) */}
      <div className="mb-8">
        {!blocks || blocks.length === 0 ? (
          <div className="text-center py-12 bg-[var(--card-bg)] rounded-2xl border-2 border-dashed border-[var(--accent)]/40 shadow-[var(--shadow-md)]">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--accent)]/20 rounded-full mb-4 shadow-md">
              <svg className="w-8 h-8 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-[var(--foreground)] text-lg font-semibold mb-2">Nenhuma quadra cadastrada</p>
            <p className="text-[var(--foreground)]/80 text-sm font-medium">Clique em "Adicionar Quadra" para começar a organizar seus lotes</p>
          </div>
        ) : (
          <>
            <label className="block text-sm font-bold text-[var(--foreground)] opacity-80 mb-2">Selecione uma Quadra</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  onClick={() => setSelectedBlockId(selectedBlockId === block.id ? '' : block.id)}
                  className={`p-4 rounded-xl font-semibold transition-all relative group cursor-pointer border-2 ${
                    selectedBlockId === block.id
                      ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg scale-105 border-emerald-500'
                      : 'bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-hover)] border-[var(--border)] hover:border-emerald-400 hover:shadow-md'
                  }`}
                >
                  <div className="text-xs mb-1 opacity-70">Quadra</div>
                  <div className="text-lg font-bold">{block.name}</div>
                  {block.description && (
                    <div className="text-xs mt-1 opacity-70 truncate">{block.description}</div>
                  )}
                  
                  {/* Botões de ação no hover e focus (funcionalidades do MapDetails) */}
                  <div className={`absolute top-1 right-1 flex gap-1 transition-opacity ${
                    selectedBlockId === block.id 
                      ? 'opacity-100' 
                      : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingBlock(block);
                        setIsAddingBlock(true);
                      }}
                      className="p-1.5 bg-yellow-500/80 hover:bg-yellow-600 rounded-lg backdrop-blur-sm cursor-pointer"
                      title="Editar quadra"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBlock(block.id);
                      }}
                      className="p-1.5 bg-red-500/80 hover:bg-red-600 rounded-lg cursor-pointer"
                      title="Excluir quadra"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Visualização dos Lotes da Quadra Selecionada */}
      {selectedBlockId && blocks.find(b => b.id === selectedBlockId) && (
        <div className="mb-8">
          <div className="bg-[var(--card-bg)] rounded-2xl shadow-[var(--shadow-lg)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[var(--foreground)] opacity-80 flex items-center gap-2">
                <svg className="w-7 h-7 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Lotes - {blocks.find(b => b.id === selectedBlockId)?.name}
              </h2>
              <button
                onClick={() => handleAddLotToBlock(selectedBlockId)}
                className="px-5 py-2.5 bg-[var(--success)] hover:bg-green-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Lote
              </button>
            </div>
            <BlockCard
              key={`${selectedBlockId}-${refreshTrigger}`}
              block={blocks.find(b => b.id === selectedBlockId)!}
              mapId={mapId}
              loadLotsForBlock={loadLotsForBlock}
              handleAddLotToBlock={handleAddLotToBlock}
              handleEditLot={handleEditLot}
              handleDeleteLot={handleDeleteLot}
              handleToggleLotStatus={handleToggleLotStatus}
              handleDeleteBlock={handleDeleteBlock}
              setEditingBlock={setEditingBlock}
              setIsAddingBlock={setIsAddingBlock}
              allBlocks={blocks}
              refreshTrigger={refreshTrigger}
              reservations={reservations}
              userRole={user?.role}
            />
          </div>
        </div>
      )}

      {/* Mapa Interativo */}
      {map && map.imageUrl && map.imageUrl.trim() !== '' && (
        <div className="bg-[var(--card-bg)] border-2 border-[var(--primary)]/30 rounded-2xl overflow-hidden shadow-[var(--shadow-lg)] p-6 mb-8">
          <h2 className="text-xl font-bold text-[var(--foreground)] opacity-80 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Visualização do Mapa
          </h2>
          <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--background)] rounded-xl p-4">
            <InteractiveMap
              imageUrl={map.imageUrl}
              lots={allLots}
              onLotClick={(lot) => {
                // Aqui você pode adicionar lógica adicional se necessário
              }}
              selectedLotIds={[]}
            />
          </div>
        </div>
      )}

      {/* Modal de Adicionar/Editar Quadra */}
      {isAddingBlock && editingBlock && (
        <div className="fixed inset-0 bg-[var(--foreground)]/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-[var(--card-bg)] rounded-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] my-auto overflow-y-auto shadow-[var(--shadow-xl)] border border-[var(--border)]">
            <div className="sticky top-0 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white p-4 sm:p-6 rounded-t-2xl shadow-[var(--shadow-md)] z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold">{editingBlock.id ? 'Editar Quadra' : 'Adicionar Quadra'}</h2>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsAddingBlock(false);
                    setEditingBlock(null);
                  }}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                  type="button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-[var(--foreground)] text-sm font-semibold mb-2">
                    Nome da Quadra *
                  </label>
                  <input
                    type="text"
                    value={editingBlock.name}
                    onChange={(e) => setEditingBlock({ ...editingBlock, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--surface)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] placeholder-[var(--foreground)]/40"
                    placeholder="Ex: Quadra A, Quadra 1, Setor Norte"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-[var(--foreground)] text-sm font-semibold mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={editingBlock.description || ''}
                    onChange={(e) => setEditingBlock({ ...editingBlock, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--surface)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] placeholder-[var(--foreground)]/40"
                    placeholder="Descrição opcional da quadra"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6">
              <button
                type="button"
                onClick={() => {
                  setIsAddingBlock(false);
                  setEditingBlock(null);
                }}
                className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] rounded-xl hover:bg-[var(--foreground)]/5 font-semibold text-sm sm:text-base shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveBlock}
                className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 bg-[var(--success)] text-white rounded-xl hover:bg-[var(--success)]/90 font-semibold text-sm sm:text-base shadow-[var(--shadow-md)] transition-all hover:shadow-[var(--shadow-lg)] cursor-pointer"
              >
                {editingBlock.id ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar Lote */}
      {isAddingLot && (
        <div className="fixed inset-0 bg-[var(--foreground)]/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-[var(--card-bg)] rounded-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] my-auto overflow-y-auto shadow-[var(--shadow-xl)] border border-[var(--border)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="sticky top-0 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white p-4 sm:p-6 rounded-t-2xl shadow-[var(--shadow-md)] z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold">Adicionar Lote</h2>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsAddingLot(false);
                    setSelectedBlockForLot('');
                  }}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                  type="button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <LotForm
                blockId={selectedBlockForLot}
                blockName={blocks.find(b => b.id === selectedBlockForLot)?.name || ''}
                onSave={handleSaveLot}
                onCancel={() => {
                  setIsAddingLot(false);
                  setSelectedBlockForLot('');
                }}
                onSubmitChange={(canSubmit, submit) => {
                  setCanSubmitLot(canSubmit);
                  setSubmitLotFn(() => submit);
                }}
              />
            </div>
            <div className="sticky bottom-0 bg-[var(--card-bg)] border-t border-[var(--border)] p-4 sm:p-6 flex flex-col sm:flex-row gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={() => {
                  setIsAddingLot(false);
                  setSelectedBlockForLot('');
                }}
                className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] rounded-xl hover:bg-[var(--foreground)]/5 font-semibold text-sm sm:text-base shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (submitLotFn) submitLotFn();
                }}
                disabled={!canSubmitLot}
                className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 bg-[var(--success)] text-white rounded-xl hover:bg-[var(--success)]/90 font-semibold text-sm sm:text-base shadow-[var(--shadow-md)] transition-all hover:shadow-[var(--shadow-lg)] disabled:bg-[var(--foreground)]/20 disabled:cursor-not-allowed cursor-pointer"
              >
                Adicionar Lote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar/Editar Imagem */}
      {isEditingImage && (
        <div className="fixed inset-0 bg-[var(--foreground)]/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-[var(--card-bg)] rounded-2xl w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] my-auto overflow-y-auto shadow-[var(--shadow-xl)] border border-[var(--border)]">
            <div className="sticky top-0 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white p-4 sm:p-6 rounded-t-2xl shadow-[var(--shadow-md)] z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold">{map.imageUrl ? 'Editar Imagem do Mapa' : 'Adicionar Imagem do Mapa'}</h2>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsEditingImage(false);
                    setImageFile(null);
                    setImagePreview('');
                  }}
                  disabled={isUploadingImage}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer disabled:opacity-50"
                  type="button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-5">
              <div>
                <label className="block text-[var(--foreground)] text-sm font-semibold mb-2">
                  Selecionar Arquivo
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleImageSelect}
                  disabled={isUploadingImage}
                  className="w-full px-3 py-2 bg-[var(--surface)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)] cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:text-white file:font-semibold hover:file:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
                />
                <p className="text-xs text-[var(--foreground)]/60 mt-1">
                  Formatos aceitos: JPG, PNG, GIF, PDF. Tamanho máximo: 10MB (imagens) ou 50MB (PDF)
                </p>
              </div>

              {imagePreview && (
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)] mb-2">Preview:</p>
                  {imagePreview === 'PDF' ? (
                    <div className="w-full h-40 bg-[var(--surface)] rounded-lg border-2 border-[var(--primary)] flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-red-400 mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <p className="text-white font-semibold">{imageFile?.name}</p>
                      <p className="text-white/60 text-sm">Arquivo PDF selecionado</p>
                    </div>
                  ) : (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-64 object-contain bg-[var(--surface)] rounded-lg border-2 border-[var(--primary)]"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6">
              <button
                type="button"
                onClick={() => {
                  setIsEditingImage(false);
                  setImageFile(null);
                  setImagePreview('');
                }}
                disabled={isUploadingImage}
                className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] rounded-xl hover:bg-[var(--foreground)]/5 font-semibold text-sm sm:text-base shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)] disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleUploadImage}
                disabled={!imageFile || isUploadingImage}
                className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 bg-[var(--success)] text-white rounded-xl hover:bg-[var(--success)]/90 font-semibold text-sm sm:text-base shadow-[var(--shadow-md)] transition-all hover:shadow-[var(--shadow-lg)] disabled:bg-[var(--foreground)]/20 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
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
  onSubmitChange?: (canSubmit: boolean, submit: () => void) => void;
}

function LotForm({ blockId, blockName, onSave, onCancel, onSubmitChange }: LotFormProps) {
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

  // Notificar o pai quando o estado mudar
  React.useEffect(() => {
    const canSubmit = !!(lotNumber && size && totalPrice);
    if (onSubmitChange) {
      onSubmitChange(canSubmit, handleSubmit);
    }
  }, [lotNumber, size, totalPrice]);

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-[var(--primary)]/5 to-[var(--primary-light)]/10 border border-[var(--primary)]/15 rounded-xl p-3">
        <p className="text-sm text-[var(--foreground)]">
          <strong>Quadra:</strong> {blockName || 'Não identificada'}
        </p>
      </div>

      <div>
        <label className="block text-[var(--foreground)] text-sm font-semibold mb-2">
          Número do Lote *
        </label>
        <input
          type="text"
          value={lotNumber}
          onChange={(e) => setLotNumber(e.target.value)}
          className="w-full px-4 py-2.5 bg-[var(--surface)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] placeholder-[var(--foreground)]/40"
          placeholder="Ex: 01, A1, etc"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-[var(--foreground)] text-sm font-semibold mb-2">
          Área (m²) *
        </label>
        <input
          type="number"
          value={size || ''}
          onChange={(e) => setSize(parseFloat(e.target.value) || 0)}
          className="w-full px-4 py-2.5 bg-[var(--surface)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] placeholder-[var(--foreground)]/40"
          placeholder="300"
        />
      </div>

      <div>
        <label className="block text-[var(--foreground)] text-sm font-semibold mb-2">
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
          className="w-full px-4 py-2.5 bg-[var(--surface)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] placeholder-[var(--foreground)]/40"
          placeholder="0,00"
        />
        <p className="text-xs text-[var(--foreground)]/60 mt-1">💡 Preencha manualmente o valor do lote</p>
      </div>

      <div>
        <label className="block text-[var(--foreground)] text-sm font-semibold mb-2">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as LotStatus)}
          className="w-full px-4 py-2.5 bg-[var(--surface)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)] cursor-pointer focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
        >
          <option value={LotStatus.AVAILABLE}>Disponível</option>
          <option value={LotStatus.BLOCKED}>Bloqueado</option>
        </select>
        <p className="text-xs text-[var(--foreground)]/60 mt-1">💡 Para reservar ou vender, use a página de Reservas</p>
      </div>

      <div>
        <label className="block text-[var(--foreground)] text-sm font-semibold mb-2">
          Descrição
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2.5 bg-[var(--surface)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] placeholder-[var(--foreground)]/40"
          placeholder="Informações adicionais sobre o lote"
          rows={3}
        />
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
  handleDeleteLot: (lotId: string) => Promise<void>;
  handleToggleLotStatus: (lotId: string, currentStatus: LotStatus) => Promise<void>;
  handleDeleteBlock: (blockId: string) => Promise<void>;
  setEditingBlock: (block: Block) => void;
  setIsAddingBlock: (isAdding: boolean) => void;
  allBlocks: Block[];
  refreshTrigger: number;
  reservations: any[];
  userRole?: string;
}

function BlockCard({
  block,
  mapId,
  loadLotsForBlock,
  handleAddLotToBlock,
  handleEditLot,
  handleDeleteLot,
  handleToggleLotStatus,
  handleDeleteBlock,
  setEditingBlock,
  setIsAddingBlock,
  allBlocks,
  refreshTrigger,
  reservations,
  userRole,
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
    <div>
      {/* Aviso de lotes reservados/vendidos */}
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
      
      {/* Lotes da Quadra */}
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
            onLotDelete={handleDeleteLot}
            onToggleLotStatus={handleToggleLotStatus}
            selectedLotIds={[]}
            allowMultipleSelection={false}
            lotsPerRow={15}
            reservations={reservations}
            userRole={userRole}
          />
        ) : (
          <div className="text-center py-8 bg-[var(--card-bg)] rounded-xl border-2 border-dashed border-[var(--accent)]/40">
            <svg className="w-12 h-12 mx-auto mb-3 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-white font-medium mb-2">Nenhum lote cadastrado nesta quadra</p>
          <p className="text-white/70 text-sm mb-4">Clique em "Adicionar Lote" para começar</p>
        </div>
      )}
    </div>
  );
}