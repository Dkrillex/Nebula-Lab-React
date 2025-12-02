import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Gem, Loader2, Upload, Wand2, ArrowRight, Square, Circle, Type, Bold, Italic } from 'lucide-react';
import { styleTransferService } from '@/services/styleTransferService';
import { textToImageService } from '@/services/textToImageService';
import { useAuthStore } from '@/stores/authStore';
import { showAuthModal } from '@/lib/authModalManager';
import toast from 'react-hot-toast';
import { createTaskPoller, PollingController } from '@/utils/taskPolling';
import MaskCanvas, { MaskCanvasRef, ToolType, TextOptions } from '@/pages/Create/components/MaskCanvas';
import UploadComponent from '@/components/UploadComponent';
import ResultDisplay from '../components/ResultDisplay';
import { GeneratedImage, StyleTransferPageProps } from '../data';

interface UploadedImage {
  fileId?: string;
  fileName: string;
  fileUrl: string;
  file?: File;
}

export interface CreativeModeRef {
  getPrompt: () => string;
}

interface CreativeModeProps {
  t: StyleTransferPageProps['t'];
  onSaveToAssets: (img: GeneratedImage) => void;
  onImageToVideo: (img: GeneratedImage) => void;
  onPreview: (img: GeneratedImage, allImages: GeneratedImage[]) => void;
}

const CreativeMode = React.forwardRef<CreativeModeRef, CreativeModeProps>(({ t, onSaveToAssets, onImageToVideo, onPreview }, ref) => {
  const { isAuthenticated } = useAuthStore();
  
  const [prompt, setPrompt] = useState('');
  const [productImage, setProductImage] = useState<UploadedImage | null>(null);
  const [referenceImage, setReferenceImage] = useState<UploadedImage | null>(null);
  
  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  
  // Creative Mode Drawing
  const [creativeBrushTool, setCreativeBrushTool] = useState<ToolType>('pencil');
  const [creativeBrushSize, setCreativeBrushSize] = useState(20);
  const [creativeBrushColor, setCreativeBrushColor] = useState('#ffff00');
  const creativeMaskCanvasRef = useRef<MaskCanvasRef>(null);
  const [creativeColors] = useState(['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#000000', '#ffffff']);
  
  // Text Options
  const [textOptions, setTextOptions] = useState<TextOptions>({
    fontFamily: 'Arial',
    fontSize: 24,
    fontWeight: 'normal',
    fontStyle: 'normal'
  });
  
  const productInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const pollerRef = useRef<PollingController | null>(null);

  // Expose getPrompt via ref
  React.useImperativeHandle(ref, () => ({
    getPrompt: () => prompt
  }));

  // 文件类型验证
  const validateFileType = (file: File, type: 'product' | 'reference'): boolean => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['png', 'jpg', 'jpeg'].includes(fileExtension)) {
      toast.error(`不支持的文件格式：${file.name}，请上传 PNG, JPG, JPEG 格式的图片`);
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`文件大小超过限制：${file.name}，文件大小不能超过 10MB`);
      return false;
    }
    return true;
  };

  // 处理图片上传
  const handleImageUpload = (file: File, type: 'product' | 'reference') => {
    if (!validateFileType(file, type)) return;
    
    const blobUrl = URL.createObjectURL(file);
    const imgData: UploadedImage = {
      fileName: file.name,
      fileUrl: blobUrl,
      file: file
    };

    if (type === 'product') {
      setProductImage(imgData);
    } else {
      setReferenceImage(imgData);
    }
  };

  // 将图片URL转换为Base64
  const urlToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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
      
      if (taskResult.data && Array.isArray(taskResult.data)) {
        images = taskResult.data.map((item: any, index: number) => ({
          key: index + 1,
          url: item.url || item.image_url || '',
          revised_prompt: item.revised_prompt,
          previewVisible: false
        })).filter(img => img.url);
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
        const res = await styleTransferService.queryCreative(taskId);
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

  // 文本润色
  const handlePolishText = async () => {
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
  const handleTryExample = async () => {
    if (!isAuthenticated) {
      showAuthModal();
      return;
    }
    
    try {
      const productRes = await fetch('/demo/creative-product.png');
      const productBlob = await productRes.blob();
      const productFile = new File([productBlob], 'demo-product.png', { type: 'image/png' });
      handleImageUpload(productFile, 'product');
      
      setPrompt('把框选的东西变成黄色');
    } catch (error) {
      console.error('Failed to load demo assets:', error);
      toast.error('加载示例图片失败，请确保assets目录正确');
    }
  };

  // 提交生成任务
  const handleGenerate = async () => {
    if (!isAuthenticated) {
      showAuthModal();
      return;
    }
    
    if (isGenerating) return;
    if (!productImage) {
      toast.error('请上传产品图片');
      return;
    }
    if (!prompt.trim()) {
      toast.error('请输入提示词');
      return;
    }
    
    stopTaskPolling();
    setIsGenerating(true);
    setProgress(0);
    setGeneratedImages([]);

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
        setGeneratedImages(images);
        setProgress(100);
        setIsGenerating(false);
        stopTaskPolling();
      } else if (taskId) {
        startPolling(taskId);
      } else {
        throw new Error('Unexpected response format or empty result');
      }

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

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Left Column: Upload Section */}
      <div className="w-full md:w-[400px] lg:w-[450px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {/* Product Image Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base flex items-center gap-2">
                {t.creative.productTitle}
                <span className="text-[10px] text-slate-400 font-normal">高清图片效果最佳 | jpg/jpeg/png | 文件&lt;10MB</span>
              </h3>
            </div>
            
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

                    {/* Contextual Options */}
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
                </div>
              </UploadComponent>
            )}
          </div>

          {/* Prompt Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">{t.creative.promptTitle}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTryExample}
                  className="px-3 py-1.5 bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-lg shadow-sm text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface transition-colors"
                >
                  试用示例
                </button>
                <button 
                  onClick={handlePolishText}
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
                className="w-full min-h-[150px] p-4 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-background resize-none text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                maxLength={1500}
              />
              <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                {prompt.length} / 1500
              </div>
            </div>
          </div>

          {/* Reference Image Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">参考图片</h3>
                <span className="text-xs text-slate-400">(可选)</span>
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
                  />
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

          {/* Generate Button */}
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !productImage || !prompt.trim()}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transform transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating... {progress}%
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

CreativeMode.displayName = 'CreativeMode';

export default CreativeMode;

