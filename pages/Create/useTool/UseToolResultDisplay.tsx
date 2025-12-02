import React, { useState, useRef, useEffect } from 'react';
import { Download, Maximize2, FolderPlus, Check, ChevronsLeftRight } from 'lucide-react';
import AddMaterialModal from '@/components/AddMaterialModal';
import { uploadService } from '@/services/uploadService';

interface UseToolResultDisplayProps {
  imageUrl: string;
  originalImageUrl?: string | null;
  onImageClick?: (imageUrl: string) => void;
}

type ViewMode = 'result' | 'side-by-side' | 'slider';

const UseToolResultDisplay: React.FC<UseToolResultDisplayProps> = ({
  imageUrl,
  originalImageUrl,
  onImageClick,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('result');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [importedStatus, setImportedStatus] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // 滑块拖拽处理
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!sliderContainerRef.current) return;
      const rect = sliderContainerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percent = (x / rect.width) * 100;
      setSliderPosition(percent);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 将 Blob 转换为 Base64 data URL
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result as string));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleDownloadComparison = async () => {
    if (!originalImageUrl || !imageUrl) return;

    try {
      // 加载图片的辅助函数，借鉴 Nebula1 的方式
      // 通过 uploadByImageUrl 上传到 OSS，然后获取 blob，转换为 base64，避免跨域问题
      const loadImage = async (url: string): Promise<HTMLImageElement> => {
        // 如果是 data URL，直接使用
        if (url.startsWith('data:')) {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
          });
        }

        try {
          // 借鉴 Nebula1：通过 uploadByImageUrl 上传到 OSS，获取新的 OSS URL
          const { url: ossUrl } = await uploadService.uploadByImageUrl(url, 'png');
          
          // 通过 fetch 获取 OSS URL 的 blob
          const res = await fetch(ossUrl);
          const blob = await res.blob();
          
          // 将 Blob 转换为 Base64 data URL
          const dataUrl = await blobToBase64(blob);
          
          // 使用 data URL 加载图片，不会有跨域问题
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = dataUrl;
          });
        } catch (error) {
          console.warn('通过 OSS 加载失败，尝试直接加载:', error);
          // 如果上传到 OSS 失败，尝试直接加载（可能会失败）
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
          });
        }
      };

      const [originalImg, resultImg] = await Promise.all([
        loadImage(originalImageUrl),
        loadImage(imageUrl),
      ]);

      // 创建画布
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('无法创建画布上下文');
      }

      // 计算画布尺寸：每张图片各占一半宽度
      const maxWidth = Math.max(originalImg.width, resultImg.width);
      const maxHeight = Math.max(originalImg.height, resultImg.height);
      const halfWidth = maxWidth; // 每张图片占据的宽度（使用最大宽度）
      const totalWidth = halfWidth * 2; // 总宽度为两倍

      canvas.width = totalWidth;
      canvas.height = maxHeight;

      // 填充白色背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 计算缩放比例，使图片适应各自的一半空间
      const originalScale = Math.min(
        halfWidth / originalImg.width,
        maxHeight / originalImg.height
      );
      const resultScale = Math.min(
        halfWidth / resultImg.width,
        maxHeight / resultImg.height
      );

      const originalScaledWidth = originalImg.width * originalScale;
      const originalScaledHeight = originalImg.height * originalScale;
      const resultScaledWidth = resultImg.width * resultScale;
      const resultScaledHeight = resultImg.height * resultScale;

      // 绘制原图（在左半部分居中）
      const originalX = (halfWidth - originalScaledWidth) / 2;
      const originalY = (maxHeight - originalScaledHeight) / 2;
      ctx.drawImage(
        originalImg,
        originalX,
        originalY,
        originalScaledWidth,
        originalScaledHeight
      );

      // 绘制结果图（在右半部分居中）
      const resultX = halfWidth + (halfWidth - resultScaledWidth) / 2;
      const resultY = (maxHeight - resultScaledHeight) / 2;
      ctx.drawImage(
        resultImg,
        resultX,
        resultY,
        resultScaledWidth,
        resultScaledHeight
      );

      // 转换为 data URL 并下载（借鉴 Nebula1 使用 toDataURL）
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `comparison-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('下载对比图失败:', error);
      // 移除 alert 弹窗，只在控制台输出错误
    }
  };

  const handlePreview = () => {
    if (onImageClick) {
      onImageClick(imageUrl);
    }
  };

  const handleAddToMaterials = () => {
    setIsAddModalOpen(true);
  };

  const handleMaterialSuccess = () => {
    setImportedStatus(true);
    setIsAddModalOpen(false);
  };

  // 如果没有原图，只显示结果模式
  const availableModes: ViewMode[] = originalImageUrl
    ? ['result', 'side-by-side', 'slider']
    : ['result'];

  const getModeLabel = (mode: ViewMode): string => {
    const labels: Record<ViewMode, string> = {
      result: '结果',
      'side-by-side': '并排',
      slider: '滑块',
    };
    return labels[mode];
  };

  return (
    <>
      <div className="flex flex-col gap-4 w-full">
        {/* 模式切换按钮 */}
        {originalImageUrl && availableModes.length > 1 && (
          <div className="flex justify-center">
            <div className="flex items-center gap-1 rounded-lg bg-[#f3f4f6] p-1">
              {availableModes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors duration-200 ${
                    viewMode === mode
                      ? 'bg-gradient-to-r from-[#7d6fdd] to-[#15b7fa] text-white'
                      : 'text-[#6b7280] hover:bg-[rgba(107,114,128,0.1)]'
                  }`}
                >
                  {getModeLabel(mode)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 结果展示区域 */}
        <div className="relative w-full">
          {/* 结果模式 */}
          {viewMode === 'result' && (
            <div className="relative group">
              <img
                src={imageUrl}
                alt="Generated result"
                className="w-full rounded-lg object-contain max-h-[700px] mx-auto"
                onClick={handlePreview}
                style={{ cursor: 'pointer' }}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // 如果 crossOrigin 失败，尝试不使用 crossOrigin
                  const img = e.currentTarget;
                  if (img.crossOrigin !== null) {
                    img.crossOrigin = null;
                    img.referrerPolicy = 'no-referrer';
                  }
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                <button
                  onClick={handlePreview}
                  className="rounded-full bg-white/90 p-2 hover:bg-white transition-colors"
                  title="预览"
                >
                  <Maximize2 className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={handleDownload}
                  className="rounded-full bg-white/90 p-2 hover:bg-white transition-colors"
                  title="下载"
                >
                  <Download className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={handleAddToMaterials}
                  className={`rounded-full p-2 transition-colors ${
                    importedStatus
                      ? 'bg-green-500 text-white'
                      : 'bg-white/90 hover:bg-white'
                  }`}
                  title="添加到素材库"
                >
                  {importedStatus ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <FolderPlus className="h-5 w-5 text-gray-700" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 并排模式 */}
          {viewMode === 'side-by-side' && originalImageUrl && (
            <div className="grid grid-cols-2 gap-2">
              <div className="relative flex items-center justify-center overflow-hidden rounded-lg border border-[rgba(0,0,0,0.1)] bg-white">
                <img
                  src={originalImageUrl}
                  alt="Original"
                  className="max-h-full max-w-full object-contain"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.crossOrigin !== null) {
                      img.crossOrigin = null;
                      img.referrerPolicy = 'no-referrer';
                    }
                  }}
                />
                <div className="absolute bottom-1 right-1 rounded bg-black/50 px-2 py-1 text-xs text-white">
                  原图
                </div>
              </div>
              <div className="relative flex items-center justify-center overflow-hidden rounded-lg border border-[rgba(0,0,0,0.1)] bg-white">
                <img
                  src={imageUrl}
                  alt="Generated"
                  className="max-h-full max-w-full object-contain"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.crossOrigin !== null) {
                      img.crossOrigin = null;
                      img.referrerPolicy = 'no-referrer';
                    }
                  }}
                />
                <div className="absolute bottom-1 right-1 rounded bg-black/50 px-2 py-1 text-xs text-white">
                  结果
                </div>
              </div>
            </div>
          )}

          {/* 滑块模式 */}
          {viewMode === 'slider' && originalImageUrl && (
            <div
              ref={sliderContainerRef}
              onMouseDown={handleMouseDown}
              className="relative h-[450px] w-full cursor-ew-resize select-none overflow-hidden rounded-lg border border-[rgba(0,0,0,0.1)] bg-white"
            >
              {/* 原图（底层） */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={originalImageUrl}
                  alt="Original"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              {/* 结果图（可裁剪显示） */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                }}
              >
                <img
                  src={imageUrl}
                  alt="Generated"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              {/* 滑块控制条 */}
              <div
                className="absolute bottom-0 top-0 w-0.5 cursor-ew-resize bg-gray-400"
                style={{ 
                  left: `calc(${sliderPosition}% - 1px)`,
                }}
              >
                <div 
                  className="absolute -left-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border-2 border-gray-400 bg-white shadow-sm"
                >
                  <ChevronsLeftRight className="h-3 w-3 text-gray-600" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col gap-3 md:flex-row">
          <button
            onClick={
              viewMode === 'side-by-side' ? handleDownloadComparison : handleDownload
            }
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 font-semibold rounded-[10px] bg-[rgba(107,114,128,0.2)] hover:bg-[rgba(107,114,128,0.4)] text-[#111827] transition-all duration-200"
          >
            <Download className="h-5 w-5" />
            <span>
              {viewMode === 'side-by-side' ? '下载对比图' : '下载'}
            </span>
          </button>
          <button
            onClick={handleAddToMaterials}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 font-semibold rounded-[10px] transition-all duration-200 ${
              importedStatus
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-[#7d6fdd] to-[#15b7fa] text-white shadow-lg shadow-[rgba(255,150,172,0.25)] hover:shadow-lg hover:shadow-[#7d6fdd]/30'
            }`}
          >
            <FolderPlus className="h-5 w-5" />
            <span>{importedStatus ? '已添加到素材库' : '添加到素材库'}</span>
          </button>
        </div>
      </div>

      <AddMaterialModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleMaterialSuccess}
        initialData={{
          assetName: '生成结果',
          assetTag: '生成结果',
          assetDesc: '生成结果',
          assetUrl: imageUrl,
          assetType: 6, // 图片类型
        }}
        disableAssetTypeSelection={true}
        isImportMode={true}
      />
    </>
  );
};

export default UseToolResultDisplay;

