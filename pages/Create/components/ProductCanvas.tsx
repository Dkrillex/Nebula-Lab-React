import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ProductCanvasProps {
  modelImageUrl: string | null;
  productImageUrl: string | null;
  onLocationChange?: (location: number[][]) => void;
  className?: string;
}

export interface ProductCanvasRef {
  resetTransform: () => void;
}

interface TransformState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

const ProductCanvas = forwardRef<ProductCanvasRef, ProductCanvasProps>(({
  modelImageUrl,
  productImageUrl,
  onLocationChange,
  className = ''
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for mutable state to avoid re-renders during drag
  const transformRef = useRef<TransformState>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0
  });
  
  const interactionRef = useRef({
    isDragging: false,
    isRotating: false,
    isScaling: false,
    lastMouseX: 0,
    lastMouseY: 0
  });

  const imagesRef = useRef<{
    model: HTMLImageElement | null;
    product: HTMLImageElement | null;
  }>({
    model: null,
    product: null
  });

  const initialScaleRef = useRef(1);

  // Initialize images and canvas
  useEffect(() => {
    if (!modelImageUrl) return;

    setIsLoading(true);
    const modelImg = new Image();
    modelImg.crossOrigin = 'anonymous';
    
    modelImg.onload = () => {
      imagesRef.current.model = modelImg;
      setIsLoading(false);
      initCanvas();
      draw();
    };
    
    modelImg.onerror = () => {
      console.error('Failed to load model image');
      setIsLoading(false);
    };

    modelImg.src = modelImageUrl;

    return () => {
      imagesRef.current.model = null;
    };
  }, [modelImageUrl]);

  useEffect(() => {
    if (!productImageUrl) {
      imagesRef.current.product = null;
      draw(); // Clear product from canvas
      return;
    }

    const productImg = new Image();
    productImg.crossOrigin = 'anonymous';
    
    productImg.onload = () => {
      imagesRef.current.product = productImg;
      resetTransform(); // Reset transform when new product loads
      draw();
    };

    productImg.onerror = () => {
      console.error('Failed to load product image');
    };

    productImg.src = productImageUrl;

    return () => {
      imagesRef.current.product = null;
    };
  }, [productImageUrl]);

  // Resize observer to handle window resizing
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      initCanvas();
      draw();
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  };

  const resetTransform = () => {
    const canvas = canvasRef.current;
    const productImg = imagesRef.current.product;
    if (!canvas || !productImg) return;

    const containerWidth = canvas.width;
    const containerHeight = canvas.height;

    // Center the image
    transformRef.current.x = containerWidth / 2;
    transformRef.current.y = containerHeight / 2;
    transformRef.current.rotation = 0;

    // Scale logic from Vue: 1/3 of container size
    const maxWidth = containerWidth / 3;
    const maxHeight = containerHeight / 3;
    const scale = Math.min(maxWidth / productImg.width, maxHeight / productImg.height);
    
    transformRef.current.scale = scale;
    initialScaleRef.current = scale;
    
    updateLocation();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const { model, product } = imagesRef.current;
    
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw model background (using object-fit: contain logic)
    if (model) {
      // We'll assume the parent container handles the background image via CSS or <img> tag
      // to match the Vue implementation which uses an absolute positioned <img> for background
      // and canvas ONLY for the product.
      // However, if we want to composite them, we can draw both.
      // The Vue code has: <img class="model-background-image"> and <canvas class="model-product-canvas">
      // So the canvas is transparent and only draws the product.
    }

    // Draw product
    if (product) {
      const { x, y, scale, rotation } = transformRef.current;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);
      ctx.drawImage(product, -product.width / 2, -product.height / 2);
      ctx.restore();
    }
  };

  const updateLocation = () => {
    if (!onLocationChange || !canvasRef.current || !imagesRef.current.product) return;

    const { x, y, scale, rotation } = transformRef.current;
    const img = imagesRef.current.product;
    const canvas = canvasRef.current;

    const angleInRadians = (rotation * Math.PI) / 180;
    const halfWidth = (img.width * scale) / 2;
    const halfHeight = (img.height * scale) / 2;

    // Calculate 4 corners (TopLeft, TopRight, BottomRight, BottomLeft)
    // Relative to the center (x, y)
    const corners = [
      // Top Left
      { 
        x: x + (-halfWidth * Math.cos(angleInRadians) - (-halfHeight) * Math.sin(angleInRadians)),
        y: y + (-halfWidth * Math.sin(angleInRadians) + (-halfHeight) * Math.cos(angleInRadians))
      },
      // Top Right
      {
        x: x + (halfWidth * Math.cos(angleInRadians) - (-halfHeight) * Math.sin(angleInRadians)),
        y: y + (halfWidth * Math.sin(angleInRadians) + (-halfHeight) * Math.cos(angleInRadians))
      },
      // Bottom Right
      {
        x: x + (halfWidth * Math.cos(angleInRadians) - halfHeight * Math.sin(angleInRadians)),
        y: y + (halfWidth * Math.sin(angleInRadians) + halfHeight * Math.cos(angleInRadians))
      },
      // Bottom Left
      {
        x: x + (-halfWidth * Math.cos(angleInRadians) - halfHeight * Math.sin(angleInRadians)),
        y: y + (-halfWidth * Math.sin(angleInRadians) + halfHeight * Math.cos(angleInRadians))
      }
    ];

    // Normalize coordinates (0-1)
    const normalizedLocation = corners.map(corner => [
      Number((corner.x / canvas.width).toFixed(6)),
      Number((corner.y / canvas.height).toFixed(6))
    ]);

    onLocationChange(normalizedLocation);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!productImageUrl) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    interactionRef.current.lastMouseX = mouseX;
    interactionRef.current.lastMouseY = mouseY;
    interactionRef.current.isScaling = e.altKey;
    interactionRef.current.isRotating = e.shiftKey;
    interactionRef.current.isDragging = !e.altKey && !e.shiftKey;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!productImageUrl) return;
    
    const { isDragging, isRotating, isScaling, lastMouseX, lastMouseY } = interactionRef.current;
    if (!isDragging && !isRotating && !isScaling) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const dx = mouseX - lastMouseX;
    const dy = mouseY - lastMouseY;

    if (isDragging) {
      transformRef.current.x += dx;
      transformRef.current.y += dy;
    } else if (isRotating) {
      // Rotate based on horizontal movement
      transformRef.current.rotation += dx * 0.5;
    } else if (isScaling) {
      // Scale based on vertical movement
      const scaleDelta = dy * -0.005;
      const scaleMultiplier = 1 + scaleDelta;
      const newScale = Math.max(0.002, Math.min(10, transformRef.current.scale + (initialScaleRef.current * scaleMultiplier - initialScaleRef.current)));
      transformRef.current.scale = newScale;
    }

    interactionRef.current.lastMouseX = mouseX;
    interactionRef.current.lastMouseY = mouseY;

    draw();
  };

  const handleMouseUp = () => {
    if (interactionRef.current.isDragging || interactionRef.current.isRotating || interactionRef.current.isScaling) {
      updateLocation(); // Update location on mouse up
    }
    
    interactionRef.current.isDragging = false;
    interactionRef.current.isRotating = false;
    interactionRef.current.isScaling = false;
  };

  // Expose resetTransform via ref
  useImperativeHandle(ref, () => ({
    resetTransform
  }));

  return (
    <div className={`relative w-full h-full bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 ${className}`} ref={containerRef}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}
      
      {/* Background Image (Model) */}
      {modelImageUrl && (
        <img
          src={modelImageUrl}
          alt="Model Background"
          className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none z-0"
        />
      )}

      {/* Canvas for Product */}
      <canvas
        ref={canvasRef}
        className={`absolute top-0 left-0 w-full h-full z-10 touch-none ${productImageUrl ? (interactionRef.current.isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* Instructions Overlay */}
      {productImageUrl && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur p-3 rounded-lg text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 pointer-events-none z-20 shadow-sm">
          <div className="flex justify-between gap-2">
            <span className="flex items-center gap-1"><span className="font-bold">拖动:</span> 左键</span>
            <span className="flex items-center gap-1"><span className="font-bold">旋转:</span> Shift+拖动</span>
            <span className="flex items-center gap-1"><span className="font-bold">缩放:</span> Alt+拖动</span>
          </div>
        </div>
      )}
    </div>
  );
});

ProductCanvas.displayName = 'ProductCanvas';

export default ProductCanvas;
