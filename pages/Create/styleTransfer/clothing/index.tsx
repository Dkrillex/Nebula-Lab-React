import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Gem, Loader2, Upload } from 'lucide-react';
import { styleTransferService } from '@/services/styleTransferService';
import { uploadService } from '@/services/uploadService';
import { useAuthStore } from '@/stores/authStore';
import { showAuthModal } from '@/lib/authModalManager';
import toast from 'react-hot-toast';
import { createTaskPoller, PollingController } from '@/utils/taskPolling';
import UploadComponent from '@/components/UploadComponent';
import ResultDisplay from '../components/ResultDisplay';
import { GeneratedImage, StyleTransferPageProps } from '../data';

interface UploadedImage {
  fileId?: string;
  fileName: string;
  fileUrl: string;
  file?: File;
}

export interface ClothingModeRef {
  getPrompt?: () => string;
}

interface ClothingModeProps {
  t: StyleTransferPageProps['t'];
  onSaveToAssets: (img: GeneratedImage) => void;
  onImageToVideo: (img: GeneratedImage) => void;
  onPreview: (img: GeneratedImage, allImages: GeneratedImage[]) => void;
}

const ClothingMode = React.forwardRef<ClothingModeRef, ClothingModeProps>(({ t, onSaveToAssets, onImageToVideo, onPreview }, ref) => {
  const { isAuthenticated } = useAuthStore();
  
  const [clothingType, setClothingType] = useState<'top' | 'bottom' | 'full'>('top');
  const [garmentImages, setGarmentImages] = useState<UploadedImage[]>([]);
  const [modelImage, setModelImage] = useState<UploadedImage | null>(null);
  
  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  
  const garmentInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);
  const pollerRef = useRef<PollingController | null>(null);

  // 文件类型验证
  const validateFileType = (file: File): boolean => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['png', 'jpg', 'jpeg', 'webp'].includes(fileExtension)) {
      toast.error(`不支持的文件格式：${file.name}，请上传 PNG, JPG, JPEG, WEBP 格式的图片`);
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`文件大小超过限制：${file.name}，文件大小不能超过 10MB`);
      return false;
    }
    return true;
  };

  // 处理图片上传
  const handleImageUpload = (file: File, type: 'garment' | 'model') => {
    if (!validateFileType(file)) return;
    
    const blobUrl = URL.createObjectURL(file);
    const imgData: UploadedImage = {
      fileName: file.name,
      fileUrl: blobUrl,
      file: file
    };

    if (type === 'garment') {
      if (clothingType === 'full') {
        setGarmentImages(prev => {
          const newImages = [...prev, imgData];
          return newImages.slice(-2);
        });
      } else {
        setGarmentImages([imgData]);
      }
    } else {
      setModelImage(imgData);
    }
  };

  // 上传图片到OSS
  const uploadImageToOss = async (image: UploadedImage): Promise<UploadedImage> => {
    if (image.fileId) return image;
    if (!image.file) throw new Error('No file object found');

    try {
      const uploadRes = await uploadService.uploadFile(image.file);
      
      if (!uploadRes || !uploadRes.url) {
        throw new Error('OSS upload failed: No URL returned');
      }

      const { url, ossId, fileName } = uploadRes;

      return {
        ...image,
        fileId: ossId,
        fileUrl: url,
        fileName: fileName || image.fileName
      };
    } catch (error) {
      console.error('OSS上传失败:', error);
      throw error;
    }
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
    
    const extractTaskResult = (res: any) => {
      if (res.result) return res.result;
      if (res.data) return res.data;
      return res;
    };

    const processResultImages = (taskResult: any): GeneratedImage[] => {
      let images: GeneratedImage[] = [];
      
      if (taskResult.image_urls && Array.isArray(taskResult.image_urls)) {
        images = taskResult.image_urls.map((url: string, index: number) => ({
          key: index + 1,
          url: url,
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
        const res = await styleTransferService.queryClothing(taskId);
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

  // 提交生成任务
  const handleGenerate = async () => {
    if (!isAuthenticated) {
      showAuthModal();
      return;
    }
    
    if (isGenerating) return;
    if (garmentImages.length === 0) {
      toast.error('请上传服装图片');
      return;
    }
    if (!modelImage) {
      toast.error('请上传模特图片');
      return;
    }
    if (clothingType === 'full' && garmentImages.length < 2) {
      toast.error('全身模式需要上传两张图片（上衣和下衣）');
      return;
    }
    if (clothingType !== 'full' && garmentImages.length !== 1) {
      toast.error(`${clothingType === 'top' ? '上衣' : '下衣'}模式只能上传一张图片`);
      return;
    }
    
    stopTaskPolling();
    setIsGenerating(true);
    setProgress(0);
    setGeneratedImages([]);

    try {
      // Uploads
      const uploadedGarments = await Promise.all(garmentImages.map(img => uploadImageToOss(img)));
      const uploadedModel = await uploadImageToOss(modelImage);
      
      setGarmentImages(uploadedGarments);
      setModelImage(uploadedModel);

      const garmentsForRequest = uploadedGarments.map((img, index) => {
        if (clothingType === 'full') {
          return { type: index === 0 ? 'upper' : 'bottom', url: img.fileUrl };
        } else {
          const apiClothingType = clothingType === 'top' ? 'upper' : clothingType;
          return { type: apiClothingType, url: img.fileUrl };
        }
      });

      const hasUpperType = garmentsForRequest.some(item => item.type === 'upper' || item.type === 'full');
      const hasBottomType = garmentsForRequest.some(item => item.type === 'bottom' || item.type === 'full');

      const submitData = {
        score: '1', 
        volcDressingV2Bo: {
          garment: { data: garmentsForRequest },
          model: { id: '1', url: uploadedModel.fileUrl },
          req_key: 'dressing_diffusionV2',
          inference_config: {
            do_sr: false, seed: -1, keep_head: true, keep_hand: false, keep_foot: false, num_steps: 16,
            keep_upper: !hasUpperType,
            keep_lower: !hasBottomType,
            tight_mask: 'loose', p_bbox_iou_ratio: 0.3, p_bbox_expand_ratio: 1.1, max_process_side_length: 1920,
          }
        }
      };

      const res = await styleTransferService.submitClothing(submitData);
      let taskId;
      if (res.data && res.data.task_id) taskId = res.data.task_id;
      else if (res.data && res.data.taskId) taskId = res.data.taskId;
      else if (res.data && res.data.id) taskId = res.data.id;

      if (!taskId) throw new Error('Task ID not found in response');
      startPolling(taskId);

    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Generation failed');
      setIsGenerating(false);
      stopTaskPolling();
    }
  };

  useEffect(() => {
    return () => {
      stopTaskPolling();
    };
  }, [stopTaskPolling]);

  const renderRadio = (value: 'top' | 'bottom' | 'full', label: string) => (
    <label className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-lg border transition-all ${
      clothingType === value 
        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
        : 'border-slate-200 dark:border-border bg-white dark:bg-surface hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10'
    }`}>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
        clothingType === value ? 'border-indigo-600' : 'border-slate-300'
      }`}>
        {clothingType === value && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>}
      </div>
      <input 
        type="radio" 
        className="hidden" 
        checked={clothingType === value} 
        onChange={() => {
          setClothingType(value);
          setGarmentImages([]);
        }} 
      />
      <span className={`text-sm font-medium ${
        clothingType === value ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'
      }`}>{label}</span>
    </label>
  );

  const renderUploadBox = (
    image: UploadedImage | null,
    type: 'garment' | 'model',
    label: string,
    inputRef?: React.RefObject<HTMLInputElement>
  ) => {
    return (
      <UploadComponent
        onFileSelected={(file) => handleImageUpload(file, type)}
        onUploadComplete={() => {}}
        onError={(error) => toast.error(error.message)}
        uploadType="oss"
        immediate={false}
        showConfirmButton={false}
        accept=".png,.jpg,.jpeg,.webp"
        className="h-full min-h-[200px] w-full"
      >
        <div className="text-center text-gray-500 p-4 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-surface shadow-sm flex items-center justify-center text-indigo-500">
            <Upload size={24} />
          </div>
          <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm whitespace-pre-line">{label}</p>
          <p className="text-[10px] text-gray-400 bg-slate-100 dark:bg-surface px-2 py-1 rounded-full mt-2">
            {t.standard.support}
          </p>
        </div>
      </UploadComponent>
    );
  };

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Left Column: Upload Section */}
      <div className="w-full md:w-[400px] lg:w-[450px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {/* Clothing Type Selection */}
          <div className="mb-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-2">
              {t.clothing.garmentTitle}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line mb-4">
              {t.clothing.garmentDesc}
            </p>

            {/* Garment Images */}
            {clothingType === 'full' ? (
              <div className="grid grid-cols-2 gap-3">
                {/* 上衣上传框 */}
                <div className="relative w-full aspect-square">
                  {garmentImages[0] ? (
                    <div className="relative w-full h-full border-2 border-indigo-500 rounded-xl overflow-hidden">
                      <img 
                        src={garmentImages[0].fileUrl} 
                        alt="上衣" 
                        className="w-full h-full object-contain" 
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-1 left-1 bg-indigo-500 text-white text-xs px-2 py-0.5 rounded">
                        上衣
                      </div>
                      <button
                        onClick={() => {
                          setGarmentImages(prev => prev.filter((_, i) => i !== 0));
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-70 hover:opacity-100 transition-opacity z-10"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <UploadComponent
                      onFileSelected={(file) => handleImageUpload(file, 'garment')}
                      onUploadComplete={() => {}}
                      onError={(error) => toast.error(error.message)}
                      accept=".png,.jpg,.jpeg,.webp"
                      maxSize={10}
                      immediate={false}
                      showPreview={false}
                      showConfirmButton={false}
                      uploadType="oss"
                      className="relative w-full h-full border-2 border-dashed border-indigo-300 rounded-xl overflow-hidden cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors bg-white dark:bg-surface"
                    >
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                          <Upload size={24} className="text-indigo-500" />
                        </div>
                        <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">上传上衣</p>
                        <p className="text-[10px] text-gray-400 bg-slate-100 dark:bg-surface px-2 py-1 rounded-full">
                          {t.standard.support}
                        </p>
                      </div>
                    </UploadComponent>
                  )}
                </div>
                
                {/* 下衣上传框 */}
                <div className="relative w-full aspect-square">
                  {garmentImages[1] ? (
                    <div className="relative w-full h-full border-2 border-indigo-500 rounded-xl overflow-hidden">
                      <img 
                        src={garmentImages[1].fileUrl} 
                        alt="下衣" 
                        className="w-full h-full object-contain" 
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-1 left-1 bg-indigo-500 text-white text-xs px-2 py-0.5 rounded">
                        下衣
                      </div>
                      <button
                        onClick={() => {
                          setGarmentImages(prev => prev.filter((_, i) => i !== 1));
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-70 hover:opacity-100 transition-opacity z-10"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <UploadComponent
                      onFileSelected={(file) => handleImageUpload(file, 'garment')}
                      onUploadComplete={() => {}}
                      onError={(error) => toast.error(error.message)}
                      accept=".png,.jpg,.jpeg,.webp"
                      maxSize={10}
                      immediate={false}
                      showPreview={false}
                      showConfirmButton={false}
                      uploadType="oss"
                      className="relative w-full h-full border-2 border-dashed border-indigo-300 rounded-xl overflow-hidden cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors bg-white dark:bg-surface"
                    >
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                          <Upload size={24} className="text-indigo-500" />
                        </div>
                        <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">上传下衣</p>
                        <p className="text-[10px] text-gray-400 bg-slate-100 dark:bg-surface px-2 py-1 rounded-full">
                          {t.standard.support}
                        </p>
                      </div>
                    </UploadComponent>
                  )}
                </div>
              </div>
            ) : (
              garmentImages.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <div className="relative w-full h-full border-2 border-indigo-500 rounded-xl overflow-hidden min-h-[300px]">
                    <img 
                      src={garmentImages[0].fileUrl} 
                      alt="Garment" 
                      className="w-full h-full object-contain" 
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={() => setGarmentImages([])}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-70 hover:opacity-100 transition-opacity z-10"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div 
                    className="relative w-full border-2 border-dashed border-indigo-300 rounded-xl overflow-hidden cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors min-h-[100px]"
                    onClick={() => garmentInputRef.current?.click()}
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
                      <Upload size={20} className="text-indigo-400" />
                      <p className="text-xs text-indigo-500 font-medium">重新上传</p>
                    </div>
                    <input
                      ref={garmentInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file, 'garment');
                        }
                        if (e.target) e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </div>
                </div>
              ) : (
                renderUploadBox(null, 'garment', t.clothing.uploadGarment, garmentInputRef)
              )
            )}
          </div>

          <div className="bg-slate-50 dark:bg-surface/50 rounded-lg p-3 border border-slate-200 dark:border-border mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">选择服装类型</label>
            <div className="flex gap-3">
            {renderRadio('top', t.clothing.types.top)}
            {renderRadio('bottom', t.clothing.types.bottom)}
            {renderRadio('full', t.clothing.types.full)}
            </div>
            {clothingType === 'full' && (
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">
                全身模式需要上传两张图片：第一张为上衣，第二张为下衣
            </p>
            )}
        </div>

          {/* Model Image Section */}
          <div className="mb-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-2">
              {t.clothing.modelTitle}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              上传模特图片，AI将自动替换模特身上的服装<br/>
              支持格式: jpg/jpeg/png/webp<br/>
              图片大小: 小于10MB
            </p>

            {modelImage ? (
              <div className="relative w-full h-full border-2 border-indigo-500 rounded-xl overflow-hidden min-h-[300px]">
                <img 
                  src={modelImage.fileUrl} 
                  alt="Model" 
                  className="w-full h-full object-contain" 
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setModelImage(null)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-70 hover:opacity-100 transition-opacity z-10"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              renderUploadBox(modelImage, 'model', t.clothing.uploadModel, modelInputRef)
            )}
          </div>

          {/* Generate Button */}
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || garmentImages.length === 0 || !modelImage || (clothingType === 'full' && garmentImages.length < 2)}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transform transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Right Column: Result Display */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 flex flex-col relative overflow-hidden">
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
    </div>
  );
});

ClothingMode.displayName = 'ClothingMode';

export default ClothingMode;

