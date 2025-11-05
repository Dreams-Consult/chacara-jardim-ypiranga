import { useRef, useState, useEffect, useCallback } from 'react';
import { Lot, LotArea, LotStatus } from '@/types';

interface UseInteractiveMapProps {
  imageUrl: string;
  lots: Lot[];
  onLotClick?: (lot: Lot) => void;
  isEditMode?: boolean;
  onAreaDrawn?: (area: LotArea) => void;
  selectedLotId?: string;
}

export function useInteractiveMap({
  imageUrl,
  lots,
  onLotClick,
  isEditMode = false,
  onAreaDrawn,
  selectedLotId,
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

  const drawLot = (
    ctx: CanvasRenderingContext2D,
    lot: Lot,
    isHovered: boolean,
    isSelected: boolean
  ) => {
    if (lot.area.points.length < 3) return;

    ctx.beginPath();
    ctx.moveTo(lot.area.points[0].x, lot.area.points[0].y);
    lot.area.points.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();

    let fillColor = 'rgba(34, 197, 94, 0.3)';
    let strokeColor = '#22c55e';

    if (lot.status === LotStatus.RESERVED) {
      fillColor = 'rgba(251, 191, 36, 0.3)';
      strokeColor = '#fbbf24';
    } else if (lot.status === LotStatus.SOLD) {
      fillColor = 'rgba(239, 68, 68, 0.3)';
      strokeColor = '#ef4444';
    }

    if (isHovered) {
      fillColor = fillColor.replace('0.3', '0.5');
      strokeColor = '#000';
    }

    if (isSelected) {
      fillColor = 'rgba(59, 130, 246, 0.5)';
      strokeColor = '#3b82f6';
    }

    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = isHovered || isSelected ? 3 : 2;
    ctx.stroke();
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
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const dx = (e.clientX - panStart.x) * scaleX;
      const dy = (e.clientY - panStart.y) * scaleY;
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

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => Math.max(0.5, Math.min(prev + delta, 5)));
  }, []);

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
    if (drawingPoints.length >= 3 && onAreaDrawn) {
      onAreaDrawn({ points: drawingPoints });
      setDrawingPoints([]);
    }
  };

  const handleCancelDrawing = () => {
    setDrawingPoints([]);
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
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleFinishDrawing,
    handleCancelDrawing,
  };
}
