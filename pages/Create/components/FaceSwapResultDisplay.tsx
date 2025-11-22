import React, { useState, useRef, useEffect } from 'react';
import { Download, Maximize2, FolderPlus, Check, ChevronsLeftRight } from 'lucide-react';
import AddMaterialModal from '../../../components/AddMaterialModal';

interface FaceSwapResultDisplayProps {
  imageUrl: string;
  originalImageUrl?: string | null;
  onUseAsInput?: (imageUrl: string) => void;
  onImageClick?: (imageUrl: string) => void;
}

type ViewMode = 'result' | 'side-by-side' | 'slider';

const FaceSwapResultDisplay: React.FC<FaceSwapResultDisplayProps> = ({
  imageUrl,
  originalImageUrl,
  onUseAsInput,
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
    link.download = `face-swap-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadComparison = async () => {
    if (!originalImageUrl || !imageUrl) return;

    try {
      // 加载两张图片
      const loadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        });
      };

      const [originalImg, resultImg] = await Promise.all([
        loadImage(originalImageUrl),
        loadImage(imageUrl),
      ]);

      // 创建画布
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const totalWidth = originalImg.width + resultImg.width;
      const maxHeight = Math.max(originalImg.height, resultImg.height);

      canvas.width = totalWidth;
      canvas.height = maxHeight;

      // 填充白色背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制原图
      ctx.drawImage(originalImg, 0, (maxHeight - originalImg.height) / 2);
      // 绘制结果图
      ctx.drawImage(resultImg, originalImg.width, (maxHeight - resultImg.height) / 2);

      // 下载
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `face-swap-comparison-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('下载对比图失败:', error);
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
      <div className="flex flex-col gap-4">
        {/* 模式切换按钮 */}
        {originalImageUrl && availableModes.length > 1 && (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-1 rounded-lg bg-[#f3f4f6] p-1">
              {availableModes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors duration-200 ${
                    viewMode === mode
                      ? 'bg-gradient-to-r from-[hsl(var(--primary))] to-[#15b7fa] text-white'
                      : 'text-[#111827] hover:bg-[rgba(107,114,128,0.2)]'
                  }`}
                >
                  {getModeLabel(mode)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 结果展示区域 */}
        <div className="relative">
          {/* 结果模式 */}
          {viewMode === 'result' && (
            <div className="relative group">
              <img
                src={imageUrl}
                alt="Face swap result"
                className="w-full rounded-lg object-contain max-h-[700px]"
                onClick={handlePreview}
                style={{ cursor: 'pointer' }}
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
                className="absolute bottom-0 top-0 w-1 cursor-ew-resize"
                style={{ 
                  left: `calc(${sliderPosition}% - 2px)`,
                  background: 'linear-gradient(180deg, hsl(var(--primary)) 0%, #15b7fa 100%)'
                }}
              >
                <div 
                  className="absolute -left-3.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-white"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #15b7fa 100%)'
                  }}
                >
                  <ChevronsLeftRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        {/* <div className="flex flex-col gap-3 md:flex-row"> */}
          {/* <button
            onClick={
              viewMode === 'side-by-side' ? handleDownloadComparison : handleDownload
            }
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 font-semibold rounded-[10px] bg-[rgba(107,114,128,0.2)] hover:bg-[rgba(107,114,128,0.4)] text-[#111827] transition-all duration-200"
          >
            <Download className="h-5 w-5" />
            <span>
              {viewMode === 'side-by-side' ? '下载对比图' : '下载'}
            </span>
          </button> */}
          {/* {onUseAsInput && (
            <button
              onClick={() => onUseAsInput(imageUrl)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 font-semibold rounded-[10px] bg-gradient-to-r from-[hsl(var(--primary))] to-[#15b7fa] text-white shadow-lg shadow-[rgba(255,150,172,0.25)] transition-all duration-200 hover:shadow-lg hover:shadow-[#7d6fdd]/30"
            >
              <span>用作输入</span>
            </button>
          )} */}
        {/* </div> */}
      </div>

      <AddMaterialModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          if (handleMaterialSuccess) handleMaterialSuccess();
          setIsAddModalOpen(false);
        }}
        initialData={{
          assetName: '换脸结果',
          assetTag: '换脸结果',
          assetDesc: '换脸结果',
          assetUrl: imageUrl,
          assetType: 6, // 图片类型
        }}
        disableAssetTypeSelection={true}
      />
    </>
  );
};

export default FaceSwapResultDisplay;
