import { useRef, useState, useEffect, useCallback } from 'react';
import { Lot, LotArea, LotStatus } from '@/types';

interface UseInteractiveMapProps {
  imageUrl: string;
  lots: Lot[];
  onLotClick?: (lot: Lot) => void;
  isEditMode?: boolean;
  onAreaDrawn?: (area: LotArea) => void;
  selectedLotId?: string;
  selectedLotIds?: string[]; // Novo: suporte para múltiplos lotes selecionados
  drawingMode?: 'polygon' | 'rectangle';
  previewArea?: LotArea | null;
}

export function useInteractiveMap({
  imageUrl,
  lots,
  onLotClick,
  isEditMode = false,
  onAreaDrawn,
  selectedLotId,
  selectedLotIds = [], // Novo: suporte para múltiplos lotes selecionados
  drawingMode = 'polygon',
  previewArea = null,
}: UseInteractiveMapProps) {
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
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState(1);
  const [initialOffset, setInitialOffset] = useState({ x: 0, y: 0 });
  const [pinchCenter, setPinchCenter] = useState<{ x: number; y: number } | null>(null);

  // Estados para desenho de retângulo
  const [isDrawingRect, setIsDrawingRect] = useState(false);
  const [rectStart, setRectStart] = useState<{ x: number; y: number } | null>(null);
  const [rectEnd, setRectEnd] = useState<{ x: number; y: number } | null>(null);

  const drawLot = (
    ctx: CanvasRenderingContext2D,
    lot: Lot,
    isHovered: boolean,
    isSelected: boolean
  ) => {
    // Lotes agora não possuem área desenhada (lot.area.points removido)
    // Função mantida para compatibilidade mas não desenha nada
    return;
  };

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    ctx.drawImage(img, 0, 0);

    // Lotes não são mais desenhados no mapa (lot.area.points removido)
    // lots.forEach((lot) => {
    //   const isSelected = lot.id === selectedLotId || selectedLotIds.includes(lot.id);
    //   drawLot(ctx, lot, lot.id === hoveredLot?.id, isSelected);
    // });

    // Desenho de polígono (modo antigo)
    if (isEditMode && drawingMode === 'polygon' && drawingPoints.length > 0) {
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

    // Desenho de retângulo em progresso
    if (isEditMode && drawingMode === 'rectangle' && isDrawingRect && rectStart && rectEnd) {
      const width = rectEnd.x - rectStart.x;
      const height = rectEnd.y - rectStart.y;

      ctx.strokeStyle = '#3b82f6';
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.lineWidth = 2 / scale;
      ctx.strokeRect(rectStart.x, rectStart.y, width, height);
      ctx.fillRect(rectStart.x, rectStart.y, width, height);
    }

    // Desenho da área de pré-visualização (área selecionada que será salva)
    if (isEditMode && previewArea && previewArea.points.length >= 3) {
      ctx.beginPath();
      ctx.moveTo(previewArea.points[0].x, previewArea.points[0].y);
      previewArea.points.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();

      ctx.fillStyle = 'rgba(34, 197, 94, 0.3)'; // Verde semi-transparente
      ctx.fill();
      ctx.strokeStyle = '#22c55e'; // Verde
      ctx.lineWidth = 3 / scale;
      ctx.stroke();

      // Desenhar pontos da área
      previewArea.points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6 / scale, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2 / scale;
        ctx.stroke();
      });
    }

    ctx.restore();
  }, [imageLoaded, lots, drawingPoints, hoveredLot, selectedLotId, selectedLotIds, isEditMode, scale, offset, drawingMode, isDrawingRect, rectStart, rectEnd, previewArea]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    if (!imageUrl || imageUrl.trim() === '') {
      return;
    }

    // Não tentar carregar PDFs diretamente - aguardar conversão
    if (imageUrl.startsWith('data:application/pdf')) {
      return;
    }

    const handleLoad = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      setImageLoaded(true);
    };

    const handleError = () => {
      console.error('Erro ao carregar imagem do mapa');
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    img.src = imageUrl;

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [imageUrl]);

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
      const xi = points[i].x, yi = points[i].y;
      const xj = points[j].x, yj = points[j].y;
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

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = mouseX * scaleX;
    const canvasY = mouseY * scaleY;

    const x = (canvasX - offset.x) / scale;
    const y = (canvasY - offset.y) / scale;

    return { x, y };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning || isDrawingRect) return;

    const { x, y } = getCanvasCoordinates(e);

    if (isEditMode && drawingMode === 'polygon') {
      setDrawingPoints([...drawingPoints, { x, y }]);
    }
    // Removido: cliques em áreas do mapa quando não está em modo de edição
    // As seleções devem ser feitas pelo componente CinemaStyleLotSelector
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isPanning) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const dx = (e.clientX - panStart.x) * scaleX;
      const dy = (e.clientY - panStart.y) * scaleY;
      setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // Atualiza o retângulo enquanto arrasta
    if (isDrawingRect && rectStart) {
      const { x, y } = getCanvasCoordinates(e);
      setRectEnd({ x, y });
      return;
    }

    if (isEditMode) return;

    // Removido: hover nas áreas do mapa quando não está em modo de edição
    // O hover agora é feito pelo componente CinemaStyleLotSelector
    if (canvas) {
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
    } else if (e.button === 0 && isEditMode && drawingMode === 'rectangle') {
      // Botão esquerdo no modo retângulo
      const { x, y } = getCanvasCoordinates(e);
      setIsDrawingRect(true);
      setRectStart({ x, y });
      setRectEnd({ x, y });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsPanning(false);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default';
    }

    // Finaliza o desenho do retângulo
    if (isDrawingRect && rectStart && onAreaDrawn) {
      // Captura a posição final do mouse no momento do mouseup
      const finalPosition = getCanvasCoordinates(e);

      const minX = Math.min(rectStart.x, finalPosition.x);
      const maxX = Math.max(rectStart.x, finalPosition.x);
      const minY = Math.min(rectStart.y, finalPosition.y);
      const maxY = Math.max(rectStart.y, finalPosition.y);

      // Verifica se o retângulo tem tamanho mínimo (evita cliques acidentais)
      const width = maxX - minX;
      const height = maxY - minY;

      if (width > 10 && height > 10) {
        // Cria os 4 pontos do retângulo
        const rectanglePoints = [
          { x: minX, y: minY },
          { x: maxX, y: minY },
          { x: maxX, y: maxY },
          { x: minX, y: maxY },
        ];

        console.log('📐 Retângulo criado:', {
          start: rectStart,
          end: finalPosition,
          points: rectanglePoints
        });

        onAreaDrawn({ points: rectanglePoints });
      }

      setIsDrawingRect(false);
      setRectStart(null);
      setRectEnd(null);
    }
  };  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();

      // Posição do mouse relativa ao canvas (viewport coordinates)
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Converte para coordenadas do canvas
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const canvasMouseX = mouseX * scaleX;
      const canvasMouseY = mouseY * scaleY;

      // Calcula o ponto na imagem original sob o cursor do mouse
      const imagePointX = (canvasMouseX - offset.x) / scale;
      const imagePointY = (canvasMouseY - offset.y) / scale;

      // Calcula a nova escala
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.max(0.5, Math.min(scale + delta, 5));

      // Calcula o novo offset para manter o ponto da imagem sob o cursor
      const newOffsetX = canvasMouseX - imagePointX * newScale;
      const newOffsetY = canvasMouseY - imagePointY * newScale;

      setScale(newScale);
      setOffset({ x: newOffsetX, y: newOffsetY });
    },
    [scale, offset]
  );

  // Calcula distância entre dois pontos de touch (para pinch-to-zoom)
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calcula o ponto central entre dois toques
  const getTouchCenter = (touch1: React.Touch, touch2: React.Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch-to-zoom: salva distância inicial e centro do pinch
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      const center = getTouchCenter(e.touches[0], e.touches[1]);

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();

      // Centro em coordenadas do viewport relativo ao canvas
      const centerX = center.x - rect.left;
      const centerY = center.y - rect.top;

      setInitialPinchDistance(distance);
      setInitialScale(scale);
      setInitialOffset({ x: offset.x, y: offset.y });
      setPinchCenter({ x: centerX, y: centerY });
    } else if (e.touches.length === 1 && !isEditMode) {
      // Pan: salva posição inicial
      setIsPanning(true);
      setPanStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistance !== null && pinchCenter) {
      // Pinch-to-zoom com ponto focal preciso
      e.preventDefault();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const currentCenter = getTouchCenter(e.touches[0], e.touches[1]);

      // Centro atual em coordenadas do viewport relativo ao canvas
      const currentCenterX = currentCenter.x - rect.left;
      const currentCenterY = currentCenter.y - rect.top;

      // Calcula nova escala
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      const scaleRatio = distance / initialPinchDistance;
      const newScale = Math.max(0.5, Math.min(initialScale * scaleRatio, 5));

      // Converte coordenadas do viewport para coordenadas do canvas
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const canvasCenterX = pinchCenter.x * scaleX;
      const canvasCenterY = pinchCenter.y * scaleY;

      // Ponto na imagem original (antes de qualquer transformação)
      const imagePointX = (canvasCenterX - initialOffset.x) / initialScale;
      const imagePointY = (canvasCenterY - initialOffset.y) / initialScale;

      // Novo offset para manter o ponto da imagem fixo sob o centro atual do pinch
      const currentCanvasCenterX = currentCenterX * scaleX;
      const currentCanvasCenterY = currentCenterY * scaleY;

      const newOffsetX = currentCanvasCenterX - imagePointX * newScale;
      const newOffsetY = currentCanvasCenterY - imagePointY * newScale;

      setScale(newScale);
      setOffset({ x: newOffsetX, y: newOffsetY });
    } else if (e.touches.length === 1 && isPanning && !isEditMode) {
      // Pan
      e.preventDefault();
      setOffset({
        x: e.touches[0].clientX - panStart.x,
        y: e.touches[0].clientY - panStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setInitialPinchDistance(null);
    setPinchCenter(null);
    setIsPanning(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleFinishDrawing = () => {
    if (drawingMode === 'polygon' && drawingPoints.length >= 3 && onAreaDrawn) {
      onAreaDrawn({ points: drawingPoints });
      setDrawingPoints([]);
    }
  };

  const handleCancelDrawing = () => {
    setDrawingPoints([]);
    setIsDrawingRect(false);
    setRectStart(null);
    setRectEnd(null);
  };

  return {
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
  };
}
