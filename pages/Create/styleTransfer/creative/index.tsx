import React, { useState, useRef, useImperativeHandle, useCallback } from 'react';
import { X, Upload, Wand2, ArrowRight, Square, Circle, Type, Bold, Italic } from 'lucide-react';
import MaskCanvas, { MaskCanvasRef, ToolType, TextOptions } from '../../components/MaskCanvas';
import UploadComponent from '@/components/UploadComponent';
import { textToImageService } from '@/services/textToImageService';
import { styleTransferService } from '@/services/styleTransferService';
import { useAuthStore } from '@/stores/authStore';
import { showAuthModal } from '@/lib/authModalManager';
import toast from 'react-hot-toast';
import { 
  UploadedImage, 
  GeneratedImage,
  StyleTransferPageProps, 
  validateFileType, 
  urlToBase64 
} from '../data';

export interface CreativeModeRef {
  handleGenerate: () => Promise<void>;
  canGenerate: () => boolean;
  getPrompt: () => string;
}

interface CreativeModeProps {
  t: StyleTransferPageProps['t'];
  isGenerating: boolean;
  onGenerate: (taskIdOrImages: string | GeneratedImage[]) => void;
  onError: (error: Error) => void;
}

const CreativeMode = React.forwardRef<CreativeModeRef, CreativeModeProps>(({ t, isGenerating, onGenerate, onError }, ref) => {
  const { isAuthenticated } = useAuthStore();
  
  // 状态管理
  const [productImage, setProductImage] = useState<UploadedImage | null>(null);
  const [referenceImage, setReferenceImage] = useState<UploadedImage | null>(null);
  const [prompt, setPrompt] = useState('');
  
  // Creative Mode Drawing
  const [creativeBrushTool, setCreativeBrushTool] = useState<ToolType>('pencil');
  const [creativeBrushSize, setCreativeBrushSize] = useState(20);
  const [creativeBrushColor, setCreativeBrushColor] = useState('#ffff00');
  const creativeMaskCanvasRef = useRef<MaskCanvasRef>(null);
  const [creativeColors] = useState(['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#000000', '#ffffff']);
  
  // Text Options for Creative Mode
  const [textOptions, setTextOptions] = useState<TextOptions>({
    fontFamily: 'Arial',
    fontSize: 24,
    fontWeight: 'normal',
    fontStyle: 'normal'
  });

  // Refs
  const productInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);

  // 处理图片上传
  const handleImageUpload = (file: File, type: 'product' | 'reference') => {
    if (!validateFileType(file, type, 'creative')) {
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
    } else if (type === 'reference') {
      setReferenceImage(imgData);
    }
  };

  // 文本润色
  const handlePolishText = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isAuthenticated) {
      showAuthModal();
      return;
    }
    
    if (!prompt.trim()) return;
    try {
      const polishedText = await textToImageService.polishText({
        text: prompt,
        type: 'object_replacement'
      });
      
      if (polishedText && typeof polishedText === 'string') {
        setPrompt(polishedText);
        toast.success('文本润色成功！');
      } else {
        toast.error('文本润色完成，但未返回润色结果');
      }
    } catch (error: any) {
      console.error('Text polishing failed:', error);
      toast.error(error.message || '文本润色失败');
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
      // 创意模式：使用 creative-product.png
      const productRes = await fetch('/demo/creative-product.png');
      const productBlob = await productRes.blob();
      const productFile = new File([productBlob], 'demo-product.png', { type: 'image/png' });
      handleImageUpload(productFile, 'product');
      
      // 设置提示词
      setPrompt('把框选的东西变成黄色');
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
    if (!prompt.trim()) {
      toast.error('请输入提示词');
      return;
    }

    try {
      // 构建parts数组
      const parts: Array<{ text?: string; image?: string }> = [];
      parts.push({ text: prompt });

      // 添加产品图片（Base64）
      let productBase64;
      if (creativeMaskCanvasRef.current) {
        const editedImage = await creativeMaskCanvasRef.current.getEditedImageBase64();
        productBase64 = editedImage || await urlToBase64(productImage.fileUrl);
      } else {
        productBase64 = await urlToBase64(productImage.fileUrl);
      }
      parts.push({ image: productBase64 });

      if (referenceImage) {
        const refBase64 = await urlToBase64(referenceImage.fileUrl);
        parts.push({ image: refBase64 });
      }

      const res = await styleTransferService.submitCreative({
        size: '2K',
        contents: [{ parts }]
      });

      console.log('Creative submit response:', res);

      let images: GeneratedImage[] = [];
      let taskId: string | undefined;

      if (Array.isArray(res)) {
        images = res.map((item: any, index: number) => ({
          key: `${Date.now()}_${index}`,
          url: item.url || item.image_url || '',
          revised_prompt: item.revised_prompt,
          b64_json: item.b64_json
        }));
      } else if (res && res.data && Array.isArray(res.data)) {
        images = res.data.map((item: any, index: number) => ({
          key: `${Date.now()}_${index}`,
          url: item.url || item.image_url || '',
          revised_prompt: item.revised_prompt,
          b64_json: item.b64_json
        }));
      } else if (res && (res.id || res.taskId)) {
        taskId = res.id || res.taskId;
      }

      if (images.length > 0) {
        onGenerate(images);
      } else if (taskId) {
        onGenerate(taskId);
      } else {
        throw new Error('Unexpected response format or empty result');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      onError(error);
    }
  }, [productImage, prompt, referenceImage, isGenerating, isAuthenticated, onGenerate, onError]);

  // Expose ref methods
  useImperativeHandle(ref, () => ({
    handleGenerate,
    canGenerate: () => {
      if (!productImage) return false;
      if (!prompt.trim()) return false;
      return true;
    },
    getPrompt: () => prompt
  }), [handleGenerate, productImage, prompt, referenceImage]);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Product Image (Canvas) - Always Top */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold text-foreground">
            {t.creative.productTitle}
          </h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">高清图片效果最佳 | jpg/jpeg/png | 文件&lt;10MB</p>
        
        {productImage ? (
          <div className="flex flex-col gap-2">
            <div className="relative border-2 border-indigo-500 rounded-xl overflow-hidden h-[450px]">
              <MaskCanvas
                ref={creativeMaskCanvasRef}
                imageUrl={productImage.fileUrl}
                tool={creativeBrushTool}
                brushSize={creativeBrushSize}
                brushColor={creativeBrushColor}
                textOptions={textOptions}
                mode="draw"
                className="w-full h-full"
              />
              <button
                onClick={() => setProductImage(null)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-70 hover:opacity-100 transition-opacity z-10"
              >
                <X size={14} />
              </button>
            </div>
            
            {/* Creative Tools Toolbar */}
            <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-surface/50 rounded-lg border border-slate-100 dark:border-border overflow-x-auto">
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Tools */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setCreativeBrushTool('pencil')}
                    className={`p-1.5 rounded-lg transition-colors ${creativeBrushTool === 'pencil' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-surface'}`}
                    title="画笔"
                  >
                    🖌️
                  </button>
                  <button
                    onClick={() => setCreativeBrushTool('eraser')}
                    className={`p-1.5 rounded-lg transition-colors ${creativeBrushTool === 'eraser' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-surface'}`}
                    title="橡皮擦"
                  >
                    🧽
                  </button>
                  <button
                    onClick={() => setCreativeBrushTool('arrow')}
                    className={`p-1.5 rounded-lg transition-colors ${creativeBrushTool === 'arrow' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-surface'}`}
                    title="箭头"
                  >
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => setCreativeBrushTool('rect')}
                    className={`p-1.5 rounded-lg transition-colors ${creativeBrushTool === 'rect' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-surface'}`}
                    title="矩形"
                  >
                    <Square size={16} />
                  </button>
                  <button
                    onClick={() => setCreativeBrushTool('ellipse')}
                    className={`p-1.5 rounded-lg transition-colors ${creativeBrushTool === 'ellipse' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-surface'}`}
                    title="椭圆"
                  >
                    <Circle size={16} />
                  </button>
                  <button
                    onClick={() => setCreativeBrushTool('text')}
                    className={`p-1.5 rounded-lg transition-colors ${creativeBrushTool === 'text' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-surface'}`}
                    title="文本"
                  >
                    <Type size={16} />
                  </button>
                </div>
                
                <div className="w-px h-6 bg-slate-200 dark:bg-border"></div>

                {/* Colors */}
                <div className="flex gap-2 items-center">
                  {creativeColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setCreativeBrushColor(color)}
                      className={`w-5 h-5 rounded-full border-2 ${creativeBrushColor === color ? 'border-indigo-500 scale-110' : 'border-transparent hover:scale-110'}`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>

                <div className="w-px h-6 bg-slate-200 dark:bg-border"></div>

                {/* Contextual Options: Text or Brush Size - Inline */}
                {creativeBrushTool === 'text' ? (
                  <div className="flex items-center gap-2 text-xs">
                    <select 
                      value={textOptions.fontFamily}
                      onChange={(e) => setTextOptions(prev => ({ ...prev, fontFamily: e.target.value }))}
                      className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-border bg-white dark:bg-surface text-slate-700 dark:text-slate-300"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times</option>
                      <option value="Courier New">Courier</option>
                      <option value="Verdana">Verdana</option>
                    </select>
                    
                    <input 
                      type="number" 
                      value={textOptions.fontSize} 
                      onChange={(e) => setTextOptions(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
                      className="w-12 px-2 py-1 text-xs rounded border border-slate-200 dark:border-border bg-white dark:bg-surface text-slate-700 dark:text-slate-300"
                      min="10" max="200"
                    />

                    <div className="flex gap-0.5 bg-slate-100 dark:bg-surface p-0.5 rounded">
                      <button
                        onClick={() => setTextOptions(prev => ({ ...prev, fontWeight: prev.fontWeight === 'bold' ? 'normal' : 'bold' }))}
                        className={`p-1 rounded ${textOptions.fontWeight === 'bold' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:bg-white/50'}`}
                        title="加粗"
                      >
                        <Bold size={14} />
                      </button>
                      <button
                        onClick={() => setTextOptions(prev => ({ ...prev, fontStyle: prev.fontStyle === 'italic' ? 'normal' : 'italic' }))}
                        className={`p-1 rounded ${textOptions.fontStyle === 'italic' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:bg-white/50'}`}
                        title="斜体"
                      >
                        <Italic size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1 min-w-[180px] max-w-[240px]">
                    <span className="text-xs text-slate-400 whitespace-nowrap">大小</span>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={creativeBrushSize}
                      onChange={(e) => setCreativeBrushSize(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="text-xs text-slate-400 w-6">{creativeBrushSize}</span>
                  </div>
                )}

                <div className="w-px h-6 bg-slate-200 dark:bg-border"></div>

                {/* Actions */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => creativeMaskCanvasRef.current?.undoLastAction()}
                    className="px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-surface border border-slate-200 dark:border-border rounded hover:bg-slate-50 transition-colors"
                  >
                    撤销
                  </button>
                  <button
                    onClick={() => creativeMaskCanvasRef.current?.clearCanvas()}
                    className="px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-surface border border-slate-200 dark:border-border rounded hover:bg-slate-50 transition-colors"
                  >
                    清除
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <UploadComponent
            onFileSelected={(file) => handleImageUpload(file, 'product')}
            onUploadComplete={() => {}}
            onError={(error) => toast.error(error.message)}
            uploadType="oss"
            immediate={false}
            showConfirmButton={false}
            accept=".png,.jpg,.jpeg"
            className="w-full min-h-[380px]"
          >
            <div className="text-center text-gray-500 p-4 flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-surface shadow-sm flex items-center justify-center text-indigo-500">
                <Upload size={24} />
              </div>
              <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm whitespace-pre-line">{t.creative.uploadProduct}</p>
              <p className="text-[10px] text-gray-400 bg-slate-100 dark:bg-surface px-2 py-1 rounded-full mt-2">
                jpg/jpeg/png | 文件&lt;10MB
              </p>
            </div>
          </UploadComponent>
        )}
      </div>

      {/* 2. Bottom Section: Prompt + Reference Image */}
      <div className="mb-6">
        {/* Prompt Section */}
        <div className="flex-1 flex flex-col mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-foreground">{t.creative.promptTitle}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleTryExample(e)}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                试用示例
              </button>
              <button 
                onClick={(e) => handlePolishText(e)}
                disabled={!prompt.trim()}
                className="flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-3 py-1.5 rounded-lg shadow hover:shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
              >
                <Wand2 size={12} />
                {t.creative.aiPolish}
              </button>
            </div>
          </div>
          <div className="relative">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t.creative.promptPlaceholder}
              className="w-full h-28 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 resize-none text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none pr-16"
              maxLength={1500}
            />
            <span className="absolute bottom-3 right-3 text-[10px] text-gray-400">{prompt.length}/1500</span>
          </div>
        </div>

        {/* Reference Image Section */}
        <div className="w-full flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-foreground">参考图片</h3>
              <span className="text-xs text-muted-foreground">(可选)</span>
            </div>
            {referenceImage && (
              <button
                onClick={() => setReferenceImage(null)}
                className="text-xs text-red-500 hover:text-red-600"
              >
                移除
              </button>
            )}
          </div>
          
          <div className="flex-1 min-h-[150px] border-2 border-dashed border-slate-200 dark:border-border rounded-xl overflow-hidden relative bg-slate-50 dark:bg-surface/50 hover:bg-slate-100 dark:hover:bg-surface transition-colors">
            {referenceImage ? (
              <div className="w-full h-full relative group">
                <img 
                  src={referenceImage.fileUrl} 
                  alt="Reference" 
                  className="w-full h-full object-cover" 
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
                {/* Overlay for re-upload or clear */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => setReferenceImage(null)}
                    className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40 backdrop-blur-sm"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4"
                onClick={() => referenceInputRef.current?.click()}
              >
                <UploadComponent
                  onFileSelected={(file) => handleImageUpload(file, 'reference')}
                  onUploadComplete={() => {}}
                  onError={(error) => toast.error(error.message)}
                  uploadType="oss"
                  immediate={false}
                  accept=".png,.jpg,.jpeg"
                  className="absolute inset-0 border-none bg-transparent"
                  showPreview={false} 
                >
                  <div className="text-center">
                    <Upload size={20} className="mx-auto text-slate-400 mb-2" />
                    <span className="text-xs text-slate-500">点击上传</span>
                  </div>
                </UploadComponent>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

CreativeMode.displayName = 'CreativeMode';

export default CreativeMode;

