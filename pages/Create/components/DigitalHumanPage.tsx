import React, { useState, useEffect, useRef } from 'react';
import { PenTool, Mic, X, Check, Loader, Play, AlertCircle, Palette } from 'lucide-react';
import { avatarService, AiAvatar, Voice, Caption, UploadedFile } from '../../../services/avatarService';
import { uploadService } from '../../../services/uploadService';
import { useAuthStore } from '../../../stores/authStore';
import DigitalHumanVideo from './DigitalHumanVideo';
import DigitalHumanProduct from './DigitalHumanProduct';
import DigitalHumanSinging from './DigitalHumanSinging';
import toast from 'react-hot-toast';

interface DigitalHumanPageProps {
  t: {
    title: string;
    subtitle: string;
    tabs: {
      video: string;
      product: string;
      singing: string;
    };
    leftPanel: {
      myDigitalHuman: string;
      uploadTitle: string;
      uploadFormat: string;
      uploadDesc: string;
      personalTemplate: string;
      publicTemplate: string;
      customUpload: string;
    };
    rightPanel: {
      modeSelection: string;
      mode1: string;
      mode2: string;
      scriptContent: string;
      textToSpeech: string;
      importAudio: string;
      textPlaceholder: string;
      textLimit: number;
      voiceType: string;
      aiVoice: string;
      publicVoice: string;
      selectVoice: string;
      aiSubtitle: string;
      selectSubtitleStyle: string;
      previewPlaceholder: string;
      tryExample: string;
      generate: string;
    };
  };
  productAvatarT: any;
}

const DigitalHumanPage: React.FC<DigitalHumanPageProps> = ({ t, productAvatarT }) => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'video' | 'product' | 'singing'>('video');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Video Tab Shared State
  const [avatarList, setAvatarList] = useState<AiAvatar[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<AiAvatar | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<UploadedFile | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [isCustomAvatar, setIsCustomAvatar] = useState(false);
  const [avatarPagination, setAvatarPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
    gender: 'male' as 'male' | 'female',
  });
  const [videoPreviewStates, setVideoPreviewStates] = useState<Record<string, boolean>>({});
  
  // AbortController ref for canceling previous requests
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Load Avatars when modal opens
  useEffect(() => {
    if (showAvatarModal) {
      loadAvatarList();
    }
    
    // Cleanup: cancel request when component unmounts or dependencies change
    return () => {
      if (abortControllerRef.current) {
        // Cleanup cancellation is silent (no toast)
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [showAvatarModal, avatarPagination.current, avatarPagination.pageSize, avatarPagination.gender, isCustomAvatar]);
  
  const loadAvatarList = async (showCancelToast: boolean = false) => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      // Show toast immediately if requested (this is an active cancellation)
      if (showCancelToast) {
        toast.error('请求已取消');
      }
      // 直接 abort，request.ts 会根据是否有 externalSignal 来判断是主动取消还是超时
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    try {
      setAvatarLoading(true);
      setAvatarList([]);

      let res;
      
      if (isCustomAvatar) {
        // 个人模板参数：assetTypeList='3,9', isPrivateModel='1'
        res = await avatarService.adsAssetsList({ 
          pageNo: avatarPagination.current, 
          pageSize: avatarPagination.pageSize,
          assetTypeList: '3,9',
          isPrivateModel: '1',
        }, { signal: abortController.signal });
      } else {
        // 公共模板参数：gender, isCustom
        res = await avatarService.getAiAvatarList({ 
          pageNo: avatarPagination.current, 
          pageSize: avatarPagination.pageSize,
          gender: avatarPagination.gender,
          isCustom: isCustomAvatar, // false
        }, { signal: abortController.signal });
      }
      if (res.code === '200' || res.rows && res.rows.length > 0) {
        let avatarData: AiAvatar[] = [];
        let total = 0;
        
        if (isCustomAvatar) {
           // 处理 adsAssetsList 返回结构
           const rows = (res as any).rows || (res as any).result?.rows || (res.data as any)?.rows || [];
           avatarData = rows.map((item: any) => ({
             ...item,
             aiavatarId: item.aiAvatarId,
             aiavatarName: item.assetName,
             coverUrl: item.assetUrl, // 使用 assetUrl 作为封面
             thumbnailUrl: item.assetUrl,
             previewVideoUrl: item.assetUrl, // 使用 assetUrl 作为预览视频
             gender: 'unknown' // 个人素材可能没有性别字段
           }));
           total = (res as any).total || (res as any).result?.total || (res.data as any)?.total || 0;
        } else {
          // 处理 getAiAvatarList 返回结构
          if ((res as any).result?.data) {
            avatarData = (res as any).result.data;
            total = (res as any).result.total || 0;
          } else if (res.data?.result?.data) {
            avatarData = res.data.result.data;
            total = res.data.result.total || 0;
          } else if (res.data && typeof res.data === 'object' && 'data' in res.data) {
            const dataObj = res.data as unknown as { data?: AiAvatar[]; total?: number };
            avatarData = Array.isArray(dataObj.data) ? dataObj.data : [];
            total = dataObj.total || 0;
          }
        }
        
        setAvatarList(avatarData || []);
        setAvatarPagination(prev => ({ ...prev, total }));
      }
    } catch (error: any) {
      console.error('Failed to load avatars:', error);
    } finally {
      // Only clear loading state if this request wasn't cancelled
      if (abortControllerRef.current === abortController) {
        setAvatarLoading(false);
        abortControllerRef.current = null;
      }
    }
  };
  
  const handleFileUpload = async (file: File, type: 'video' | 'audio' | 'image') => {
    try {
      setUploading(true);
      setErrorMessage(null);
      
      const data = await uploadService.uploadFile(file);
      const uploadedFile: UploadedFile = {
          fileId: data.ossId,
          fileName: data.fileName,
          fileUrl: data.url,
          format: file.name.split('.').pop() || '',
      };
      // Check audio duration if needed (requires loading audio)
      if (type === 'audio') {
            const audio = new Audio(data.url);
            await new Promise(resolve => {
                audio.onloadedmetadata = () => {
                    uploadedFile.duration = audio.duration;
                    resolve(null);
                };
                audio.onerror = () => resolve(null); // Proceed even if metadata fails
            });
      }

      return uploadedFile;
    } catch (error: any) {
      console.error('File upload failed:', error);
      setErrorMessage(error.message || '文件上传失败');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900 p-4 md:p-5 flex flex-col gap-4 overflow-hidden">
      
      {/* Header */}
      <div className="text-center text-gray-800 dark:text-gray-100 space-y-2 flex-shrink-0">
        <h1 className="text-3xl font-bold tracking-wide">{t.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm opacity-90">{t.subtitle}</p>
      </div>

      {/* Top Tabs */}
      <div className="flex justify-center flex-shrink-0">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-1 rounded-full flex gap-1">
          <button
            onClick={() => setActiveTab('video')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'video' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <PenTool size={14} />
            {t.tabs.video}
          </button>
          <button
            onClick={() => setActiveTab('product')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'product' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Palette size={14} />
            {t.tabs.product}
          </button>
          <button
            onClick={() => setActiveTab('singing')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'singing' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Mic size={14} />
            {t.tabs.singing}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex-shrink-0">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="ml-auto"><X size={14}/></button>
          </div>
          )}

      <div className="flex-1 overflow-hidden min-h-0">
          <div className={`h-full w-full ${activeTab === 'video' ? 'block' : 'hidden'}`}>
            <DigitalHumanVideo 
                t={t}
                onShowAvatarModal={(isCustom) => { setIsCustomAvatar(isCustom); setShowAvatarModal(true); }}
                selectedAvatar={selectedAvatar}
                setSelectedAvatar={setSelectedAvatar}
                uploadedVideo={uploadedVideo}
                setUploadedVideo={setUploadedVideo}
                handleFileUpload={handleFileUpload}
                uploading={uploading}
                setErrorMessage={setErrorMessage}
            />
          </div>
          <div className={`h-full w-full ${activeTab === 'product' ? 'block' : 'hidden'}`}>
            <DigitalHumanProduct 
                t={productAvatarT}
                handleFileUpload={handleFileUpload}
                uploading={uploading}
                setErrorMessage={setErrorMessage}
            />
          </div>
          <div className={`h-full w-full ${activeTab === 'singing' ? 'block' : 'hidden'}`}>
            <DigitalHumanSinging 
                t={t}
                handleFileUpload={handleFileUpload}
                uploading={uploading}
                setErrorMessage={setErrorMessage}
            />
          </div>
      </div>
      
      {/* Avatar Modal (Shared for Video Tab) */}
      {showAvatarModal && (
        <AvatarModal
          avatars={avatarList}
          selected={selectedAvatar}
          onSelect={(avatar) => {
            setSelectedAvatar(avatar);
            setShowAvatarModal(false);
            setVideoPreviewStates({});
          }}
          onClose={() => {
            setShowAvatarModal(false);
            setVideoPreviewStates({});
          }}
          loading={avatarLoading}
          pagination={avatarPagination}
          isCustom={isCustomAvatar}
          onPaginationChange={(page, pageSize) => {
            setAvatarPagination(prev => ({ ...prev, current: page, pageSize }));
          }}
          onGenderChange={(gender) => {
            setAvatarPagination(prev => ({ ...prev, gender, current: 1 }));
          }}
          onCustomChange={(isCustom) => {
            setIsCustomAvatar(isCustom);
            setAvatarPagination(prev => ({ ...prev, current: 1 }));
          }}
          onVideoPreview={(avatarId, preview) => {
            setVideoPreviewStates(prev => ({ ...prev, [avatarId]: preview }));
          }}
          previewStates={videoPreviewStates}
        />
      )}
    </div>
  );
};

// Reusing AvatarModal from previous implementation
const AvatarModal: React.FC<{
  avatars: AiAvatar[];
  selected: AiAvatar | null;
  onSelect: (avatar: AiAvatar) => void;
  onClose: () => void;
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    gender: 'male' | 'female';
  };
  isCustom: boolean;
  onPaginationChange: (page: number, pageSize: number) => void;
  onGenderChange: (gender: 'male' | 'female') => void;
  onCustomChange: (isCustom: boolean) => void;
  onVideoPreview: (avatarId: string, preview: boolean) => void;
  previewStates: Record<string, boolean>;
}> = ({ 
  avatars, 
  selected, 
  onSelect, 
  onClose, 
  loading, 
  pagination,
  isCustom,
  onPaginationChange,
  onGenderChange,
  onCustomChange,
  onVideoPreview,
  previewStates,
}) => {
  // 使用 useRef 来存储当前的定时器 ID
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // 处理鼠标移入：添加延时，避免快速划过时触发大量视频加载
  const handleMouseEnter = (avatarId: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    
    hoverTimeoutRef.current = setTimeout(() => {
      onVideoPreview(avatarId, true);
    }, 600); // 600ms 延迟
  };

  // 处理鼠标移出：立即清除定时器并停止播放
  const handleMouseLeave = (avatarId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    onVideoPreview(avatarId, false);
  };

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{isCustom ? '个人模板' : '公共模板'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>
        
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => onCustomChange(false)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!isCustom ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              公共模板
            </button>
            <button onClick={() => onCustomChange(true)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${isCustom ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              个人模板
            </button>
          </div>
          
          {!isCustom && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">性别筛选：</label>
              <select value={pagination.gender} onChange={(e) => onGenderChange(e.target.value as 'male' | 'female')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="male">男性</option>
                <option value="female">女性</option>
              </select>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="animate-spin text-indigo-600" size={32} />
              <span className="ml-3 text-gray-600 dark:text-gray-400">正在加载...</span>
            </div>
          ) : avatars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-lg mb-2">暂无数据</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {avatars.map(avatar => (
                  <div
                    key={avatar.aiavatarId}
                    onMouseEnter={() => handleMouseEnter(avatar.aiavatarId)}
                    onMouseLeave={() => handleMouseLeave(avatar.aiavatarId)}
                    onClick={() => onSelect(avatar)}
                    className={`relative aspect-[9/16] w-full rounded-lg overflow-hidden cursor-pointer transition hover:shadow-lg ${selected?.aiavatarId === avatar.aiavatarId ? 'ring-2 ring-offset-2 ring-indigo-500' : 'border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300'}`}
                  >
                    <img src={avatar.thumbnailUrl || avatar.coverUrl} alt={avatar.aiavatarName} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/nullAvatar.png'; }} />
                    {previewStates[avatar.aiavatarId] && avatar.previewVideoUrl && (
                      <video 
                        src={avatar.previewVideoUrl} 
                        className="absolute inset-0 w-full h-full object-cover" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const video = e.currentTarget;
                          if (video.crossOrigin !== null) {
                            video.crossOrigin = null;
                            video.referrerPolicy = 'no-referrer';
                          }
                        }}
                      />
                    )}
                    {selected?.aiavatarId === avatar.aiavatarId && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                        <Check size={16} className="text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-white text-xs font-medium truncate">{avatar.aiavatarName}</p>
                      <p className="text-white/80 text-[10px]">{avatar.gender}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {pagination.total > pagination.pageSize && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button onClick={() => onPaginationChange(pagination.current - 1, pagination.pageSize)} disabled={pagination.current <= 1} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">上一页</button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">第 {pagination.current} 页 / 共 {Math.ceil(pagination.total / pagination.pageSize)} 页</span>
                  <button onClick={() => onPaginationChange(pagination.current + 1, pagination.pageSize)} disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">下一页</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigitalHumanPage;
