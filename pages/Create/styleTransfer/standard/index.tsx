import React, { useState, useRef, useCallback } from 'react';
import { X, Upload } from 'lucide-react';
import MaskCanvas, { MaskCanvasRef } from '../../components/MaskCanvas';
import UploadComponent from '@/components/UploadComponent';
import TemplateSelectModal from '../../components/TemplateSelectModal';
import { Template } from '@/services/styleTransferService';
import { styleTransferService } from '@/services/styleTransferService';
import { avatarService } from '@/services/avatarService';
import { useAuthStore } from '@/stores/authStore';
import { showAuthModal } from '@/lib/authModalManager';
import toast from 'react-hot-toast';
import { 
  UploadedImage, 
  StyleTransferPageProps, 
  TEXTS, 
  validateFileType, 
  uploadImageToTopView 
} from '../data';

export interface StandardModeRef {
  handleGenerate: () => Promise<void>;
  canGenerate: () => boolean;
}

interface StandardModeProps {
  t: StyleTransferPageProps['t'];
  isGenerating: boolean;
  onGenerate: (taskId: string) => void;
  onError: (error: Error) => void;
}

const StandardMode = React.forwardRef<StandardModeRef, StandardModeProps>(({ t, isGenerating, onGenerate, onError }, ref) => {
  const { isAuthenticated } = useAuthStore();
  
  // 状态管理
  const [productImage, setProductImage] = useState<UploadedImage | null>(null);
  const [templateImage, setTemplateImage] = useState<UploadedImage | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [generatingCount, setGeneratingCount] = useState(1);
  const [location, setLocation] = useState<number[][]>([]);
  
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

  // 处理图片上传
  const handleImageUpload = (file: File, type: 'product' | 'template') => {
    if (!validateFileType(file, type, 'standard')) {
      return;
    }
    
    const blobUrl = URL.createObjectURL(file);
    const imgData: UploadedImage = {
      fileName: file.name,
      fileUrl: blobUrl,
      file: file
    };

    if (type === 'product') {
      setProductImage(imgData);
    } else if (type === 'template') {
      setTemplateImage(imgData);
      setSelectedTemplate(null); // 清除模板选择
    }
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
      // 标准模式：使用 product.webp 和 template.png
      const productRes = await fetch('/demo/product.webp');
      const productBlob = await productRes.blob();
      const productFile = new File([productBlob], 'demo-product.webp', { type: 'image/webp' });
      handleImageUpload(productFile, 'product');

      // Load template image for standard mode
      const templateRes = await fetch('/demo/template.png');
      const templateBlob = await templateRes.blob();
      const templateFile = new File([templateBlob], 'demo-template.png', { type: 'image/png' });
      handleImageUpload(templateFile, 'template');
    } catch (error) {
      console.error('Failed to load demo assets:', error);
      toast.error('加载示例图片失败，请确保assets目录正确');
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
    if (!productImage) {
      toast.error('请上传产品图片');
      return;
    }
    if (!templateImage && !selectedTemplate) {
      toast.error('请上传模板图片或选择模板');
      return;
    }

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
      onGenerate(taskId);
    } catch (error: any) {
      console.error('Generation error:', error);
      onError(error);
    }
  }, [productImage, templateImage, selectedTemplate, generatingCount, location, isGenerating, isAuthenticated, onGenerate, onError]);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setShowTemplateModal(false);
  };

  const renderUploadBox = (
    image: UploadedImage | null,
    type: 'product' | 'template',
    label: string,
    inputRef?: React.RefObject<HTMLInputElement>,
    customClass?: string,
    disabled?: boolean
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
        className={customClass || "h-full min-h-[200px] w-full"}
        disabled={disabled}
      >
        <div className="text-center text-gray-500 p-4 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-surface shadow-sm flex items-center justify-center text-indigo-500">
            <Upload size={24} />
          </div>
          <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm whitespace-pre-line">{label}</p>
          {type !== 'template' && (
            <p className="text-[10px] text-gray-400 bg-slate-100 dark:bg-surface px-2 py-1 rounded-full mt-2">
              {t.standard.support}
            </p>
          )}
        </div>
      </UploadComponent>
    );
  };

  return (
    <>
      {/* Product Image Upload */}
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-3 text-foreground">
          {t.standard.productTitle}
        </h3>
        
        <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
          {TEXTS.standard.productDesc}
        </p>

        {productImage ? (
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex-1 relative border-2 border-indigo-500 rounded-xl overflow-hidden min-h-[300px]">
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
                <span className="text-xs text-slate-400 min-w-[24px]">{brushSize}px</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 mb-2">
            {renderUploadBox(
              productImage,
              'product',
              t.standard.uploadProduct,
              productInputRef,
              undefined,
              isGenerating
            )}
          </div>
        )}

        {/* Try Example Button */}
        {!productImage && (
          <div className="mt-auto pt-4 flex justify-center">
            <button
              onClick={(e) => handleTryExample(e)}
              className="px-6 py-2 bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface transition-colors w-full"
            >
              试用示例
            </button>
          </div>
        )}
      </div>

      {/* Template Image Upload */}
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-3 text-foreground">
          {TEXTS.standard.areaTitle}
        </h3>
        
        <p className="text-xs text-slate-400 leading-relaxed">{TEXTS.standard.areaDesc}</p>

        {(templateImage || selectedTemplate) ? (
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex-1 relative border-2 border-indigo-500 rounded-xl overflow-hidden min-h-[300px]">
              <MaskCanvas
                ref={templateMaskCanvasRef}
                imageUrl={templateImage?.fileUrl || selectedTemplate?.templateImageUrl || ''}
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
                <span className="text-xs text-slate-400 min-w-[24px]">{templateBrushSize}px</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-[300px]">
            {renderUploadBox(
              templateImage,
              'template',
              TEXTS.standard.templateUpload,
              templateInputRef,
              undefined,
              isGenerating
            )}
          </div>
        )}
      </div>

      {/* Fixed Bottom Actions */}
      <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
        {/* Template Actions */}
        <div className="space-y-2">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isAuthenticated) {
                showAuthModal();
                return;
              }
              setShowTemplateModal(true);
            }}
            disabled={isGenerating}
            className="w-full py-3 rounded-xl border border-slate-200 dark:border-border text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isAuthenticated) {
                showAuthModal();
                return;
              }
              setTemplateImage(null);
              setSelectedTemplate(null);
              if (templateInputRef.current) templateInputRef.current.value = '';
            }}
            disabled={isGenerating}
            className="w-full py-3 rounded-xl border border-slate-200 dark:border-border text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            重新上传
          </button>
        </div>
      </div>

      {/* Template Selection Modal */}
      <TemplateSelectModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelect={handleTemplateSelect}
        selectedTemplateId={selectedTemplate?.templateId}
      />

      {/* Expose ref methods */}
      {React.useImperativeHandle(ref, () => ({
        handleGenerate,
        canGenerate: () => {
          if (!productImage) return false;
          if (!templateImage && !selectedTemplate) return false;
          return true;
        }
      }), [handleGenerate, productImage, templateImage, selectedTemplate])}
    </>
  );
});

StandardMode.displayName = 'StandardMode';

export default StandardMode;

