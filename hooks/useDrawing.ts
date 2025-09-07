import { useRef, useEffect, useCallback } from 'react';
import type React from 'react';

export const useDrawing = (
  onDrawEnd: (dataUrl: string) => void,
  isDrawingEnabled: boolean = true
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const getCtx = useCallback(() => canvasRef.current?.getContext('2d'), []);

  useEffect(() => {
    const ctx = getCtx();
    if (ctx) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [getCtx]);

  const getCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): [number, number] => {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0];
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      // Touch event
      if (e.touches && e.touches.length > 0) {
        return [e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top];
      }
    } else {
      // Mouse event
      return [e.clientX - rect.left, e.clientY - rect.top];
    }
    return [0, 0];
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingEnabled) return;
    const ctx = getCtx();
    if (!ctx) return;
    const [x, y] = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawing.current = true;
  }, [getCtx, isDrawingEnabled, getCoords]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !isDrawingEnabled) return;
    e.preventDefault();
    const ctx = getCtx();
    if (!ctx) return;
    const [x, y] = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }, [getCtx, isDrawingEnabled, getCoords]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing.current) return;
    const ctx = getCtx();
    if (ctx) {
        ctx.closePath();
    }
    isDrawing.current = false;
    if (canvasRef.current) {
      onDrawEnd(canvasRef.current.toDataURL('image/png'));
    }
  }, [onDrawEnd, getCtx]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [getCtx]);

  return { canvasRef, startDrawing, draw, stopDrawing, clearCanvas };
};
