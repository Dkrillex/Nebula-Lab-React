import React, { useState, useRef, useEffect } from 'react';
import { Upload, Target, Sparkles, Shirt, Gem, Palette, Wand2, Image as ImageIcon, X, Loader2, Download, Check, AlertCircle } from 'lucide-react';
import { styleTransferService, AnyShootTaskResult } from '../../../services/styleTransferService';
import { uploadService } from '../../../services/uploadService';
import { textToImageService } from '../../../services/textToImageService';
import { request } from '../../../lib/request';

interface StyleTransferPageProps {
  t: {
    title: string;
    subtitle: string;
    modes: {
      standard: { title: string; desc: string };
      creative: { title: string; desc: string };
      clothing: { title: string; desc: string };
    };
    standard: {
      productTitle: string;
      productDesc: string;
      uploadProduct: string;
      areaTitle: string;
      areaDesc: string;
      uploadTemplate: string;
      selectTemplate: string;
      support: string;
    };
    clothing: {
      garmentTitle: string;
      garmentDesc: string;
      uploadGarment: string;
      modelTitle: string;
      uploadModel: string;
      types: { top: string; bottom: string; full: string };
    };
    creative: {
      productTitle: string;
      promptTitle: string;
      addRef: string;
      tryExample: string;
      aiPolish: string;
      promptPlaceholder: string;
      uploadProduct: string;
      support: string;
    };
    common: {
      generate: string;
      resultTitle: string;
      resultPlaceholder: string;
    };
  };
}

interface UploadedImage {
  fileId?: string;
  fileName: string;
  fileUrl: string;
  file?: File;
}

interface GeneratedImage {
  key: string;
  url: string;
  revised_prompt?: string;
  b64_json?: string;
}

const StyleTransferPage: React.FC<StyleTransferPageProps> = ({ t }) => {
  const [selectedMode, setSelectedMode] = useState<'standard' | 'creative' | 'clothing'>('standard');
  const [clothingType, setClothingType] = useState<'top' | 'bottom' | 'full'>('top');
  const [prompt, setPrompt] = useState('');
  const [generatingCount, setGeneratingCount] = useState(1);
  
  // 图片上传状态
  const [productImage, setProductImage] = useState<UploadedImage | null>(null);
  const [templateImage, setTemplateImage] = useState<UploadedImage | null>(null);
  const [garmentImage, setGarmentImage] = useState<UploadedImage | null>(null);
  const [modelImage, setModelImage] = useState<UploadedImage | null>(null);
  const [referenceImage, setReferenceImage] = useState<UploadedImage | null>(null);
  const [showReferenceImage, setShowReferenceImage] = useState(false);
  
  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // 模板相关
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  // Refs
  const productInputRef = useRef<HTMLInputElement>(null);
  const templateInputRef = useRef<HTMLInputElement>(null);
  const garmentInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const modes = [
    { id: 'standard', icon: Target, title: t.modes.standard.title, desc: t.modes.standard.desc },
    { id: 'creative', icon: Sparkles, title: t.modes.creative.title, desc: t.modes.creative.desc },
    { id: 'clothing', icon: Shirt, title: t.modes.clothing.title, desc: t.modes.clothing.desc },
  ];

  // 处理图片上传（延迟上传，先本地预览）
  const handleImageUpload = (file: File, type: 'product' | 'template' | 'garment' | 'model' | 'reference') => {
    const blobUrl = URL.createObjectURL(file);
    const imgData: UploadedImage = {
      fileName: file.name,
      fileUrl: blobUrl,
      file: file
    };

    switch (type) {
      case 'product':
        setProductImage(imgData);
        break;
      case 'template':
        setTemplateImage(imgData);
        break;
      case 'garment':
        setGarmentImage(imgData);
        break;
      case 'model':
        setModelImage(imgData);
        break;
      case 'reference':
        setReferenceImage(imgData);
        break;
    }
  };

  // 上传图片到OSS
  const uploadImageToOss = async (image: UploadedImage): Promise<UploadedImage> => {
    if (image.fileId) return image;
    if (!image.file) throw new Error('No file object found');

    const res = await uploadService.uploadFile(image.file);
    if (res.code === 200 && res.data) {
      return {
        ...image,
        fileId: res.data.ossId,
        fileUrl: res.data.url
      };
    } else {
      throw new Error(res.msg || 'Image upload failed');
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
        // 移除 data:image/...;base64, 前缀，只保留base64数据
        const base64Data = base64.split(',')[1] || base64;
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // 文本润色
  const handlePolishText = async () => {
    if (!prompt.trim()) return;
    try {
      const res = await textToImageService.polishText({
        text: prompt,
        type: 'object_replacement'
      });
      if (res.data) {
        setPrompt(res.data);
      }
    } catch (error) {
      console.error('Text polishing failed:', error);
    }
  };

  // 轮询任务状态
  const startPolling = (taskId: string, mode: 'standard' | 'creative' | 'clothing') => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);
    
    pollingInterval.current = setInterval(async () => {
      try {
        let res;
        if (mode === 'standard') {
          res = await styleTransferService.queryStandard(taskId);
        } else if (mode === 'creative') {
          res = await styleTransferService.queryCreative(taskId);
        } else {
          res = await styleTransferService.queryClothing(taskId);
        }
        
        if (res.code === 200 && res.data) {
          const status = res.data.status;
          if (status === 'success' || status === 'succeeded') {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
            if (progressInterval.current) clearInterval(progressInterval.current);
            setProgress(100);
            
            // 处理结果图片 - 兼容多种返回格式
            let imageUrls: string[] = [];
            if (res.data.resultImages && Array.isArray(res.data.resultImages)) {
              imageUrls = res.data.resultImages;
            } else if (res.data.data && Array.isArray(res.data.data)) {
              // 创意模式可能返回 data.data 数组
              imageUrls = res.data.data.map((item: any) => item.url || item.image_url || '').filter(Boolean);
            } else if (res.data.url) {
              // 单个图片URL
              imageUrls = [res.data.url];
            }
            
            const images: GeneratedImage[] = imageUrls.map((url: string, index: number) => ({
              key: `${Date.now()}_${index}`,
              url: url
            }));
            setGeneratedImages(images);
            setIsGenerating(false);
          } else if (status === 'fail' || status === 'failed' || status === 'error') {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
            if (progressInterval.current) clearInterval(progressInterval.current);
            setIsGenerating(false);
            setErrorMessage(res.data.errorMsg || res.data.error || 'Generation failed');
          }
          // 'init', 'processing', 'running' -> continue polling
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 10000); // 10秒轮询一次
  };

  // 提交生成任务
  const handleGenerate = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setProgress(0);
    setGeneratedImages([]);
    setErrorMessage(null);

    // 模拟进度
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return 90;
        return prev + Math.floor(Math.random() * 10);
      });
    }, 2000);

    try {
      if (selectedMode === 'creative') {
        // 创意模式
        if (!productImage) {
          setErrorMessage('请上传产品图片');
          setIsGenerating(false);
          return;
        }
        if (!prompt.trim()) {
          setErrorMessage('请输入提示词');
          setIsGenerating(false);
          return;
        }

        // 上传产品图片
        const uploadedProduct = await uploadImageToOss(productImage);
        setProductImage(uploadedProduct);

        // 构建parts数组
        const parts: Array<{ text?: string; image?: string }> = [];
        
        // 添加文本提示词
        parts.push({ text: prompt });

        // 添加产品图片（Base64）
        const productBase64 = await urlToBase64(uploadedProduct.fileUrl);
        parts.push({ image: productBase64 });

        // 如果有参考图片，也添加进去
        if (showReferenceImage && referenceImage) {
          const uploadedRef = await uploadImageToOss(referenceImage);
          setReferenceImage(uploadedRef);
          const refBase64 = await urlToBase64(uploadedRef.fileUrl);
          parts.push({ image: refBase64 });
        }

        // 提交创意模式任务
        const res = await styleTransferService.submitCreative({
          size: '2K',
          contents: [{ parts }]
        });

        if (res.code === 200 && res.data) {
          // 创意模式可能直接返回结果数组，也可能返回任务ID需要轮询
          if (Array.isArray(res.data)) {
            // 直接返回图片数组
            const images: GeneratedImage[] = res.data.map((item: any, index: number) => ({
              key: `${Date.now()}_${index}`,
              url: item.url || item.image_url || '',
              revised_prompt: item.revised_prompt,
              b64_json: item.b64_json
            }));
            setGeneratedImages(images);
            setProgress(100);
            setIsGenerating(false);
            if (progressInterval.current) clearInterval(progressInterval.current);
          } else if (res.data.data && Array.isArray(res.data.data)) {
            // 返回的数据在 data.data 中
            const images: GeneratedImage[] = res.data.data.map((item: any, index: number) => ({
              key: `${Date.now()}_${index}`,
              url: item.url || item.image_url || '',
              revised_prompt: item.revised_prompt,
              b64_json: item.b64_json
            }));
            setGeneratedImages(images);
            setProgress(100);
            setIsGenerating(false);
            if (progressInterval.current) clearInterval(progressInterval.current);
          } else if (res.data.id || res.data.taskId) {
            // 如果需要轮询
            const taskId = res.data.id || res.data.taskId;
            startPolling(taskId, 'creative');
          } else {
            throw new Error('Unexpected response format');
          }
        } else {
          throw new Error(res.msg || 'Submission failed');
        }

      } else if (selectedMode === 'standard') {
        // 标准模式
        if (!productImage) {
          setErrorMessage('请上传产品图片');
          setIsGenerating(false);
          return;
        }
        if (!templateImage && !selectedTemplate) {
          setErrorMessage('请上传模板图片或选择模板');
          setIsGenerating(false);
          return;
        }

        // 上传图片
        const uploadedProduct = await uploadImageToOss(productImage);
        setProductImage(uploadedProduct);
        
        let uploadedTemplate = templateImage;
        if (templateImage && !templateImage.fileId) {
          uploadedTemplate = await uploadImageToOss(templateImage);
          setTemplateImage(uploadedTemplate);
        }

        const res = await styleTransferService.submitStandard({
          productImageFileId: uploadedProduct.fileId!,
          templateImageFileId: uploadedTemplate?.fileId,
          templateId: selectedTemplate?.templateId,
          generatingCount,
          score: String(generatingCount)
        });

        if (res.code === 200 && res.data) {
          const taskId = res.data.taskId || res.data.id;
          if (!taskId) {
            throw new Error('Task ID not found');
          }
          startPolling(taskId, 'standard');
        } else {
          throw new Error(res.msg || 'Submission failed');
        }

      } else if (selectedMode === 'clothing') {
        // 服装模式
        if (!garmentImage) {
          setErrorMessage('请上传服装图片');
          setIsGenerating(false);
          return;
        }
        if (!modelImage) {
          setErrorMessage('请上传模特图片');
          setIsGenerating(false);
          return;
        }

        // 上传图片
        const uploadedGarment = await uploadImageToOss(garmentImage);
        const uploadedModel = await uploadImageToOss(modelImage);
        setGarmentImage(uploadedGarment);
        setModelImage(uploadedModel);

        const res = await styleTransferService.submitClothing({
          score: '1', // 默认积分
          volcDressingV2Bo: {
            garment: {
              data: [{
                type: clothingType,
                url: uploadedGarment.fileUrl
              }]
            },
            model: {
              id: uploadedModel.fileId || '',
              url: uploadedModel.fileUrl
            },
            req_key: `req_${Date.now()}`
          }
        });

        if (res.code === 200 && res.data) {
          const taskId = res.data.taskId || res.data.id;
          if (!taskId) {
            throw new Error('Task ID not found');
          }
          startPolling(taskId, 'clothing');
        } else {
          throw new Error(res.msg || 'Submission failed');
        }
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      setErrorMessage(error.message || 'Generation failed');
      setIsGenerating(false);
      if (progressInterval.current) clearInterval(progressInterval.current);
    }
  };

  useEffect(() => {
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const renderUploadBox = (
    image: UploadedImage | null,
    type: 'product' | 'template' | 'garment' | 'model' | 'reference',
    label: string,
    inputRef: React.RefObject<HTMLInputElement>
  ) => (
    <div className="relative">
      {image ? (
        <div className="relative border-2 border-indigo-500 rounded-xl overflow-hidden group">
          <img src={image.fileUrl} alt={label} className="w-full h-full object-contain" />
          <button
            onClick={() => {
              if (type === 'product') setProductImage(null);
              else if (type === 'template') setTemplateImage(null);
              else if (type === 'garment') setGarmentImage(null);
              else if (type === 'model') setModelImage(null);
              else if (type === 'reference') setReferenceImage(null);
            }}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 dark:border-border rounded-xl bg-slate-50 dark:bg-surface/50 hover:bg-slate-100 dark:hover:bg-surface transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 group h-48"
        >
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-surface shadow-sm flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
            <Upload size={24} />
          </div>
          <div className="text-center px-4">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold block mb-1">
              {label}
            </span>
            <span className="px-3 py-1 bg-slate-200 dark:bg-surface border border-slate-300 dark:border-border rounded text-[10px] text-slate-500 font-mono inline-block">
              {t.standard.support}
            </span>
          </div>
        </div>
      )}
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0], type);
          }
          if (e.target) e.target.value = '';
        }}
      />
    </div>
  );

  const renderRadio = (value: 'top' | 'bottom' | 'full', label: string) => (
    <label className="flex items-center gap-2 cursor-pointer">
        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${clothingType === value ? 'border-indigo-600' : 'border-slate-300'}`}>
            {clothingType === value && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>}
        </div>
        <input 
            type="radio" 
            className="hidden" 
            checked={clothingType === value} 
            onChange={() => setClothingType(value)} 
        />
        <span className={`text-sm ${clothingType === value ? 'text-indigo-600 font-medium' : 'text-slate-600'}`}>{label}</span>
    </label>
  );

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-background p-4 md:p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      
      {/* Header */}
      <div className="text-center space-y-2 flex-shrink-0">
        <h1 className="text-3xl font-bold tracking-wide text-gray-800 dark:text-gray-100">{t.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{t.subtitle}</p>
      </div>

      {/* Mode Selector */}
      <div className="flex flex-wrap justify-center gap-4">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setSelectedMode(mode.id as any)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl border transition-all duration-200 min-w-[240px] text-left ${
              selectedMode === mode.id 
                ? 'bg-indigo-600 border-indigo-600 shadow-lg scale-105' 
                : 'bg-white dark:bg-surface border-slate-200 dark:border-border hover:border-indigo-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
               selectedMode === mode.id ? 'bg-white/20 text-white' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
            }`}>
               <mode.icon size={20} className={selectedMode === mode.id && mode.id === 'creative' ? 'text-yellow-200' : ''} />
            </div>
            <div>
              <div className={`font-bold text-sm ${selectedMode === mode.id ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                 {mode.title}
              </div>
              <div className={`text-xs ${selectedMode === mode.id ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                 {mode.desc}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Content Grid */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]`}>
        
        {/* Creative Mode Layout: 2 Columns */}
        {selectedMode === 'creative' ? (
          <>
            {/* Left Column: Combined Input */}
            <div className="lg:col-span-2 bg-white dark:bg-surface rounded-2xl p-6 flex flex-col gap-6 shadow-sm border border-slate-100 dark:border-border">
                {/* Product Image Section */}
                <div>
                    <div className="flex justify-between items-end mb-3">
                        <div>
                             <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">{t.creative.productTitle}</h3>
                             <p className="text-xs text-slate-400 mt-1">{t.standard.productDesc}</p>
                        </div>
                    </div>
                    {renderUploadBox(productImage, 'product', t.creative.uploadProduct, productInputRef)}
                </div>

                {/* Reference Image (Optional) */}
                {showReferenceImage && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">参考图片</h3>
                      <button
                        onClick={() => {
                          setShowReferenceImage(false);
                          setReferenceImage(null);
                        }}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        移除
                      </button>
                    </div>
                    {renderUploadBox(referenceImage, 'reference', '上传参考图片', referenceInputRef)}
                  </div>
                )}

                {/* Prompt Section */}
                <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">{t.creative.promptTitle}</h3>
                        <div className="flex gap-2">
                             <button 
                               onClick={() => setShowReferenceImage(!showReferenceImage)}
                               className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-border text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-border transition-colors"
                             >
                                {t.creative.addRef}
                             </button>
                             <button 
                               onClick={() => setPrompt('将产品放置在现代化的办公环境中，背景简洁专业，突出产品特点')}
                               className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-border text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-border transition-colors"
                             >
                                {t.creative.tryExample}
                             </button>
                             <button 
                               onClick={handlePolishText}
                               className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium flex items-center gap-1 border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                             >
                                <Wand2 size={12} />
                                {t.creative.aiPolish}
                             </button>
                        </div>
                    </div>
                    <div className="relative flex-1">
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t.creative.promptPlaceholder}
                            className="w-full h-full min-h-[120px] p-4 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-background resize-none text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            maxLength={1500}
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                            {prompt.length} / 1500
                        </div>
                    </div>
                </div>

                {/* Generate Button */}
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !productImage || !prompt.trim()}
                  className="w-full max-w-md mx-auto py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transform transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Generating... {progress}%
                    </>
                  ) : (
                    <>
                      <Gem size={18} />
                      {t.common.generate}
                    </>
                  )}
                </button>
            </div>
          </>
        ) : (
          <>
            {/* Standard/Clothing Mode Layout: 3 Columns */}
            
            {/* Column 1: Left Input */}
            <div className="bg-white dark:bg-surface rounded-2xl p-6 flex flex-col gap-4 shadow-sm border border-slate-100 dark:border-border">
               <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">
                   {selectedMode === 'clothing' ? t.clothing.garmentTitle : t.standard.productTitle}
               </h3>
               
               <p className="text-xs text-slate-400 leading-relaxed">
                   {selectedMode === 'clothing' ? t.clothing.garmentDesc : t.standard.productDesc}
               </p>

               {selectedMode === 'clothing' && (
                   <div className="flex gap-4 my-2">
                       {renderRadio('top', t.clothing.types.top)}
                       {renderRadio('bottom', t.clothing.types.bottom)}
                       {renderRadio('full', t.clothing.types.full)}
                   </div>
               )}

               {renderUploadBox(
                 selectedMode === 'clothing' ? garmentImage : productImage,
                 selectedMode === 'clothing' ? 'garment' : 'product',
                 selectedMode === 'clothing' ? t.clothing.uploadGarment : t.standard.uploadProduct,
                 selectedMode === 'clothing' ? garmentInputRef : productInputRef
               )}
            </div>

            {/* Column 2: Middle Input / Config */}
            <div className="bg-white dark:bg-surface rounded-2xl p-6 flex flex-col gap-4 shadow-sm border border-slate-100 dark:border-border">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">
                   {selectedMode === 'clothing' ? t.clothing.modelTitle : t.standard.areaTitle}
                </h3>
                
                {selectedMode === 'standard' && (
                   <p className="text-xs text-slate-400 leading-relaxed">{t.standard.areaDesc}</p>
                )}

                {renderUploadBox(
                  selectedMode === 'clothing' ? modelImage : templateImage,
                  selectedMode === 'clothing' ? 'model' : 'template',
                  selectedMode === 'clothing' ? t.clothing.uploadModel : t.standard.uploadTemplate,
                  selectedMode === 'clothing' ? modelInputRef : templateInputRef
                )}

                {selectedMode === 'standard' && (
                  <>
                    <button 
                      onClick={() => setShowTemplateModal(true)}
                      className="w-full py-3 rounded-xl border border-slate-200 dark:border-border text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-surface transition-colors mt-2"
                    >
                      {t.standard.selectTemplate}
                    </button>
                    
                    {selectedTemplate && (
                      <div className="mt-2 p-2 border border-indigo-200 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                          已选择: {selectedTemplate.templateName}
                        </p>
                      </div>
                    )}

                    <div className="mt-2">
                      <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">
                        生成数量: {generatingCount}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="4"
                        value={generatingCount}
                        onChange={(e) => setGeneratingCount(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>1</span>
                        <span>4</span>
                      </div>
                    </div>
                  </>
                )}

                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || 
                    (selectedMode === 'clothing' ? (!garmentImage || !modelImage) : (!productImage || (!templateImage && !selectedTemplate)))}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transform transition-transform active:scale-95 flex items-center justify-center gap-2 mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Generating... {progress}%
                    </>
                  ) : (
                    <>
                      <Gem size={18} />
                      {t.common.generate}
                    </>
                  )}
                </button>
            </div>
          </>
        )}

        {/* Column 3: Output (Common for all modes) */}
        <div className="bg-white dark:bg-surface rounded-2xl p-6 flex flex-col shadow-sm border border-slate-100 dark:border-border">
           <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-6">{t.common.resultTitle}</h3>
           
           {isGenerating ? (
             <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-surface/30 rounded-xl border-2 border-dashed border-slate-100 dark:border-border relative overflow-hidden min-h-[300px]">
               <div className="flex flex-col items-center gap-4">
                 <Loader2 size={48} className="animate-spin text-indigo-600" />
                 <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                   AI正在生成中... {progress}%
                 </p>
               </div>
             </div>
           ) : generatedImages.length > 0 ? (
             <div className="flex-1 overflow-y-auto custom-scrollbar">
               <div className="grid grid-cols-1 gap-4">
                 {generatedImages.map((img) => (
                   <div key={img.key} className="relative group border-2 border-slate-200 dark:border-border rounded-xl overflow-hidden">
                     <img src={img.url} alt="Generated" className="w-full h-auto object-contain" />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                       <a
                         href={img.url}
                         download
                         target="_blank"
                         rel="noopener noreferrer"
                         className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors"
                         title="Download"
                       >
                         <Download size={20} />
                       </a>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-surface/30 rounded-xl border-2 border-dashed border-slate-100 dark:border-border relative overflow-hidden min-h-[300px]">
               <div className="relative z-10 flex flex-col items-center gap-4 text-center max-w-xs">
                 <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center shadow-inner">
                   <Palette size={40} className="text-amber-500" />
                 </div>
                 <p className="text-sm text-slate-400 leading-relaxed font-medium">
                   {t.common.resultPlaceholder}
                 </p>
               </div>
               
               {/* Decorative circles */}
               <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-50 dark:bg-indigo-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70"></div>
               <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-50 dark:bg-purple-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70"></div>
             </div>
           )}
        </div>

      </div>
      
    </div>
  );
};

export default StyleTransferPage;
