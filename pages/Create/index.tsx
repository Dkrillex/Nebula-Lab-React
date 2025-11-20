
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Image, Video, Wand2, Eraser, Upload, ArrowRight, Sparkles, 
  PenTool, Star, User, Clock, 
  Layers, Users, 
  Loader2, Heart, X
} from 'lucide-react';
import TextToImagePage from './components/TextToImagePage';
import ViralVideoPage from './components/ViralVideoPage';
import ImageToVideoPage from './components/ImageToVideoPage';
import DigitalHumanPage from './components/DigitalHumanPage';
import StyleTransferPage from './components/StyleTransferPage';
import WorkshopPage from './components/WorkshopPage';
import { templateService, LabTemplate, LabTemplateQuery } from '../../services/templateService';
import { useVideoGenerationStore } from '../../stores/videoGenerationStore';
import { useAuthStore } from '../../stores/authStore';
import AuthModal from '../../components/AuthModal';

interface CreatePageProps {
  onNavigate: (path: string) => void;
  t: {
    greeting: string;
    greetingSuffix: string;
    inputPlaceholder: string;
    send: string;
    upload: string;
    sideMenu: {
      home: string;
      modelCenter: string;
      creationCenter: string;
      personalCenter: string;
      // Model Center items
      aiExperience: string;
      modelSquare: string;
      apiKeys: string;
      apiDocs: string;
      // Creation Center items
      viralVideo: string;
      digitalHuman: string;
      imgToVideo: string;
      textToImage: string;
      styleTransfer: string;
      voiceClone: string;
      workshop: string;
      // Personal Center items
      assets: string;
      pricing: string;
      expenses: string;
    };
    shortcuts: {
      video: string;
      videoDesc: string;
      avatar: string;
      avatarDesc: string;
      transform: string;
      transformDesc: string;
      sketch: string;
      sketchDesc: string;
      inpainting: string;
      inpaintingDesc: string;
    };
    tabs: string[];
    textToImage?: any;
    viralVideo?: any;
    imgToVideo?: any;
    digitalHuman?: any;
    styleTransfer?: any;
    authModal?: any;
  };
}

const CreatePage: React.FC<CreatePageProps> = ({ t, onNavigate }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { setData } = useVideoGenerationStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Default to home (dashboard) if no tool is specified
  const activeMenu = searchParams.get('tool') || 'home';
  
  const [labTemplateData, setLabTemplateData] = useState<LabTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [templateName, setTemplateName] = useState('');
  const [params, setParams] = useState<LabTemplateQuery>({
    pageNum: 1,
    pageSize: 30 // 增加初始 pageSize，确保第一次加载更多数据
  });

  // 模板详情弹窗
  const [selectedTemplate, setSelectedTemplate] = useState<LabTemplate | null>(null);
  const [showTemplateDetail, setShowTemplateDetail] = useState(false);

  // 无限滚动相关
  const sentinelRef = useRef<HTMLDivElement>(null);
  const masonryRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const onMenuChange = (id: string) => {
    setSearchParams({ tool: id });
  };

  // Creative Types Data
  const creativeTypes = [
    {
      id: 1,
      title: 'AI Viral Video', 
      icon: 'https://nebula-ads.oss-cn-guangzhou.aliyuncs.com/cdn/picture/k-pop.png',
      description: 'AI mixed cut video',
      toolId: 'viralVideo',
      type: 'image',
    },
    { 
      id: 3,
      title: 'Talking Photo',
      icon: 'https://nebula-ads.oss-cn-guangzhou.aliyuncs.com/cdn/picture/talking-pictures.png',
      description: 'Make photos talk',
      toolId: 'digitalHuman',
      type: 'image',
    },
    {
      id: 4,
      title: 'Digital Human',
      icon: 'https://nebula-ads.oss-cn-guangzhou.aliyuncs.com/cdn/picture/product-digital-person.png',
      description: 'Product digital human video',
      toolId: 'digitalHuman',
      type: 'image',
    },
    {
      id: 5,
      title: 'Style Transfer',
      icon: 'https://nebula-ads.oss-cn-guangzhou.aliyuncs.com/cdn/picture/all-things-migrate-img.png',
      description: 'Transform object styles',
      toolId: 'styleTransfer', 
      type: 'image',
    },
    {
      id: 6,
      title: 'Text to Image',
      icon: 'https://nebula-ads.oss-cn-guangzhou.aliyuncs.com/cdn/picture/text2image.png',
      description: 'Generate images from text',
      toolId: 'textToImage',
      type: 'image',
    },
    { 
      id: 7,
      title: 'Image Editing',
      icon: 'https://nebula-ads.oss-cn-guangzhou.aliyuncs.com/cdn/picture/productAnyEdit.png',
      description: 'AI intelligent image editing',
      toolId: 'textToImage', // Fallback or new tool
      type: 'image',
    },
  ];

  // Categories
  const categories = [
    { id: '', name: t.tabs[0] || 'All' },
    { id: '人物', name: t.tabs[1] || 'Characters' },
    { id: '宠物', name: t.tabs[2] || 'Animals' },
    { id: '动漫', name: t.tabs[3] || 'Anime' },
    { id: '创意', name: t.tabs[4] || 'Creative' },
    { id: '食物', name: t.tabs[5] || 'Food' },
    { id: '风景', name: t.tabs[6] || 'Scenery' },
    { id: '产品', name: t.tabs[7] || 'Product' },
  ];

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
      
      if (res.code === 200) {
        const newRows = Array.isArray(res.rows) ? res.rows : [];
        const total = res.total || 0;
        const processedRows = newRows.map(item => ({
          ...item,
          isLike: item.isLike ?? false
        }));
        
        console.log('📋 处理后的模板数据:', processedRows.length, '条，当前页码:', currentParams.pageNum, '总数:', total);
        
        // 更新数据
        setLabTemplateData(prev => {
          const updatedData = currentParams.pageNum === 1
            ? processedRows
            : [...prev, ...processedRows];
          
          console.log('📋 更新模板数据:', {
            isFirstPage: currentParams.pageNum === 1,
            newRows: processedRows.length,
            prevCount: prev.length,
            updatedCount: updatedData.length
          });
          
          // 判断是否还有更多数据：
          // 1. 如果有 total 字段，比较已加载的数据量和总数
          // 2. 如果没有 total 字段，使用返回数据量是否等于 pageSize 来判断
          if (total > 0) {
            const hasMoreData = updatedData.length < total;
            setHasMore(hasMoreData);
            console.log('📋 使用 total 判断:', {
              loaded: updatedData.length,
              total,
              hasMore: hasMoreData
            });
          } else {
            // 如果没有 total 字段，使用返回数据量判断
            const hasMoreData = processedRows.length >= (currentParams.pageSize || 30);
            setHasMore(hasMoreData);
            console.log('📋 使用返回数据量判断:', {
              returned: processedRows.length,
              pageSize: currentParams.pageSize,
              hasMore: hasMoreData
            });
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
      console.log('📋 无限滚动设置跳过:', { 
        hasSentinel: !!sentinelRef.current, 
        hasMore, 
        loading 
      });
      return;
    }

    console.log('📋 设置无限滚动观察器，当前数据量:', labTemplateData.length);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasMore && !loading) {
          console.log('📋 触发加载更多，当前页码:', params.pageNum, '当前数据量:', labTemplateData.length);
          setParams(prev => {
            const nextPageNum = (prev.pageNum || 1) + 1;
            console.log('📋 更新页码:', prev.pageNum, '->', nextPageNum);
            return { ...prev, pageNum: nextPageNum };
          });
        }
      },
      { 
        threshold: 0, 
        rootMargin: '300px 0px' // 提前300px加载，确保用户滚动时能及时加载
      }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
      console.log('📋 已开始观察 sentinel 元素');
    } else {
      console.warn('📋 sentinel 元素不存在，无法设置观察器');
    }
  }, [hasMore, loading, params.pageNum, labTemplateData.length]);

  // 当 activeMenu、pageNum 或 templateName 变化时加载数据
  useEffect(() => {
    if (activeMenu === 'home') {
      console.log('📋 触发加载模板，activeMenu:', activeMenu, 'pageNum:', params.pageNum, 'templateName:', templateName);
      loadTemplates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu, params.pageNum, templateName]); // loadTemplates 已在内部使用最新的 params 和 templateName

  // 设置无限滚动
  useEffect(() => {
    if (activeMenu === 'home' && labTemplateData.length > 0 && hasMore) {
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
  }, [labTemplateData.length, activeMenu, hasMore, setupInfiniteScroll]);

  const handleTypeClick = (toolId: string) => {
    onMenuChange(toolId);
  };

  const switchCategory = (id: string) => {
    console.log('📋 切换分类:', id);
    setTemplateName(id);
    setParams(prev => ({ ...prev, pageNum: 1, pageSize: 30 }));
    setHasMore(true);
    setLabTemplateData([]);
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
      setIsAuthModalOpen(true);
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

      const targetUrl = isImageType
        ? '/chat?mode=image'
        : '/chat?mode=video';

      const transferId = `transfer_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

      const modelName = isImageType
        ? 'doubao-seedream-4-0-250828'
        : 'veo-3.1-fast-generate-preview';

      const referenceMedia = (() => {
        if (item.templateType === 1) return '';
        if (item.templateType === 2) {
          return item.videoTemplateUrl || item.templateUrl || '';
        }
        if (isImageToVideo) {
          return item.videoTemplateUrl || item.templateUrl || '';
        }
        return '';
      })();

      const images = referenceMedia ? [referenceMedia] : [];
      
      // 使用 store 存储数据
      setData(transferId, {
        images,
        sourcePrompt: item.templateDesc,
        timestamp: Date.now(),
        source: isImageType ? 'imageGenerates' : (isImageToVideo ? 'videoGenerates:image2video' : 'videoGenerates:text2video'),
      });

      navigate(`${targetUrl}&transferId=${transferId}&model_name=${modelName}`);
    };

    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      // 登录成功后执行跳转
      return;
    }

    goToUrl();
  };

  const renderDict = (type: number) => {
    const map: Record<number, string> = {
      1: '文生图',
      2: '图生图',
      3: '文生视频',
      4: '图生视频'
    };
    return map[type] || 'Unknown';
  };

  const renderContent = () => {
    if (activeMenu === 'textToImage' && t.textToImage) {
      return <TextToImagePage t={t.textToImage} />;
    }
    if (activeMenu === 'viralVideo' && t.viralVideo) {
      return <ViralVideoPage t={t.viralVideo} />;
    }
    if (activeMenu === 'imgToVideo' && t.imgToVideo) {
      return <ImageToVideoPage t={t.imgToVideo} />;
    }
    if (activeMenu === 'digitalHuman' && t.digitalHuman) {
      return <DigitalHumanPage t={t.digitalHuman} />;
    }
    if (activeMenu === 'styleTransfer' && t.styleTransfer) {
      return <StyleTransferPage t={t.styleTransfer} />;
    }
    if (activeMenu === 'workshop' && t.workshop) {
      return <WorkshopPage t={t.workshop} />;
    }
    
    // Default Create Dashboard
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
            {/* Hero Greeting */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {t.greeting} <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent inline-flex items-center gap-2">{t.greetingSuffix} <Sparkles className="inline-block w-6 h-6 text-yellow-400" /></span>
              </h1>

              {/* Input Box */}
              <div className="max-w-3xl mx-auto relative mb-12">
                <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-lg transition-shadow focus-within:shadow-xl focus-within:ring-1 focus-within:ring-primary">
                  <textarea 
                    placeholder={t.inputPlaceholder}
                    className="w-full h-28 resize-none bg-transparent p-5 text-base focus:outline-none text-foreground placeholder-muted/60"
                  />
                  <div className="flex items-center justify-between px-4 py-3 bg-background/50 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:bg-background hover:text-foreground transition-colors">
                        <Upload size={16} />
                        {t.upload}
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted hidden sm:inline">Enter {t.send} · Shift + Enter New Line</span>
                      <button className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
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
                                 做同款
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
                  No templates found.
               </div>
            )}
          </div>
    );
  };

  return (
    <div className="w-full">
        {renderContent()}
        
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
          />
        )}

        {/* 登录弹窗 */}
        {t.authModal && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onLoginSuccess={() => {
              setIsAuthModalOpen(false);
              // 如果有点击操作，可以在这里继续执行
            }}
            t={t.authModal}
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
}> = ({ template, isOpen, onClose, onDoSame, onLike, renderDict }) => {
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
              <p className="text-sm text-muted mb-2">原图：</p>
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
              <span className="text-sm text-muted">{template.likeCount || 0} 喜欢</span>
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
            做同款
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
