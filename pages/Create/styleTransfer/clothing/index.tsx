import React, { useState, useRef, useImperativeHandle, useCallback } from 'react';
import { X, Upload } from 'lucide-react';
import UploadComponent from '@/components/UploadComponent';
import { styleTransferService } from '@/services/styleTransferService';
import { useAuthStore } from '@/stores/authStore';
import { showAuthModal } from '@/lib/authModalManager';
import toast from 'react-hot-toast';
import { 
  UploadedImage, 
  StyleTransferPageProps, 
  ClothingType,
  validateFileType, 
  uploadImageToOss 
} from '../data';

export interface ClothingModeRef {
  handleGenerate: () => Promise<void>;
  canGenerate: () => boolean;
}

interface ClothingModeProps {
  t: StyleTransferPageProps['t'];
  isGenerating: boolean;
  onGenerate: (taskId: string) => void;
  onError: (error: Error) => void;
}

const ClothingMode = React.forwardRef<ClothingModeRef, ClothingModeProps>(({ t, isGenerating, onGenerate, onError }, ref) => {
  const { isAuthenticated } = useAuthStore();
  
  // 状态管理
  const [garmentImages, setGarmentImages] = useState<UploadedImage[]>([]);
  const [modelImage, setModelImage] = useState<UploadedImage | null>(null);
  const [clothingType, setClothingType] = useState<ClothingType>('top');
  
  // Refs
  const garmentInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);

  // 处理图片上传
  const handleImageUpload = (file: File, type: 'garment' | 'model') => {
    if (!validateFileType(file, type)) {
      return;
    }
    
    const blobUrl = URL.createObjectURL(file);
    const imgData: UploadedImage = {
      fileName: file.name,
      fileUrl: blobUrl,
      file: file
    };

    if (type === 'garment') {
      // 服装模式：full 模式支持最多2张，其他模式只支持1张
      if (clothingType === 'full') {
        // 全身模式：追加图片，最多2张
        setGarmentImages(prev => {
          const newImages = [...prev, imgData];
          // 保持最多2张，移除最早的
          return newImages.slice(-2);
        });
      } else {
        // 上衣/下衣模式：只保留一张
        setGarmentImages([imgData]);
      }
    } else if (type === 'model') {
      setModelImage(imgData);
    }
  };

  // 生成任务
  const handleGenerate = useCallback(async () => {
    if (!isAuthenticated) {
      showAuthModal();
      return;
    }
    
    if (isGenerating) return;

    // 验证
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
      onGenerate(taskId);
    } catch (error: any) {
      console.error('Generation error:', error);
      onError(error);
    }
  }, [garmentImages, modelImage, clothingType, isGenerating, isAuthenticated, onGenerate, onError]);

  // Expose ref methods
  useImperativeHandle(ref, () => ({
    handleGenerate,
    canGenerate: () => {
      if (garmentImages.length === 0) return false;
      if (!modelImage) return false;
      if (clothingType === 'full' && garmentImages.length < 2) return false;
      if (clothingType !== 'full' && garmentImages.length !== 1) return false;
      return true;
    }
  }), [handleGenerate, garmentImages, modelImage, clothingType]);

  const renderRadio = (value: ClothingType, label: string) => (
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
          // 切换类型时清空已上传的图片
          setGarmentImages([]);
        }} 
      />
      <span className={`text-sm font-medium ${
        clothingType === value ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'
      }`}>{label}</span>
    </label>
  );

  return (
    <>
      {/* Garment Image Upload */}
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-3 text-foreground">
          {t.clothing.garmentTitle}
        </h3>
        
        <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
          {t.clothing.garmentDesc}
        </p>

        {clothingType === 'full' ? (
          // 全身模式：始终显示两个上传框
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
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.crossOrigin !== null) {
                        img.crossOrigin = null;
                        img.referrerPolicy = 'no-referrer';
                      }
                    }}
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
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.crossOrigin !== null) {
                        img.crossOrigin = null;
                        img.referrerPolicy = 'no-referrer';
                      }
                    }}
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
          // 上衣/下衣模式：显示单张图片或上传框
          garmentImages.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="relative w-full h-full border-2 border-indigo-500 rounded-xl overflow-hidden min-h-[300px]">
                <img 
                  src={garmentImages[0].fileUrl} 
                  alt="Garment" 
                  className="w-full h-full object-contain" 
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
            <UploadComponent
              onFileSelected={(file) => handleImageUpload(file, 'garment')}
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
                <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm whitespace-pre-line">{t.clothing.uploadGarment}</p>
                <p className="text-[10px] text-gray-400 bg-slate-100 dark:bg-surface px-2 py-1 rounded-full mt-2">
                  {t.standard.support}
                </p>
              </div>
            </UploadComponent>
          )
        )}
      </div>

      {/* Clothing Type Selection */}
      <div className="bg-slate-50 dark:bg-surface/50 rounded-lg p-3 border border-slate-200 dark:border-border mb-6">
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

      {/* Model Image Upload */}
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-3 text-foreground">
          {t.clothing.modelTitle}
        </h3>
        
        <p className="text-xs text-slate-400 leading-relaxed">
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
              onError={(e) => {
                const img = e.currentTarget;
                if (img.crossOrigin !== null) {
                  img.crossOrigin = null;
                  img.referrerPolicy = 'no-referrer';
                }
              }}
            />
            <button
              onClick={() => setModelImage(null)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-70 hover:opacity-100 transition-opacity z-10"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex-1 min-h-[300px]">
            <UploadComponent
              onFileSelected={(file) => handleImageUpload(file, 'model')}
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
                <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm whitespace-pre-line">{t.clothing.uploadModel}</p>
                <p className="text-[10px] text-gray-400 bg-slate-100 dark:bg-surface px-2 py-1 rounded-full mt-2">
                  {t.standard.support}
                </p>
              </div>
            </UploadComponent>
          </div>
        )}
      </div>
    </>
  );
});

ClothingMode.displayName = 'ClothingMode';

export default ClothingMode;

