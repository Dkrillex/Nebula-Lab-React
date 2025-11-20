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
        const res = await avatarService.getVoiceList({
          pageNo: pagination.pageNo,
          pageSize: pagination.pageSize,
          language: filters.language || undefined,
          gender: filters.gender || undefined,
          style: filters.style || undefined,
          // age is not directly supported in API param types from service but we can try passing it if needed
          // or filtering client side if API doesn't support. 
          // The vue code passes it in `...pram.value`.
        });
        if (res.code === 200 && res.data) {
            // Check data structure based on service definition
            if ((res.data as any).data) {
                list = (res.data as any).data;
                total = (res.data as any).total;
            } else if (Array.isArray(res.data)) {
                // Fallback
                list = res.data as any; 
            } else if (res.result && (res.result as any).data) {
                 // Possible other structure
                 list = (res.result as any).data;
                 total = (res.result as any).total;
            }
        }
      } else {
        const res = await avatarService.adsAssetsList({
          pageNo: pagination.pageNo,
          pageSize: pagination.pageSize,
          assetType: 8,
          isPrivateModel: '1',
        });
        if (res.code === 200 && res.rows) {
            list = res.rows.map((item: any) => ({
                voiceId: item.assetId,
                voiceName: item.assetName,
                demoAudioUrl: item.assetUrl,
                // Custom voices usually don't have detailed metadata like gender/age populated same way
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
        // Start from 3s like Vue version? 
        // Vue: audio.value!.currentTime = 3;
        // Let's keep it default for now or add if requested.
        // audio.currentTime = 3; 
        audio.play().catch(e => console.error("Play failed", e));
        audioRef.current = audio;
        setPlayingId(voice.voiceId);
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
    { label: 'English', value: 'en' },
    // Add more as needed
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
                Public Voices
            </button>
            <button
                onClick={() => setActiveTab('custom')}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'custom'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
            >
                My Voices
            </button>
        </div>

        {/* Filters (Only for Public) */}
        {activeTab === 'public' && (
            <div className="flex gap-3 mb-6 flex-wrap">
                <select
                    value={filters.language}
                    onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                >
                    <option value="">All Languages</option>
                    {languages.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
                <select
                    value={filters.gender}
                    onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                >
                    <option value="">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
                {/* Add more filters as needed */}
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
                                        p-2 rounded-full transition-colors
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

