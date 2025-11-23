import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Loader, Image as ImageIcon, PlayCircle, Plus, Trash2, Download, Check } from 'lucide-react';
import { avatarService, ProductAvatar, ProductAvatarCategory } from '../../../services/avatarService';
import UploadComponent from '../../../components/UploadComponent';
import demoProductPng from '@/assets/demo/productImage.png';
import demoUserFacePng from '@/assets/demo/userFaceImage.png';
import { uploadTVFile } from '@/utils/upload';
import toast from 'react-hot-toast';
import AddMaterialModal from '@/components/AddMaterialModal';

interface DigitalHumanProductProps {
  t: any;
  handleFileUpload: (file: File, type: 'image') => Promise<any>; 
  uploading: boolean;
  setErrorMessage: (msg: string | null) => void;
}

interface GeneratedImage {
  id: string;
  url: string;
  timestamp: number;
  addState?: boolean;
}

const DigitalHumanProduct: React.FC<DigitalHumanProductProps> = ({
  t,
  handleFileUpload,
  uploading,
  setErrorMessage
}) => {
  const [categories, setCategories] = useState<ProductAvatarCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(-1);
  const [avatars, setAvatars] = useState<ProductAvatar[]>([]);
  const [loadingAvatars, setLoadingAvatars] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<ProductAvatar | null>(null);
  const [displayedAvatars, setDisplayedAvatars] = useState<ProductAvatar[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const BATCH_SIZE = 9; 
  const cursorRef = useRef(0);
  const allAvatarsRef = useRef<ProductAvatar[]>([]);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Add Material Modal
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  // Uploads
  const [productImage, setProductImage] = useState<{ fileId: string, url: string } | null>(null);
  const [userFaceImage, setUserFaceImage] = useState<{ fileId: string, url: string } | null>(null);
  const [customAvatarImage, setCustomAvatarImage] = useState<{ fileId: string, url: string } | null>(null);
  
  // Inputs
  const [prompt, setPrompt] = useState('');
  const [productSize, setProductSize] = useState(2); // 1-6
  const [autoShow, setAutoShow] = useState(true);
  
  // Result
  const [generating, setGenerating] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [loadingSample, setLoadingSample] = useState(false);
  
  // Progress
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchCategories();
    // Initialize prompt with translated default
    setPrompt(t?.rightPanel?.aiTextPlaceholder || '');
  }, [t]);

  useEffect(() => {
     fetchAvatars();
  }, [selectedCategory]);

  // 滚动加载逻辑
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // 距离底部 50px 时触发加载
    if (scrollHeight - scrollTop - clientHeight < 50) {
        if (!loadingAvatars && hasMore) {
            loadMoreAvatars();
        }
    }
  };

  // 分批加载逻辑 (由滚动触发)
  const loadMoreAvatars = () => {
    if (loadingAvatars) return; 
    
    const nextCursor = cursorRef.current + BATCH_SIZE;
    const nextBatch = allAvatarsRef.current.slice(cursorRef.current, nextCursor);
    
    if (nextBatch.length > 0) {
      setDisplayedAvatars(prev => [...prev, ...nextBatch]);
      cursorRef.current = nextCursor;
      
      if (cursorRef.current >= allAvatarsRef.current.length) {
        setHasMore(false);
      }
    } else {
      setHasMore(false);
    }
  };

  // 初始加载
  useEffect(() => {
    if (avatars.length > 0) {
        cursorRef.current = 0;
        setDisplayedAvatars([]);
        setHasMore(true);
        allAvatarsRef.current = avatars;
        
        // 加载第一批
        const firstBatch = avatars.slice(0, BATCH_SIZE);
        setDisplayedAvatars(firstBatch);
        cursorRef.current = BATCH_SIZE;
        
        if (avatars.length <= BATCH_SIZE) {
            setHasMore(false);
        }
    } else {
        setDisplayedAvatars([]);
        setHasMore(false);
    }
  }, [avatars]);

  const fetchCategories = async () => {
    try {
      const res = await avatarService.getProductAvatarCategories();
      let categoriesData: ProductAvatarCategory[] = [];

      const data = (res as any).result || (res as any).data || res;

      if (Array.isArray(data)) {
          categoriesData = data;
      }

      setCategories([{ categoryId: -1, categoryName: 'All' }, ...categoriesData]);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchAvatars = async () => {
    try {
      setLoadingAvatars(true);
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
      setDisplayedAvatars([]);
      cursorRef.current = 0;
      allAvatarsRef.current = [];

      const res = await avatarService.getProductAvatarList({
        pageNo: 1,
        pageSize: 100,
        categoryIds: selectedCategory === -1 ? '' : String(selectedCategory)
      });
      
      let avatarData: ProductAvatar[] = [];
      const resultData = (res as any).result || res;

      if (resultData?.data && Array.isArray(resultData.data)) {
          avatarData = resultData.data;
      } else if (Array.isArray(resultData)) {
          avatarData = resultData;
      }

      const finalData = avatarData || [];
      setAvatars(finalData); 
      allAvatarsRef.current = finalData; 

      if (!selectedAvatar && finalData.length > 0) {
          setSelectedAvatar(finalData[0]);
      }
    } catch (error) {
      console.error('Failed to fetch avatars:', error);
    } finally {
      setLoadingAvatars(false);
    }
  };

  // Error handling wrapper
  const showError = (msg: string) => {
    toast.error(msg);
  };

  const startProgress = () => {
    setProgress(0);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
        setProgress(prev => {
            if (prev >= 95) return 95;
            return prev + Math.floor(Math.random() * 2) + 1; 
        });
    }, 600);
  };

  const stopProgress = () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setProgress(100);
  };

  const handleGenerate = async () => {
    if (!productImage) {
        showError(t?.rightPanel?.uploadProductImg || 'Please upload product image');
        return;
    }
    if (!selectedAvatar && !customAvatarImage) {
        showError(t?.rightPanel?.uploadAvatar || 'Please select an avatar');
        return;
    }
    try {
        setGenerating(true);
        setPreviewImageUrl(null);
        startProgress();

        const params = {
            avatarId: selectedAvatar?.avatarId || '',
            templateImageFileId: customAvatarImage?.fileId || '',
            productImageFileId: productImage.fileId,
            userFaceImageFileId: userFaceImage?.fileId || '',
            imageEditPrompt: prompt,
            productSize: String(productSize)
        };
        const res = await avatarService.submitImageReplaceTask(params);
        const resultData = (res as any).result || res;
        
        if (resultData?.taskId) {
             pollTask(resultData.taskId);
        } else {
            throw new Error((res as any).msg || (res as any).message || 'Task submission failed');
        }
    } catch (error: any) {
        toast.error(error.message || 'Generation failed');
        stopProgress();
        setGenerating(false);
    }
  };

  const pollTask = async (taskId: string) => {
      const interval = 5000;
      let attempts = 0;
      const maxAttempts = 100;

      const check = async () => {
          try {
              const { result: resultData } = await avatarService.queryImageReplaceTask(taskId);
              const status = resultData?.taskStatus;
              if (status === 'success') {
                  stopProgress();
                  setTimeout(() => {
                      // Extract URL from productReplaceResult array if available
                      let url = resultData.resultImageUrl || resultData.bgRemovedImagePath || '';
                      if (!url && resultData.productReplaceResult && resultData.productReplaceResult.length > 0) {
                          url = resultData.productReplaceResult[0].url;
                      }
                      setPreviewImageUrl(url); 
                      
                      // Add to history
                      if (url) {
                        setGeneratedImages(prev => {
                            if (prev.some(img => img.id === taskId)) return prev;
                            return [{
                                id: taskId,
                                url: url,
                                timestamp: Date.now()
                            }, ...prev];
                        });
                      }
                      
                      setGenerating(false);
                  }, 500);
              } else if (status === 'fail') {
                  stopProgress();
                  setTimeout(() => {
                      toast.error(resultData.errorMsg || t?.tips?.generateFailed || 'Generation failed');
                      setGenerating(false);
                  }, 500);
              } else {
                  attempts++;
                  if (attempts < maxAttempts) setTimeout(check, interval);
                  else {
                      toast.error(t?.errors?.taskTimeout || 'Task timed out');
                      stopProgress();
                      setGenerating(false);
                  }
              }
          } catch (e) {
              // On network error, retry but keep counting attempts
              attempts++;
              if (attempts < maxAttempts) setTimeout(check, interval);
              else {
                  toast.error(t?.errors?.queryFailed || 'Failed to query status');
                  stopProgress();
                  setGenerating(false);
              }
          }
      };
      check();
  };

  const handleTrySample = async () => {
    try {
        setLoadingSample(true);
        setProductImage(null);
        setUserFaceImage(null);

        const fetchImage = async (imgUrl: string, filename: string) => {
            const response = await fetch(imgUrl);
            const blob = await response.blob();
            return new File([blob], filename, { type: 'image/png' });
        };

        const [productFile, userFaceFile] = await Promise.all([
            fetchImage(demoProductPng, 'demo-productImage.png'),
            fetchImage(demoUserFacePng, 'demo-userFaceImage.png')
        ]);

        // Upload concurrently
        const [productUpload, userFaceUpload] = await Promise.all([
            uploadTVFile(productFile),
            uploadTVFile(userFaceFile)
        ]);
        
        setProductImage({ 
            fileId: productUpload.fileId, 
            url: URL.createObjectURL(productFile)
        });
        
        setUserFaceImage({ 
            fileId: userFaceUpload.fileId, 
            url: URL.createObjectURL(userFaceFile)
        });
        
    } catch (error) {
        console.error('Failed to load sample:', error);
        showError(t?.errors?.sampleLoadFailed || 'Failed to load sample images');
    } finally {
        setLoadingSample(false);
    }
  };

  const sliderMarks = {
    1: t?.sliderMarks?.tiny,
    2: t?.sliderMarks?.small,
    3: t?.sliderMarks?.medium,
    4: t?.sliderMarks?.large,
    5: t?.sliderMarks?.xLarge,
    6: t?.sliderMarks?.xxLarge,
  };
  
  const handleAddToMaterials = () => {
    if (!previewImageUrl) return;
    setShowMaterialModal(true);
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `digital_product_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success(t?.tips?.downloadStarted || '开始下载...');
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  const handleDownloadAll = async () => {
    for (const img of generatedImages) {
      await handleDownload(img.url);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const handleClearAll = () => {
    setGeneratedImages([]);
    setPreviewImageUrl(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left: Avatar Selection */}
      <div className="w-full lg:w-1/3 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col lg:h-[calc(100vh-230px)]">
        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 shrink-0">
            {t?.leftPanel?.title || 'Select Avatar Template'}
        </h3>
        
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-4 shrink-0 max-h-[10vh] overflow-y-auto custom-scrollbar">
            {categories.map(cat => (
                <button 
                    key={cat.categoryId}
                    onClick={() => setSelectedCategory(cat.categoryId)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${selectedCategory === cat.categoryId ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                    {cat.categoryName === 'All' ? 'All' : cat.categoryName}
                </button>
            ))}
        </div>

        {/* Avatar Grid */}
        <div 
            className="flex flex-wrap gap-3 overflow-y-auto custom-scrollbar flex-1 min-h-[300px] content-start"
            onScroll={handleScroll}
        >
            {/* Upload Custom Item */}
            <div className="w-[calc(33.33%-8px)] sm:w-[calc(25%-9px)] lg:w-[calc(50%-6px)] xl:w-[calc(33.33%-8px)] aspect-[9/16]">
            <UploadComponent
                uploadType="tv"
                immediate={true}
                onUploadComplete={(file) => {
                    setCustomAvatarImage({ fileId: file.fileId, url: file.fileUrl || '' });
                    setSelectedAvatar(null);
                }}
                className={`w-full h-full ${customAvatarImage ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-600'}`}
            >
                <div className="flex flex-col items-center justify-center h-full">
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500">{t?.leftPanel?.uploadDiy || 'Upload Custom'}</span>
                </div>
            </UploadComponent>
            </div>

            {loadingAvatars && displayedAvatars.length === 0 ? (
                <div className="w-full flex justify-center py-10"><Loader className="animate-spin text-indigo-600" /></div>
            ) : (
              <>
                {displayedAvatars.map(avatar => (
                  <div 
                      key={avatar.avatarId}
                      onClick={() => { setSelectedAvatar(avatar); setCustomAvatarImage(null); }}
                      className={`relative w-[calc(33.33%-8px)] sm:w-[calc(25%-9px)] lg:w-[calc(50%-6px)] xl:w-[calc(33.33%-8px)] aspect-[9/16] rounded-lg overflow-hidden cursor-pointer border-2 transition ${selectedAvatar?.avatarId === avatar.avatarId ? 'border-indigo-500 shadow-md' : 'border-transparent hover:shadow-sm'}`}
                  >
                      <img src={avatar.avatarImagePath} className="w-full h-full object-cover" loading="lazy" alt={avatar.avatarName} />
                      {selectedAvatar?.avatarId === avatar.avatarId && (
                          <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                              <div className="bg-indigo-600 text-white text-xs px-2 py-1 rounded">{t?.leftPanel?.picker || 'Pick'}</div>
                          </div>
                      )}
                  </div>
                ))}
                {/* 加载更多占位符 */}
                {hasMore && (
                   <div className="w-full flex justify-center py-4">
                      <Loader className="animate-spin text-gray-400" size={20} />
                   </div>
                )}
              </>
            )}
        </div>
      </div>

      {/* Middle: Configuration & Results */}
      <div className="h-[calc(100vh-230px)] flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg relative overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-32 mb-[80px]">
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
              {/* Preview */}
              <div className="flex-1">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4">
                      {t?.rightPanel?.templatePreview || 'Avatar Preview'}
                  </h3>
                  <div className="relative aspect-[9/16] max-w-[240px] max-h-[300px] mx-auto bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                      {(selectedAvatar || customAvatarImage) ? (
                          <img src={selectedAvatar?.avatarImagePath || customAvatarImage?.url} className="w-full h-full object-cover" />
                      ) : (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-4">
                              <ImageIcon size={48} className="mb-2" />
                              <span>{t?.rightPanel?.pickerTemplate || 'Please select template'}</span>
                          </div>
                      )}
                      
                      {/* Face Upload Overlay */}
                      {(selectedAvatar || customAvatarImage) && (
                          <div className="absolute bottom-4 right-4">
                              <div className="relative group">
                                  {userFaceImage ? (
                                      <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-lg relative">
                                          <img src={userFaceImage.url} className="w-full h-full object-cover" />
                                          <button onClick={() => setUserFaceImage(null)} className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 flex items-center justify-center rounded-bl text-[10px] z-20">×</button>
                                      </div>
                                  ) : (
                                      <UploadComponent
                                          uploadType="tv"
                                          immediate={true}
                                          showPreview={false}
                                          onUploadComplete={(file) => setUserFaceImage({ fileId: file.fileId, url: file.fileUrl || '' })}
                                          className="w-12 h-12 bg-black/60 hover:bg-black/80 text-white rounded-lg flex flex-col items-center justify-center backdrop-blur-sm border border-white/30 transition !border-solid"
                                      >
                                          <Upload size={16} />
                                          <span className="text-[10px] mt-1">{t?.rightPanel?.uploadMyFace || 'Upload Face'}</span>
                                      </UploadComponent>
                                  )}
                              </div>
                          </div>
                      )}
                  </div>
              </div>

              {/* Product Config */}
              <div className="flex-1 flex flex-col gap-4">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200">
                      {t?.rightPanel?.productConfig || 'Product Config'}
                  </h3>
                  
                  {/* Product Upload */}
                  {productImage ? (
                      <div className="relative h-40 bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden border-2 border-indigo-500/20">
                          <img src={productImage.url} className="w-full h-full object-contain p-2" alt="Product" />
                          <button 
                              onClick={() => setProductImage(null)} 
                              className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-600 transition shadow-sm"
                          >
                              ×
                          </button>
                      </div>
                  ) : (
                    <UploadComponent
                        uploadType="tv"
                        immediate={true}
                        onUploadComplete={(file) => {setProductImage({ fileId: file.fileId, url: file.fileUrl || '' })}}
                        className="h-40"
                    >
                            <div className="text-center text-gray-500">
                                <Upload size={32} className="mx-auto mb-2" />
                                <p className="text-sm">{t?.rightPanel?.uploadProductImg || 'Upload Product Image'}</p>
                            </div>
                    </UploadComponent>
                  )}

                  {/* Product Size */}
                  {productImage && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">{t?.rightPanel?.productSize || 'Product Size'}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={autoShow} onChange={(e) => { setAutoShow(e.target.checked); if(e.target.checked) setProductSize(2); }} className="sr-only peer" />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">{t?.rightPanel?.autoShow || 'Auto'}</span>
                            </label>
                        </div>
                        <input 
                            type="range" 
                            min="1" 
                            max="6" 
                            value={productSize} 
                            onChange={(e) => { setProductSize(Number(e.target.value)); setAutoShow(false); }} 
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{sliderMarks[1]}</span>
                            <span>{sliderMarks[6]}</span>
                        </div>
                    </div>
                  )}
              </div>
          </div>

          {/* Prompt */}
          <div className="mb-4">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {t?.rightPanel?.aiTips || 'AI Mixed Prompt'}
              </h3>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-24 p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                placeholder={t?.rightPanel?.aiTipsPlaceholder || 'Tell AI how to blend...'}
              />
          </div>

          {/* Results Area */}
          {(generatedImages.length > 0 || generating) && (
             <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-800 dark:text-gray-200">{t?.rightPanel?.resultTitle || '生成结果'}</h3>
                    <div className="flex gap-2">
                        <button
                             onClick={handleClearAll}
                             disabled={generatedImages.length === 0}
                             className={`px-3 py-1.5 border rounded-lg text-xs flex items-center gap-1 transition-colors ${
                               generatedImages.length === 0
                                 ? 'border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 opacity-50 cursor-not-allowed'
                                 : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                             }`}
                        >
                           <Trash2 size={12} />
                           {t?.actions?.clearAll || '清空'}
                        </button>
                        <button
                             onClick={handleDownloadAll}
                             disabled={generatedImages.length === 0}
                             className={`px-3 py-1.5 border rounded-lg text-xs flex items-center gap-1 transition-colors ${
                               generatedImages.length === 0
                                 ? 'border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 opacity-50 cursor-not-allowed'
                                 : 'border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
                             }`}
                        >
                           <Download size={12} /> {t?.actions?.downloadAll || '下载全部'}
                        </button>
                    </div>
                </div>

                {/* Main Preview */}
                <div className="w-full h-[450px] shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/50 mb-6 relative overflow-hidden group">
                    {generating ? (
                         <div className="flex flex-col items-center gap-4 z-10 p-6 w-full max-w-md">
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                <Loader className="animate-spin text-indigo-600" size={20} />
                                {t?.rightPanel?.generating || "AI Generating"}
                            </h3>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                <div 
                                    className="bg-indigo-600 h-3 rounded-full transition-all duration-300 ease-out" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between items-center text-sm w-full">
                                <span className="text-gray-500 dark:text-gray-400 animate-pulse">
                                    {t?.rightPanel?.pleaseWait || "AI is analyzing..."}
                                </span>
                                <span className="font-bold text-indigo-600">{progress}%</span>
                            </div>
                         </div>
                    ) : previewImageUrl ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-black/5 dark:bg-black/20">
                             <img 
                                src={previewImageUrl} 
                                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                                alt="Generated Result"
                             />
                             <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => handleDownload(previewImageUrl!)}
                                  className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                                  title={t?.actions?.download || '下载'}
                                >
                                  <Download size={18} />
                                </button>
                                <button 
                                  onClick={handleAddToMaterials}
                                  className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                                  title={t?.actions?.addToMaterials || '加入素材库'}
                                >
                                  <Plus size={18} />
                                </button>
                             </div>
                        </div>
                    ) : (
                         <div className="flex flex-col items-center text-slate-400">
                             <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <ImageIcon size={40} className="text-slate-300 dark:text-slate-600" />
                             </div>
                             <p className="text-sm max-w-xs text-center">{t?.rightPanel?.previewPlaceholder || '生成结果将在这里显示'}</p>
                         </div>
                    )}
                </div>

                {/* History Thumbs */}
                {generatedImages.length > 0 && (
                     <div className="h-24 flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                       {generatedImages.map((img) => (
                         <div 
                           key={img.id}
                           onClick={() => setPreviewImageUrl(img.url)}
                           className={`relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all bg-black/5 ${
                             previewImageUrl === img.url ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-transparent hover:border-indigo-300'
                           }`}
                         >
                           <img src={img.url} className="w-full h-full object-cover pointer-events-none" />
                           {img.addState && (
                             <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                                <Check size={8} className="text-white" />
                             </div>
                           )}
                         </div>
                       ))}
                     </div>
                )}
             </div>
          )}
          </div>

          {/* Actions */}
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-6 border-t border-gray-100 dark:border-gray-700 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <div className="flex gap-4">
                  <button 
                    onClick={handleTrySample}
                    disabled={loadingSample || generating}
                    className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingSample ? <Loader className="animate-spin" size={18} /> : (t?.rightPanel?.trySample || 'Try Sample')}
                  </button>
                  <button 
                    onClick={handleGenerate} 
                    disabled={generating || !productImage} 
                    className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {generating ? <Loader className="animate-spin" size={18} /> : (t?.rightPanel?.startWorking || 'Start Generating')}
                  </button>
              </div>
          </div>
      </div>
      {/* Add Material Modal */}
      <AddMaterialModal
          isOpen={showMaterialModal}
          onClose={() => setShowMaterialModal(false)}
          onSuccess={() => {
              toast.success('已添加到素材库');
              setShowMaterialModal(false);
          }}
          initialData={{
              assetName: `产品数字人_${new Date().toISOString().slice(0,10)}`,
              assetTag: `产品数字人_${new Date().toISOString().slice(0,10)}`,
              assetDesc: `产品数字人_${new Date().toISOString().slice(0,10)}`,
              assetUrl: previewImageUrl || '',
              assetType: 13 // Product Digital Human
          }}
          disableAssetTypeSelection={true}
       />
    </div>
  );
};

export default DigitalHumanProduct;
