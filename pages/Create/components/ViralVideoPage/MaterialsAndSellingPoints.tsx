import React from 'react';
import { Upload, FolderOpen, Image as ImageIcon, X, Loader, Play, ArrowRight } from 'lucide-react';
import { UploadedImage, ProductAnalysis, ViralVideoPageProps } from './types';
import { WorkflowProgress } from './components/WorkflowProgress';
import { ExampleCard } from './components/ExampleCard';

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
}) => {
  return (
    <div className="bg-background min-h-full flex flex-col pb-12">
      {/* 工作流进度条 */}
      <WorkflowProgress step={step} videoId={videoId} />

      {/* Header Title */}
      <div className="py-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">素材与卖点</h1>
      </div>

      {/* Main Content - Split Layout */}
      <div className="px-4 md:px-8 max-w-7xl mx-auto w-full mb-12">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Panel: Visual Process Flow */}
          <div className="flex-1 bg-surface border border-border rounded-xl p-6 md:p-8 flex flex-col items-center justify-center shadow-sm">
            <div className="flex items-center justify-center gap-4 md:gap-8 w-full mb-8">
              {/* Images Stack */}
              <div className="flex flex-col gap-2">
                {uploadedImages.length > 0 ? (
                  <>
                    {uploadedImages.slice(0, 2).map((img, idx) => (
                      <div 
                        key={idx}
                        className={`w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-zinc-800 rounded-lg shadow-md p-1.5 border border-border relative ${
                          idx === 0 ? 'transform -rotate-3' : 'transform rotate-3 -mt-20 ml-8 z-10'
                        }`}
                      >
                        <div className="w-full h-full rounded overflow-hidden relative group">
                          <img src={img.url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => onRemoveImage(idx)}
                            className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} className="text-white" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {uploadedImages.length > 2 && (
                      <div className="text-center text-xs text-muted mt-2">
                        +{uploadedImages.length - 2} 张
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-zinc-800 rounded-lg shadow-md p-1.5 transform -rotate-3 border border-border">
                      <div className="w-full h-full bg-gray-100 dark:bg-zinc-700 rounded overflow-hidden flex items-center justify-center">
                        <ImageIcon size={24} className="text-muted/50" />
                      </div>
                    </div>
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-zinc-800 rounded-lg shadow-md p-1.5 transform rotate-3 -mt-20 ml-8 z-10 border border-border">
                      <div className="w-full h-full bg-gray-100 dark:bg-zinc-700 rounded overflow-hidden flex items-center justify-center">
                        <ImageIcon size={24} className="text-muted/50" />
                      </div>
                    </div>
                  </>
                )}
                <div className="text-center mt-4 text-sm text-muted font-medium">{t.process.uploadImages}</div>
              </div>

              {/* Arrow */}
              <div className="text-orange-500">
                <ArrowRight size={32} strokeWidth={3} />
              </div>

              {/* Output Video */}
              <div className="flex flex-col gap-2">
                <div className="w-40 h-72 md:w-48 md:h-80 bg-white dark:bg-zinc-800 rounded-lg shadow-md p-1.5 border border-border relative group cursor-pointer">
                  <div className="w-full h-full bg-gray-900 rounded overflow-hidden relative">
                    {analysisResult && uploadedImages.length > 0 ? (
                      <>
                        <img 
                          src={uploadedImages[0].url} 
                          alt="Video Result" 
                          className="w-full h-full object-cover opacity-90" 
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/30 backdrop-blur rounded-full flex items-center justify-center pl-1">
                            <Play fill="white" className="text-white" size={20} />
                          </div>
                        </div>
                        {/* Captions simulation - 显示商品名称或第一个卖点 */}
                        {analysisResult.productName && (
                          <div className="absolute bottom-8 left-0 w-full text-center text-white text-xs font-bold shadow-black drop-shadow-md px-2">
                            {analysisResult.productName}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <img 
                          src="https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=400&auto=format&fit=crop" 
                          alt="Video Result" 
                          className="w-full h-full object-cover opacity-90" 
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/30 backdrop-blur rounded-full flex items-center justify-center pl-1">
                            <Play fill="white" className="text-white" size={20} />
                          </div>
                        </div>
                        {/* Default caption */}
                        <div className="absolute bottom-8 left-0 w-full text-center text-white text-xs font-bold shadow-black drop-shadow-md">
                          就好像穿上一双对的靴子
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-center mt-4 text-sm text-muted font-medium">
                  {isAnalyzing ? '分析中...' : analysisResult ? '分析完成' : t.process.generateVideo}
                </div>
              </div>
            </div>

            <div className="w-full max-w-sm space-y-3">
              <button 
                onClick={onGoToStep2}
                disabled={!analysisResult || uploadedImages.length === 0}
                className="w-full py-3 rounded-lg border border-border bg-background hover:bg-surface transition-colors text-foreground font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.process.makeSame}
              </button>
              <div className="flex justify-center gap-1 mt-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
              </div>
            </div>
          </div>

          {/* Right Panel: Upload Interface */}
          <div className="flex-1 bg-surface border border-border rounded-xl overflow-hidden shadow-sm flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-border">
              <button 
                onClick={() => onTabChange('upload')}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'upload' ? 'bg-white dark:bg-zinc-800 text-foreground border-t-2 border-t-primary' : 'bg-gray-50 dark:bg-zinc-900/50 text-muted hover:text-foreground'}`}
              >
                {t.tabs.upload}
              </button>
              <button 
                onClick={() => onTabChange('link')}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'link' ? 'bg-white dark:bg-zinc-800 text-foreground border-t-2 border-t-primary' : 'bg-gray-50 dark:bg-zinc-900/50 text-muted hover:text-foreground'}`}
              >
                {t.tabs.link}
              </button>
            </div>

            {/* Content */}
            <div className="p-6 md:p-10 flex-1 flex flex-col">
              {activeTab === 'upload' ? (
                <div className="flex-1 border-2 border-dashed border-border rounded-xl bg-background flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                  {uploadedImages.length > 0 ? (
                    <div className="w-full space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {uploadedImages.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img 
                              src={img.url} 
                              alt={`Upload ${idx + 1}`} 
                              className="w-full h-32 object-cover rounded-lg border border-border"
                            />
                            <button
                              onClick={() => onRemoveImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} className="text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      {/* 继续上传按钮 - 如果未达到最大数量 */}
                      {uploadedImages.length < MAX_IMAGES && (
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
                          继续上传 ({uploadedImages.length}/{MAX_IMAGES})
                        </button>
                      )}
                      
                      {/* 修改视频拟合比例按钮 */}
                      <button
                        onClick={onEditModalOpen}
                        className="w-full py-2 rounded-lg border border-border bg-white dark:bg-zinc-800 text-foreground hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                      >
                        修改图片拟合比例
                      </button>
                      
                      {/* 完成提交按钮 - 放在右侧上传区域，至少4张图片才显示 */}
                      {uploadedImages.length >= MIN_IMAGES && !analysisResult && !isAnalyzing && (
                        <button 
                          onClick={onAnalyzeAllImages}
                          disabled={isAnalyzing || uploadedImages.length < MIN_IMAGES}
                          className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
                        >
                          完成提交
                        </button>
                      )}
                      
                      {/* 分析中提示 */}
                      {isAnalyzing && (
                        <div className="w-full py-3 rounded-lg border border-border bg-white dark:bg-zinc-800 flex flex-col items-center justify-center gap-2 text-sm">
                          <Loader className="animate-spin text-indigo-600" size={16} />
                          <div>正在分析 {uploadedImages.length} 张图片...</div>
                          <div className="text-xs text-muted">AI正在综合分析所有图片</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="mb-6 p-4 rounded-full bg-surface border border-border">
                        <ImageIcon size={48} className="text-muted/50" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">{t.uploadArea.title}</h3>
                      <p className="text-xs text-muted max-w-md mb-6">{t.uploadArea.desc}</p>
                      <p className="text-[10px] text-muted/70 max-w-xs mb-8">{t.uploadArea.limitation}</p>
                      
                      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                        <button 
                          onClick={onSelectFromPortfolio}
                          className="flex-1 py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                        >
                          <FolderOpen size={16} />
                          {t.uploadArea.selectFromPortfolio}
                        </button>
                        <button 
                          onClick={onLocalUpload}
                          disabled={isUploading}
                          className="flex-1 py-2.5 rounded-lg border border-border bg-white dark:bg-zinc-800 text-foreground hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-50"
                        >
                          {isUploading ? (
                            <Loader className="animate-spin" size={16} />
                          ) : (
                            <Upload size={16} />
                          )}
                          {t.uploadArea.uploadLocal}
                        </button>
                      </div>
                    </>
                  )}
                  
                  {/* 隐藏的文件输入 - 始终存在 */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                  <div className="w-full max-w-md">
                    <input
                      type="text"
                      placeholder="https://..."
                      value={linkInput}
                      onChange={(e) => onLinkInputChange(e.target.value)}
                      className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none mb-4"
                    />
                    <button 
                      onClick={onLinkImport}
                      disabled={!linkInput || isUploading}
                      className="w-full py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Import
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Footer: Excellent Cases */}
      <div className="px-4 md:px-8 max-w-7xl mx-auto w-full">
        <h2 className="text-xl font-bold text-foreground mb-6">{t.examples}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ExampleCard image="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop" />
          <ExampleCard image="https://images.unsplash.com/photo-1529139574466-a302c27e3844?q=80&w=400&auto=format&fit=crop" />
          <ExampleCard image="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400&auto=format&fit=crop" />
          <ExampleCard image="https://images.unsplash.com/photo-1485230946086-1d99d529c750?q=80&w=400&auto=format&fit=crop" />
        </div>
      </div>
    </div>
  );
};

