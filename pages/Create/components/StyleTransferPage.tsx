import React, { useState, useRef, useEffect } from 'react';
import { Upload, Target, Sparkles, Shirt, Gem, Palette, Wand2, Image as ImageIcon, X, Loader2, Download, Check, AlertCircle } from 'lucide-react';
import { styleTransferService, AnyShootTaskResult, Template } from '../../../services/styleTransferService';
import { uploadService } from '../../../services/uploadService';
import { avatarService } from '../../../services/avatarService';
import { textToImageService } from '../../../services/textToImageService';
import { request } from '../../../lib/request';
import TemplateSelectModal from './TemplateSelectModal';
import ProductCanvas from './ProductCanvas';
import MaskCanvas, { MaskCanvasRef } from './MaskCanvas';
import UploadComponent from '../../../components/UploadComponent';

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
  key: number;
  url: string;
  revised_prompt?: string;
  b64_json?: string;
  previewVisible?: boolean;
}

const StyleTransferPage: React.FC<StyleTransferPageProps> = ({ t }) => {
  const [selectedMode, setSelectedMode] = useState<'standard' | 'creative' | 'clothing'>('standard');
  const [clothingType, setClothingType] = useState<'top' | 'bottom' | 'full'>('top');
  const [prompt, setPrompt] = useState('');
  const [generatingCount, setGeneratingCount] = useState(1);
  const [location, setLocation] = useState<number[][]>([]);
  
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
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  // Masking (Standard Mode)
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
  const garmentInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Updated Text Constants matching Vue version
  const TEXTS = {
    standard: {
      desc: '精确控制产品位置和形状',
      productDesc: '高清图片效果最佳\n格式:jpg/jpeg/png/webp; 文件大小<10MB',
      areaDesc: '使用笔刷画出遮罩标记产品替换后需要发生变化的区域',
      templateUpload: '上传模板图片\n(png, jpg, jpeg, webp)',
      areaTitle: '画出您想要替换的区域'
    },
    creative: {
      desc: '选中区域物品变化转换'
    },
    clothing: {
      desc: '服装快速替换'
    }
  };

  const modes = [
    { id: 'standard', icon: Target, title: t.modes.standard.title, desc: TEXTS.standard.desc },
    { id: 'creative', icon: Sparkles, title: t.modes.creative.title, desc: TEXTS.creative.desc },
    { id: 'clothing', icon: Shirt, title: t.modes.clothing.title, desc: TEXTS.clothing.desc },
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

  // 上传图片到TopView OSS
  const uploadImageToOss = async (image: UploadedImage): Promise<UploadedImage> => {
    if (image.fileId) return image;
    if (!image.file) throw new Error('No file object found');

    // Use TopView Upload API (via avatarService.getUploadCredential)
    let fileType = image.file.type.split('/')[1] || 'jpg';
    if (fileType === 'mpeg') fileType = 'mp3';
    if (fileType === 'quicktime') fileType = 'mp4';

    console.log('准备获取上传凭证, fileType:', fileType);
    const credRes = await avatarService.getUploadCredential(fileType);
    console.log('上传凭证响应:', credRes);
    
    // TopView API 返回的 code 是字符串类型,成功时为 "200"
    if (!credRes || !credRes.result || credRes.code !== '200') {
      console.error('获取上传凭证失败:', credRes);
      throw new Error(credRes?.message || 'Failed to get upload credentials');
    }

    const { uploadUrl, fileName, fileId, format } = credRes.result;
    console.log('准备上传文件:', { fileName, fileId, format, fileSize: image.file.size });

    // PUT file to uploadUrl
    // 在开发环境使用代理避免 CORS 问题
    let finalUploadUrl = uploadUrl;
    if (import.meta.env.DEV) {
      // 替换 S3 域名为代理路径
      finalUploadUrl = uploadUrl.replace('https://aigc.s3-accelerate.amazonaws.com', '/s3-upload');
      console.log('使用代理上传:', finalUploadUrl);
    }
    
    const uploadRes = await fetch(finalUploadUrl, {
      method: 'PUT',
      body: image.file,
      headers: {
        'Content-Type': image.file.type
      }
    });

    console.log('上传响应状态:', uploadRes.status, uploadRes.statusText);
    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error('上传失败详情:', errorText);
      throw new Error(`Upload failed: ${uploadRes.status} ${uploadRes.statusText}. Details: ${errorText}`);
    }

    console.log('文件上传成功:', { fileId, fileName });

    return {
      ...image,
      fileId: fileId,
      fileName: fileName,
      // Use original blob URL for preview, actual URL from CDN may differ
      fileUrl: image.fileUrl
    };
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

  // 试用示例
  const handleTryExample = async () => {
    try {
      // Load product image
      const productRes = await fetch('/demo/product.webp');
      const productBlob = await productRes.blob();
      const productFile = new File([productBlob], 'demo-product.webp', { type: 'image/webp' });
      handleImageUpload(productFile, 'product');

      if (selectedMode === 'standard') {
        // Load template image for standard mode
        const templateRes = await fetch('/demo/template.png');
        const templateBlob = await templateRes.blob();
        const templateFile = new File([templateBlob], 'demo-template.png', { type: 'image/png' });
        handleImageUpload(templateFile, 'template');
      } else if (selectedMode === 'creative') {
        setPrompt('把框选的东西变成黄色');
      }
    } catch (error) {
      console.error('Failed to load demo assets:', error);
      setErrorMessage('加载示例图片失败，请确保assets目录正确');
    }
  };

  // 轮询任务状态
  const startPolling = (taskId: string, mode: 'standard' | 'creative' | 'clothing') => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);
    
    console.log('开始轮询任务:', taskId, '模式:', mode);
    
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
        
        console.log('轮询查询结果:', res);
        
        // requestClient 已处理外层,返回格式:
        // TopView: { result: { taskId, status, anyfitImages: [...] } }
        // 或其他: { taskId, status, ... }
        let taskResult;
        if (res.result) {
          // TopView 格式: { result: {...} }
          taskResult = res.result;
        } else {
          // 直接格式
          taskResult = res;
        }
        
        const status = taskResult.status;
        console.log('任务状态:', status);
        
        if (status === 'running' || status === 'init' || status === 'in_queue' || status === 'generating') {
          // 任务进行中,更新进度
          if (progress < 80) {
            setProgress(prev => Math.min(80, prev + Math.floor(Math.random() * 10) + 5));
          } else if (progress < 90) {
            setProgress(prev => Math.min(90, prev + Math.floor(Math.random() * 5) + 1));
          }
          // 继续轮询
        } else if (status === 'success' || status === 'succeeded' || status === 'done') {
          // 任务成功完成
          if (pollingInterval.current) clearInterval(pollingInterval.current);
          if (progressInterval.current) clearInterval(progressInterval.current);
          setProgress(100);
          
          console.log('任务完成,处理结果...');
          
          // 处理结果图片 - 兼容多种返回格式
          let images: GeneratedImage[] = [];
          
          if (taskResult.anyfitImages && Array.isArray(taskResult.anyfitImages)) {
            // 标准模式返回格式
            images = taskResult.anyfitImages.map((item: any, index: number) => ({
              key: item.key || index + 1,
              url: item.url,
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
          
          console.log('生成的图片:', images);
          setGeneratedImages(images);
          
          // 延迟重置生成状态,让用户看到 100% 进度
          setTimeout(() => {
            setIsGenerating(false);
          }, 1000);
          
        } else if (status === 'fail' || status === 'failed' || status === 'error') {
          // 任务失败
          if (pollingInterval.current) clearInterval(pollingInterval.current);
          if (progressInterval.current) clearInterval(progressInterval.current);
          setIsGenerating(false);
          setProgress(0);
          const errorMsg = taskResult.errorMsg || taskResult.error || taskResult.message || 'Generation failed';
          console.error('任务失败:', errorMsg);
          setErrorMessage(errorMsg);
        }
      } catch (error) {
        console.error('轮询查询出错:', error);
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

        // Optimize: Parallel Uploads using Promise.all
        const uploadPromises = [];

        // 1. Product Image
        uploadPromises.push(uploadImageToOss(productImage).then(res => {
          setProductImage(res);
          return res.fileId;
        }));

        // 2. Template Image
        if (templateImage && !templateImage.fileId) {
          uploadPromises.push(uploadImageToOss(templateImage).then(res => {
            setTemplateImage(res);
            return res.fileId;
          }));
        } else {
          uploadPromises.push(Promise.resolve(templateImage?.fileId));
        }

        // 3. Product Mask (if canvas active)
        if (productMaskCanvasRef.current) {
          uploadPromises.push(productMaskCanvasRef.current.getMask().then(async (maskBlob) => {
            if (maskBlob) {
              const maskFile = new File([maskBlob], 'product_mask.png', { type: 'image/png' });
              console.log('准备上传产品蒙版, size:', maskFile.size);
              
              // Use TopView upload for mask
              const credRes = await avatarService.getUploadCredential('png');
              if (credRes.code === '200' && credRes.result) {
                const { uploadUrl, fileId } = credRes.result;
                console.log('产品蒙版上传凭证获取成功:', fileId);
                
                // 使用代理上传(开发环境)
                let finalUploadUrl = uploadUrl;
                if (import.meta.env.DEV) {
                  finalUploadUrl = uploadUrl.replace('https://aigc.s3-accelerate.amazonaws.com', '/s3-upload');
                }
                
                const uploadRes = await fetch(finalUploadUrl, {
                  method: 'PUT',
                  body: maskFile,
                  headers: { 'Content-Type': 'image/png' }
                });
                
                if (uploadRes.ok) {
                  console.log('产品蒙版上传成功:', fileId);
                  return fileId;
                } else {
                  console.error('产品蒙版上传失败:', uploadRes.status);
                }
              }
            }
            return undefined;
          }));
        } else {
          uploadPromises.push(Promise.resolve(undefined));
        }

        // 4. Template Mask (if canvas active)
        if (templateMaskCanvasRef.current) {
          uploadPromises.push(templateMaskCanvasRef.current.getMask().then(async (maskBlob) => {
            if (maskBlob) {
              const maskFile = new File([maskBlob], 'template_mask.png', { type: 'image/png' });
              console.log('准备上传模板蒙版, size:', maskFile.size);
              
              // Use TopView upload for mask
              const credRes = await avatarService.getUploadCredential('png');
              if (credRes.code === '200' && credRes.result) {
                const { uploadUrl, fileId } = credRes.result;
                console.log('模板蒙版上传凭证获取成功:', fileId);
                
                // 使用代理上传(开发环境)
                let finalUploadUrl = uploadUrl;
                if (import.meta.env.DEV) {
                  finalUploadUrl = uploadUrl.replace('https://aigc.s3-accelerate.amazonaws.com', '/s3-upload');
                }
                
                const uploadRes = await fetch(finalUploadUrl, {
                  method: 'PUT',
                  body: maskFile,
                  headers: { 'Content-Type': 'image/png' }
                });
                
                if (uploadRes.ok) {
                  console.log('模板蒙版上传成功:', fileId);
                  return fileId;
                } else {
                  console.error('模板蒙版上传失败:', uploadRes.status);
                }
              }
            }
            return undefined;
          }));
        } else {
          uploadPromises.push(Promise.resolve(undefined));
        }

        const [
          productImageFileId, 
          templateImageFileId, 
          productMaskFileId, 
          templateMaskFileId
        ] = await Promise.all(uploadPromises);

        if (!productImageFileId) throw new Error('Failed to upload product image');

        console.log('所有上传完成, 准备提交任务:');
        console.log('- productImageFileId:', productImageFileId);
        console.log('- templateImageFileId:', templateImageFileId);
        console.log('- productMaskFileId:', productMaskFileId);
        console.log('- templateMaskFileId:', templateMaskFileId);

        const submitParams = {
          productImageFileId: productImageFileId!,
          productMaskFileId,
          templateImageFileId,
          templateMaskFileId,
          templateId: selectedTemplate?.templateId,
          generatingCount,
          score: String(generatingCount),
          location: location.length > 0 ? location : undefined
        };
        console.log('提交参数:', submitParams);

        const res = await styleTransferService.submitStandard(submitParams);
        console.log('提交任务响应:', res);

        // requestClient 已处理外层,返回格式:
        // { result: { taskId: '...', status: 'success', ... } }
        // 或者如果有 data 字段: { data: { ... } }
        let taskId;
        if (res.result && res.result.taskId) {
          // TopView 格式: { result: { taskId: ... } }
          taskId = res.result.taskId;
        } else if (res.taskId) {
          // 直接格式
          taskId = res.taskId;
        } else if (res.id) {
          taskId = res.id;
        }

        if (!taskId) {
          console.error('未找到 taskId:', res);
          throw new Error('Task ID not found in response');
        }

        console.log('提交成功, taskId:', taskId);
        startPolling(taskId, 'standard');

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

        // Parallel Uploads for Clothing Mode
        const [uploadedGarment, uploadedModel] = await Promise.all([
          uploadImageToOss(garmentImage),
          uploadImageToOss(modelImage)
        ]);
        
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

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    // If the template has an image URL, we can also set it as templateImage if needed,
    // but usually selectedTemplate object is enough for the API.
    // However, the UI might want to show the template image.
    setShowTemplateModal(false);
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
    inputRef?: React.RefObject<HTMLInputElement> // Optional now
  ) => (
    <UploadComponent
      onFileSelected={(file) => handleImageUpload(file, type)}
      onUploadComplete={() => {}} // Not used directly as we handle upload in generate
      uploadType="oss" // Or 'tv' if needed, but we manually upload in generate
      immediate={false}
      accept="image/png,image/jpeg,image/webp"
      className="h-full min-h-[200px] w-full"
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
                             <p className="text-xs text-slate-400 mt-1 whitespace-pre-line">{TEXTS.standard.productDesc}</p>
                        </div>
                    </div>
                    {renderUploadBox(productImage, 'product', t.creative.uploadProduct, productInputRef)}
                    
                    {/* Try Example Button */}
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={handleTryExample}
                        className="px-6 py-2 bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface transition-colors"
                      >
                        试用示例
                      </button>
                    </div>
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
               
               <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                   {selectedMode === 'clothing' ? t.clothing.garmentDesc : TEXTS.standard.productDesc}
               </p>

               {selectedMode === 'clothing' && (
                   <div className="flex gap-4 my-2">
                       {renderRadio('top', t.clothing.types.top)}
                       {renderRadio('bottom', t.clothing.types.bottom)}
                       {renderRadio('full', t.clothing.types.full)}
                   </div>
               )}

               {selectedMode === 'standard' && productImage ? (
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
                 <div className="flex-1">
                    {renderUploadBox(
                      selectedMode === 'clothing' ? garmentImage : productImage,
                      selectedMode === 'clothing' ? 'garment' : 'product',
                      selectedMode === 'clothing' ? t.clothing.uploadGarment : t.standard.uploadProduct,
                      selectedMode === 'clothing' ? garmentInputRef : productInputRef
                    )}
                 </div>
               )}

               {/* Try Example Button */}
               <div className="mt-auto pt-4 flex justify-center">
                  <button
                    onClick={handleTryExample}
                    className="px-6 py-2 bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface transition-colors w-full"
                  >
                    试用示例
                  </button>
               </div>
            </div>

            {/* Column 2: Middle Input / Config */}
            <div className="bg-white dark:bg-surface rounded-2xl p-6 flex flex-col gap-4 shadow-sm border border-slate-100 dark:border-border">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">
                   {selectedMode === 'clothing' ? t.clothing.modelTitle : TEXTS.standard.areaTitle}
                </h3>
                
                {selectedMode === 'standard' && (
                   <p className="text-xs text-slate-400 leading-relaxed">{TEXTS.standard.areaDesc}</p>
                )}

                {selectedMode === 'standard' && (templateImage || selectedTemplate) ? (
                  <div className="flex flex-col gap-3 flex-1">
                    <div className="flex-1 relative border-2 border-indigo-500 rounded-xl overflow-hidden min-h-[300px]">
                      <MaskCanvas
                        ref={templateMaskCanvasRef}
                        imageUrl={templateImage?.fileUrl || selectedTemplate?.templateImageUrl || ''}
                        tool={templateBrushTool}
                        brushSize={templateBrushSize}
                        className="w-full h-full"
                      />
                      <button
                        onClick={() => {
                          setTemplateImage(null);
                          setSelectedTemplate(null);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-70 hover:opacity-100 transition-opacity z-20"
                      >
                        <X size={14} />
                      </button>
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
                  <div className="flex-1">
                    {renderUploadBox(
                      selectedMode === 'clothing' ? modelImage : templateImage,
                      selectedMode === 'clothing' ? 'model' : 'template',
                      selectedMode === 'clothing' ? t.clothing.uploadModel : TEXTS.standard.templateUpload,
                      selectedMode === 'clothing' ? modelInputRef : templateInputRef
                    )}
                  </div>
                )}

                {selectedMode === 'standard' && (
                  <div className="mt-auto pt-4">
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
                      <button 
                        onClick={() => {
                          setTemplateImage(null);
                          setSelectedTemplate(null);
                          if (templateInputRef.current) templateInputRef.current.value = '';
                        }}
                        className="w-full py-3 rounded-xl border border-slate-200 dark:border-border text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-surface transition-colors mt-2"
                      >
                        重新上传
                      </button>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || 
                    (selectedMode === 'clothing' ? (!garmentImage || !modelImage) : (!productImage || (!templateImage && !selectedTemplate)))}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transform transition-transform active:scale-95 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
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
      
      {/* Template Selection Modal */}
      <TemplateSelectModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelect={handleTemplateSelect}
        selectedTemplateId={selectedTemplate?.templateId}
      />
    </div>
  );
};

export default StyleTransferPage;
