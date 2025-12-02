import React from 'react';
import { Upload, FolderOpen, Image as ImageIcon, X, Loader, Play, ArrowRight } from 'lucide-react';
import { UploadedImage } from './types';
import { ExampleCard } from './components/ExampleCard';
import { RecentTasks } from './components/RecentTasks';
import { ViralVideoPageProps } from './types';

interface HomePageProps {
  t: ViralVideoPageProps['t'];
  uploadedImages: UploadedImage[];
  analysisResult: any;
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
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStartMaking: () => void;
  onStartTemplate: () => void;
  onTaskClick: (projectId: string | number) => void;
  onShowAllTasks: () => void;
}

// 示例图片数据
const SAMPLE_IMAGES = [
  'https://lab-oss.ai-nebula.com/nebula-lab/2025/11/28/9ee5707ca2a547e9a180969f001bcf73.png',
  'https://lab-oss.ai-nebula.com/nebula-lab/2025/11/28/0c94104a202a4859aff2565addf4dea2.png',
  'https://lab-oss.ai-nebula.com/nebula-lab/2025/11/28/7f00b2d43a2746fb85f8566a3624fa9a.png',
  'https://lab-oss.ai-nebula.com/nebula-lab/2025/11/28/646472b066114711a2b787d4101e2345.png',
];

export const HomePage: React.FC<HomePageProps> = ({
  t,
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
  fileInputRef,
  onFileChange,
  onStartMaking,
  onStartTemplate,
  onTaskClick,
  onShowAllTasks,
}) => {
  return (
    <div className="bg-background min-h-full flex flex-col pb-12">
      {/* Header Title */}
      <div className="py-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t.title}</h1>
      </div>

      {/* Main Content - Split Layout */}
      <div className="px-4 md:px-8 max-w-7xl mx-auto w-full mb-12">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Sidebar: 最近任务 */}
          <div className="w-40 flex-shrink-0">
            <div className="bg-surface border border-border rounded-lg p-2 shadow-sm">
              <RecentTasks onTaskClick={onTaskClick} onShowAllTasks={onShowAllTasks} />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col lg:flex-row gap-6">
          
          {/* Left Panel: 一键做同款 */}
          <div className="flex-1 bg-surface border border-border rounded-xl p-6 md:p-8 flex flex-col shadow-sm">
            <div className="flex items-center gap-4 md:gap-6 w-full mb-6">
              {/* 左边：四张示例图片 */}
              <div className="flex-1 grid grid-cols-2 gap-2 md:gap-3">
                {SAMPLE_IMAGES.map((image, index) => (
                  <div 
                    key={index}
                    className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-border"
                  >
                    <img 
                      src={image} 
                      alt={`示例${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ))}
              </div>

              {/* 右边：视频 */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-[200px] md:max-w-[240px] aspect-[9/16] bg-white dark:bg-zinc-800 rounded-lg shadow-md p-1.5 border border-border relative group cursor-pointer">
                  <div className="w-full h-full bg-gray-900 rounded overflow-hidden relative">
                    <img 
                      src="https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=400&auto=format&fit=crop" 
                      alt="示例视频" 
                      className="w-full h-full object-cover opacity-90" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/30 backdrop-blur rounded-full flex items-center justify-center pl-1">
                        <Play fill="white" className="text-white" size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 一键做同款按钮 */}
            <div className="w-full">
              <button 
                onClick={onStartTemplate}
                className="w-full py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium shadow-sm"
              >
                一键做同款
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
            {/* Content */}
            <div className="p-6 md:p-10 flex-1 flex flex-col">
              <div className="flex-1 border-2 border-dashed border-border rounded-xl bg-background flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                  {uploadedImages.length > 0 ? (
                    <div className="w-full space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {uploadedImages.map((img, idx) => (
                          <div key={`${idx}-${img.url}`} className="relative group aspect-square overflow-hidden rounded-lg border border-border bg-gray-100 dark:bg-zinc-800">
                            <img 
                              key={`img-${idx}-${img.url}`}
                              src={img.url} 
                              alt={`Upload ${idx + 1}`} 
                              className="w-full h-full object-contain"
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
                      <button
                        onClick={onEditModalOpen}
                        className="w-full py-2 rounded-lg border border-border bg-white dark:bg-zinc-800 text-foreground hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                      >
                        修改图片拟合比例
                      </button>
                      {uploadedImages.length >= MIN_IMAGES && !analysisResult && (
                        <button 
                          onClick={onAnalyzeAllImages}
                          disabled={isAnalyzing}
                          className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isAnalyzing ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader className="animate-spin" size={16} />
                              AI正在综合分析所有图片...
                            </div>
                          ) : (
                            '完成提交'
                          )}
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Initial upload UI */}
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
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onFileChange}
                    className="hidden"
                  />
                </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Footer: 优秀案例 */}
      <div className="px-4 md:px-8 max-w-7xl mx-auto w-full">
        <h2 className="text-xl font-bold text-foreground mb-6">{t.examples}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <ExampleCard image="https://lab-oss.ai-nebula.com/template/02176017944046161ee2447fb8673108fd2fdb6d547618f70a45a_0.jpeg" />
          <ExampleCard image="https://lab-oss.ai-nebula.com/template/%E6%88%AA%E5%B1%8F2025-10-22%2015.58.00.png" />
          <ExampleCard image="https://lab-oss.ai-nebula.com/template/%E6%88%AA%E5%B1%8F2025-10-22%2016.07.28.png" />
          <ExampleCard image="https://lab-oss.ai-nebula.com/template/%E6%88%AA%E5%B1%8F2025-10-22%2016.12.00.png" />
          <ExampleCard image="https://lab-oss.ai-nebula.com/template/0217611211393692e69aac892d0563f4efbf7c1eafe43913384f7_0.jpeg" />
          <ExampleCard image="https://lab-oss.ai-nebula.com/template/0217611217671903604af2171ff3afef2a58b8f6d52508ae3ae7b_0.jpeg" />
          <ExampleCard image="https://lab-oss.ai-nebula.com/2025/10/30/25c78becf76547eeae78e420c220a750.jpeg" />
        </div>
      </div>
    </div>
  );
};

