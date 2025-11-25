import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download, FolderPlus, Video, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

export interface PreviewImage {
  key: string | number;
  url: string;
  name?: string;
}

export interface ImagePreviewAction {
  key: string;
  icon: React.ReactNode;
  label: string;
  onClick: (image: PreviewImage, index: number) => void;
  className?: string;
}

export interface ImagePreviewModalProps {
  visible: boolean;
  images: PreviewImage[];
  initialIndex?: number;
  onClose: () => void;
  // 自定义操作按钮
  actions?: ImagePreviewAction[];
  // 是否显示下载按钮
  showDownload?: boolean;
  // 下载文件名前缀
  downloadPrefix?: string;
  // 是否显示缩放控制
  showZoomControls?: boolean;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  visible,
  images,
  initialIndex = 0,
  onClose,
  actions = [],
  showDownload = true,
  downloadPrefix = 'image',
  showZoomControls = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // 重置状态当初始索引变化时
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setScale(1);
    setRotation(0);
  }, [initialIndex, visible]);

  // 上一张
  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
    setScale(1);
    setRotation(0);
  }, [images.length]);

  // 下一张
  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
    setScale(1);
    setRotation(0);
  }, [images.length]);

  // 下载图片
  const handleDownload = useCallback(() => {
    const img = images[currentIndex];
    if (img) {
      const link = document.createElement('a');
      link.href = img.url;
      link.download = `${downloadPrefix}_${Date.now()}.png`;
      link.click();
    }
  }, [images, currentIndex, downloadPrefix]);

  // 放大
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 3));
  }, []);

  // 缩小
  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  // 旋转
  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  // 键盘事件
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, handlePrev, handleNext, handleZoomIn, handleZoomOut, onClose]);

  if (!visible || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
        title="关闭 (Esc)"
      >
        <X size={24} />
      </button>

      {/* 图片计数 */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-black/50 text-white rounded-full text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* 缩放控制 */}
      {showZoomControls && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            title="缩小 (-)"
          >
            <ZoomOut size={20} />
          </button>
          <span className="px-2 py-1 bg-black/50 text-white rounded text-sm font-medium min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            title="放大 (+)"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={handleRotate}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            title="旋转"
          >
            <RotateCw size={20} />
          </button>
        </div>
      )}

      {/* 左箭头 */}
      {images.length > 1 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          title="上一张 (←)"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {/* 图片 */}
      <div className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center overflow-hidden">
        <img
          src={currentImage?.url}
          alt={currentImage?.name || `Preview ${currentIndex + 1}`}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl transition-transform duration-200"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
          }}
          draggable={false}
        />
      </div>

      {/* 右箭头 */}
      {images.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          title="下一张 (→)"
        >
          <ChevronRight size={32} />
        </button>
      )}

      {/* 底部操作栏 */}
      {(showDownload || actions.length > 0) && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
          {showDownload && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Download size={18} />
              下载图片
            </button>
          )}
          {actions.map(action => (
            <button
              key={action.key}
              onClick={() => action.onClick(currentImage, currentIndex)}
              className={action.className || "flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImagePreviewModal;

