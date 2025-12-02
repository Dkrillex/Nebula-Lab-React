import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gem, Palette, Loader2, Download, FolderPlus, Video, Eye } from 'lucide-react';
import ImagePreviewModal, { ImagePreviewAction } from '@/components/ImagePreviewModal';
import { styleTransferService } from '@/services/styleTransferService';
import AddMaterialModal from '@/components/AddMaterialModal';
import { useVideoGenerationStore } from '@/stores/videoGenerationStore';
import { useAuthStore } from '@/stores/authStore';
import { showAuthModal } from '@/lib/authModalManager';
import toast from 'react-hot-toast';
import { createTaskPoller, PollingController } from '@/utils/taskPolling';
import { 
  StyleTransferPageProps, 
  GeneratedImage, 
  ModeType,
  getModes 
} from './data';
import StandardMode, { StandardModeRef } from './standard';
import CreativeMode, { CreativeModeRef } from './creative';
import ClothingMode, { ClothingModeRef } from './clothing';

const StyleTransferPage: React.FC<StyleTransferPageProps> = ({ t }) => {
  const navigate = useNavigate();
  const { setData } = useVideoGenerationStore();
  const { isAuthenticated } = useAuthStore();
  const [selectedMode, setSelectedMode] = useState<ModeType>('standard');
  
  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  
  // Refs for mode components
  const standardModeRef = useRef<StandardModeRef>(null);
  const creativeModeRef = useRef<CreativeModeRef>(null);
  const clothingModeRef = useRef<ClothingModeRef>(null);
  const pollerRef = useRef<PollingController | null>(null);

  // AddMaterialModal State
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [addMaterialData, setAddMaterialData] = useState<any>(null);

  // 图片预览状态
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const modes = getModes(t);

  const stopTaskPolling = useCallback(() => {
    if (pollerRef.current) {
      pollerRef.current.stop();
      pollerRef.current = null;
    }
  }, []);

  // 轮询任务状态
  const startPolling = useCallback((taskId: string, mode: ModeType) => {
    if (!taskId) return;
    stopTaskPolling();
    
    console.log('开始轮询任务:', taskId, '模式:', mode);
    
    const extractTaskResult = (res: any) => {
      if (res.result) {
        return res.result;
      } else if (res.data) {
        return res.data;
      }
      return res;
    };

    const processResultImages = (taskResult: any): GeneratedImage[] => {
      let images: GeneratedImage[] = [];
      
      if (taskResult.anyfitImages && Array.isArray(taskResult.anyfitImages)) {
        // 标准模式返回格式
        images = taskResult.anyfitImages.map((item: any, index: number) => ({
          key: item.key || index + 1,
          url: item.url,
          previewVisible: false
        }));
      } else if (taskResult.image_urls && Array.isArray(taskResult.image_urls)) {
        // 服装模式返回格式: image_urls
        images = taskResult.image_urls.map((url: string, index: number) => ({
          key: index + 1,
          url: url,
          previewVisible: false
        }));
      } else if (taskResult.resultImages && Array.isArray(taskResult.resultImages)) {
        images = taskResult.resultImages.map((url: string, index: number) => ({
          key: index + 1,
          url: url,
          previewVisible: false
        }));
      } else if (taskResult.data && Array.isArray(taskResult.data)) {
        // 创意模式可能返回 data 数组
        images = taskResult.data.map((item: any, index: number) => ({
          key: index + 1,
          url: item.url || item.image_url || '',
          revised_prompt: item.revised_prompt,
          previewVisible: false
        })).filter(img => img.url);
      } else if (taskResult.url) {
        // 单个图片URL
        images = [{
          key: 1,
          url: taskResult.url,
          previewVisible: false
        }];
      }
      
      return images;
    };

    const poller = createTaskPoller<any>({
      request: async () => {
        let res;
        if (mode === 'standard') {
          res = await styleTransferService.queryStandard(taskId);
        } else if (mode === 'creative') {
          res = await styleTransferService.queryCreative(taskId);
        } else {
          res = await styleTransferService.queryClothing(taskId);
        }
        console.log('轮询查询结果:', res);
        return extractTaskResult(res);
      },
      parseStatus: data => data?.status,
      isSuccess: status => {
        if (!status) return false;
        return ['success', 'succeeded', 'done'].includes(status.toLowerCase());
      },
      isFailure: status => {
        if (!status) return false;
        return ['fail', 'failed', 'error'].includes(status.toLowerCase());
      },
      isPending: status => {
        if (!status) return false;
        return ['running', 'init', 'in_queue', 'generating'].includes(status.toLowerCase());
      },
      onProgress: value => setProgress(value),
      onSuccess: taskResult => {
        setProgress(100);
        console.log('任务完成,处理结果...');
        
        const images = processResultImages(taskResult);
        console.log('生成的图片:', images);
        setGeneratedImages(images);
        
        // 延迟重置生成状态,让用户看到 100% 进度
        setTimeout(() => {
          setIsGenerating(false);
        }, 1000);
        
        stopTaskPolling();
      },
      onFailure: taskResult => {
        setIsGenerating(false);
        setProgress(0);
        const errorMsg = taskResult?.errorMsg || taskResult?.error || taskResult?.message || 'Generation failed';
        console.error('任务失败:', errorMsg);
        toast.error(errorMsg);
        stopTaskPolling();
      },
      onTimeout: () => {
        setIsGenerating(false);
        setProgress(0);
        toast.error('任务超时');
        stopTaskPolling();
      },
      onError: error => {
        console.error('轮询查询出错:', error);
        toast.error('查询失败');
        setIsGenerating(false);
        stopTaskPolling();
      },
      intervalMs: 10_000,
      progressMode: 'fast',
      continueOnError: () => false,
    });

    pollerRef.current = poller;
    poller.start();
  }, [stopTaskPolling]);

  // 处理模式组件的生成请求
  const handleModeGenerate = useCallback((taskIdOrImages: string | GeneratedImage[], mode: ModeType) => {
    if (typeof taskIdOrImages === 'string') {
      // 需要轮询的任务ID
      stopTaskPolling();
      setIsGenerating(true);
      setProgress(0);
      setGeneratedImages([]);
      startPolling(taskIdOrImages, mode);
    } else {
      // 直接返回的图片数组（创意模式可能直接返回）
      stopTaskPolling();
      setGeneratedImages(taskIdOrImages);
      setProgress(100);
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
      }, 1000);
    }
  }, [startPolling, stopTaskPolling]);

  // 处理模式组件的错误
  const handleModeError = useCallback((error: Error) => {
    console.error('Generation error:', error);
    toast.error(error.message || 'Generation failed');
            setIsGenerating(false);
            stopTaskPolling();
  }, [stopTaskPolling]);

  // 提交生成任务（由生成按钮触发）
  const handleGenerate = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isAuthenticated) {
      showAuthModal();
      return;
    }
    
    if (isGenerating) return;

    // 根据模式调用对应的组件方法
    try {
      if (selectedMode === 'standard') {
        if (!standardModeRef.current?.canGenerate()) {
          return;
        }
        await standardModeRef.current.handleGenerate();
      } else if (selectedMode === 'creative') {
        if (!creativeModeRef.current?.canGenerate()) {
          return;
        }
        await creativeModeRef.current.handleGenerate();
      } else if (selectedMode === 'clothing') {
        if (!clothingModeRef.current?.canGenerate()) {
          return;
        }
        await clothingModeRef.current.handleGenerate();
      }
    } catch (error: any) {
      handleModeError(error);
    }
  };

  // 检查是否可以生成
  const canGenerate = () => {
    if (selectedMode === 'standard') {
      return standardModeRef.current?.canGenerate() ?? false;
    } else if (selectedMode === 'creative') {
      return creativeModeRef.current?.canGenerate() ?? false;
    } else if (selectedMode === 'clothing') {
      return clothingModeRef.current?.canGenerate() ?? false;
    }
    return false;
  };

  useEffect(() => {
    return () => {
      stopTaskPolling();
    };
  }, [stopTaskPolling]);

  const handleSaveToAssets = (img: GeneratedImage) => {
    let assetType = 6; // 万物迁移
    
    // Generate mode label
    const modeLabels = {
      'standard': '标准模式',
      'creative': '创意模式',
      'clothing': '服饰模式'
    };
    const modeLabel = modeLabels[selectedMode];
    const materialName = `万物迁移-${modeLabel}`;
    
    setAddMaterialData({
      assetName: materialName,
      assetUrl: img.url,
      assetType: 6,
      assetTag: materialName,
      assetDesc: materialName,
      assetId: String(img.key).includes('_') ? undefined : String(img.key)
    });
    setShowAddMaterialModal(true);
  };

  // 图生视频跳转
  const handleImageToVideo = (img: GeneratedImage) => {
    const prompt = selectedMode === 'creative' ? creativeModeRef.current?.getPrompt() || '' : '';
    const transferId = `transfer_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    setData(transferId, {
      images: [img.url],
      sourcePrompt: prompt,
      timestamp: Date.now(),
      source: 'styleTransfer'
    });
    navigate(`/create/imgToVideo?transferId=${transferId}`);
  };

  // 图片预览
  const handlePreview = (img: GeneratedImage) => {
    const index = generatedImages.findIndex(i => i.key === img.key);
    setPreviewIndex(index >= 0 ? index : 0);
    setPreviewVisible(true);
  };

  // 预览操作按钮配置
  const previewActions: ImagePreviewAction[] = [
    {
      key: 'saveToAssets',
      icon: <FolderPlus size={18} />,
      label: '添加素材',
      onClick: (image) => {
        const img = generatedImages.find(i => i.url === image.url);
        if (img) {
          handleSaveToAssets(img);
          setPreviewVisible(false);
        }
      },
    },
    {
      key: 'imageToVideo',
      icon: <Video size={18} />,
      label: '图生视频',
      onClick: (image) => {
        const img = generatedImages.find(i => i.url === image.url);
        if (img) {
          handleImageToVideo(img);
        }
      },
      className: "flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium",
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white dark:bg-gray-900">
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Leftmost Column - Vertical Mode Selector */}
        <div className="w-20 md:w-24 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-visible flex-shrink-0">
          <div className="p-2 flex flex-col gap-2">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`relative flex flex-col items-center justify-center gap-1.5 px-2 py-4 rounded-lg transition-all ${
                  selectedMode === mode.id 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={`${mode.title}: ${mode.desc}`}
              >
                {selectedMode === mode.id && (
                  <div className="absolute -left-2 top-0 bottom-0 w-1 bg-indigo-300 dark:bg-indigo-400 rounded-r-full"></div>
                )}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                   selectedMode === mode.id ? 'bg-white/20 text-white' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                }`}>
                   <mode.icon size={20} className={selectedMode === mode.id && mode.id === 'creative' ? 'text-yellow-200' : ''} />
                </div>
                <div className={`text-[11px] font-medium text-center leading-tight ${selectedMode === mode.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                   {mode.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Middle Panel - Mode Components */}
        <div className="w-full md:w-[400px] lg:w-[450px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {selectedMode === 'standard' && (
              <StandardMode
                ref={standardModeRef}
                t={t}
                isGenerating={isGenerating}
                onGenerate={(taskId) => handleModeGenerate(taskId, 'standard')}
                onError={handleModeError}
              />
            )}
            {selectedMode === 'creative' && (
              <CreativeMode
                ref={creativeModeRef}
                t={t}
                isGenerating={isGenerating}
                onGenerate={(taskIdOrImages) => handleModeGenerate(taskIdOrImages, 'creative')}
                onError={handleModeError}
              />
            )}
              {selectedMode === 'clothing' && (
              <ClothingMode
                ref={clothingModeRef}
                t={t}
                isGenerating={isGenerating}
                onGenerate={(taskId) => handleModeGenerate(taskId, 'clothing')}
                onError={handleModeError}
              />
                      )}
                    </div>

          {/* Fixed Bottom Actions - Generate Button */}
          <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <button 
              onClick={(e) => handleGenerate(e)}
              disabled={isGenerating || !canGenerate()}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transform transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  生成中... {progress}%
                </>
              ) : (
                <>
                  <Gem size={18} />
                  <div className="flex items-center gap-1">
                    <span>{t.common.generate}</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md font-medium opacity-90">消耗1积分</span>
                  </div>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 flex flex-col relative overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Palette className="w-5 h-5" /> {t.common.resultTitle}
            </h2>
          </div>
          
          {/* Result Display Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
           {isGenerating ? (
             <div className="flex-1 flex flex-col items-center justify-center">
               <div className="flex flex-col items-center gap-4">
                 <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                 <p className="text-indigo-600 dark:text-indigo-400 font-medium">AI正在生成中... {progress}%</p>
               </div>
             </div>
           ) : generatedImages.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {generatedImages.map((img) => (
                   <div key={img.key} className="relative group border-2 border-slate-200 dark:border-border rounded-xl overflow-hidden">
                     <img 
                       src={img.url} 
                       alt="Generated" 
                       className="w-full h-auto object-contain" 
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
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                       <a
                         href={img.url}
                         download
                         target="_blank"
                         rel="noopener noreferrer"
                         className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors"
                         title="下载"
                       >
                         <Download size={20} />
                       </a>
                       <button
                         onClick={() => handleSaveToAssets(img)}
                         className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors"
                         title="添加素材"
                       >
                         <FolderPlus size={20} />
                       </button>
                       <button
                         onClick={() => handleImageToVideo(img)}
                         className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors"
                         title="图生视频"
                       >
                         <Video size={20} />
                       </button>
                       <button
                         onClick={() => handlePreview(img)}
                         className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors"
                         title="预览"
                       >
                         <Eye size={20} />
                       </button>
                     </div>
                   </div>
                 ))}
             </div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center">
               <div className="flex flex-col items-center text-slate-400">
                 <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                   <Palette size={40} className="opacity-50 text-slate-400 dark:text-slate-500" />
                 </div>
                 <p className="text-sm max-w-xs text-center text-slate-500 dark:text-slate-400">{t.common.resultPlaceholder}</p>
               </div>
             </div>
           )}
          </div>
        </div>
      </div>

      {/* Add Material Modal */}
      <AddMaterialModal
        isOpen={showAddMaterialModal}
        onClose={() => setShowAddMaterialModal(false)}
        onSuccess={() => setShowAddMaterialModal(false)}
        initialData={addMaterialData}
        disableAssetTypeSelection={true}
        isImportMode={true}
      />

      {/* 图片预览弹窗 */}
      <ImagePreviewModal
        visible={previewVisible}
        images={generatedImages.map(img => ({ key: img.key, url: img.url }))}
        initialIndex={previewIndex}
        onClose={() => setPreviewVisible(false)}
        actions={previewActions}
        downloadPrefix="style_transfer"
      />
    </div>
  );
};

export default StyleTransferPage;
