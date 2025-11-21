import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

export type ToolType = 'pencil' | 'eraser' | 'arrow' | 'rect' | 'ellipse' | 'text';

export interface TextOptions {
  fontFamily: string;
  fontSize: number;
  fontWeight: string; // 'normal' | 'bold'
  fontStyle: string; // 'normal' | 'italic'
}

interface MaskCanvasProps {
  imageUrl: string | null;
  tool: ToolType;
  brushSize: number;
  brushColor?: string;
  textOptions?: TextOptions;
  mode?: 'mask' | 'draw';
  enableZoom?: boolean;
  className?: string;
}

export interface MaskCanvasRef {
  getMask: () => Promise<Blob | null>;
  getEditedImageBase64: () => Promise<string | null>;
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
  type: ToolType;
  path: { x: number; y: number }[]; // Normalized coordinates. For shapes: [start, end]
  text?: string;
  textOptions?: TextOptions;
  brushSize: number;
  color: string;
  globalCompositeOperation: GlobalCompositeOperation;
}

const MaskCanvas = forwardRef<MaskCanvasRef, MaskCanvasProps>(({
  imageUrl,
  tool,
  brushSize,
  brushColor = 'rgba(255, 255, 0, 0.5)', // Default for mask mode
  textOptions = { fontFamily: 'Arial', fontSize: 20, fontWeight: 'normal', fontStyle: 'normal' },
  mode = 'mask', // 'mask' | 'draw'
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
  
  // For shape drawing (start point)
  const startDrawPosRef = useRef<{ x: number, y: number } | null>(null);
  
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
    
    // Draw current stroke being drawn (preview)
    if (currentStrokeRef.current && isDrawingRef.current) {
       drawStroke(maskCtx, currentStrokeRef.current);
    }
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
    if (shape.path.length === 0 && shape.type !== 'text') return;

    ctx.save();
    ctx.globalCompositeOperation = shape.globalCompositeOperation;
    ctx.strokeStyle = shape.color;
    ctx.fillStyle = shape.color;
    ctx.lineWidth = shape.brushSize * zoomScale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (shape.type === 'pencil' || shape.type === 'eraser') {
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
    } else if (shape.type === 'rect') {
        if (shape.path.length < 2) return;
        const start = normalizedToCanvasCoords(shape.path[0].x, shape.path[0].y);
        const end = normalizedToCanvasCoords(shape.path[1].x, shape.path[1].y);
        
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
    } else if (shape.type === 'ellipse') {
        if (shape.path.length < 2) return;
        const start = normalizedToCanvasCoords(shape.path[0].x, shape.path[0].y);
        const end = normalizedToCanvasCoords(shape.path[1].x, shape.path[1].y);
        
        const centerX = (start.x + end.x) / 2;
        const centerY = (start.y + end.y) / 2;
        const radiusX = Math.abs(end.x - start.x) / 2;
        const radiusY = Math.abs(end.y - start.y) / 2;
        
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
    } else if (shape.type === 'arrow') {
        if (shape.path.length < 2) return;
        const start = normalizedToCanvasCoords(shape.path[0].x, shape.path[0].y);
        const end = normalizedToCanvasCoords(shape.path[1].x, shape.path[1].y);
        
        const headLength = 20 * zoomScale;
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 6), end.y - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 6), end.y - headLength * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    } else if (shape.type === 'text' && shape.text && shape.textOptions) {
        const pos = normalizedToCanvasCoords(shape.path[0].x, shape.path[0].y);
        const { fontSize, fontFamily, fontWeight, fontStyle } = shape.textOptions;
        
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize * zoomScale}px ${fontFamily}`;
        ctx.fillStyle = shape.color;
        ctx.fillText(shape.text, pos.x, pos.y);
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
      e.preventDefault();
      return;
    }

    const { x, y } = getCoords(e);
    const normalizedPos = canvasToNormalizedCoords(x, y);

    if (tool === 'text') {
        const text = window.prompt('请输入文本:');
        if (text) {
            const newStroke: Stroke = {
                type: 'text',
                path: [normalizedPos],
                text,
                textOptions: { ...textOptions }, // Copy current options
                brushSize,
                color: brushColor,
                globalCompositeOperation: 'source-over'
            };
            drawnShapesRef.current.push(newStroke);
            actionHistoryRef.current.push({ type: 'add', shape: newStroke });
            redrawAllShapes();
        }
        return;
    }

    isDrawingRef.current = true;
    lastDrawPosRef.current = { x, y };
    startDrawPosRef.current = { x, y }; // for shapes
    
    // Initial path
    let initialPath = [normalizedPos];
    if (tool === 'rect' || tool === 'ellipse' || tool === 'arrow') {
        initialPath = [normalizedPos, normalizedPos]; // Start and end are same initially
    }

    currentStrokeRef.current = {
      type: tool,
      brushSize,
      color: tool === 'eraser' ? 'rgba(0,0,0,1)' : brushColor, 
      globalCompositeOperation: tool === 'eraser' ? 'destination-out' : 'source-over',
      path: initialPath
    };

    redrawAllShapes(); // Draw initial dot or shape
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

    const normalizedPos = canvasToNormalizedCoords(x, y);

    if (tool === 'pencil' || tool === 'eraser') {
        const lastPos = lastDrawPosRef.current;
        if (!lastPos) return;
        
        // Simple distance check to avoid too many points
        const dist = Math.sqrt(Math.pow(x - lastPos.x, 2) + Math.pow(y - lastPos.y, 2));
        if (dist < 2) return;
        
        currentStrokeRef.current.path.push(normalizedPos);
        lastDrawPosRef.current = { x, y };
    } else if (tool === 'rect' || tool === 'ellipse' || tool === 'arrow') {
        // Update end point
        currentStrokeRef.current.path[1] = normalizedPos;
    }

    redrawAllShapes();
  };

  const endDraw = () => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      return;
    }
    
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (currentStrokeRef.current) {
      // Filter out tiny paths for pencil/eraser?
      if (tool === 'pencil' || tool === 'eraser') {
          if (currentStrokeRef.current.path.length > 0) {
              drawnShapesRef.current.push(currentStrokeRef.current);
              actionHistoryRef.current.push({ type: 'add', shape: currentStrokeRef.current });
          }
      } else {
          // Shapes
          drawnShapesRef.current.push(currentStrokeRef.current);
          actionHistoryRef.current.push({ type: 'add', shape: currentStrokeRef.current });
      }
      
      currentStrokeRef.current = null;
    }
    
    redrawAllShapes();
  };

  const handleWheel = (e: WheelEvent) => {
    if (!enableZoom) return;
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomScale(prev => Math.min(Math.max(prev + delta, 1), 3));
  };

  // Keyboard events for Space key (Pan mode) and Wheel event for Zoom
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
    
    // Add wheel event listener with passive: false to allow preventDefault
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
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
        
        ctx.globalCompositeOperation = shape.type === 'eraser' ? 'destination-out' : 'source-over';
        ctx.fillStyle = 'white'; 
        ctx.strokeStyle = 'white'; // Mask area is white for mask export
        
        const scaleFactor = originalWidth / baseDrawWidth;
        ctx.lineWidth = shape.brushSize * scaleFactor;
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Reuse logic for path vs shapes, but use normalizedToOriginal
        if (shape.type === 'pencil' || shape.type === 'eraser') {
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
                if (shape.path.length === 1) {
                    ctx.lineTo(start.x, start.y);
                }
                ctx.stroke();
                if (shape.path.length === 1) {
                    ctx.beginPath();
                    ctx.arc(start.x, start.y, (shape.brushSize * scaleFactor)/2, 0, Math.PI*2);
                    ctx.fill();
                }
            }
        } else if (shape.type === 'rect') {
            const start = normalizedToOriginal(shape.path[0].x, shape.path[0].y);
            const end = normalizedToOriginal(shape.path[1].x, shape.path[1].y);
            ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
            ctx.fillRect(start.x, start.y, end.x - start.x, end.y - start.y); // Fill for mask?
        } else if (shape.type === 'ellipse') {
            const start = normalizedToOriginal(shape.path[0].x, shape.path[0].y);
            const end = normalizedToOriginal(shape.path[1].x, shape.path[1].y);
            const centerX = (start.x + end.x) / 2;
            const centerY = (start.y + end.y) / 2;
            const radiusX = Math.abs(end.x - start.x) / 2;
            const radiusY = Math.abs(end.y - start.y) / 2;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
            ctx.fill(); // Fill for mask
            ctx.stroke();
        }
        // Arrow and Text generally ignored in mask unless strokeText? 
        // If mask is for "area to modify", text should probably be part of it?
        // Assuming standard mask is just highlighting area.
        // For now, just support basic shapes filling for mask.
        
        ctx.restore();
      });

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
    getEditedImageBase64: async () => {
      const { originalWidth, originalHeight } = imageDrawInfoRef.current;
      if (originalWidth === 0 || originalHeight === 0 || !imageRef.current) return null;

      const canvas = document.createElement('canvas');
      canvas.width = originalWidth;
      canvas.height = originalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // 1. Draw Original Image
      ctx.drawImage(imageRef.current, 0, 0, originalWidth, originalHeight);

      // 2. Draw Shapes on top
      const { baseOffsetX, baseOffsetY, baseDrawWidth, baseDrawHeight } = originalImageInfoRef.current;
      
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
        // For edited image, we use the actual shape color
        ctx.globalCompositeOperation = shape.type === 'eraser' ? 'destination-out' : 'source-over';
        ctx.strokeStyle = shape.color;
        ctx.fillStyle = shape.color;
        
        const scaleFactor = originalWidth / baseDrawWidth;
        ctx.lineWidth = shape.brushSize * scaleFactor;
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Replicate drawing logic for high-res export
        if (shape.type === 'pencil' || shape.type === 'eraser') {
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
                 if (shape.path.length === 1) {
                    ctx.lineTo(start.x, start.y);
                 }
                 ctx.stroke();
                 if (shape.path.length === 1) {
                    ctx.beginPath();
                    ctx.arc(start.x, start.y, (shape.brushSize * scaleFactor)/2, 0, Math.PI*2);
                    ctx.fill();
                 }
             }
        } else if (shape.type === 'rect') {
             const start = normalizedToOriginal(shape.path[0].x, shape.path[0].y);
             const end = normalizedToOriginal(shape.path[1].x, shape.path[1].y);
             ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        } else if (shape.type === 'ellipse') {
             const start = normalizedToOriginal(shape.path[0].x, shape.path[0].y);
             const end = normalizedToOriginal(shape.path[1].x, shape.path[1].y);
             const centerX = (start.x + end.x) / 2;
             const centerY = (start.y + end.y) / 2;
             const radiusX = Math.abs(end.x - start.x) / 2;
             const radiusY = Math.abs(end.y - start.y) / 2;
             ctx.beginPath();
             ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
             ctx.stroke();
        } else if (shape.type === 'arrow') {
             const start = normalizedToOriginal(shape.path[0].x, shape.path[0].y);
             const end = normalizedToOriginal(shape.path[1].x, shape.path[1].y);
             const headLength = 20 * zoomScale * scaleFactor; // Scale head
             const angle = Math.atan2(end.y - start.y, end.x - start.x);
             ctx.beginPath();
             ctx.moveTo(start.x, start.y);
             ctx.lineTo(end.x, end.y);
             ctx.stroke();
             ctx.beginPath();
             ctx.moveTo(end.x, end.y);
             ctx.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 6), end.y - headLength * Math.sin(angle - Math.PI / 6));
             ctx.moveTo(end.x, end.y);
             ctx.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 6), end.y - headLength * Math.sin(angle + Math.PI / 6));
             ctx.stroke();
        } else if (shape.type === 'text' && shape.text && shape.textOptions) {
             const pos = normalizedToOriginal(shape.path[0].x, shape.path[0].y);
             const { fontSize, fontFamily, fontWeight, fontStyle } = shape.textOptions;
             ctx.font = `${fontStyle} ${fontWeight} ${fontSize * scaleFactor}px ${fontFamily}`;
             ctx.fillText(shape.text, pos.x, pos.y);
        }
        
        ctx.restore();
      });

      return canvas.toDataURL('image/png');
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
    >
      <canvas ref={mainCanvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
      <canvas ref={maskCanvasRef} className={`absolute top-0 left-0 w-full h-full pointer-events-none ${mode === 'mask' ? 'opacity-70' : 'opacity-100'}`} />
      
      {/* Cursor for brush */}
      {cursor.visible && !isSpacePressedRef.current && (tool === 'pencil' || tool === 'eraser') && (
        <div 
          className="pointer-events-none fixed z-50 rounded-full border-2"
          style={{
            position: 'absolute',
            left: cursor.x - (brushSize * zoomScale) / 2,
            top: cursor.y - (brushSize * zoomScale) / 2,
            width: brushSize * zoomScale,
            height: brushSize * zoomScale,
            borderColor: brushColor === '#ffffff' || brushColor === 'rgba(255,255,255,1)' ? 'black' : brushColor
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
