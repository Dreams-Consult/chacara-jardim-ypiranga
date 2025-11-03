'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Lot, LotArea, LotStatus } from '@/types';

interface InteractiveMapProps {
  imageUrl: string;
  lots: Lot[];
  onLotClick?: (lot: Lot) => void;
  isEditMode?: boolean;
  onAreaDrawn?: (area: LotArea) => void;
  selectedLotId?: string;
}

export default function InteractiveMap({
  imageUrl,
  lots,
  onLotClick,
  isEditMode = false,
  onAreaDrawn,
  selectedLotId,
}: InteractiveMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [drawingPoints, setDrawingPoints] = useState<{ x: number; y: number }[]>([]);
  const [hoveredLot, setHoveredLot] = useState<Lot | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const drawLot = (
    ctx: CanvasRenderingContext2D,
    lot: Lot,
    isHovered: boolean,
    isSelected: boolean
  ) => {
    if (lot.area.points.length < 3) return;

    // Desenhar área
    ctx.beginPath();
    ctx.moveTo(lot.area.points[0].x, lot.area.points[0].y);
    lot.area.points.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();

    // Cor baseada no status
    let fillColor = 'rgba(34, 197, 94, 0.3)'; // Verde para disponível
    let strokeColor = '#22c55e';

    if (lot.status === LotStatus.RESERVED) {
      fillColor = 'rgba(251, 191, 36, 0.3)'; // Amarelo para reservado
      strokeColor = '#fbbf24';
    } else if (lot.status === LotStatus.SOLD) {
      fillColor = 'rgba(239, 68, 68, 0.3)'; // Vermelho para vendido
      strokeColor = '#ef4444';
    }

    if (isHovered) {
      fillColor = fillColor.replace('0.3', '0.5');
      strokeColor = '#000';
    }

    if (isSelected) {
      fillColor = 'rgba(59, 130, 246, 0.5)'; // Azul para selecionado
      strokeColor = '#3b82f6';
    }

    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = isHovered || isSelected ? 3 : 2;
    ctx.stroke();

    // Desenhar número do lote no centro
    const centerX =
      lot.area.points.reduce((sum, p) => sum + p.x, 0) / lot.area.points.length;
    const centerY =
      lot.area.points.reduce((sum, p) => sum + p.y, 0) / lot.area.points.length;

    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(lot.lotNumber, centerX, centerY);
  };

  const redraw = React.useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar imagem
    ctx.drawImage(img, 0, 0);

    // Desenhar lotes
    lots.forEach((lot) => {
      drawLot(ctx, lot, lot.id === hoveredLot?.id, lot.id === selectedLotId);
    });

    // Desenhar pontos em criação
    if (isEditMode && drawingPoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(drawingPoints[0].x, drawingPoints[0].y);
      drawingPoints.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Desenhar pontos
      drawingPoints.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
      });
    }
  }, [imageLoaded, lots, drawingPoints, hoveredLot, selectedLotId, isEditMode]);

  // Carregar e desenhar imagem
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      setImageLoaded(true);
    };

    img.src = imageUrl;
  }, [imageUrl]);

  // Redesenhar quando dependências mudarem
  useEffect(() => {
    redraw();
  }, [redraw]);

  const isPointInPolygon = (
    x: number,
    y: number,
    points: { x: number; y: number }[]
  ): boolean => {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].x,
        yi = points[i].y;
      const xj = points[j].x,
        yj = points[j].y;
      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (isEditMode) {
      // Adicionar ponto ao desenho
      setDrawingPoints([...drawingPoints, { x, y }]);
    } else {
      // Verificar clique em lote
      const clickedLot = lots.find((lot) => isPointInPolygon(x, y, lot.area.points));
      if (clickedLot && onLotClick) {
        onLotClick(clickedLot);
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isEditMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const hoveredLot = lots.find((lot) => isPointInPolygon(x, y, lot.area.points));
    setHoveredLot(hoveredLot || null);

    if (hoveredLot) {
      canvas.style.cursor = 'pointer';
    } else {
      canvas.style.cursor = 'default';
    }
  };

  const handleFinishDrawing = () => {
    if (drawingPoints.length >= 3 && onAreaDrawn) {
      onAreaDrawn({ points: drawingPoints });
      setDrawingPoints([]);
    }
  };

  const handleCancelDrawing = () => {
    setDrawingPoints([]);
  };

  return (
    <div className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imageRef} src={imageUrl} alt="Map" className="hidden" />
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        className="max-w-full h-auto border border-gray-300 rounded-lg"
      />
      {isEditMode && drawingPoints.length > 0 && (
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleFinishDrawing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            disabled={drawingPoints.length < 3}
          >
            Finalizar Área ({drawingPoints.length} pontos)
          </button>
          <button
            onClick={handleCancelDrawing}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Cancelar
          </button>
        </div>
      )}
      {hoveredLot && !isEditMode && (
        <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg">
          <h3 className="font-bold text-lg">Lote {hoveredLot.lotNumber}</h3>
          <p className="text-sm text-gray-600">
            Status: {hoveredLot.status === LotStatus.AVAILABLE ? 'Disponível' : hoveredLot.status === LotStatus.RESERVED ? 'Reservado' : 'Vendido'}
          </p>
          <p className="text-sm">Área: {hoveredLot.size}m²</p>
          <p className="text-sm font-bold">
            R$ {hoveredLot.price.toLocaleString('pt-BR')}
          </p>
        </div>
      )}
    </div>
  );
}
