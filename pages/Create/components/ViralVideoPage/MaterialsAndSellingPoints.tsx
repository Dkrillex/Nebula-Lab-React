import React, { useState, useEffect, useRef } from 'react';
import { Upload, FolderOpen, Image as ImageIcon, X, Loader, ChevronRight, ChevronLeft, PenTool, Save } from 'lucide-react';
import { UploadedImage, ProductAnalysis, ViralVideoPageProps } from './types';
import { WorkflowProgress } from './components/WorkflowProgress';

interface MaterialsAndSellingPointsProps {
  t: ViralVideoPageProps['t'];
  step: number;
  videoId?: string;
  uploadedImages: UploadedImage[];
  analysisResult: ProductAnalysis | null;
  isAnalyzing: boolean;
  isUploading: boolean;
  activeTab: 'upload' | 'link';
  linkInput: string;
  MIN_IMAGES: number;
  MAX_IMAGES: number;
  onTabChange: (tab: 'upload' | 'link') => void;
  onLinkInputChange: (value: string) => void;
  onLocalUpload: () => void;
  onSelectFromPortfolio: () => void;
  onLinkImport: () => void;
  onRemoveImage: (index: number) => void;
  onEditModalOpen: () => void;
  onAnalyzeAllImages: () => void;
  onGoToStep2: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProductNameChange?: (name: string) => void;
  onSellingPointsChange?: (points: string) => void;
  onGenerateScript?: () => void;
  onBack?: () => void;
  onHelpWrite?: () => Promise<void>;
  onStepChange: (step: number) => void; // Added onStepChange
}

export const MaterialsAndSellingPoints: React.FC<MaterialsAndSellingPointsProps> = ({
  t,
  step,
  videoId,
  uploadedImages,
  analysisResult,
  isAnalyzing,
  isUploading,
  activeTab,
  linkInput,
  MIN_IMAGES,
  MAX_IMAGES,
  onTabChange,
  onLinkInputChange,
  onLocalUpload,
  onSelectFromPortfolio,
  onLinkImport,
  onRemoveImage,
  onEditModalOpen,
  onAnalyzeAllImages,
  onGoToStep2,
  fileInputRef,
  onFileChange,
  onProductNameChange,
  onSellingPointsChange,
  onGenerateScript,
  onBack,
  onHelpWrite,
  onStepChange, // Destructure onStepChange
}) => {
  const [productName, setProductName] = useState(analysisResult?.productName || '');
  const [sellingPoints, setSellingPoints] = useState(
    analysisResult?.sellingPoints?.join(';') || ''
  );
  const [isHelpWriting, setIsHelpWriting] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // 当分析结果更新时，同步更新商品名称和卖点
  useEffect(() => {
    if (analysisResult) {
      setProductName(analysisResult.productName || '');
      setSellingPoints(analysisResult.sellingPoints?.join(';') || '');
    }
  }, [analysisResult]);

  const handleProductNameChange = (value: string) => {
    if (value.length <= 40) {
      setProductName(value);
      if (onProductNameChange) {
        onProductNameChange(value);
      }
    }
  };

  const handleSellingPointsChange = (value: string) => {
    if (value.length <= 100) {
      setSellingPoints(value);
      if (onSellingPointsChange) {
        onSellingPointsChange(value);
      }
    }
  };

  // 检查是否可以滚动
  useEffect(() => {
    const checkScroll = () => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        const canScrollR = scrollLeft + clientWidth < scrollWidth - 5;
        const canScrollL = scrollLeft > 5;
        setCanScrollRight(canScrollR);
        setCanScrollLeft(canScrollL);
      }
    };
    
    // 延迟检查，确保DOM已渲染
    const timer = setTimeout(checkScroll, 100);
    
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', checkScroll);
      // 监听窗口大小变化
      window.addEventListener('resize', checkScroll);
      return () => {
        carousel.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
        clearTimeout(timer);
      };
    }
    
    return () => clearTimeout(timer);
  }, [uploadedImages]);

  // 滚动到下一组图片
  const handleScrollRight = () => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.8;
      carouselRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // 滚动到上一组图片
  const handleScrollLeft = () => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.8;
      carouselRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleHelpWrite = async () => {
    if (isHelpWriting) return;
    
    setIsHelpWriting(true);
    try {
      if (onHelpWrite) {
        await onHelpWrite();
      } else if (analysisResult && analysisResult.sellingPoints.length > 0) {
        // 如果没有提供 onHelpWrite，使用已有的分析结果
        const points = analysisResult.sellingPoints.join(';');
        handleSellingPointsChange(points);
      }
    } catch (error) {
      console.error('帮我写失败:', error);
    } finally {
      setIsHelpWriting(false);
    }
  };

  return (
    <div className="bg-background min-h-full flex flex-col">
      {/* 工作流进度条 */}
      <WorkflowProgress 
        step={step} 
        videoId={videoId} 
        onBack={step === 1 ? onBack : undefined}
        onStepChange={onStepChange}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">商品素材与卖点</h1>
          </div>

          {/* Section 1: 商品素材 */}
          <div className="bg-surface border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">
                商品素材 ({uploadedImages.length}/{MAX_IMAGES})
              </h2>
            </div>
            
            <p className="text-sm text-muted mb-6">
              请上传4-10张有肖像权的商品上身图 图片规则;每张图生成5s视频,图片比例即视频比例
            </p>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left: Upload Area */}
              <div className="lg:w-1/3 flex-shrink-0">
                {uploadedImages.length === 0 ? (
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-background">
                    <div className="mb-4">
                      <ImageIcon size={48} className="text-muted/50 mx-auto" />
                    </div>
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={onSelectFromPortfolio}
                        className="w-full py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                      >
                        <FolderOpen size={16} />
                        从作品选择
                      </button>
                      <button 
                        onClick={onLocalUpload}
                        disabled={isUploading}
                        className="w-full py-2.5 rounded-lg border border-border bg-white dark:bg-zinc-800 text-foreground hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-50"
                      >
                        {isUploading ? (
                          <Loader className="animate-spin" size={16} />
                        ) : (
                          <Upload size={16} />
                        )}
                        从本地上传
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Product Thumbnail and Name */}
                    <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                      <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={uploadedImages[0]?.url} 
                          alt="Product" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {productName || '商品名称'}
                        </div>
                      </div>
                    </div>

                    {/* Upload Buttons */}
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={onSelectFromPortfolio}
                        className="w-full py-2 rounded-lg border border-border bg-white dark:bg-zinc-800 text-foreground hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                      >
                        <FolderOpen size={16} />
                        从作品选择
                      </button>
                      <button 
                        onClick={onLocalUpload}
                        disabled={isUploading}
                        className="w-full py-2 rounded-lg border border-border bg-white dark:bg-zinc-800 text-foreground hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-50"
                      >
                        {isUploading ? (
                          <Loader className="animate-spin" size={16} />
                        ) : (
                          <Upload size={16} />
                        )}
                        从本地上传
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Image Carousel */}
              <div className="lg:flex-1 min-w-0">
                {uploadedImages.length > 0 ? (
                  <div className="relative overflow-hidden">
                    {/* 渐变遮罩 - 左侧 */}
                    {canScrollLeft && (
                      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-surface via-surface/80 to-transparent pointer-events-none z-10" />
                    )}
                    
                    {/* 渐变遮罩 - 右侧 */}
                    {canScrollRight && (
                      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-surface via-surface/80 to-transparent pointer-events-none z-10" />
                    )}
                    
                    <div 
                      ref={carouselRef}
                      className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
                      style={{ 
                        scrollbarWidth: 'none', 
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch'
                      }}
                    >
                      <style>{`
                        [data-carousel]::-webkit-scrollbar {
                          display: none;
                        }
                      `}</style>
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="flex-shrink-0 relative group">
                          <div className="w-32 h-48 md:w-40 md:h-56 rounded-lg overflow-hidden border border-border bg-gray-100">
                            <img 
                              src={img.url} 
                              alt={`Product ${idx + 1}`} 
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <button
                            onClick={() => onRemoveImage(idx)}
                            className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <X size={14} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* 左侧滚动按钮 */}
                    {canScrollLeft && (
                      <button
                        onClick={handleScrollLeft}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white dark:hover:bg-zinc-800 transition-all z-20 border border-border/50 hover:scale-110"
                        aria-label="向左滚动"
                      >
                        <ChevronLeft size={20} className="text-foreground" />
                      </button>
                    )}
                    
                    {/* 右侧滚动按钮 */}
                    {canScrollRight && (
                      <button
                        onClick={handleScrollRight}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white dark:hover:bg-zinc-800 transition-all z-20 border border-border/50 hover:scale-110"
                        aria-label="向右滚动"
                      >
                        <ChevronRight size={20} className="text-foreground" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-border">
                    <p className="text-muted">请上传商品图片</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modify Video Ratio Button */}
            {uploadedImages.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={onEditModalOpen}
                  className="px-4 py-2 rounded-lg border border-border bg-white dark:bg-zinc-800 text-foreground hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors text-sm font-medium"
                >
                  修改视频比例
                </button>
              </div>
            )}
          </div>

          {/* Section 2: 商品详情 */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold text-foreground mb-6">商品详情</h2>

            {/* Product Name Input */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">商品名称:</label>
                <span className="text-xs text-muted">{productName.length}/40</span>
              </div>
              <input
                type="text"
                value={productName}
                onChange={(e) => handleProductNameChange(e.target.value)}
                placeholder="请输入商品名称"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                maxLength={40}
              />
            </div>

            {/* Selling Points Input */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">商品卖点:</label>
                <span className="text-xs text-muted">{sellingPoints.length}/100</span>
              </div>
              <textarea
                value={sellingPoints}
                onChange={(e) => handleSellingPointsChange(e.target.value)}
                placeholder="请输入商品卖点，多个卖点用分号(;)分隔"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm resize-none"
                rows={3}
                maxLength={100}
              />
              <div className="mt-2">
                <button
                  onClick={handleHelpWrite}
                  disabled={isHelpWriting || uploadedImages.length < MIN_IMAGES}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-white dark:bg-zinc-800 text-foreground hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isHelpWriting ? (
                    <Loader className="animate-spin" size={14} />
                  ) : (
                    <PenTool size={14} />
                  )}
                  帮我写
                </button>
              </div>
            </div>

              {/* Generate Script Button */}
            <div className="flex justify-end">
              <button
                onClick={onGenerateScript || onGoToStep2}
                disabled={!productName || !sellingPoints || uploadedImages.length < MIN_IMAGES}
                className="relative px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                  热门
                </span>
                生成脚本
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onFileChange}
        className="hidden"
      />
    </div>
  );
};
