'use client';

import React from 'react';
import { Lot, LotArea, LotStatus } from '@/types';
import { useInteractiveMap } from '@/hooks/useInteractiveMap';

interface InteractiveMapProps {
  imageUrl: string;
  lots: Lot[];
  onLotClick?: (lot: Lot) => void;
  isEditMode?: boolean;
  onAreaDrawn?: (area: LotArea) => void;
  selectedLotId?: string;
  drawingMode?: 'polygon' | 'rectangle';
  previewArea?: LotArea | null;
}

export default function InteractiveMap({
  imageUrl,
  lots,
  onLotClick,
  isEditMode = false,
  onAreaDrawn,
  selectedLotId,
  drawingMode = 'polygon',
  previewArea = null,
}: InteractiveMapProps) {
  const {
    canvasRef,
    imageRef,
    containerRef,
    hoveredLot,
    drawingPoints,
    scale,
    handleCanvasClick,
    handleCanvasMouseMove,
    handleMouseDown,
    handleMouseUp,
    handleContextMenu,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleFinishDrawing,
    handleCancelDrawing,
  } = useInteractiveMap({
    imageUrl,
    lots,
    onLotClick,
    isEditMode,
    onAreaDrawn,
    selectedLotId,
    drawingMode,
    previewArea,
  });

  return (
    <div ref={containerRef} className="relative">
      {imageUrl && imageUrl.trim() !== '' ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={imageRef} src={imageUrl} alt="Map" className="hidden" />
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onContextMenu={handleContextMenu}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="border border-gray-300 rounded-lg shadow-lg cursor-crosshair max-w-full"
          />
        </>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
          <svg className="w-24 h-24 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 font-medium mb-2">Nenhuma imagem do mapa carregada</p>
          <p className="text-gray-500 text-sm">Adicione uma imagem ao mapa para começar a desenhar os lotes</p>
        </div>
      )}

      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="bg-white hover:bg-gray-50 text-gray-800 font-bold py-2 px-3 rounded-lg shadow-lg border border-gray-200 transition-all hover:shadow-xl cursor-pointer"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-white hover:bg-gray-50 text-gray-800 font-bold py-2 px-3 rounded-lg shadow-lg border border-gray-200 transition-all hover:shadow-xl cursor-pointer"
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={handleResetZoom}
          className="bg-white hover:bg-gray-50 text-gray-800 font-medium py-2 px-3 rounded-lg shadow-lg border border-gray-200 transition-all hover:shadow-xl text-xs cursor-pointer"
          title="Reset Zoom"
        >
          Reset
        </button>
        <div className="bg-white px-3 py-1 rounded-lg shadow-lg border border-gray-200 text-xs text-gray-700 text-center">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {isEditMode && drawingMode === 'polygon' && drawingPoints.length > 0 && (
        <div className="absolute bottom-4 left-4 flex gap-2">
          <button
            onClick={handleFinishDrawing}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-lg transition-all hover:shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
            disabled={drawingPoints.length < 3}
          >
            Finalizar Área ({drawingPoints.length} pontos)
          </button>
          <button
            onClick={handleCancelDrawing}
            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 shadow-lg transition-all hover:shadow-xl cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      )}

      {isEditMode && drawingMode === 'rectangle' && !previewArea && (
        <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="font-medium">🔲 Modo Retângulo: Clique e arraste para desenhar</p>
        </div>
      )}

      {isEditMode && previewArea && previewArea.points.length >= 3 && (
        <div className="absolute bottom-4 left-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="font-medium">✅ Área selecionada - Complete as informações do lote</p>
        </div>
      )}

      {hoveredLot && !isEditMode && (
        <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-xl border border-gray-200">
          <h3 className="font-bold text-lg text-gray-900 mb-2">Lote {hoveredLot.lotNumber}</h3>
          <p className="text-sm text-gray-700 mb-1">
            <span className="font-medium">Status:</span>{' '}
            <span className={
              hoveredLot.status === LotStatus.AVAILABLE
                ? 'font-semibold text-green-700'
                : hoveredLot.status === LotStatus.RESERVED
                  ? 'font-semibold text-amber-700'
                  : 'font-semibold text-red-700'
            }>
              {hoveredLot.status === LotStatus.AVAILABLE ? 'Disponível' : hoveredLot.status === LotStatus.RESERVED ? 'Reservado' : 'Vendido'}
            </span>
          </p>
          <p className="text-sm text-gray-700 mb-1">
            <span className="font-medium">Área:</span> {hoveredLot.size}m²
          </p>
          <p className="text-base font-bold text-gray-900 mt-2">
            R$ {hoveredLot.price.toLocaleString('pt-BR')}
          </p>
          {hoveredLot.pricePerM2 && (
            <p className="text-xs text-gray-600 mt-1">
              R$ {hoveredLot.pricePerM2.toLocaleString('pt-BR')}/m²
            </p>
          )}
        </div>
      )}
    </div>
  );
}
