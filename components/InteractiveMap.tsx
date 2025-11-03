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
  const containerRef = useRef<HTMLDivElement>(null);

  const [drawingPoints, setDrawingPoints] = useState<{ x: number; y: number }[]>([]);
  const [hoveredLot, setHoveredLot] = useState<Lot | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

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
  };

  const redraw = React.useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar renderização de alta qualidade
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    ctx.drawImage(img, 0, 0);

    lots.forEach((lot) => {
      drawLot(ctx, lot, lot.id === hoveredLot?.id, lot.id === selectedLotId);
    });

    if (isEditMode && drawingPoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(drawingPoints[0].x, drawingPoints[0].y);
      drawingPoints.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2 / scale;
      ctx.stroke();

      drawingPoints.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5 / scale, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
      });
    }

    ctx.restore();
  }, [imageLoaded, lots, drawingPoints, hoveredLot, selectedLotId, isEditMode, scale, offset]);

  // Carregar e desenhar imagem
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    img.onload = () => {
      // Suportar telas de alta densidade (Retina/HiDPI)
      const dpr = window.devicePixelRatio || 1;

      // Definir tamanho do canvas baseado na imagem original
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Ajustar para alta densidade se necessário
      if (dpr > 1) {
        const displayWidth = canvas.width;
        const displayHeight = canvas.height;

        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;

        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;

        // Escalar o contexto para compensar o aumento de pixels
        ctx.scale(dpr, dpr);
      }

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

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = (e.clientX - rect.left) * scaleX;
    const clientY = (e.clientY - rect.top) * scaleY;

    const x = (clientX - offset.x) / scale;
    const y = (clientY - offset.y) / scale;

    return { x, y };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) return;

    const { x, y } = getCanvasCoordinates(e);

    if (isEditMode) {
      setDrawingPoints([...drawingPoints, { x, y }]);
    } else {
      const clickedLot = lots.find((lot) => isPointInPolygon(x, y, lot.area.points));
      if (clickedLot && onLotClick) {
        onLotClick(clickedLot);
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (isEditMode) return;

    const { x, y } = getCanvasCoordinates(e);
    const hoveredLot = lots.find((lot) => isPointInPolygon(x, y, lot.area.points));
    setHoveredLot(hoveredLot || null);

    if (hoveredLot) {
      canvas.style.cursor = 'pointer';
    } else {
      canvas.style.cursor = 'default';
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 2) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grabbing';
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default';
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Verifica se o mouse está dentro dos limites do canvas
      if (mouseX < 0 || mouseX > rect.width || mouseY < 0 || mouseY > rect.height) {
        return;
      }

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const canvasX = mouseX * scaleX;
      const canvasY = mouseY * scaleY;

      const zoomIntensity = 0.1;
      const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;

      setScale((prevScale) => {
        const newScale = Math.min(Math.max(0.5, prevScale + delta), 5);
        const scaleChange = newScale / prevScale;

        setOffset((prev) => ({
          x: canvasX - (canvasX - prev.x) * scaleChange,
          y: canvasY - (canvasY - prev.y) * scaleChange,
        }));

        return newScale;
      });
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  };

  const handleResetZoom = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
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
    <div ref={containerRef} className="relative">
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
        className="max-w-full h-auto border border-gray-300 rounded-lg"
      />

      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setScale((prev) => Math.min(prev + 0.2, 5))}
          className="bg-white hover:bg-gray-50 text-gray-800 font-bold py-2 px-3 rounded-lg shadow-lg border border-gray-200 transition-all hover:shadow-xl"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setScale((prev) => Math.max(prev - 0.2, 0.5))}
          className="bg-white hover:bg-gray-50 text-gray-800 font-bold py-2 px-3 rounded-lg shadow-lg border border-gray-200 transition-all hover:shadow-xl"
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={handleResetZoom}
          className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-2 px-3 rounded-lg shadow-lg border border-gray-200 text-xs transition-all hover:shadow-xl"
          title="Reset Zoom"
        >
          100%
        </button>
      </div>

      {isEditMode && drawingPoints.length > 0 && (
        <div className="absolute top-4 left-4 flex gap-2">
          <button
            onClick={handleFinishDrawing}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-lg transition-all hover:shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
            disabled={drawingPoints.length < 3}
          >
            Finalizar Área ({drawingPoints.length} pontos)
          </button>
          <button
            onClick={handleCancelDrawing}
            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 shadow-lg transition-all hover:shadow-xl"
          >
            Cancelar
          </button>
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
        </div>
      )}
    </div>
  );
}
