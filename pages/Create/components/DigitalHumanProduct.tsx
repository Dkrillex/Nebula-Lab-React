import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Loader, Image as ImageIcon, PlayCircle, Plus, Trash2, Download, Check, RotateCcw } from 'lucide-react';
import { useActivate, useUnactivate } from 'react-activation';
import { avatarService, ProductAvatar, ProductAvatarCategory } from '../../../services/avatarService';
import UploadComponent, { UploadComponentRef } from '../../../components/UploadComponent';
import ProductCanvas, { ProductCanvasRef } from './ProductCanvas';
import { useProductAvatarStore } from '../../../stores/productAvatarStore';
import { useNavigate } from 'react-router-dom';
import demoProductPng from '@/assets/demo/productImage.png';
import demoUserFacePng from '@/assets/demo/userFaceImage.png';
import { uploadTVFile } from '@/utils/upload';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { showAuthModal } from '@/lib/authModalManager';
interface DigitalHumanProductProps {
  t: any;
  handleFileUpload: (file: File, type: 'image') => Promise<any>; 
  uploading: boolean;
  setErrorMessage: (msg: string | null) => void;
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
  // Uploads
  const [productImage, setProductImage] = useState<{ fileId: string, url: string } | null>(null);
  const [userFaceImage, setUserFaceImage] = useState<{ fileId: string, url: string } | null>(null);
  const [customAvatarImage, setCustomAvatarImage] = useState<{ fileId: string, url: string } | null>(null);
  
  // Inputs
  const [prompt, setPrompt] = useState('');
  const [productSize, setProductSize] = useState(2); // 1-6
  const [autoShow, setAutoShow] = useState(true);
  const [activeMode, setActiveMode] = useState<'normal' | 'highPrecision'>('normal');
  
  // Manual mode state
  const [productLocation, setProductLocation] = useState<number[][]>([]);
  const [bgRemovedProductImage, setBgRemovedProductImage] = useState<{ fileId: string, url: string } | null>(null);
  const [removingBackground, setRemovingBackground] = useState(false);
  const removeBgTimerRef = useRef<NodeJS.Timeout | null>(null);
  const productCanvasRef = useRef<ProductCanvasRef | null>(null);
  const customAvatarUploadRef = useRef<UploadComponentRef>(null);
  const userFaceUploadRef = useRef<UploadComponentRef>(null);
  const productUploadRef = useRef<UploadComponentRef>(null);
  
  // Result
  const [generating, setGenerating] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  
  // Store and navigation
  const productAvatarStore = useProductAvatarStore();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // 使用 useRef 来跟踪是否已经初始化，避免路由变化时重复执行
  // 这些 ref 在 KeepAlive 恢复时不会被重置，确保状态保持
  const initializedRef = useRef(false);
  const categoriesFetchedRef = useRef(false);
  const isFirstMountRef = useRef(true);
  
  // 初始化逻辑：只在真正的首次挂载时执行
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    // 只在首次挂载时执行 fetchCategories，避免路由变化时重复刷新数据
    if (!categoriesFetchedRef.current) {
      fetchCategories();
      categoriesFetchedRef.current = true;
    }
    
    // prompt 的初始化：只在首次挂载且 prompt 为空时设置
    if (!initializedRef.current) {
      const promptText = t?.rightPanel?.aiTextPlaceholder || '';
      if (promptText && !prompt) {
        setPrompt(promptText);
      }
      initializedRef.current = true;
    }
    
    // 标记首次挂载完成
    isFirstMountRef.current = false;
  }, []); // 空依赖数组，只在组件挂载时执行一次
  
  // 使用 useActivate 处理 KeepAlive 恢复时的逻辑
  useActivate(() => {
    // 当组件从 KeepAlive 缓存中恢复时，不需要重新初始化
    // 所有状态都会自动保持，因为 KeepAlive 会保留组件的完整状态
    // 这里可以添加一些需要在恢复时执行的逻辑（如果需要）
  });
  
  // 使用 useUnactivate 处理组件被缓存时的逻辑
  useUnactivate(() => {
    // 当组件被 KeepAlive 缓存时，可以在这里执行一些清理或保存操作
    // 但通常不需要，因为 KeepAlive 会自动保存所有状态
  });

  useEffect(() => {
      if (!isAuthenticated) {
        return;
      }
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
    // 检查登录状态
    if (!isAuthenticated) {
      return;
    }
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

  // Handle mode change
  const changeActiveMode = (mode: 'normal' | 'highPrecision') => {
    setActiveMode(mode);
    if (mode === 'highPrecision' && productImage) {
      // Clear product image when switching to manual mode to trigger background removal
      setProductImage(null);
      setBgRemovedProductImage(null);
      setProductLocation([]);
    }
  };

  // Handle background removal (for manual mode)
  const handleProductImageUpload = async (file: { fileId: string, fileUrl: string }) => {
    setProductImage({ fileId: file.fileId, url: file.fileUrl });
    
    if (activeMode === 'highPrecision') {
      // Automatically trigger background removal
      await removeBackground(file.fileId);
    }
  };

  const removeBackground = async (productImageFileId: string) => {
    try {
      setRemovingBackground(true);
      const res = await avatarService.submitRemoveBackground({ productImageFileId });
      const resultData = (res as any).result || res;
      
      if (resultData?.taskId) {
        pollRemoveBackground(resultData.taskId);
      } else {
        throw new Error((res as any).msg || (res as any).message || 'Background removal failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Background removal failed');
      setRemovingBackground(false);
    }
  };

  const pollRemoveBackground = async (taskId: string) => {
    const interval = 5000;
    let attempts = 0;
    const maxAttempts = 60;

    const check = async () => {
      try {
        const { result: resultData } = await avatarService.queryRemoveBackground(taskId);
        const status = resultData?.status;
        
        if (status === 'success') {
          if (resultData.bgRemovedImagePath && resultData.bgRemovedImageFileId) {
            setBgRemovedProductImage({
              fileId: resultData.bgRemovedImageFileId,
              url: resultData.bgRemovedImagePath
            });
            setRemovingBackground(false);
          }
        } else if (status === 'fail') {
          toast.error(resultData.errorMsg || 'Background removal failed');
          setRemovingBackground(false);
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            if (removeBgTimerRef.current) clearTimeout(removeBgTimerRef.current);
            removeBgTimerRef.current = setTimeout(check, interval);
          } else {
            toast.error(t?.errors?.taskTimeout || 'Task timed out');
            setRemovingBackground(false);
          }
        }
      } catch (e) {
        attempts++;
        if (attempts < maxAttempts) {
          if (removeBgTimerRef.current) clearTimeout(removeBgTimerRef.current);
          removeBgTimerRef.current = setTimeout(check, interval);
        } else {
          toast.error(t?.errors?.queryFailed || 'Failed to query status');
          setRemovingBackground(false);
        }
      }
    };
    
    check();
  };

  // Handle location change from ProductCanvas
  const handleLocationChange = (location: number[][]) => {
    setProductLocation(location);
  };

  // Reset product position
  const handleResetTransform = () => {
    if (productCanvasRef.current) {
      productCanvasRef.current.resetTransform();
    }
  };

  const handleGenerate = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isAuthenticated) {
      showAuthModal();
      return;
    }
    
    // 1. Validation
    // Check Product Image
    if (!productImage && !productUploadRef.current?.file) {
        showError(t?.rightPanel?.uploadProductImg || 'Please upload product image');
        return;
    }
    
    // Check Avatar
    if (!selectedAvatar && !customAvatarImage && !customAvatarUploadRef.current?.file) {
        showError(t?.rightPanel?.uploadAvatar || 'Please select an avatar');
        return;
    }
    
    // Manual mode additional validation
    if (activeMode === 'highPrecision') {
      if (!bgRemovedProductImage) {
        showError(t?.rightPanel?.waitBackgroundRemoval || 'Please wait for background removal to complete');
        return;
      }
      if (productLocation.length === 0) {
        showError(t?.rightPanel?.setProductLocation || 'Please set product location');
        return;
      }
    }
    
    try {
        setGenerating(true);
        
        // 2. Handle Delayed Uploads
        let currentProductImage = productImage;
        let currentUserFaceImage = userFaceImage;
        let currentCustomAvatarImage = customAvatarImage;

        // 2.1 Product Image (Only for Normal Mode, as High Precision requires pre-upload for bg removal)
        if (activeMode === 'normal') {
            // If file is selected but not uploaded (fileId is empty)
            if (productUploadRef.current?.file && (!currentProductImage || !currentProductImage.fileId)) {
                try {
                    const uploaded = await productUploadRef.current.triggerUpload();
                    if (uploaded && uploaded.fileId) {
                        currentProductImage = { fileId: uploaded.fileId, url: uploaded.fileUrl };
                        setProductImage(currentProductImage);
                    } else {
                        throw new Error('Product image upload failed');
                    }
                } catch (e) {
                    console.error(e);
                    showError('Failed to upload product image');
                    setGenerating(false);
                    return;
                }
            }
            
            // Final check for product image
            if (!currentProductImage || !currentProductImage.fileId) {
                 showError('Product image is missing');
                 setGenerating(false);
                 return;
            }
        }

        // 2.2 Custom Avatar Image (If selected)
        if (!selectedAvatar) {
             if (customAvatarUploadRef.current?.file && (!currentCustomAvatarImage || !currentCustomAvatarImage.fileId)) {
                try {
                    const uploaded = await customAvatarUploadRef.current.triggerUpload();
                    if (uploaded && uploaded.fileId) {
                        currentCustomAvatarImage = { fileId: uploaded.fileId, url: uploaded.fileUrl };
                        setCustomAvatarImage(currentCustomAvatarImage);
                    } else {
                        throw new Error('Custom avatar upload failed');
                    }
                } catch (e) {
                    console.error(e);
                    showError('Failed to upload custom avatar');
                    setGenerating(false);
                    return;
                }
            }
            
            if (!currentCustomAvatarImage || !currentCustomAvatarImage.fileId) {
                 showError('Custom avatar image is missing');
                 setGenerating(false);
                 return;
            }
        }

        // 2.3 User Face Image (Optional)
        if (userFaceUploadRef.current?.file && (!currentUserFaceImage || !currentUserFaceImage.fileId)) {
            try {
                const uploaded = await userFaceUploadRef.current.triggerUpload();
                if (uploaded && uploaded.fileId) {
                    currentUserFaceImage = { fileId: uploaded.fileId, url: uploaded.fileUrl };
                    setUserFaceImage(currentUserFaceImage);
                } else {
                     // If user selected a face file, we expect it to upload successfully
                     throw new Error('Face image upload failed');
                }
            } catch (e) {
                console.error(e);
                showError('Failed to upload face image');
                setGenerating(false);
                return;
            }
        }

        // 3. Submission
        let params: any;
        
        if (activeMode === 'highPrecision') {
          // V2 manual mode
          params = {
            generateImageMode: 'manual',
            avatarId: selectedAvatar?.avatarId || '',
            templateImageFileId: currentCustomAvatarImage?.fileId || '',
            productImageWithoutBackgroundFileId: bgRemovedProductImage!.fileId,
            userFaceImageFileId: currentUserFaceImage?.fileId || '',
            location: productLocation as any
          };
          
          const res = await avatarService.submitV2ImageReplaceTask(params);
          const resultData = (res as any).result || res;
          
          if (resultData?.taskId) {
            productAvatarStore.setData(resultData.taskId, { ...params, taskId: resultData.taskId });
            navigate(`/create/product-replace?taskId=${resultData.taskId}&v2=true`, { replace: false });
          } else {
            throw new Error((res as any).msg || (res as any).message || 'Task submission failed');
          }
        } else {
          // V1 normal mode
          params = {
            avatarId: selectedAvatar?.avatarId || '',
            templateImageFileId: currentCustomAvatarImage?.fileId || '',
            productImageFileId: currentProductImage!.fileId, // Checked above
            userFaceImageFileId: currentUserFaceImage?.fileId || '',
            imageEditPrompt: prompt,
            productSize: String(productSize)
          };
          
          const res = await avatarService.submitImageReplaceTask(params);
          const resultData = (res as any).result || res;
          
          if (resultData?.taskId) {
            productAvatarStore.setData(resultData.taskId, { ...params, taskId: resultData.taskId });
            navigate(`/create/product-replace?taskId=${resultData.taskId}`, { replace: false });
          } else {
            throw new Error((res as any).msg || (res as any).message || 'Task submission failed');
          }
        }
    } catch (error: any) {
        console.error('Generation Error:', error);
        toast.error(error.message || 'Generation failed');
        setGenerating(false);
    }
  };

  const handleTrySample = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isAuthenticated) {
      showAuthModal();
      return;
    }
    
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
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (removeBgTimerRef.current) {
        clearTimeout(removeBgTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left: Avatar Selection */}
      <div className="w-full lg:w-3/5 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col lg:h-[calc(100vh-230px)]">
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
            <div className="w-[calc(33.33%-8px)] sm:w-[calc(25%-9px)] lg:w-[calc(20%-10px)] aspect-[9/16]">
            <UploadComponent
                ref={customAvatarUploadRef}
                uploadType="tv"
                accept=".png,.jpg,.jpeg,.webp"
                immediate={false}
                showConfirmButton={false}
                onFileSelected={(file) => {
                    setCustomAvatarImage({ fileId: '', url: URL.createObjectURL(file) });
                    setSelectedAvatar(null);
                }}
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
                      className={`relative w-[calc(33.33%-8px)] sm:w-[calc(25%-9px)] lg:w-[calc(20%-10px)] aspect-[9/16] rounded-lg overflow-hidden cursor-pointer border-2 transition ${selectedAvatar?.avatarId === avatar.avatarId ? 'border-indigo-500 shadow-md' : 'border-transparent hover:shadow-sm'}`}
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

      {/* Right: Configuration & Results */}
      <div className="h-[calc(100vh-230px)] w-full lg:w-2/5 bg-white dark:bg-gray-800 rounded-2xl shadow-lg relative overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-32 mb-[80px]">
          <div className="flex flex-col gap-6 mb-6">
              {/* Preview */}
              <div className="w-full">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4">
                      {t?.rightPanel?.templatePreview || 'Avatar Preview'}
                  </h3>
                  
                  {/* Mode Tabs */}
                  <div className="flex gap-2 mb-4 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    <button
                      onClick={() => changeActiveMode('normal')}
                      className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition ${
                        activeMode === 'normal'
                          ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                      }`}
                    >
                      {t?.rightPanel?.automaticMode || 'Automatic Mode'}
                    </button>
                    <button
                      onClick={() => changeActiveMode('highPrecision')}
                      className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition ${
                        activeMode === 'highPrecision'
                          ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                      }`}
                    >
                      {t?.rightPanel?.manualMode || 'Manual Mode'}
                    </button>
                  </div>

                  {/* Manual Mode Instructions */}
                  {activeMode === 'highPrecision' && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-gray-700 dark:text-gray-300">
                      <div className="flex items-start gap-2 mb-2">
                        <span>✏️</span>
                        <span>{t?.rightPanel?.instructionUploadProduct || 'Please upload product image first'}</span>
                      </div>
                      <div className="flex items-start gap-2 mb-2">
                        <span>👆</span>
                        <span>{t?.rightPanel?.instructionDrag || 'Drag: Hold left mouse button to move product'}</span>
                      </div>
                      <div className="flex items-start gap-2 mb-2">
                        <span>🔄</span>
                        <span>{t?.rightPanel?.instructionRotate || 'Rotate: Hold Shift + drag'}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span>🔍</span>
                        <span>{t?.rightPanel?.instructionScale || 'Scale: Hold Alt(Option) + drag up/down'}</span>
                      </div>
                    </div>
                  )}

                  <div className="relative aspect-[9/16] max-w-[240px] max-h-[300px] mx-auto bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                      {activeMode === 'highPrecision' && (selectedAvatar || customAvatarImage) && bgRemovedProductImage ? (
                        <ProductCanvas
                          ref={productCanvasRef}
                          modelImageUrl={selectedAvatar?.avatarImagePath || customAvatarImage?.url || null}
                          productImageUrl={bgRemovedProductImage.url}
                          onLocationChange={handleLocationChange}
                          className="w-full h-full"
                        />
                      ) : (selectedAvatar || customAvatarImage) ? (
                        <img src={selectedAvatar?.avatarImagePath || customAvatarImage?.url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-4">
                            <ImageIcon size={48} className="mb-2" />
                            <span>{t?.rightPanel?.pickerTemplate || 'Please select template'}</span>
                        </div>
                      )}
                      
                      {/* Face Upload Overlay */}
                      {(selectedAvatar || customAvatarImage) && (
                          <div className="absolute bottom-4 right-4 z-30">
                              <div className="relative group">
                                  <div className={userFaceImage ? 'block' : 'hidden'}>
                                      <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-lg relative">
                                          {userFaceImage && <img src={userFaceImage.url} className="w-full h-full object-cover" />}
                                          <button 
                                              onClick={() => {
                                                  setUserFaceImage(null);
                                                  userFaceUploadRef.current?.clear();
                                              }} 
                                              className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 flex items-center justify-center rounded-bl text-[10px] z-20"
                                          >
                                              ×
                                          </button>
                                      </div>
                                  </div>
                                  
                                  <div className={!userFaceImage ? 'block' : 'hidden'}>
                                      <UploadComponent
                                          ref={userFaceUploadRef}
                                          uploadType="tv"
                                          accept=".png,.jpg,.jpeg,.webp"
                                          immediate={false}
                                          showConfirmButton={false}
                                          showPreview={false}
                                          onFileSelected={(file) => setUserFaceImage({ fileId: '', url: URL.createObjectURL(file) })}
                                          onUploadComplete={(file) => setUserFaceImage({ fileId: file.fileId, url: file.fileUrl || '' })}
                                          className="w-12 h-12 bg-black/60 hover:bg-black/80 text-white rounded-lg flex flex-col items-center justify-center backdrop-blur-sm border border-white/30 transition !border-solid"
                                      >
                                          <Upload size={16} />
                                          <span className="text-[10px] mt-1">{t?.rightPanel?.uploadMyFace || 'Upload Face'}</span>
                                      </UploadComponent>
                                  </div>
                              </div>
                          </div>
                      )}
                      
                  </div>
              </div>

              {/* Product Config */}
              <div className="w-full flex flex-col gap-4">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200">
                      {t?.rightPanel?.productConfig || 'Product Config'}
                  </h3>
                  
                  {/* Product Upload */}
                  <div className={productImage ? 'block' : 'hidden'}>
                      <div className="relative h-40 bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden border-2 border-indigo-500/20">
                          {removingBackground ? (
                            <div className="flex flex-col items-center justify-center h-full">
                              <Loader className="animate-spin text-indigo-600 mb-2" size={24} />
                              <p className="text-xs text-gray-600 dark:text-gray-400">{t?.rightPanel?.removingBackground || 'Removing background...'}</p>
                            </div>
                          ) : (
                            <>
                              {productImage && <img src={bgRemovedProductImage?.url || productImage.url} className="w-full h-full object-contain p-2" alt="Product" />}
                              <button 
                                  onClick={() => {
                                    setProductImage(null);
                                    setBgRemovedProductImage(null);
                                    setProductLocation([]);
                                    productUploadRef.current?.clear();
                                  }} 
                                  className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-600 transition shadow-sm"
                              >
                                  ×
                              </button>
                            </>
                          )}
                      </div>
                  </div>
                  
                  <div className={!productImage ? 'block' : 'hidden'}>
                    <UploadComponent
                        ref={productUploadRef}
                        uploadType="tv"
                        accept=".png,.jpg,.jpeg,.webp"
                        immediate={activeMode === 'highPrecision'}
                        showConfirmButton={false}
                        onFileSelected={(file) => {
                            if (activeMode === 'normal') {
                                // Clear previous state but keep url for preview
                                setProductImage({ fileId: '', url: URL.createObjectURL(file) });
                            }
                        }}
                        onUploadComplete={(file) => handleProductImageUpload({ fileId: file.fileId, fileUrl: file.fileUrl || '' })}
                        className="h-40"
                    >
                            <div className="text-center text-gray-500">
                                <Upload size={32} className="mx-auto mb-2" />
                                <p className="text-sm">{t?.rightPanel?.uploadProductImg || 'Upload Product Image'}</p>
                            </div>
                    </UploadComponent>
                  </div>

                  {/* Product Size - Only show in normal mode */}
                  {productImage && activeMode === 'normal' && (
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

          {/* Prompt - Only show in normal mode */}
          {activeMode === 'normal' && (
            <div className="mb-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                    {t?.rightPanel?.aiTips || 'AI Mixed Prompt'}
                </h3>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-24 p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder={t?.rightPanel?.aiTipsPlaceholder || 'Tell AI how to blend...'}
                  maxLength={2000}
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {prompt.length}/2000
                </div>
            </div>
          )}

          </div>

          {/* Actions */}
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-6 border-t border-gray-100 dark:border-gray-700 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <div className="flex gap-4">
                  <button 
                    onClick={(e) => handleTrySample(e)}
                    disabled={loadingSample || generating}
                    className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingSample ? <Loader className="animate-spin" size={18} /> : (t?.rightPanel?.trySample || 'Try Sample')}
                  </button>
                  <button 
                    onClick={(e) => handleGenerate(e)} 
                    disabled={generating || !productImage || (activeMode === 'highPrecision' && (!bgRemovedProductImage || productLocation.length === 0))} 
                    className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {generating ? <Loader className="animate-spin" size={18} /> : (t?.rightPanel?.startWorking || 'Start Generating')}
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default DigitalHumanProduct;
