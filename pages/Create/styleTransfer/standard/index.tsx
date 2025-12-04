import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Gem, Loader2, Upload } from 'lucide-react';
import { styleTransferService, Template } from '@/services/styleTransferService';
import { avatarService } from '@/services/avatarService';
import { useAuthStore } from '@/stores/authStore';
import { showAuthModal } from '@/lib/authModalManager';
import toast from 'react-hot-toast';
import { createTaskPoller, PollingController } from '@/utils/taskPolling';
import MaskCanvas, { MaskCanvasRef } from '@/pages/Create/components/MaskCanvas';
import UploadComponent from '@/components/UploadComponent';
import TemplateSelectModal from '@/pages/Create/components/TemplateSelectModal';
import ResultDisplay from '../components/ResultDisplay';
import { GeneratedImage, StyleTransferPageProps } from '../data';

interface UploadedImage {
  fileId?: string;
  fileName: string;
  fileUrl: string;
  file?: File;
}

export interface StandardModeRef {
  getPrompt?: () => string;
}

interface StandardModeProps {
  t: StyleTransferPageProps['t'];
  onSaveToAssets: (img: GeneratedImage) => void;
  onImageToVideo: (img: GeneratedImage) => void;
  onPreview: (img: GeneratedImage, allImages: GeneratedImage[]) => void;
}

const formatMessage = (template: string, params?: Record<string, string | number>) => {
  if (!template) return '';
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = params?.[key];
    return value !== undefined ? String(value) : '';
  });
};

const StandardMode = React.forwardRef<StandardModeRef, StandardModeProps>(({ t, onSaveToAssets, onImageToVideo, onPreview }, ref) => {
  const { isAuthenticated } = useAuthStore();
  const toasts = t.standard.toasts;
  
  // 图片上传状态
  const [productImage, setProductImage] = useState<UploadedImage | null>(null);
  const [templateImage, setTemplateImage] = useState<UploadedImage | null>(null);
  
  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  
  // 模板相关
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  // Masking
  const [brushTool, setBrushTool] = useState<'pencil' | 'eraser'>('pencil');
  const [brushSize, setBrushSize] = useState(20);
  const productMaskCanvasRef = useRef<MaskCanvasRef>(null);
  
  // Template Masking
  const [templateBrushTool, setTemplateBrushTool] = useState<'pencil' | 'eraser'>('pencil');
  const [templateBrushSize, setTemplateBrushSize] = useState(20);
  const templateMaskCanvasRef = useRef<MaskCanvasRef>(null);
  
  // Refs
  const productInputRef = useRef<HTMLInputElement>(null);
  const templateInputRef = useRef<HTMLInputElement>(null);
  const pollerRef = useRef<PollingController | null>(null);
  
  const [generatingCount] = useState(1);
  const [location] = useState<number[][]>([]);

  // 文件类型验证
  const validateFileType = (file: File): boolean => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['png', 'jpg', 'jpeg', 'webp'].includes(fileExtension)) {
      toast.error(formatMessage(toasts.unsupportedFormat, { fileName: file.name }));
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(formatMessage(toasts.sizeLimitExceeded, { fileName: file.name }));
      return false;
    }
    return true;
  };

  // 处理图片上传
  const handleImageUpload = (file: File, type: 'product' | 'template') => {
    if (!validateFileType(file)) return;
    
    const blobUrl = URL.createObjectURL(file);
    const imgData: UploadedImage = {
      fileName: file.name,
      fileUrl: blobUrl,
      file: file
    };
    if (type === 'product') {
      setProductImage(imgData);
    } else {
      setTemplateImage(imgData);
    }
  };

  // 上传图片到TopView
  const uploadImageToTopView = async (image: UploadedImage): Promise<UploadedImage> => {
    if (image.fileId) return image;
    if (!image.file) throw new Error('No file object found');

    let fileType = image.file.type.split('/')[1] || 'jpg';
    if (fileType === 'mpeg') fileType = 'mp3';
    if (fileType === 'quicktime') fileType = 'mp4';

    const credRes = await avatarService.getUploadCredential(fileType);
    if (!credRes || !credRes.result || credRes.code !== '200') {
      throw new Error(credRes?.message || 'Failed to get upload credentials');
    }

    const { uploadUrl, fileName, fileId } = credRes.result;

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      body: image.file,
      headers: { 'Content-Type': image.file.type }
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      throw new Error(`Upload failed: ${uploadRes.status} ${uploadRes.statusText}`);
    }

    return {
      ...image,
      fileId: fileId,
      fileName: fileName,
      fileUrl: image.fileUrl
    };
  };

  const stopTaskPolling = useCallback(() => {
    if (pollerRef.current) {
      pollerRef.current.stop();
      pollerRef.current = null;
    }
  }, []);

  // 轮询任务状态
  const startPolling = useCallback((taskId: string) => {
    if (!taskId) return;
    stopTaskPolling();
    
    // 确保在开始轮询时显示进度条
    setIsGenerating(true);
    
    const extractTaskResult = (res: any) => {
      if (res.result) return res.result;
      if (res.data) return res.data;
      return res;
    };

    const processResultImages = (taskResult: any): GeneratedImage[] => {
      let images: GeneratedImage[] = [];
      
      if (taskResult.anyfitImages && Array.isArray(taskResult.anyfitImages)) {
        images = taskResult.anyfitImages.map((item: any, index: number) => ({
          key: item.key || index + 1,
          url: item.url,
          previewVisible: false
        }));
      } else if (taskResult.url) {
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
        const res = await styleTransferService.queryStandard(taskId);
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
        const images = processResultImages(taskResult);
        setGeneratedImages(images);
        setTimeout(() => {
          setIsGenerating(false);
        }, 1000);
        stopTaskPolling();
      },
      onFailure: taskResult => {
        setIsGenerating(false);
        setProgress(0);
        const errorMsg = taskResult?.errorMsg || taskResult?.error || taskResult?.message || 'Generation failed';
        toast.error(errorMsg);
        stopTaskPolling();
      },
      onTimeout: () => {
        setIsGenerating(false);
        setProgress(0);
        toast.error(toasts.taskTimeout);
        stopTaskPolling();
      },
      onError: error => {
        console.error('轮询查询出错:', error);
        toast.error(toasts.queryFailed);
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

  // 提交生成任务
  const handleGenerate = async () => {
    if (!isAuthenticated) {
      showAuthModal();
      return;
    }
    
    if (isGenerating) return;
    if (!productImage) {
      toast.error(toasts.missingProductImage);
      return;
    }
    if (!templateImage && !selectedTemplate) {
      toast.error(toasts.missingTemplateImage);
      return;
    }
    
    stopTaskPolling();
    setIsGenerating(true);
    setProgress(0);

    try {
      // Parallel Uploads
      const uploadPromises = [];

      // 1. Product Image
      uploadPromises.push(uploadImageToTopView(productImage).then(res => {
        setProductImage(res);
        return res.fileId;
      }));

      // 2. Template Image
      if (templateImage && !templateImage.fileId) {
        uploadPromises.push(uploadImageToTopView(templateImage).then(res => {
          setTemplateImage(res);
          return res.fileId;
        }));
      } else {
        uploadPromises.push(Promise.resolve(templateImage?.fileId));
      }

      // Helper for Mask Upload
      const uploadMask = async (ref: React.RefObject<MaskCanvasRef>, name: string) => {
        if (ref.current) {
          const maskBlob = await ref.current.getMask();
          if (maskBlob) {
            const maskFile = new File([maskBlob], name, { type: 'image/png' });
            const credRes = await avatarService.getUploadCredential('png');
            if (credRes.code === '200' && credRes.result) {
              const { uploadUrl, fileId } = credRes.result;
              const uploadRes = await fetch(uploadUrl, {
                method: 'PUT',
                body: maskFile,
                headers: { 'Content-Type': 'image/png' }
              });
              if (uploadRes.ok) return fileId;
            }
          }
        }
        return undefined;
      };

      uploadPromises.push(uploadMask(productMaskCanvasRef, 'product_mask.png'));
      uploadPromises.push(uploadMask(templateMaskCanvasRef, 'template_mask.png'));

      const [pId, tId, pmId, tmId] = await Promise.all(uploadPromises);

      if (!pId) throw new Error('Failed to upload product image');

      const submitParams = {
        productImageFileId: pId!,
        productMaskFileId: pmId,
        templateImageFileId: tId,
        templateMaskFileId: tmId,
        templateId: selectedTemplate?.templateId,
        generatingCount,
        score: String(generatingCount),
        location: location.length > 0 ? location : undefined
      };

      const res = await styleTransferService.submitStandard(submitParams);
      
      let taskId;
      if (res.result && res.result.taskId) {
        taskId = res.result.taskId;
      } else if (res.taskId) {
        taskId = res.taskId;
      } else if (res.id) {
        taskId = res.id;
      }

      if (!taskId) throw new Error('Task ID not found in response');
      startPolling(taskId);

    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || toasts.generationFailed);
      setIsGenerating(false);
      stopTaskPolling();
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setShowTemplateModal(false);
  };

  // 试用示例
  const handleTryExample = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isAuthenticated) {
      showAuthModal();
      return;
    }
    
    try {
      const productRes = await fetch('/demo/product.webp');
      const productBlob = await productRes.blob();
      const productFile = new File([productBlob], 'demo-product.webp', { type: 'image/webp' });
      handleImageUpload(productFile, 'product');

      const templateRes = await fetch('/demo/template.png');
      const templateBlob = await templateRes.blob();
      const templateFile = new File([templateBlob], 'demo-template.png', { type: 'image/png' });
      handleImageUpload(templateFile, 'template');
    } catch (error) {
      console.error('Failed to load demo assets:', error);
      toast.error(toasts.loadExampleFailed);
    }
  };

  useEffect(() => {
    return () => {
      stopTaskPolling();
    };
  }, [stopTaskPolling]);

  const renderUploadBox = (
    image: UploadedImage | null,
    type: 'product' | 'template',
    label: string,
    inputRef?: React.RefObject<HTMLInputElement>,
    disabled?: boolean
  ) => {
    return (
      <UploadComponent
        onFileSelected={(file) => handleImageUpload(file, type)}
        onUploadComplete={() => {}}
        onError={(error) => toast.error(error.message || toasts.uploadFailed)}
        uploadType="oss"
        immediate={false}
        showConfirmButton={false}
        accept=".png,.jpg,.jpeg,.webp"
        className="h-[11rem] w-full"
        disabled={disabled}
      >
        <div className="text-center text-gray-500 p-4 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-surface shadow-sm flex items-center justify-center text-indigo-500">
            <Upload size={24} />
          </div>
          <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm whitespace-pre-line">{label}</p>
          <p className="text-[0.625rem] text-gray-400 bg-slate-100 dark:bg-surface px-2 py-1 rounded-full mt-2">
            {t.standard.support}
          </p>
        </div>
      </UploadComponent>
    );
  };

  return (
    <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden h-full">
      {/* Left Column: Upload Section */}
      <div className="w-full md:w-[22rem] lg:w-[25rem] bg-white dark:bg-gray-900 md:border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden min-h-[60vh] md:min-h-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
          {/* Product Image Section */}
          <div className="mb-5">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-2">
              {t.standard.productTitle}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line mb-4">
              {t.standard.productDesc}
            </p>
            
            {productImage ? (
              <div className="flex flex-col gap-3">
                <div className="relative border-2 border-indigo-500 rounded-xl overflow-hidden h-[16rem]">
                  <MaskCanvas
                    ref={productMaskCanvasRef}
                    imageUrl={productImage.fileUrl}
                    tool={brushTool}
                    brushSize={brushSize}
                    className="w-full h-full"
                  />
                  <button
                    onClick={() => setProductImage(null)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-70 hover:opacity-100 transition-opacity z-10"
                  >
                    <X size={14} />
                  </button>
                </div>
                
                {/* Brush Controls */}
                <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-surface/50 rounded-lg border border-slate-100 dark:border-border">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBrushTool('pencil')}
                      className={`p-2 rounded-lg transition-colors ${brushTool === 'pencil' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-surface'}`}
                      title="画笔"
                    >
                      🖌️
                    </button>
                    <button
                      onClick={() => setBrushTool('eraser')}
                      className={`p-2 rounded-lg transition-colors ${brushTool === 'eraser' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-surface'}`}
                      title="橡皮擦"
                    >
                      🧽
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-1 max-w-[120px]">
                    <span className="text-xs text-slate-400 min-w-[24px]">画笔粗细</span>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="text-xs text-slate-400 min-w-[24px]">{brushSize}</span>
                  </div>
                </div>
              </div>
            ) : (
              renderUploadBox(productImage, 'product', t.standard.uploadProduct, productInputRef, isGenerating)
            )}
            
            {!productImage && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleTryExample}
                  className="px-6 py-2 bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface transition-colors w-full"
                >
                  {t.standard.tryExample}
                </button>
              </div>
            )}
          </div>

          {/* Template Image Section */}
          <div className="mb-5">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-2">
              {t.standard.areaTitle}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {t.standard.areaDesc}
            </p>

            {(templateImage || selectedTemplate) ? (
              <div className="flex flex-col gap-3">
                <div className="relative border-2 border-indigo-500 rounded-xl overflow-hidden h-[16rem]">
                  <MaskCanvas
                    ref={templateMaskCanvasRef}
                    imageUrl={(templateImage?.fileUrl || selectedTemplate?.templateImageUrl) ?? null}
                    tool={templateBrushTool}
                    brushSize={templateBrushSize}
                    className="w-full h-full"
                  />
                  {!isGenerating && (
                    <button
                      onClick={() => {
                        setTemplateImage(null);
                        setSelectedTemplate(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-70 hover:opacity-100 transition-opacity z-20"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Template Brush Controls */}
                <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-surface/50 rounded-lg border border-slate-100 dark:border-border">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTemplateBrushTool('pencil')}
                      className={`p-2 rounded-lg transition-colors ${templateBrushTool === 'pencil' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-surface'}`}
                      title="画笔"
                    >
                      🖌️
                    </button>
                    <button
                      onClick={() => setTemplateBrushTool('eraser')}
                      className={`p-2 rounded-lg transition-colors ${templateBrushTool === 'eraser' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-surface'}`}
                      title="橡皮擦"
                    >
                      🧽
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-1 max-w-[120px]">
                    <span className="text-xs text-slate-400 min-w-[24px]">画笔粗细</span>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={templateBrushSize}
                      onChange={(e) => setTemplateBrushSize(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="text-xs text-slate-400 min-w-[24px]">{templateBrushSize}</span>
                  </div>
                </div>
              </div>
            ) : (
              renderUploadBox(templateImage, 'template', t.standard.uploadTemplate, templateInputRef, isGenerating)
            )}
          </div>
        </div>

        {/* Generate Button - Fixed at Bottom */}
        <div className="p-5 pt-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 sticky bottom-0 z-10">
        <div className="mt-4 space-y-2 mb-2">
              <button 
                onClick={() => {
                  if (!isAuthenticated) {
                    showAuthModal();
                    return;
                  }
                  setShowTemplateModal(true);
                }}
                disabled={isGenerating}
                className="w-full py-2.5 text-sm rounded-xl border border-slate-200 dark:border-border text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.standard.selectTemplate}
              </button>
              
              {selectedTemplate && (
                <div className="p-2 border border-indigo-200 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    已选择: {selectedTemplate.templateCategoryList[0]?.categoryName || selectedTemplate.templateId}
                  </p>
                </div>
              )}

              <button 
                onClick={() => {
                  if (!isAuthenticated) {
                    showAuthModal();
                    return;
                  }
                  setTemplateImage(null);
                  setSelectedTemplate(null);
                  if (templateInputRef.current) templateInputRef.current.value = '';
                }}
                disabled={isGenerating}
                className="w-full py-2.5 text-sm rounded-xl border border-slate-200 dark:border-border text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                重新上传
              </button>
            </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !productImage || (!templateImage && !selectedTemplate)}
            className="w-full py-2.5 text-sm bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transform transition-transform active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">生成中... {progress}%</span>
              </>
            ) : (
              <>
                <Gem size={16} />
                <div className="flex items-center gap-1">
                  <span className="text-sm">{t.common.generate}</span>
                  <span className="text-[0.625rem] bg-white/20 px-1.5 py-0.5 rounded-md font-medium opacity-90">消耗1积分</span>
                </div>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Column: Result Display */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 flex flex-col relative overflow-y-auto md:overflow-hidden min-h-[500px] md:min-h-0">
        <ResultDisplay
          isGenerating={isGenerating}
          progress={progress}
          generatedImages={generatedImages}
          resultTitle={t.common.resultTitle}
          resultPlaceholder={t.common.resultPlaceholder}
          onSaveToAssets={onSaveToAssets}
          onImageToVideo={onImageToVideo}
          onPreview={(img) => onPreview(img, generatedImages)}
        />
      </div>

      {/* Template Selection Modal */}
      <TemplateSelectModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelect={handleTemplateSelect}
        selectedTemplateId={selectedTemplate?.templateId}
      />
    </div>
  );
});

StandardMode.displayName = 'StandardMode';

export default StandardMode;

