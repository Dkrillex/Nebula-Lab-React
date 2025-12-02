import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Upload, X, Download, Image as ImageIcon, Loader2, Check, Trash2, Sparkles, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { clothingExtractionService, ClothingExtractionTaskResult } from '../../../services/clothingExtractionService';
import { uploadService } from '../../../services/uploadService';
import { assetsService, AdsAssetsVO } from '../../../services/assetsService';
import { useAuthStore } from '../../../stores/authStore';
import { showAuthModal } from '../../../lib/authModalManager';
import AddMaterialModal from '../../../components/AddMaterialModal';
import BaseModal from '../../../components/BaseModal';
import toast from 'react-hot-toast';
import { createTaskPoller, PollingController } from '../../../utils/taskPolling';

type TemplateType = 'full_outfit' | 'top_front' | 'bottom_front' | 'custom';

interface GeneratedImage {
  url: string;
  imageId?: string;
}

interface ClothingExtractionPageProps {
  t?: any;
}

const ClothingExtractionPage: React.FC<ClothingExtractionPageProps> = ({ t }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const taskId = searchParams.get('taskId') || '';

  // States
  const [uploadedImage, setUploadedImage] = useState<{ file: File; url: string; fileId?: string } | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('top_front');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatingCount, setGeneratingCount] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskResult, setTaskResult] = useState<ClothingExtractionTaskResult | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [selectedImageForMaterial, setSelectedImageForMaterial] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showImageRulesModal, setShowImageRulesModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [portfolioAssets, setPortfolioAssets] = useState<AdsAssetsVO[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [freeTrialCount, setFreeTrialCount] = useState(18); // 免费试用次数
  const [showAllTasksModal, setShowAllTasksModal] = useState(false);
  const [showTemplateMoreModal, setShowTemplateMoreModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollerRef = useRef<PollingController | null>(null);

  // Example images for "Try it out" section
  const exampleImages = [
    { url: '/demo/product.webp', label: 'Example 1' },
    { url: '/demo/product.webp', label: 'Example 2' },
    { url: '/demo/product.webp', label: 'Example 3' },
    { url: '/demo/product.webp', label: 'Example 4' },
  ];

  // Example showcase data (原图 -> 生成图对比)
  const exampleShowcase = {
    original: '/demo/product.webp',
    generated: '/demo/product.webp',
  };

  // Excellent cases data (优秀案例) - 使用最近任务或示例数据
  const excellentCases = (() => {
    const fromTasks = recentTasks
      .filter(task => task.resultImages && task.resultImages.length > 0)
      .slice(0, 12)
      .map(task => ({
        id: task.taskId,
        original: task.imageUrl,
        generated: Array.isArray(task.resultImages) ? task.resultImages[0] : task.resultImages,
      }));
    
    // 如果没有任务数据，使用示例数据
    if (fromTasks.length === 0) {
      return [
        { id: '1', original: '/demo/product.webp', generated: '/demo/product.webp' },
        { id: '2', original: '/demo/product.webp', generated: '/demo/product.webp' },
        { id: '3', original: '/demo/product.webp', generated: '/demo/product.webp' },
        { id: '4', original: '/demo/product.webp', generated: '/demo/product.webp' },
        { id: '5', original: '/demo/product.webp', generated: '/demo/product.webp' },
        { id: '6', original: '/demo/product.webp', generated: '/demo/product.webp' },
      ];
    }
    
    return fromTasks;
  })();

  // Template options
  const templateOptions = [
    { id: 'full_outfit' as TemplateType, label: '整套穿搭', icon: '👔' },
    { id: 'top_front' as TemplateType, label: '上装正面', icon: '👕' },
    { id: 'bottom_front' as TemplateType, label: '下装正面', icon: '👖' },
    { id: 'custom' as TemplateType, label: '自定义', icon: '✨' },
  ];

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    if (!isAuthenticated) {
      showAuthModal();
      return;
    }

    // 验证文件大小 (20KB ~ 15MB)
    if (file.size < 20 * 1024) {
      toast.error('文件大小不能小于20KB');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error('文件大小不能超过15MB');
      return;
    }

    const url = URL.createObjectURL(file);
    setUploadedImage({ file, url });

    // 验证图片分辨率
    const img = new Image();
    img.onload = async () => {
      if (img.width < 400 || img.height < 400) {
        toast.error('图片分辨率必须大于400*400');
        setUploadedImage(null);
        URL.revokeObjectURL(url);
        return;
      }

      // 验证通过后上传文件
      try {
        const uploadResult = await uploadService.uploadFile(file);
        setUploadedImage(prev => prev ? { ...prev, fileId: uploadResult.ossId } : null);
        toast.success('图片上传成功');
      } catch (error: any) {
        toast.error(error.message || '图片上传失败');
        setUploadedImage(null);
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      toast.error('无法读取图片，请检查文件格式');
      setUploadedImage(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollerRef.current) {
      pollerRef.current.stop();
      pollerRef.current = null;
    }
  }, []);

  // Start polling
  const startPolling = useCallback((currentTaskId: string) => {
    if (!currentTaskId) return;

    stopPolling();
    setIsGenerating(true);
    setProgress(0);

    const poller = createTaskPoller<ClothingExtractionTaskResult>({
      request: async () => {
        const res = await clothingExtractionService.queryExtraction(currentTaskId);
        return res.result || res;
      },
      parseStatus: data => data?.taskStatus,
      onProgress: value => setProgress(value),
      onSuccess: resultData => {
        setProgress(100);
        setIsGenerating(false);
        setTaskResult(resultData);
        
        const images = resultData.resultImages || resultData.images || [];
        setGeneratedImages(images.map((img: any) => ({
          url: typeof img === 'string' ? img : img.url,
          imageId: img.imageId
        })));
        
        stopPolling();
        toast.success('生成完成！');
      },
      onFailure: resultData => {
        setIsGenerating(false);
        toast.error(resultData?.errorMsg || '生成失败');
        stopPolling();
      },
      onTimeout: () => {
        setIsGenerating(false);
        toast.error('任务超时，请稍后重试');
        stopPolling();
      },
      onError: error => {
        console.error('轮询查询失败:', error);
        setIsGenerating(false);
        toast.error('查询任务状态失败，请稍后重试');
        stopPolling();
      },
      intervalMs: 10_000,
      progressMode: 'medium',
      initialProgress: 0,
    });

    pollerRef.current = poller;
    poller.start();
  }, [stopPolling]);

  // Handle generate
  const handleGenerate = async () => {
    if (!isAuthenticated) {
      showAuthModal();
      return;
    }

    if (!uploadedImage?.fileId) {
      toast.error('请先上传图片');
      return;
    }

    if (selectedTemplate === 'custom' && !customPrompt.trim()) {
      toast.error('请输入自定义模板描述');
      return;
    }

    if (generatingCount < 1 || generatingCount > 4) {
      toast.error('生成数量必须在1-4之间');
      return;
    }

    try {
      setIsGenerating(true);
      setProgress(0);
      setTaskResult(null);
      setGeneratedImages([]);

      const params = {
        imageFileId: uploadedImage.fileId,
        templateType: selectedTemplate,
        customPrompt: selectedTemplate === 'custom' ? customPrompt : undefined,
        generatingCount,
        score: '1', // Default score, adjust as needed
      };

      const res = await clothingExtractionService.submitExtraction(params);
      const resultData = res.result || res;

      if (resultData?.taskId) {
        startPolling(resultData.taskId);
        // Update URL with taskId
        navigate(`/create/clothing-extraction?taskId=${resultData.taskId}`, { replace: true });
      } else {
        throw new Error(res.msg || res.message || '任务提交失败');
      }
    } catch (error: any) {
      setIsGenerating(false);
      toast.error(error.message || '生成失败');
    }
  };

  // Handle example image click
  const handleExampleClick = (exampleUrl: string) => {
    // Load example image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(async (blob) => {
            if (blob) {
              const file = new File([blob], 'example.jpg', { type: 'image/jpeg' });
              await handleFileSelect(file);
            }
          }, 'image/jpeg');
        }
      } catch (error) {
        toast.error('加载示例图片失败');
      }
    };
    img.onerror = () => {
      toast.error('加载示例图片失败');
    };
    img.src = exampleUrl;
  };

  // Handle select from portfolio
  const handleSelectFromPortfolio = async () => {
    if (!isAuthenticated) {
      showAuthModal();
      return;
    }

    setShowPortfolioModal(true);
    setPortfolioLoading(true);
    try {
      const response = await assetsService.getAssetsList({
        pageNum: 1,
        pageSize: 50,
        dataType: 1, // 文件类型
      });
      
      const assets = Array.isArray(response) 
        ? response 
        : (response as any)?.rows || [];
      
      // 过滤出图片类型
      const imageAssets = assets.filter((asset: AdsAssetsVO) => {
        const url = asset.assetUrl || asset.coverUrl || asset.thumbnailUrl || '';
        return url.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
      });
      
      setPortfolioAssets(imageAssets);
    } catch (error: any) {
      console.error('获取素材列表失败:', error);
      toast.error('获取素材列表失败，请重试');
    } finally {
      setPortfolioLoading(false);
    }
  };

  // Handle select asset from portfolio
  const handleSelectAsset = async (asset: AdsAssetsVO) => {
    const imageUrl = asset.assetUrl || asset.coverUrl || asset.thumbnailUrl || '';
    if (!imageUrl) {
      toast.error('该素材没有有效的图片URL');
      return;
    }

    setShowPortfolioModal(false);
    
    try {
      // 从URL获取图片并转换为File
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], asset.assetName || 'selected-image.jpg', { type: blob.type });
      await handleFileSelect(file);
      toast.success('已选择素材');
    } catch (error: any) {
      console.error('加载素材失败:', error);
      toast.error('加载素材失败，请重试');
    }
  };

  // Handle one-click similar (一键做同款)
  const handleOneClickSimilar = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'similar-image.jpg', { type: blob.type });
      await handleFileSelect(file);
    } catch (error) {
      toast.error('加载图片失败');
    }
  };

  // Load recent tasks
  useEffect(() => {
    const loadRecentTasks = async () => {
      try {
        const res = await clothingExtractionService.getRecentTasks({ pageNo: 1, pageSize: 10 });
        if (res.result?.data) {
          setRecentTasks(res.result.data);
        }
      } catch (error) {
        console.error('加载最近任务失败:', error);
      }
    };
    loadRecentTasks();
  }, []);

  // Handle taskId from URL
  useEffect(() => {
    if (taskId && !taskResult) {
      startPolling(taskId);
    }
  }, [taskId, startPolling, taskResult]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
      {/* Header */}
      <div className="w-full border-b border-border bg-card/50 backdrop-blur-sm z-10">
        <div className="px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-foreground">从任意图中提取商品平铺图</h1>
            <p className="text-xs text-muted-foreground mt-1 opacity-90">上传任意图片，即可提取商品平铺图</p>
          </div>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
            教程
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel - Settings */}
        <div className="w-full md:w-[400px] lg:w-[450px] bg-surface border-r border-border flex flex-col p-6 overflow-y-auto custom-scrollbar">
          {/* Image Upload Area */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground">上传图片</h3>
              <button 
                onClick={() => setShowImageRulesModal(true)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                图片规则
              </button>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                uploadedImage
                  ? 'border-border'
                  : 'border-border hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-100/50 dark:bg-slate-800/50'
              }`}
            >
              {uploadedImage ? (
                <div className="relative">
                  <img
                    src={uploadedImage.url}
                    alt="Uploaded"
                    className="max-h-96 mx-auto rounded-lg object-contain"
                  />
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setTaskResult(null);
                      setGeneratedImages([]);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <p className="text-foreground mb-2 font-medium">
                    拖拽图片到此处或点击上传
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    图片大小20K~15M，分辨率大于400*400<br />
                    支持 JPG、PNG、WEBP 格式
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                    >
                      从本地上传
                    </button>
                    <button
                      onClick={handleSelectFromPortfolio}
                      className="px-4 py-2 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-600 transition text-sm"
                    >
                      从作品选择
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </>
              )}
            </div>

            {/* Try it out examples */}
            {!uploadedImage && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">试一试</p>
                <div className="grid grid-cols-4 gap-2">
                  {exampleImages.map((example, index) => (
                    <div
                      key={index}
                      onClick={() => handleExampleClick(example.url)}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-border hover:border-indigo-500 transition"
                    >
                      <img
                        src={example.url}
                        alt={example.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Example Showcase (示例转换展示) */}
            {!uploadedImage && (
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p className="text-sm text-muted-foreground mb-3 text-center">
                  上传任意图片,即可提取商品平铺图
                </p>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-2">上传原图</p>
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border">
                      <img
                        src={exampleShowcase.original}
                        alt="Original"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <ArrowRight className="text-indigo-600 flex-shrink-0" size={24} />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-2">生成平铺图</p>
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border bg-white">
                      <img
                        src={exampleShowcase.generated}
                        alt="Generated"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleOneClickSimilar(exampleShowcase.original)}
                  className="w-full py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition text-sm font-medium"
                >
                  一键做同款
                </button>
              </div>
            )}
          </div>

          {/* Template Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground">模板</h3>
              <button 
                onClick={() => setShowTemplateMoreModal(true)}
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                更多&gt;
              </button>
            </div>

              <div className="grid grid-cols-4 gap-3 mb-4">
                {templateOptions.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      // 当选择自定义模板时，设置默认文案
                      if (template.id === 'custom' && !customPrompt) {
                        setCustomPrompt('提取图中的【羽绒背心】并整齐地摆放在纯白色背景上，适用于电商展示');
                      }
                    }}
                    className={`relative p-4 rounded-lg border-2 transition ${
                      selectedTemplate === template.id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{template.icon}</div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {template.label}
                    </div>
                    {selectedTemplate === template.id && (
                      <div className="absolute top-2 right-2">
                        <Check className="text-indigo-600" size={20} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Template Input */}
              {selectedTemplate === 'custom' && (
                <div className="mt-4">
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="提取图中的【商品名称】并整齐地摆放在纯白色背景上, 适用于电商展示"
                    className="w-full h-24 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {customPrompt.length}/500
                    </span>
                    <button
                      onClick={() => setCustomPrompt('')}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Generation Settings */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                生成张数 (1-4张)
              </label>
              <input
                type="number"
                min={1}
                max={4}
                value={generatingCount}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= 4) {
                    setGeneratingCount(value);
                  }
                }}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Fixed Generate Button at Bottom */}
            <div className="mt-auto pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <button 
                  onClick={() => setShowAllTasksModal(true)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  全部任务 &gt;
                </button>
                <p className="text-xs text-muted-foreground text-center">
                  绘蛙持续调优中 请谨慎鉴别生成结果
                </p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={!uploadedImage?.fileId || isGenerating || (selectedTemplate === 'custom' && !customPrompt.trim())}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:from-red-700 hover:to-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>生成中... {progress}%</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>免费试用 剩余{freeTrialCount}次</span>
                  </>
                )}
              </button>
            </div>
          </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-8 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">
              {generatedImages.length > 0 ? '生成结果' : '优秀案例'}
            </h2>
          </div>

          {/* Main Preview Area */}
          <div className="w-full h-[450px] shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 mb-6 relative overflow-hidden">
            {isGenerating && progress > 0 ? (
              <div className="flex flex-col items-center gap-4 z-10">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                <p className="text-indigo-600 font-medium">生成中... {progress}%</p>
              </div>
            ) : generatedImages.length > 0 ? (
              <div className="relative w-full h-full flex items-center justify-center p-4">
                <div className="grid grid-cols-2 gap-4 w-full h-full">
                  {generatedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded z-10">
                        模板{index + 1}
                      </div>
                      <img
                        src={img.url}
                        alt={`Generated ${index + 1}`}
                        className="w-full h-full object-contain rounded-lg bg-white"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 rounded-lg">
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = img.url;
                            link.download = `extracted-product-${index + 1}.jpg`;
                            link.click();
                          }}
                          className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors"
                          title="下载"
                        >
                          <Download size={20} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedImageForMaterial(img.url);
                            setShowMaterialModal(true);
                          }}
                          className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors"
                          title="添加到素材库"
                        >
                          <ImageIcon size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-400">
                <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                  <ImageIcon size={40} className="text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-sm max-w-xs text-center">上传图片并生成，查看结果</p>
              </div>
            )}
          </div>

          {/* Excellent Cases Grid */}
          {generatedImages.length === 0 && excellentCases.length > 0 && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {excellentCases.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    className="relative group bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-square">
                      <img
                        src={caseItem.generated}
                        alt="Generated"
                        className="w-full h-full object-contain bg-white"
                      />
                      {/* 原图缩略图覆盖 */}
                      <div className="absolute bottom-2 left-2 w-16 h-16 rounded border-2 border-white shadow-md overflow-hidden">
                        <img
                          src={caseItem.original}
                          alt="Original"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="p-3">
                      <button
                        onClick={() => handleOneClickSimilar(caseItem.original)}
                        className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                      >
                        做同款
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History Thumbs / Recent Tasks */}
          {generatedImages.length > 0 ? (
            <div className="h-24 flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {generatedImages.map((img, index) => (
                <div
                  key={index}
                  className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-indigo-300 transition-all"
                >
                  <img src={img.url} alt="History" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : recentTasks.length > 0 && excellentCases.length === 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">最近任务</h3>
              <div className="h-24 flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {recentTasks.slice(0, 8).map((task) => (
                  <div
                    key={task.taskId}
                    onClick={() => navigate(`/create/clothing-extraction?taskId=${task.taskId}`)}
                    className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-indigo-300 transition-all"
                  >
                    <img src={task.imageUrl} alt="Task" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Add Material Modal */}
      <AddMaterialModal
        isOpen={showMaterialModal}
        onClose={() => {
          setShowMaterialModal(false);
          setSelectedImageForMaterial(null);
        }}
        onSuccess={() => {
          toast.success('已添加到素材库');
          setShowMaterialModal(false);
          setSelectedImageForMaterial(null);
        }}
        initialData={{
          assetName: `商品提取_${new Date().toISOString().slice(0, 10)}`,
          assetTag: `商品提取_${new Date().toISOString().slice(0, 10)}`,
          assetDesc: `商品提取_${new Date().toISOString().slice(0, 10)}`,
          assetUrl: selectedImageForMaterial || '',
          assetType: 1, // Image type
        }}
        disableAssetTypeSelection={true}
        isImportMode={true}
      />

      {/* Portfolio Selection Modal */}
      <BaseModal
        isOpen={showPortfolioModal}
        onClose={() => setShowPortfolioModal(false)}
        title="从作品选择"
        width="max-w-4xl"
      >
        <div className="space-y-4">
          {portfolioLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin" size={24} />
              <span className="ml-2 text-muted-foreground">加载中...</span>
            </div>
          ) : portfolioAssets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              暂无素材，请先上传图片
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {portfolioAssets.map((asset) => {
                const imageUrl = asset.assetUrl || asset.coverUrl || asset.thumbnailUrl || '';
                if (!imageUrl) return null;
                
                return (
                  <div
                    key={asset.id}
                    onClick={() => handleSelectAsset(asset)}
                    className="relative aspect-square rounded-lg overflow-hidden border border-border cursor-pointer hover:border-indigo-500 transition-colors group"
                  >
                    <img 
                      src={imageUrl} 
                      alt={asset.assetName || '素材'} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium">
                        选择
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </BaseModal>

      {/* All Tasks Modal */}
      <BaseModal
        isOpen={showAllTasksModal}
        onClose={() => setShowAllTasksModal(false)}
        title="全部任务"
        width="max-w-6xl"
      >
        <div className="p-6">
          {recentTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              暂无任务记录
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {recentTasks.map((task) => (
                <div
                  key={task.taskId}
                  onClick={() => {
                    setShowAllTasksModal(false);
                    navigate(`/create/clothing-extraction?taskId=${task.taskId}`);
                  }}
                  className="relative aspect-square rounded-lg overflow-hidden border border-border cursor-pointer hover:border-indigo-500 transition-colors group"
                >
                  <img
                    src={task.imageUrl}
                    alt="Task"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium">
                      查看详情
                    </div>
                  </div>
                  {task.status && (
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                      {task.status === 'success' ? '已完成' : task.status === 'running' ? '进行中' : '待处理'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </BaseModal>

      {/* Template More Modal */}
      <BaseModal
        isOpen={showTemplateMoreModal}
        onClose={() => setShowTemplateMoreModal(false)}
        title="更多模板"
        width="max-w-4xl"
      >
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'dress_front', label: '连衣裙正面', icon: '👗' },
              { id: 'dress_back', label: '连衣裙背面', icon: '👗' },
              { id: 'onesie_front', label: '连体衣正面', icon: '👶' },
              { id: 'onesie_back', label: '连体衣背面', icon: '👶' },
              { id: 'top_back', label: '上装背面', icon: '👔' },
              { id: 'bottom_back', label: '下装背面', icon: '👖' },
              { id: 'shoes', label: '鞋靴', icon: '👟' },
              { id: 'bag', label: '包包', icon: '👜' },
              { id: 'necklace', label: '项链', icon: '💎' },
              { id: 'earrings', label: '耳饰', icon: '✨' },
              { id: 'bracelet', label: '手饰', icon: '⌚' },
              { id: 'hat', label: '帽子', icon: '👒' },
            ].map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  toast(`模板 "${template.label}" 功能开发中`, { icon: 'ℹ️' });
                  setShowTemplateMoreModal(false);
                }}
                className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition text-center"
              >
                <div className="text-3xl mb-2">{template.icon}</div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {template.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </BaseModal>

      {/* Image Rules Modal */}
      <BaseModal
        isOpen={showImageRulesModal}
        onClose={() => setShowImageRulesModal(false)}
        title="请按规则上传图片,以达到最佳效果"
        width="max-w-5xl"
      >
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Rules */}
          <div className="mb-6">
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p>• 图片大小20KB~15MB之间</p>
              <p>• 分辨率大于400*400</p>
              <p>• 格式支持jpg/jpeg/png/webp</p>
            </div>
          </div>

          {/* Good Examples */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">正确示例</h4>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[
                { label: '服装', image: '/demo/product.webp' },
                { label: '鞋靴', image: '/demo/product.webp' },
                { label: '眼镜', image: '/demo/product.webp' },
                { label: '沙发', image: '/demo/product.webp' },
                { label: '杯子', image: '/demo/product.webp' },
              ].map((example, index) => (
                <div key={index} className="flex-shrink-0 w-48">
                  <div className="relative mb-2">
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                      <img
                        src={example.image}
                        alt={example.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                      <CheckCircle size={20} className="text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-center text-gray-700 dark:text-gray-300 mb-2">{example.label}</p>
                  <button className="w-full py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                    试一试
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bad Examples */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              小贴士:请勿上传以下错误图片,会极大影响生成效果
            </h4>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[
                { label: '商品被遮挡', image: '/demo/product.webp' },
                { label: '商品不清晰', image: '/demo/product.webp' },
                { label: '拍摄灯光暗', image: '/demo/product.webp' },
              ].map((example, index) => (
                <div key={index} className="flex-shrink-0 w-48">
                  <div className="relative mb-2">
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                      <img
                        src={example.image}
                        alt={example.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1">
                      <XCircle size={20} className="text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-center text-gray-700 dark:text-gray-300">{example.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </BaseModal>
    </div>
  );
};

export default ClothingExtractionPage;

