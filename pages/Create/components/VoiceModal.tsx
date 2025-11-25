import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Pause, User } from 'lucide-react';
import BaseModal from '../../../components/BaseModal';
import { avatarService, Voice } from '../../../services/avatarService';

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
  const [loading, setLoading] = useState(false);
  const [voiceList, setVoiceList] = useState<Voice[]>([]);
  const [pagination, setPagination] = useState({ pageNo: 1, pageSize: 20, total: 0 });
  
  // Filters
  const [filters, setFilters] = useState({
    language: '',
    gender: '',
    age: '',
    style: '',
  });

  // Audio Player
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchVoices();
    } else {
      stopAudio();
    }
  }, [isOpen, activeTab, pagination.pageNo, filters]);

  const fetchVoices = async () => {
    setLoading(true);
    try {
      let list: Voice[] = [];
      let total = 0;
      
      if (activeTab === 'public') {
        const { result, code } = await avatarService.getVoiceList({
          pageNo: pagination.pageNo,
          pageSize: pagination.pageSize,
          language: filters.language || undefined,
          gender: filters.gender || undefined,
          style: filters.style || undefined,
          age: filters.age || undefined,
        });
        if (code === '200' && result.data) {
          list = (result as any).data;
          total = (result as any).total;
        }
      } else {
        const res = await avatarService.adsAssetsList({
          pageNo: pagination.pageNo,
          pageSize: pagination.pageSize,
          assetType: 8,
          isPrivateModel: '1',
        });
        if (res.rows) {
            list = res.rows.map((item: any) => ({
                voiceId: item.assetId,
                voiceName: item.assetName,
                demoAudioUrl: item.assetUrl,
            }));
            total = res.total || 0;
        }
      }
      
      setVoiceList(list || []);
      setPagination(prev => ({ ...prev, total }));
    } catch (error) {
      console.error('Failed to fetch voices:', error);
    } finally {
      setLoading(false);
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
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'public'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
            >
                {t?.tabs?.public || 'Public Voices'}
            </button>
            <button
                onClick={() => setActiveTab('custom')}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
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
            {loading ? (
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {voiceList.map((voice) => (
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
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <h4 className={`font-semibold truncate ${selectedVoiceId === voice.voiceId ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-100'}`}>
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
                                        p-2 rounded-full transition-colors flex-shrink-0
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
