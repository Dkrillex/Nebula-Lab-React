
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useActivate, useUnactivate } from 'react-activation';
import { 
  ArrowRight, Sparkles, Loader2, X, Upload
} from 'lucide-react';
import toast from 'react-hot-toast';

import { templateService, LabTemplate, LabTemplateQuery } from '../../services/templateService';
import { useVideoGenerationStore } from '../../stores/videoGenerationStore';
import { useAuthStore } from '../../stores/authStore';
import { useAppOutletContext } from '../../router/context';
import { translations } from '../../translations';
import { showAuthModal } from '../../lib/authModalManager';

const CREATE_IMAGE_PAYLOAD_KEY = 'createImagePayload';
const MAX_CREATE_UPLOAD_IMAGES = 4;
const MAX_CREATE_UPLOAD_SIZE_MB = 10;

const CreateHome: React.FC<{ t?: any }> = ({ t: propT }) => {
  const { t: contextT, handleNavClick } = useAppOutletContext();
  
  // 安全获取 translations
  // 1. 优先使用 props 中的 t (由 RouteWrapper 注入，已定位到 createPage)
  // 2. 其次尝试从 context 获取 (需要手动定位到 createPage)
  // 3. 最后使用默认语言包
  const t = propT || contextT?.createPage || translations['zh'].createPage || {};
  
  // 调试信息
  if (process.env.NODE_ENV === 'development') {
    console.log('CreateHome - 组件渲染, t:', !!t, 'propT:', !!propT, 'contextT:', !!contextT);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { setData } = useVideoGenerationStore();
  const [inputValue, setInputValue] = useState('');
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  
  const [labTemplateData, setLabTemplateData] = useState<LabTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [templateName, setTemplateName] = useState('');
  const [params, setParams] = useState<LabTemplateQuery>({
    pageNum: 1,
    pageSize: 12 // 增加初始 pageSize，确保第一次加载更多数据
  });

  // 模板详情弹窗
  const [selectedTemplate, setSelectedTemplate] = useState<LabTemplate | null>(null);
  const [showTemplateDetail, setShowTemplateDetail] = useState(false);

  // 无限滚动相关
  const sentinelRef = useRef<HTMLDivElement>(null);
  const masonryRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  
  // 滚动位置保存
  const scrollTopRef = useRef<number>(0);

  // Creative Types Data
  const creativeTypes = [
    {
      id: 1,
      title: t.shortcuts?.video || 'Video', 
      icon: 'https://nebula-ads.oss-cn-guangzhou.aliyuncs.com/cdn/picture/k-pop.png',
      description: t.shortcuts?.videoDesc || 'Create video from image/text',
      toolId: 'viralVideo',
      type: 'image',
    },
    { 
      id: 3,
      title: t.shortcuts?.talkingPhoto || 'Talking Photo',
      icon: 'https://nebula-ads.oss-cn-guangzhou.aliyuncs.com/cdn/picture/talking-pictures.png',
      description: t.shortcuts?.talkingPhotoDesc || 'Make photo speak',
      toolId: 'imgToVideo',
      type: 'image',
    },
    {
      id: 4,
      title: t.shortcuts?.avatar || 'Avatar',
      icon: 'https://nebula-ads.oss-cn-guangzhou.aliyuncs.com/cdn/picture/product-digital-person.png',
      description: t.shortcuts?.avatarDesc || 'Digital human avatar',
      toolId: 'digitalHuman?tab=product',
      type: 'image',
    },
    {
      id: 5,
      title: t.shortcuts?.transform || 'Transform',
      icon: 'https://nebula-ads.oss-cn-guangzhou.aliyuncs.com/cdn/picture/all-things-migrate-img.png',
      description: t.shortcuts?.transformDesc || 'Style transfer',
      toolId: 'styleTransfer', 
      type: 'image',
    },
    {
      id: 6,
      title: t.shortcuts?.sketch || 'Sketch',
      icon: 'https://nebula-ads.oss-cn-guangzhou.aliyuncs.com/cdn/picture/productAnyEdit.png',
      description: t.shortcuts?.sketchDesc || 'Text to image',
      toolId: 'textToImage',
      type: 'image',
    },
    {
      id: 8,
      title: t.sideMenu?.voiceClone || 'Voice Clone',
      icon: 'https://nebula-ads.oss-cn-guangzhou.aliyuncs.com/cdn/picture/text2image.png', 
      description: t.sideMenu?.voiceClone || 'Clone voice',
      toolId: 'voiceClone',
      type: 'audio',
    },
  ];

  // Categories
  // 使用可选链防止 t.tabs 未定义
  const tabs = t.tabs || ['All', 'Characters', 'Animals', 'Anime', 'Creative', 'Food', 'Scenery', 'Product'];
  const categories = [
    { id: '', name: tabs[0] || 'All' },
    { id: '人物', name: tabs[1] || 'Characters' },
    { id: '宠物', name: tabs[2] || 'Animals' },
    { id: '动漫', name: tabs[3] || 'Anime' },
    { id: '创意', name: tabs[4] || 'Creative' },
    { id: '食物', name: tabs[5] || 'Food' },
    { id: '风景', name: tabs[6] || 'Scenery' },
    { id: '产品', name: tabs[7] || 'Product' },
  ];

  // KeepAlive 激活时逻辑
  useActivate(() => {
    console.log('CreateHome activated (restored from cache)');
    
    // 1. 恢复滚动位置
    const scrollContainer = document.getElementById('dashboard-main-scroll');
    if (scrollContainer && scrollTopRef.current > 0) {
      // 稍微延迟以确保 DOM 渲染完成
      setTimeout(() => {
        scrollContainer.scrollTop = scrollTopRef.current;
      }, 0);
    }

    // 2. 重新检查无限滚动观察器
    if (labTemplateData.length > 0 && hasMore) {
      setupInfiniteScroll();
    }
  });

  // KeepAlive 缓存（离开）时逻辑
  useUnactivate(() => {
    console.log('CreateHome unactivated (caching)');
    
    // 保存滚动位置
    const scrollContainer = document.getElementById('dashboard-main-scroll');
    if (scrollContainer) {
      scrollTopRef.current = scrollContainer.scrollTop;
    }
  });

  // 加载模板数据
  const loadTemplates = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const currentParams = {
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 30, // 统一使用 30 作为默认值
        templateName: templateName || undefined
      };
      
      const res = await templateService.getLabTemplateList(currentParams);
      
      console.log('📋 模板列表 API 响应:', res, '请求参数:', currentParams);
      
      // 兼容直接返回 { rows, total } 的格式
      if (res && Array.isArray(res.rows)) {
         const newRows = res.rows;
         const total = res.total || 0;
         const processedRows = newRows.map(item => ({
           ...item,
           isLike: item.isLike ?? false
         }));
         
         // 更新数据
         setLabTemplateData(prev => {
           const updatedData = currentParams.pageNum === 1
             ? processedRows
             : [...prev, ...processedRows];
           
           // 判断是否还有更多数据
           if (total > 0) {
             const hasMoreData = updatedData.length < total;
             setHasMore(hasMoreData);
           } else {
             const hasMoreData = processedRows.length >= (currentParams.pageSize || 30);
             setHasMore(hasMoreData);
           }
           
           return updatedData;
         });
      }
      else if (res.code === 200) {
        const newRows = Array.isArray(res.rows) ? res.rows : [];
        const total = res.total || 0;
        const processedRows = newRows.map(item => ({
          ...item,
          isLike: item.isLike ?? false
        }));
        
        // 更新数据
        setLabTemplateData(prev => {
          const updatedData = currentParams.pageNum === 1
            ? processedRows
            : [...prev, ...processedRows];
          
          // 判断是否还有更多数据
          if (total > 0) {
            const hasMoreData = updatedData.length < total;
            setHasMore(hasMoreData);
          } else {
            const hasMoreData = processedRows.length >= (currentParams.pageSize || 30);
            setHasMore(hasMoreData);
          }
          
          return updatedData;
        });
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      const currentPageNum = params.pageNum || 1;
      if (currentPageNum > 1) {
        setParams(prev => ({ ...prev, pageNum: currentPageNum - 1 }));
      }
    } finally {
      setLoading(false);
    }
  }, [loading, params.pageNum, params.pageSize, templateName]);

  // 设置无限滚动观察器
  const setupInfiniteScroll = useCallback(() => {
    // 清理旧的观察器
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!sentinelRef.current || !hasMore || loading) {
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasMore && !loading) {
          setParams(prev => {
            const nextPageNum = (prev.pageNum || 1) + 1;
            return { ...prev, pageNum: nextPageNum };
          });
        }
      },
      { 
        threshold: 0, 
        rootMargin: '300px 0px', // 提前300px加载，确保用户滚动时能及时加载
        root: document.getElementById('dashboard-main-scroll') // 显式指定滚动容器
      }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }
  }, [hasMore, loading, params.pageNum, labTemplateData.length]);

  // 当 pageNum 或 templateName 变化时加载数据
  useEffect(() => {
    // 如果已有数据且参数未变（通常发生在 KeepAlive 恢复时），不要重新加载
    // 但这里 pageNum 变化肯定是需要加载的
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.pageNum, templateName]); 

  // 设置无限滚动
  useEffect(() => {
    if (labTemplateData.length > 0 && hasMore) {
      // 延迟设置观察器，确保 DOM 已渲染
      const timer = setTimeout(() => {
        setupInfiniteScroll();
      }, 500);

      return () => {
        clearTimeout(timer);
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
      };
    }
  }, [labTemplateData.length, hasMore, setupInfiniteScroll]);

  const handleTypeClick = (toolId: string) => {
    // AI混剪视频功能暂未开放
    if (toolId === 'viralVideo') {
      toast.error(t.templateDetail?.featureNotOpen || '该功能暂未开放');
      return;
    }
    // 使用路由跳转而不是 query params
    navigate(`/create/${toolId}`);
  };

  const switchCategory = (id: string) => {
    console.log('📋 切换分类:', id);
    setTemplateName(id);
    setParams(prev => ({ ...prev, pageNum: 1, pageSize: 30 }));
    setHasMore(true);
    setLabTemplateData([]);
    // 重置滚动位置
    const scrollContainer = document.getElementById('dashboard-main-scroll');
    if (scrollContainer) scrollContainer.scrollTop = 0;
    scrollTopRef.current = 0;
    
    // 清理观察器
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  };

  // 点击模板卡片
  const handleTemplateClick = (item: LabTemplate) => {
    setSelectedTemplate(item);
    setShowTemplateDetail(true);
  };

  // 点击喜欢
  const clickTemplateLike = async (e: React.MouseEvent, item: LabTemplate, type: boolean = true) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      showAuthModal();
      return;
    }

    try {
      let newLikeCount = 0;
      if (type) {
        // 取消喜欢
        newLikeCount = (item.likeCount || 0) === 0 ? 0 : (item.likeCount || 0) - 1;
      } else {
        // 喜欢
        newLikeCount = (item.likeCount || 0) + 1;
      }

      await templateService.updateLabTemplate({
        ...item,
        likeCount: newLikeCount,
      });

      // 更新本地状态
      setLabTemplateData(prev => 
        prev.map(t => 
          t.id === item.id 
            ? { ...t, isLike: !t.isLike, likeCount: newLikeCount }
            : t
        )
      );

      // 如果详情弹窗打开，也更新详情
      if (selectedTemplate && selectedTemplate.id === item.id) {
        setSelectedTemplate({
          ...selectedTemplate,
          isLike: !selectedTemplate.isLike,
          likeCount: newLikeCount
        });
      }
    } catch (error) {
      console.error('Failed to update like:', error);
    }
  };

  // 做同款功能
  const handleDoSame = (item: LabTemplate) => {
    const goToUrl = () => {
      setShowTemplateDetail(false);
      const isImageType = item.templateType === 1 || item.templateType === 2;
      const isImageToVideo = item.templateType === 4;

      // 根据旧系统逻辑，统一跳转到 /chat 页面
      const targetUrl = isImageType
        ? '/chat?mode=image'
        : '/chat?mode=video';

      const transferId = `transfer_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

      // 固定模型名称，与旧系统保持一致
      const modelName = isImageType
        ? 'doubao-seedream-4-0-250828'
        : 'veo-3.1-fast-generate-preview';

      const referenceMedia = (() => {
        if (item.templateType === 1) return ''; // 文生图，无需参考图
        if (item.templateType === 2) {
          // 图生图，使用原图
          return item.videoTemplateUrl || item.templateUrl || '';
        }
        if (isImageToVideo) {
          // 图生视频，优先使用原图作为参考
          return item.videoTemplateUrl || item.templateUrl || '';
        }
        // 文生视频无需参考素材
        return '';
      })();

      // 处理图片 URL，移除反引号等特殊字符
      const cleanImageUrl = referenceMedia ? referenceMedia.replace(/`/g, '') : '';
      const images = cleanImageUrl ? [cleanImageUrl] : [];
      
      // 使用 store 存储数据
      setData(transferId, {
        images,
        sourcePrompt: item.templateDesc,
        timestamp: Date.now(),
        source: isImageType 
          ? 'imageGenerates' 
          : (isImageToVideo ? 'videoGenerates:image2video' : 'videoGenerates:text2video'),
      });

      // 路由跳转，传递 transferId 和 model_name 参数
      // 使用 URLSearchParams 确保参数正确拼接
      const urlParams = new URLSearchParams();
      urlParams.set('mode', isImageType ? 'image' : 'video');
      urlParams.set('transferId', transferId);
      urlParams.set('model_name', modelName);
      navigate(`/chat?${urlParams.toString()}`);
    };

    if (!isAuthenticated) {
      // 登录成功后执行跳转
      showAuthModal(() => {
        goToUrl();
      });
      return;
    }

    goToUrl();
  };

  const renderDict = (type: number) => {
    const templateTypes = t.templateTypes || {};
    const map: Record<number, string> = {
      1: templateTypes.textToImage || '文生图',
      2: templateTypes.imageToImage || '图生图',
      3: templateTypes.textToVideo || '文生视频',
      4: templateTypes.imageToVideo || '图生视频'
    };
    return map[type] || 'Unknown';
  };

  // 处理键盘事件：Enter 发送，Shift + Enter 换行
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const readFileAsDataURL = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const triggerImagePicker = () => {
    imageInputRef.current?.click();
  };

  const handleImageSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_CREATE_UPLOAD_IMAGES - pendingImages.length;
    if (remainingSlots <= 0) {
      toast.error(`最多上传 ${MAX_CREATE_UPLOAD_IMAGES} 张图片`);
      event.target.value = '';
      return;
    }

    const imageFiles = Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, remainingSlots);

    if (imageFiles.length === 0) {
      toast.error('请选择图片文件');
      event.target.value = '';
      return;
    }

    const oversizeFile = imageFiles.find(
      (file) => file.size > MAX_CREATE_UPLOAD_SIZE_MB * 1024 * 1024
    );
    if (oversizeFile) {
      toast.error(`单张图片不能超过 ${MAX_CREATE_UPLOAD_SIZE_MB}MB`);
      event.target.value = '';
      return;
    }

    setIsUploadingImages(true);
    try {
      const base64Images = await Promise.all(imageFiles.map(readFileAsDataURL));
      setPendingImages((prev) => [...prev, ...base64Images]);
    } catch (error) {
      console.error('读取图片失败:', error);
      toast.error('图片读取失败，请重试');
    } finally {
      setIsUploadingImages(false);
      event.target.value = '';
    }
  };

  const clearPendingImages = () => {
    setPendingImages([]);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  // 处理发送消息
  const handleSend = (skipAuthCheck = false) => {
    const messageContent = inputValue.trim();
    if (!messageContent && pendingImages.length === 0) return;

    // 检查登录状态（除非跳过检查，比如登录成功后）
    if (!skipAuthCheck && !isAuthenticated) {
      showAuthModal(() => {
        // 登录成功后自动发送（跳过登录检查）
        if (inputValue.trim()) {
          handleSend(true);
        }
      });
      return;
    }

    if (typeof window !== 'undefined') {
      if (pendingImages.length > 0) {
        sessionStorage.setItem(
          CREATE_IMAGE_PAYLOAD_KEY,
          JSON.stringify({
            images: pendingImages,
            content: messageContent,
            timestamp: Date.now(),
          })
        );
      } else {
        sessionStorage.removeItem(CREATE_IMAGE_PAYLOAD_KEY);
      }
    }

    const search = new URLSearchParams({ mode: 'image' });
    if (messageContent) {
      search.set('content', messageContent);
    }

    // 跳转到聊天页面（图片生成模式）
    navigate(`/chat?${search.toString()}`);
    setPendingImages([]);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  // 处理按钮点击（包装 handleSend 以匹配事件处理器签名）
  const handleSendClick = () => {
    handleSend();
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
            {/* Hero Greeting */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {t.greeting || 'Welcome'} <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent inline-flex items-center gap-2">{t.greetingSuffix || 'Creator'} <Sparkles className="inline-block w-6 h-6 text-yellow-400" /></span>
              </h1>

              {/* Input Box */}
              <div className="max-w-3xl mx-auto relative mb-12">
                <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-lg transition-shadow focus-within:shadow-xl focus-within:ring-1 focus-within:ring-primary">
                  <textarea 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t.inputPlaceholder || 'Describe your imagination...'}
                    className="w-full h-14 resize-none bg-transparent p-5 text-base focus:outline-none text-foreground placeholder-muted/60"
                    rows={2}
                  />
                  <div className="flex items-center justify-between px-4 py-3 bg-background/50 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelection}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={triggerImagePicker}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:bg-background hover:text-foreground transition-colors"
                      >
                        {isUploadingImages ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Upload size={16} />
                        )}
                        {t.upload || 'Upload'}
                      </button>
                      {pendingImages.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-indigo-500">
                          <span>
                            {pendingImages.length}/{MAX_CREATE_UPLOAD_IMAGES}
                          </span>
                          <button
                            type="button"
                            onClick={clearPendingImages}
                            className="text-muted hover:text-foreground"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted hidden sm:inline">{t.keyboardHint || 'Enter to send · Shift + Enter for new line'}</span>
                      <button 
                        onClick={handleSendClick}
                        disabled={!inputValue.trim() && pendingImages.length === 0}
                        className={`h-9 w-9 rounded-full flex items-center justify-center transition-all shadow-md ${
                          inputValue.trim() || pendingImages.length > 0
                            ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20 cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Creative Types (Horizontal Scroll) */}
            <div className="mb-8 overflow-x-auto pb-4 custom-scrollbar">
              <div className="flex gap-4 min-w-max px-1">
                {creativeTypes.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => handleTypeClick(item.toolId)}
                    className="group min-w-[160px] w-[180px] cursor-pointer rounded-2xl border border-border bg-surface p-3 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
                  >
                    <div className="mb-3 flex justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 h-[100px] items-center">
                       <img src={item.icon} alt={item.title} className="w-full h-full object-contain p-2" />
                    </div>
                    <h3 className="text-center text-sm font-medium text-foreground truncate px-1">{item.title}</h3>
                    <p className="mt-1 text-center text-xs text-muted truncate px-1">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => switchCategory(cat.id)}
                  className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                    templateName === cat.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-surface text-muted hover:text-foreground hover:bg-border/50 border border-transparent hover:border-border'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Templates Masonry Grid - Using CSS Columns for stability */}
            <div className="pb-8">
              <div 
                ref={masonryRef}
                className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4"
              >
                 {labTemplateData.map((item, index) => (
                   <div 
                     key={item.id} 
                     className="break-inside-avoid rounded-xl bg-surface border border-border overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer mb-4"
                     onClick={() => handleTemplateClick(item)}
                   >
                      <div className="relative">
                         {/* Media Content */}
                         {item.templateType === 3 || item.templateType === 4 ? (
                            <video 
                              src={item.templateUrl?.replace(/`/g, '')}
                              className="w-full h-auto object-cover"
                              loop
                              muted
                              playsInline
                              onMouseEnter={(e) => {
                                const video = e.currentTarget;
                                video.play().catch(console.error);
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.pause();
                              }}
                            />
                         ) : (
                            <img 
                              src={item.templateUrl?.replace(/`/g, '')}
                              alt={item.templateName}
                              className="w-full h-auto object-cover"
                              loading="lazy"
                            />
                         )}
                         
                         {/* Overlay Info */}
                         <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end min-h-[80px]">
                            <div className="flex justify-between items-center mb-1">
                              <h3 className="text-sm font-bold truncate pr-2">{item.templateName}</h3>
                              <span className="text-[10px] bg-indigo-600 px-1.5 py-0.5 rounded text-white whitespace-nowrap">{renderDict(item.templateType)}</span>
                            </div>
                            <p className="text-[10px] text-white/80 line-clamp-2 mb-2">{item.templateDesc}</p>
                            <div className="flex justify-between items-center text-xs">
                               <button 
                                 className="bg-white/20 hover:bg-white/40 px-2 py-1 rounded text-[10px] backdrop-blur-sm"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleDoSame(item);
                                 }}
                               >
                                 {t.templateDetail?.makeSame || '做同款'}
                               </button>
                               <div 
                                 className="flex items-center gap-1 cursor-pointer" 
                                 onClick={(e) => clickTemplateLike(e, item, item.isLike)}
                               >
                                  <span className="text-base">{item.isLike ? '❤️' : '🤍'}</span>
                                  <span>{item.likeCount || 0}</span>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>

               {/* 无限滚动触发器 */}
               {hasMore && (
                 <div 
                   ref={sentinelRef}
                   className="w-full h-20 flex justify-center items-center mt-4"
                 >
                    {loading && <Loader2 className="animate-spin text-indigo-500" size={24} />}
                 </div>
               )}
            </div>
            
            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
              </div>
            )}
            
            {!loading && labTemplateData.length === 0 && (
               <div className="text-center py-12 text-muted">
                  {t.templateDetail?.noTemplates || 'No templates found.'}
               </div>
            )}
      </div>
        
        {/* 模板详情弹窗 */}
        {showTemplateDetail && selectedTemplate && (
          <TemplateDetailModal
            template={selectedTemplate}
            isOpen={showTemplateDetail}
            onClose={() => {
              setShowTemplateDetail(false);
              setSelectedTemplate(null);
            }}
            onDoSame={handleDoSame}
            onLike={(e, type) => clickTemplateLike(e, selectedTemplate, type)}
            renderDict={renderDict}
            t={t}
          />
        )}

    </div>
  );
};

// 模板详情弹窗组件
const TemplateDetailModal: React.FC<{
  template: LabTemplate;
  isOpen: boolean;
  onClose: () => void;
  onDoSame: (template: LabTemplate) => void;
  onLike: (e: React.MouseEvent, type: boolean) => void;
  renderDict: (type: number) => string;
  t: any;
}> = ({ template, isOpen, onClose, onDoSame, onLike, renderDict, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Left: Media */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center overflow-auto">
          {template.templateType === 3 || template.templateType === 4 ? (
            <video
              src={template.templateUrl?.replace(/`/g, '')}
              className="max-w-full max-h-full object-contain"
              controls
              autoPlay
              loop
              muted
            />
          ) : (
            <img
              src={template.templateUrl?.replace(/`/g, '')}
              alt={template.templateName}
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>

        {/* Right: Info */}
        <div className="flex-1 p-6 md:p-8 flex flex-col overflow-auto">
          <h2 className="text-2xl font-bold mb-4">{template.templateName}</h2>
          
          <div className="mb-4 flex-1">
            <p className="text-base leading-relaxed text-muted whitespace-pre-wrap">
              {template.templateDesc}
            </p>
          </div>

          {/* Original Image (for image-to-video) */}
          {template.videoTemplateUrl && (
            <div className="mb-4">
              <p className="text-sm text-muted mb-2">{t.templateDetail?.originalImage || '原图：'}</p>
              <img
                src={template.videoTemplateUrl.replace(/`/g, '')}
                alt="Original"
                className="w-24 h-24 object-cover rounded-lg border border-border"
              />
            </div>
          )}

          {/* Like and Type */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => onLike(e, template.isLike ?? false)}
                className="text-2xl hover:scale-110 transition-transform"
              >
                {template.isLike ? '❤️' : '🤍'}
              </button>
              <span className="text-sm text-muted">{template.likeCount || 0} {t.templateDetail?.likes || '喜欢'}</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-sm">
              {renderDict(template.templateType)}
            </span>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onDoSame(template)}
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
          >
            {t.templateDetail?.makeSame || '做同款'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateHome;
