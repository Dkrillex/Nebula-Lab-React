import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

interface MaskCanvasProps {
  imageUrl: string | null;
  tool: 'pencil' | 'eraser';
  brushSize: number;
  enableZoom?: boolean;
  className?: string;
}

export interface MaskCanvasRef {
  getMask: () => Promise<Blob | null>;
  clearCanvas: () => void;
  undoLastAction: () => void;
}

interface ImageDrawInfo {
  offsetX: number;
  offsetY: number;
  drawWidth: number;
  drawHeight: number;
  scaleX: number;
  scaleY: number;
  originalWidth: number;
  originalHeight: number;
}

interface Stroke {
  type: 'pencil' | 'eraser';
  path: { x: number; y: number }[]; // Normalized coordinates
  brushSize: number;
  color: string;
  globalCompositeOperation: GlobalCompositeOperation;
}

const MaskCanvas = forwardRef<MaskCanvasRef, MaskCanvasProps>(({
  imageUrl,
  tool,
  brushSize,
  enableZoom = true,
  className = ''
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  // State
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [zoomScale, setZoomScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false });
  
  // Refs for mutable state during interactions
  const isPanningRef = useRef(false);
  const isSpacePressedRef = useRef(false);
  const lastPanRef = useRef({ x: 0, y: 0 });
  const isDrawingRef = useRef(false);
  const lastDrawPosRef = useRef<{ x: number, y: number } | null>(null);
  const drawingPathRef = useRef<{ x: number, y: number }[]>([]);
  const currentStrokeRef = useRef<Stroke | null>(null);
  
  const drawnShapesRef = useRef<Stroke[]>([]);
  const actionHistoryRef = useRef<{ type: string, shape: Stroke }[]>([]);
  
  const imageDrawInfoRef = useRef<ImageDrawInfo>({
    offsetX: 0, offsetY: 0, drawWidth: 0, drawHeight: 0,
    scaleX: 1, scaleY: 1, originalWidth: 0, originalHeight: 0
  });
  
  const originalImageInfoRef = useRef({
    baseOffsetX: 0, baseOffsetY: 0, baseDrawWidth: 0, baseDrawHeight: 0
  });

  const imageRef = useRef<HTMLImageElement | null>(null);

  // Load Image
  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      // Reset zoom/pan on new image
      setZoomScale(1);
      setPan({ x: 0, y: 0 });
      
      // Draw
      if (canvasSize.width > 0 && canvasSize.height > 0) {
        loadAndDrawImage();
      }
    };
    img.src = imageUrl;
  }, [imageUrl]); // Re-run when imageUrl changes

  // Resize Observer
  useEffect(() => {
    if (!containerRef.current) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({ width, height });
      }
    });

    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Redraw when canvas size or zoom/pan changes
  useEffect(() => {
    if (canvasSize.width > 0 && canvasSize.height > 0 && imageRef.current) {
      // Update canvas DOM size
      if (mainCanvasRef.current && maskCanvasRef.current) {
        mainCanvasRef.current.width = canvasSize.width;
        mainCanvasRef.current.height = canvasSize.height;
        maskCanvasRef.current.width = canvasSize.width;
        maskCanvasRef.current.height = canvasSize.height;
      }
      loadAndDrawImage();
    }
  }, [canvasSize, zoomScale, pan]);

  const loadAndDrawImage = () => {
    const img = imageRef.current;
    const mainCtx = mainCanvasRef.current?.getContext('2d');
    const maskCtx = maskCanvasRef.current?.getContext('2d');
    const { width, height } = canvasSize;

    if (!img || !mainCtx || !maskCtx) return;

    const imgRatio = img.width / img.height;
    const canvasRatio = width / height;

    // Base dimensions (fit containment)
    const baseDrawW = imgRatio > canvasRatio ? width : height * imgRatio;
    const baseDrawH = imgRatio > canvasRatio ? width / imgRatio : height;
    const baseOffsetX = (width - baseDrawW) / 2;
    const baseOffsetY = (height - baseDrawH) / 2;

    originalImageInfoRef.current = {
      baseOffsetX, baseOffsetY, baseDrawWidth: baseDrawW, baseDrawHeight: baseDrawH
    };

    // Apply Zoom & Pan
    const drawW = baseDrawW * zoomScale;
    const drawH = baseDrawH * zoomScale;
    const offsetX = baseOffsetX + (baseDrawW - drawW) / 2 + pan.x;
    const offsetY = baseOffsetY + (baseDrawH - drawH) / 2 + pan.y;

    imageDrawInfoRef.current = {
      offsetX, offsetY, drawWidth: drawW, drawHeight: drawH,
      scaleX: drawW / img.width, scaleY: drawH / img.height,
      originalWidth: img.width, originalHeight: img.height
    };

    // Draw Main Image
    mainCtx.clearRect(0, 0, width, height);
    mainCtx.drawImage(img, offsetX, offsetY, drawW, drawH);

    // Redraw Mask Layers
    redrawAllShapes();
  };

  const redrawAllShapes = () => {
    const maskCtx = maskCanvasRef.current?.getContext('2d');
    const { width, height } = canvasSize;
    if (!maskCtx) return;

    maskCtx.clearRect(0, 0, width, height);
    drawnShapesRef.current.forEach(shape => drawStroke(maskCtx, shape));
  };

  // Coordinate Conversion
  const normalizedToCanvasCoords = (nx: number, ny: number) => {
    const { baseOffsetX, baseOffsetY, baseDrawWidth, baseDrawHeight } = originalImageInfoRef.current;
    const { offsetX, offsetY, drawWidth, drawHeight } = imageDrawInfoRef.current;
    
    const relX = (nx - baseOffsetX) / baseDrawWidth;
    const relY = (ny - baseOffsetY) / baseDrawHeight;
    
    return {
      x: offsetX + relX * drawWidth,
      y: offsetY + relY * drawHeight
    };
  };

  const canvasToNormalizedCoords = (cx: number, cy: number) => {
    const { baseOffsetX, baseOffsetY, baseDrawWidth, baseDrawHeight } = originalImageInfoRef.current;
    const { offsetX, offsetY, drawWidth, drawHeight } = imageDrawInfoRef.current;

    const relX = (cx - offsetX) / drawWidth;
    const relY = (cy - offsetY) / drawHeight;

    return {
      x: baseOffsetX + relX * baseDrawWidth,
      y: baseOffsetY + relY * baseDrawHeight
    };
  };

  const drawStroke = (ctx: CanvasRenderingContext2D, shape: Stroke) => {
    if (shape.path.length === 0) return;

    ctx.save();
    ctx.globalCompositeOperation = shape.globalCompositeOperation;
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.brushSize * zoomScale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    
    if (shape.path.length === 1) {
      const p = normalizedToCanvasCoords(shape.path[0].x, shape.path[0].y);
      ctx.arc(p.x, p.y, (shape.brushSize * zoomScale) / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const start = normalizedToCanvasCoords(shape.path[0].x, shape.path[0].y);
      ctx.moveTo(start.x, start.y);
      
      for (let i = 1; i < shape.path.length; i++) {
        const p = normalizedToCanvasCoords(shape.path[i].x, shape.path[i].y);
        if (i === 1) {
          ctx.lineTo(p.x, p.y);
        } else {
          const prev = normalizedToCanvasCoords(shape.path[i-1].x, shape.path[i-1].y);
          const midX = (prev.x + p.x) / 2;
          const midY = (prev.y + p.y) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
        }
      }
      ctx.stroke();
    }
    ctx.restore();
  };

  // Interactions
  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (enableZoom && isSpacePressedRef.current) {
      isPanningRef.current = true;
      const { x, y } = getCoords(e);
      lastPanRef.current = { x, y };
      e.preventDefault(); // Prevent default only if panning to allow other touch actions if needed
      return;
    }

    isDrawingRef.current = true;
    const { x, y } = getCoords(e);
    lastDrawPosRef.current = { x, y };
    drawingPathRef.current = [{ x, y }];

    const normalizedPos = canvasToNormalizedCoords(x, y);
    
    currentStrokeRef.current = {
      type: tool,
      brushSize,
      color: tool === 'eraser' ? 'rgba(0,0,0,1)' : 'rgba(255,255,0,0.5)', // Using semi-transparent yellow for visibility
      globalCompositeOperation: tool === 'eraser' ? 'destination-out' : 'source-over',
      path: [normalizedPos]
    };

    // Immediate visual feedback
    const ctx = maskCanvasRef.current?.getContext('2d');
    if (ctx && currentStrokeRef.current) {
      // For the live drawing, we just draw the point/line directly
      ctx.beginPath();
      ctx.globalCompositeOperation = currentStrokeRef.current.globalCompositeOperation;
      ctx.strokeStyle = currentStrokeRef.current.color;
      ctx.lineWidth = brushSize * zoomScale;
      ctx.lineCap = 'round';
      ctx.moveTo(x, y);
      ctx.lineTo(x, y); // Single point
      ctx.stroke();
    }
  };

  const moveDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getCoords(e);
    setCursor({ x, y, visible: true });

    if (isPanningRef.current) {
      const dx = x - lastPanRef.current.x;
      const dy = y - lastPanRef.current.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastPanRef.current = { x, y };
      return;
    }

    if (!isDrawingRef.current || !currentStrokeRef.current) return;

    const lastPos = lastDrawPosRef.current;
    if (!lastPos) return;

    // Distance check
    const dist = Math.sqrt(Math.pow(x - lastPos.x, 2) + Math.pow(y - lastPos.y, 2));
    if (dist < 2) return;

    const ctx = maskCanvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.globalCompositeOperation = currentStrokeRef.current.globalCompositeOperation;
      ctx.strokeStyle = currentStrokeRef.current.color;
      ctx.lineWidth = brushSize * zoomScale;
      ctx.lineCap = 'round';
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.quadraticCurveTo(lastPos.x, lastPos.y, (lastPos.x + x)/2, (lastPos.y + y)/2);
      ctx.stroke();
    }

    const normalizedPos = canvasToNormalizedCoords(x, y);
    currentStrokeRef.current.path.push(normalizedPos);
    lastDrawPosRef.current = { x, y };
  };

  const endDraw = () => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      return;
    }
    
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (currentStrokeRef.current && currentStrokeRef.current.path.length > 0) {
      drawnShapesRef.current.push(currentStrokeRef.current);
      actionHistoryRef.current.push({ type: 'add', shape: currentStrokeRef.current });
      currentStrokeRef.current = null;
    }
    
    // Force a redraw to clean up any artifacts and ensure smooth curves from stored path
    redrawAllShapes();
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!enableZoom) return;
    e.preventDefault();
    // e.stopPropagation(); 
    // Note: stopPropagation might block parent scroll. 
    // Standard behavior: if hovering canvas, zoom canvas, don't scroll page?
    // Let's allow preventDefault to stop page scroll if intended.

    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomScale(prev => Math.min(Math.max(prev + delta, 1), 3));
  };

  // Keyboard events for Space key (Pan mode)
  useEffect(() => {
    if (!enableZoom) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressedRef.current) {
        isSpacePressedRef.current = true;
        // Trigger re-render to update cursor if needed (optional)
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePressedRef.current = false;
        isPanningRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enableZoom]);

  // Expose methods
  useImperativeHandle(ref, () => ({
    getMask: async () => {
      const { originalWidth, originalHeight } = imageDrawInfoRef.current;
      if (originalWidth === 0 || originalHeight === 0) return null;

      const offCanvas = document.createElement('canvas');
      offCanvas.width = originalWidth;
      offCanvas.height = originalHeight;
      const ctx = offCanvas.getContext('2d');
      if (!ctx) return null;

      // Draw mask shapes onto offline canvas at original resolution
      // Note: We need to draw them using original coordinates.
      // Our shapes store normalized coordinates relative to the BASE draw rect (which is fitted to canvas).
      // But wait, normalized coords were: x = baseOffsetX + relX * baseDrawWidth
      // Where relX is 0..1 relative to image.
      // So relX = (x - baseOffsetX) / baseDrawWidth.
      // And actual pixel X on original image = relX * originalWidth.
      
      const { baseOffsetX, baseOffsetY, baseDrawWidth, baseDrawHeight } = originalImageInfoRef.current;
      
      // Helper to convert normalized to original image pixel coords
      const normalizedToOriginal = (nx: number, ny: number) => {
        const relX = (nx - baseOffsetX) / baseDrawWidth;
        const relY = (ny - baseOffsetY) / baseDrawHeight;
        return {
          x: relX * originalWidth,
          y: relY * originalHeight
        };
      };

      drawnShapesRef.current.forEach(shape => {
        ctx.save();
        // For mask export: Brush is White, Eraser is Black (or transparent).
        // Vue implementation logic:
        // It draws the maskCanvas onto the image.
        // Then it scans pixels: if alpha > 0, set to White(255,255,255,255), else Transparent.
        // But here we have vector paths, so we can draw cleanly.
        
        ctx.globalCompositeOperation = shape.type === 'eraser' ? 'destination-out' : 'source-over';
        ctx.strokeStyle = 'white'; // Mask area is white
        
        // Scale brush size from screen pixels to original image pixels?
        // The brush size in props is "screen pixels".
        // If image is 2000px wide but shown at 500px, a 10px brush covers 1/50th of screen.
        // On image it should cover 1/50th of 2000px = 40px.
        // Scale factor = originalWidth / baseDrawWidth.
        const scaleFactor = originalWidth / baseDrawWidth;
        ctx.lineWidth = shape.brushSize * scaleFactor;
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        if (shape.path.length > 0) {
           const start = normalizedToOriginal(shape.path[0].x, shape.path[0].y);
           ctx.moveTo(start.x, start.y);
           for(let i=1; i<shape.path.length; i++){
              const p = normalizedToOriginal(shape.path[i].x, shape.path[i].y);
              if (i===1) ctx.lineTo(p.x, p.y);
              else {
                const prev = normalizedToOriginal(shape.path[i-1].x, shape.path[i-1].y);
                ctx.quadraticCurveTo(prev.x, prev.y, (prev.x+p.x)/2, (prev.y+p.y)/2);
              }
           }
           // If single point
           if (shape.path.length === 1) {
             ctx.lineTo(start.x, start.y); // Needs stroke to render
           }
           ctx.stroke();
           
           // Also handle dots for single clicks better
           if (shape.path.length === 1) {
             ctx.fillStyle = 'white';
             ctx.beginPath();
             ctx.arc(start.x, start.y, (shape.brushSize * scaleFactor)/2, 0, Math.PI*2);
             ctx.fill();
           }
        }
        ctx.restore();
      });

      // Convert to blob (PNG with transparency)
      // The background should be transparent. Drawn strokes are White.
      // This assumes the API expects a white mask on transparent background.
      // Or black background with white mask?
      // Vue code: 
      // if (a && avg > 100) data = 255 (White); else data = 0 (Transparent? or Black?)
      // data[i+3] = 255; (Alpha is always 255).
      // So Vue code creates a Black and White image (Binary Mask).
      // Background Black (0,0,0,255), Foreground White (255,255,255,255).
      
      // Let's replicate B&W mask.
      // Fill background black first.
      
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = originalWidth;
      finalCanvas.height = originalHeight;
      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) return null;
      
      finalCtx.fillStyle = 'black';
      finalCtx.fillRect(0, 0, originalWidth, originalHeight);
      finalCtx.drawImage(offCanvas, 0, 0);
      
      return new Promise(resolve => finalCanvas.toBlob(resolve, 'image/png'));
    },
    clearCanvas: () => {
      drawnShapesRef.current = [];
      actionHistoryRef.current = [];
      redrawAllShapes();
    },
    undoLastAction: () => {
      const last = actionHistoryRef.current.pop();
      if (last) {
        drawnShapesRef.current.pop();
        redrawAllShapes();
      }
    }
  }));

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden select-none touch-none ${className} ${enableZoom && isSpacePressedRef.current ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
      onMouseDown={startDraw}
      onMouseMove={moveDraw}
      onMouseUp={endDraw}
      onMouseLeave={() => { endDraw(); setCursor(prev => ({...prev, visible: false})); }}
      onTouchStart={startDraw}
      onTouchMove={moveDraw}
      onTouchEnd={endDraw}
      onWheel={handleWheel}
    >
      <canvas ref={mainCanvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
      <canvas ref={maskCanvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-70" />
      
      {/* Cursor for brush */}
      {cursor.visible && !isSpacePressedRef.current && (
        <div 
          className="pointer-events-none fixed z-50 rounded-full border-2 border-yellow-400"
          style={{
            left: cursor.x, // Note: These are client coordinates in the event handler?
            // Wait, getCoords returns relative to canvas.
            // But 'fixed' position needs client coordinates.
            // We should use absolute position relative to container.
            // But cursor.x/y are relative to container.
            position: 'absolute',
            left: cursor.x - (brushSize * zoomScale) / 2,
            top: cursor.y - (brushSize * zoomScale) / 2,
            width: brushSize * zoomScale,
            height: brushSize * zoomScale
          }}
        />
      )}

      {enableZoom && zoomScale !== 1 && (
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs pointer-events-none z-10">
          {Math.round(zoomScale * 100)}%
        </div>
      )}
    </div>
  );
});

MaskCanvas.displayName = 'MaskCanvas';

export default MaskCanvas;

