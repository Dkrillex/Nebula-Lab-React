import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Pause, User } from 'lucide-react';
import BaseModal from '@/components/BaseModal';
import { avatarService, Voice } from '@/services/avatarService';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (voice: Voice) => void;
  selectedVoiceId?: string;
  t?: any;
}

const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedVoiceId,
  t,
}) => {
  const [activeTab, setActiveTab] = useState<'public' | 'custom'>('public');
  
  // 分别维护两个独立的加载状态
  const [publicLoading, setPublicLoading] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);
  
  // 分别维护两个独立的数组
  const [publicVoiceList, setPublicVoiceList] = useState<Voice[]>([]);
  const [customVoiceList, setCustomVoiceList] = useState<Voice[]>([]);
  
  // 分别维护两个独立的分页状态
  const [publicPagination, setPublicPagination] = useState({ pageNo: 1, pageSize: 20, total: 0 });
  const [customPagination, setCustomPagination] = useState({ pageNo: 1, pageSize: 20, total: 0 });
  
  // Filters (仅用于公共音色)
  const [filters, setFilters] = useState({
    language: '',
    gender: '',
    age: '',
    style: '',
  });
  
  // 根据当前标签页获取对应的列表、分页和加载状态
  const currentVoiceList = activeTab === 'public' ? publicVoiceList : customVoiceList;
  const currentPagination = activeTab === 'public' ? publicPagination : customPagination;
  const currentLoading = activeTab === 'public' ? publicLoading : customLoading;

  // Audio Player
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // 缓存机制：存储已获取的音色列表
  const cacheRef = useRef<Map<string, { list: Voice[]; total: number; timestamp: number }>>(new Map());
  const CACHE_EXPIRY = 5 * 60 * 1000; // 缓存5分钟

  // 生成缓存键
  const getCacheKey = (tab: 'public' | 'custom', pageNo: number, filters?: any) => {
    if (tab === 'custom') {
      return `custom_${pageNo}`;
    }
    const filterStr = filters ? JSON.stringify(filters) : '';
    return `public_${pageNo}_${filterStr}`;
  };

  // 检查缓存是否有效
  const getCachedData = (key: string) => {
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      return cached;
    }
    return null;
  };

  // 设置缓存
  const setCache = (key: string, list: Voice[], total: number) => {
    cacheRef.current.set(key, {
      list,
      total,
      timestamp: Date.now(),
    });
  };

  useEffect(() => {
    if (isOpen) {
      // 打开模态框时，同时加载两个列表
      fetchPublicVoices();
      fetchCustomVoices();
    } else {
      stopAudio();
    }
  }, [isOpen]);

  // 当切换标签页、分页或筛选条件变化时，重新加载对应列表
  useEffect(() => {
    if (isOpen && activeTab === 'public') {
      fetchPublicVoices();
    }
  }, [isOpen, activeTab, publicPagination.pageNo, filters]);

  useEffect(() => {
    if (isOpen && activeTab === 'custom') {
      fetchCustomVoices();
    }
  }, [isOpen, activeTab, customPagination.pageNo]);

  // 获取公共音色列表
  const fetchPublicVoices = async () => {
    // 先检查缓存
    const cacheKey = getCacheKey('public', publicPagination.pageNo, filters);
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      // 使用缓存数据
      setPublicVoiceList(cached.list);
      setPublicPagination(prev => ({ ...prev, total: cached.total }));
      return;
    }

    // 缓存未命中，调用接口
    setPublicLoading(true);
    try {
      const params: any = {
        pageNo: publicPagination.pageNo,
        pageSize: publicPagination.pageSize,
      };
      if (filters.language) params.language = filters.language;
      if (filters.gender) params.gender = filters.gender;
      if (filters.style) params.style = filters.style;
      if (filters.age) params.age = filters.age;
      
      const { result, code } = await avatarService.getVoiceList(params);
      
      let list: Voice[] = [];
      let total = 0;
      
      if (code === '200' && result.data) {
        list = (result as any).data;
        total = (result as any).total;
      }
      
      // 保存到缓存
      setCache(cacheKey, list, total);
      
      setPublicVoiceList(list || []);
      setPublicPagination(prev => ({ ...prev, total }));
    } catch (error) {
      console.error('Failed to fetch public voices:', error);
    } finally {
      setPublicLoading(false);
    }
  };

  // 获取我的音色列表
  const fetchCustomVoices = async () => {
    // 先检查缓存
    const cacheKey = getCacheKey('custom', customPagination.pageNo);
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      // 使用缓存数据
      setCustomVoiceList(cached.list);
      setCustomPagination(prev => ({ ...prev, total: cached.total }));
      return;
    }

    // 缓存未命中，调用接口
    setCustomLoading(true);
    try {
      const res = await avatarService.adsAssetsList({
        pageNo: customPagination.pageNo,
        pageSize: customPagination.pageSize,
        assetType: 8,
        isPrivateModel: '1',
      });
      
      let list: Voice[] = [];
      let total = 0;
      
      if (res.rows) {
        list = res.rows.map((item: any) => ({
          voiceId: item.assetId,
          voiceName: item.assetName,
          demoAudioUrl: item.assetUrl,
        }));
        total = res.total || 0;
      }
      
      // 保存到缓存
      setCache(cacheKey, list, total);
      
      setCustomVoiceList(list || []);
      setCustomPagination(prev => ({ ...prev, total }));
    } catch (error) {
      console.error('Failed to fetch custom voices:', error);
    } finally {
      setCustomLoading(false);
    }
  };

  const handlePlay = (voice: Voice, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingId === voice.voiceId) {
      stopAudio();
    } else {
      if (voice.demoAudioUrl) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(voice.demoAudioUrl);
        audio.onended = () => setPlayingId(null);
        // Vue uses 1.2s start time
        audio.currentTime = 1.2; 
        audio.play().catch(e => console.error("Play failed", e));
        audioRef.current = audio;
        setPlayingId(voice.voiceId);

        // 3s after (Vue says 3s logic but uses 6500ms which is 6.5s?
        // Vue: setTimeout(..., 6500)
        setTimeout(() => {
            if (audioRef.current === audio) {
                stopAudio();
            }
        }, 6500);
      }
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingId(null);
  };

  const handleSelect = (voice: Voice) => {
    onSelect(voice);
    onClose();
  };

  const languages = [
    { label: 'Simplified Chinese (简体中文)', value: 'zh-CN' },
    { label: 'Traditional Chinese (繁體中文)', value: 'zh-Hant' },
    { label: 'English', value: 'en' },
    { label: 'Arabic (العربية)', value: 'ar' },
    { label: 'Bulgarian (Български)', value: 'bg' },
    { label: 'Croatian (Hrvatski)', value: 'hr' },
    { label: 'Czech (Čeština)', value: 'cs' },
    { label: 'Danish (Dansk)', value: 'da' },
    { label: 'Dutch (Nederlands)', value: 'nl' },
    { label: 'Filipino (Filipino)', value: 'fil' },
    { label: 'Finnish (Suomi)', value: 'fi' },
    { label: 'French (Français)', value: 'fr' },
    { label: 'German (Deutsch)', value: 'de' },
    { label: 'Greek (Ελληνικά)', value: 'el' },
    { label: 'Hindi (हिन्दी)', value: 'hi' },
    { label: 'Hungarian (Magyar)', value: 'hu' },
    { label: 'Indonesian (Bahasa Indonesia)', value: 'id' },
    { label: 'Italian (Italiano)', value: 'it' },
    { label: 'Japanese (日本語)', value: 'ja' },
    { label: 'Korean (한국어)', value: 'ko' },
    { label: 'Malay (Bahasa Melayu)', value: 'ms' },
    { label: 'Norwegian (Norsk)', value: 'nb' },
    { label: 'Polish (Polski)', value: 'pl' },
    { label: 'Portuguese (Português)', value: 'pt' },
    { label: 'Romanian (Română)', value: 'ro' },
    { label: 'Russian (Русский)', value: 'ru' },
    { label: 'Slovak (Slovenčina)', value: 'sk' },
    { label: 'Spanish (Español)', value: 'es' },
    { label: 'Swedish (Svenska)', value: 'sv' },
    { label: 'Turkish (Türkçe)', value: 'tr' },
    { label: 'Ukrainian (Українська)', value: 'uk' },
    { label: 'Vietnamese (Tiếng Việt)', value: 'vi' },
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t?.title || "Select Voice"}
      width="max-w-5xl"
    >
      <div className="flex flex-col h-[600px]">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
                onClick={() => setActiveTab('public')}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'public'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
            >
                {t?.tabs?.public || 'Public Voices'}
            </button>
            <button
                onClick={() => setActiveTab('custom')}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'custom'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
            >
                {t?.tabs?.custom || 'My Voices'}
            </button>
        </div>

        {/* Filters (Only for Public) */}
        {activeTab === 'public' && (
            <div className="flex gap-3 mb-6 flex-wrap">
                <select
                    value={filters.language}
                    onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                    style={{ width: '250px' }}
                >
                    <option value="">{t?.filterOptions?.allLanguages || 'All Languages'}</option>
                    {languages.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
                <select
                    value={filters.gender}
                    onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                    style={{ width: '120px' }}
                >
                    <option value="">{t?.filterOptions?.allGenders || 'All Genders'}</option>
                    <option value="male">{t?.filterOptions?.male || 'Male'}</option>
                    <option value="female">{t?.filterOptions?.female || 'Female'}</option>
                </select>
                <select
                    value={filters.age}
                    onChange={(e) => setFilters(prev => ({ ...prev, age: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                    style={{ width: '150px' }}
                >
                    <option value="">{t?.filters?.age || 'Age'}</option>
                    <option value="Young">{t?.filterOptions?.young || 'Young'}</option>
                    <option value="Middle Age">{t?.filterOptions?.middleAge || 'Middle Age'}</option>
                    <option value="Old">{t?.filterOptions?.old || 'Old'}</option>
                </select>
                <select
                    value={filters.style}
                    onChange={(e) => setFilters(prev => ({ ...prev, style: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                    style={{ width: '150px' }}
                >
                    <option value="">{t?.filters?.style || 'Style'}</option>
                    <option value="UGC">{t?.filterOptions?.ugc || 'UGC'}</option>
                    <option value="Advertisement">{t?.filterOptions?.ads || 'Advertisement'}</option>
                </select>
            </div>
        )}

        {/* Voice Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {currentLoading ? (
                <div className="flex flex-col justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">加载中...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {currentVoiceList.map((voice) => (
                        <div
                            key={voice.voiceId}
                            onClick={() => handleSelect(voice)}
                            className={`
                                relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-indigo-300 group
                                ${selectedVoiceId === voice.voiceId 
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                                    : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'}
                            `}
                        >
                            <div className="flex justify-between items-start mb-2 gap-2">
                                <div className="flex-1 min-w-0">
                                    <h4 
                                        className={`font-semibold truncate ${selectedVoiceId === voice.voiceId ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-100'}`}
                                        title={voice.voiceName}
                                    >
                                        {voice.voiceName}
                                    </h4>
                                    {activeTab === 'public' && (
                                        <p className="text-xs text-gray-500 mt-1 truncate">
                                            {[voice.gender, voice.age, voice.style].filter(Boolean).join(' • ')}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => handlePlay(voice, e)}
                                    className={`
                                        p-2 rounded-full transition-colors flex-shrink-0 ml-2
                                        ${playingId === voice.voiceId 
                                            ? 'bg-indigo-600 text-white' 
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 hover:text-indigo-600'}
                                    `}
                                >
                                    {playingId === voice.voiceId ? <Pause size={16} /> : <Play size={16} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </BaseModal>
  );
};

export default VoiceModal;
