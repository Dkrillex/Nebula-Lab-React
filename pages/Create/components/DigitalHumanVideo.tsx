import React, { useState, useEffect, useRef } from 'react';
import { Upload, PenTool, Music, ChevronDown, FileAudio, X, Play, Loader, Check, AlertCircle, Video as VideoIcon } from 'lucide-react';
import { avatarService, AiAvatar, Voice, Caption, UploadedFile } from '../../../services/avatarService';
import { useAuthStore } from '../../../stores/authStore';

interface DigitalHumanVideoProps {
  t: any;
  onShowAvatarModal: (isCustom: boolean) => void;
  selectedAvatar: AiAvatar | null;
  setSelectedAvatar: (avatar: AiAvatar | null) => void;
  uploadedVideo: UploadedFile | null;
  setUploadedVideo: (file: UploadedFile | null) => void;
  handleFileUpload: (file: File, type: 'video' | 'audio') => Promise<UploadedFile>;
  uploading: boolean;
  setErrorMessage: (msg: string | null) => void;
}

const DigitalHumanVideo: React.FC<DigitalHumanVideoProps> = ({
  t,
  onShowAvatarModal,
  selectedAvatar,
  setSelectedAvatar,
  uploadedVideo,
  setUploadedVideo,
  handleFileUpload,
  uploading,
  setErrorMessage
}) => {
  const { user } = useAuthStore();
  const [scriptMode, setScriptMode] = useState<'text' | 'audio'>('text');
  const [mode, setMode] = useState<'mode1' | 'mode2'>('mode1'); // mode1: Avatar 1, mode2: Avatar 2
  const [text, setText] = useState('');
  
  // 语音相关
  const [voiceList, setVoiceList] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  
  // 字幕相关
  const [captionList, setCaptionList] = useState<Caption[]>([]);
  const [selectedCaption, setSelectedCaption] = useState<Caption | null>(null);
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  
  // 音频上传
  const [uploadedAudio, setUploadedAudio] = useState<UploadedFile | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 任务相关
  const [generating, setGenerating] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<'idle' | 'running' | 'success' | 'fail'>('idle');
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    loadVoiceList();
    loadCaptionList();
  }, []);

  const loadVoiceList = async () => {
    try {
      setVoiceLoading(true);
      const res = await avatarService.getVoiceList({ pageNo: 1, pageSize: 100 });
      let voiceData: Voice[] = [];
      if (res.code === 200) {
        if ((res as any).result?.data && Array.isArray((res as any).result.data)) {
          voiceData = (res as any).result.data;
        } else if (res.data?.result?.data && Array.isArray(res.data.result.data)) {
          voiceData = res.data.result.data;
        } else if (res.data && (res.data as any).data && Array.isArray((res.data as any).data)) {
           voiceData = (res.data as any).data;
        }
      }
      setVoiceList(voiceData || []);
    } catch (error) {
      console.error('Failed to load voice list:', error);
      setVoiceList([]);
    } finally {
      setVoiceLoading(false);
    }
  };

  const loadCaptionList = async () => {
    try {
      const res = await avatarService.getCaptionList();
      let captionData: Caption[] = [];
      if (res.code === 200) {
        if ((res as any).result) {
            // Check if result is array, or result.data is array
            if (Array.isArray((res as any).result)) {
                captionData = (res as any).result;
            } else if ((res as any).result.data && Array.isArray((res as any).result.data)) {
                captionData = (res as any).result.data;
            }
        } else if (res.data) {
            if (Array.isArray(res.data)) {
                captionData = res.data as any;
            } else if ((res.data as any).data && Array.isArray((res.data as any).data)) {
                captionData = (res.data as any).data;
            }
        }
      }
      setCaptionList(captionData || []);
    } catch (error) {
      console.error('Failed to load caption list:', error);
      setCaptionList([]); // Ensure empty array on error
    }
  };

  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const uploaded = await handleFileUpload(file, 'audio');
        setUploadedAudio(uploaded);
        setScriptMode('audio');
      } catch (error) {
        // Error handled in parent
      }
    }
  };
  
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          try {
              const uploaded = await handleFileUpload(file, 'video');
              setUploadedVideo(uploaded);
          } catch (error) {
              // Error handled in parent
          }
      }
  }

  const calculatePoints = () => {
    if (mode === 'mode2') return 4;
    const textLength = text.length;
    if (scriptMode === 'text' && textLength) {
      return Math.floor((textLength + 399) / 400) * 1 || 1;
    }
    if (scriptMode === 'audio' && uploadedAudio?.duration) {
      return Math.floor((uploadedAudio.duration + 29) / 30) * 1 || 1;
    }
    return 0;
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setErrorMessage(null);
      setTaskStatus('running');
      setPreviewVideoUrl(null);

      if (!uploadedVideo && !selectedAvatar) {
        setErrorMessage('请上传数字人视频或选择数字人');
        setGenerating(false);
        return;
      }

      if (scriptMode === 'text') {
        if (!text.trim()) {
          setErrorMessage('请输入文本内容');
          setGenerating(false);
          return;
        }
        if (!selectedVoice) {
          setErrorMessage('请选择音色');
          setGenerating(false);
          return;
        }
      } else {
        if (!uploadedAudio) {
          setErrorMessage('请上传音频文件');
          setGenerating(false);
          return;
        }
      }

      const points = calculatePoints();
      const params = {
        avatarSourceFrom: uploadedVideo ? 0 : 1,
        videoFileId: uploadedVideo?.fileId || '',
        aiAvatarId: selectedAvatar?.aiavatarId || '',
        audioSourceFrom: scriptMode === 'text' ? 1 : 0,
        audioFileId: uploadedAudio?.fileId || '',
        ttsText: scriptMode === 'text' ? text : '',
        voiceoverId: selectedVoice?.voiceId || '',
        noticeUrl: '',
        score: String(points),
        deductPoints: points,
        modeType: mode === 'mode1' ? 0 : 1,
        captionId: selectedCaption?.captionId || '',
      };

      const submitRes = await avatarService.submitVideoCreationTask(params);
      
      let newTaskId = '';
      if (submitRes.data && (submitRes.data as any).result?.taskId) {
          newTaskId = (submitRes.data as any).result.taskId;
      } else if ((submitRes as any).result?.taskId) {
          newTaskId = (submitRes as any).result.taskId;
      } else if (submitRes.data && (submitRes.data as any).taskId) {
          newTaskId = (submitRes.data as any).taskId;
      }

      if (newTaskId) {
        setTaskId(newTaskId);
        pollTaskStatus(newTaskId);
      } else {
        throw new Error('任务提交失败：未获取到 TaskId');
      }

    } catch (error: any) {
      console.error('Generate error:', error);
      setErrorMessage(error.message || '生成失败');
      setTaskStatus('fail');
      setGenerating(false);
    }
  };

  const pollTaskStatus = async (id: string) => {
    const maxAttempts = 60;
    const interval = 5000;
    let attempts = 0;

    const poll = async () => {
      try {
        const res = await avatarService.queryVideoCreationTask(id);
        let taskData: any = res;
         if ((res as any).result) {
            taskData = (res as any).result;
         } else if (res.data) {
            taskData = res.data;
         }

        if (taskData) {
          const status = taskData.status;
          if (status === 'success') {
            setTaskStatus('success');
            setPreviewVideoUrl(taskData.outputVideoUrl);
            setGenerating(false);
            return;
          } else if (status === 'fail') {
            setTaskStatus('fail');
            setErrorMessage(taskData.errorMsg || '任务执行失败');
            setGenerating(false);
            return;
          } else {
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(poll, interval);
            } else {
              setTaskStatus('fail');
              setErrorMessage('任务超时');
              setGenerating(false);
            }
          }
        }
      } catch (error) {
        attempts++;
        if (attempts < maxAttempts) {
            setTimeout(poll, interval);
        } else {
             setTaskStatus('fail');
             setErrorMessage('查询失败');
             setGenerating(false);
        }
      }
    };
    poll();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left Panel */}
      <div className="w-full lg:w-1/3 bg-white dark:bg-gray-800 rounded-2xl p-6 flex flex-col gap-6 shadow-lg">
        <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">{t.leftPanel.myDigitalHuman}</h2>
        
        {/* Avatar Selection Display */}
        {selectedAvatar ? (
            <div className="relative">
                <div className="border-2 border-indigo-500 rounded-xl overflow-hidden aspect-[9/16] bg-gray-100">
                    {selectedAvatar.previewVideoUrl ? (
                        <video src={selectedAvatar.previewVideoUrl} className="w-full h-full object-cover" controls />
                    ) : (
                        <img src={selectedAvatar.thumbnailUrl || selectedAvatar.coverUrl} alt={selectedAvatar.aiavatarName} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white">
                        <p className="font-semibold">{selectedAvatar.aiavatarName}</p>
                    </div>
                </div>
                <button onClick={() => setSelectedAvatar(null)} className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-red-50">
                    <X size={16} className="text-gray-600" />
                </button>
            </div>
        ) : uploadedVideo ? (
            <div className="relative border-2 border-indigo-500 rounded-xl p-3 bg-indigo-50 dark:bg-indigo-900/20">
                <div className="flex items-center gap-2">
                    <VideoIcon size={20} className="text-indigo-600" />
                    <span className="text-sm font-medium truncate">{uploadedVideo.fileName}</span>
                </div>
                <button onClick={() => setUploadedVideo(null)} className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-red-50">
                    <X size={14} className="text-gray-600" />
                </button>
            </div>
        ) : (
            <div onClick={() => onShowAvatarModal(false)} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer flex flex-col items-center justify-center gap-4 min-h-[300px] group">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-600 shadow flex items-center justify-center text-gray-400 group-hover:text-indigo-500 transition">
                    <Upload size={32} />
                </div>
                <div className="text-center px-4">
                    <p className="text-base font-bold text-gray-700 dark:text-gray-300 mb-1">{t.leftPanel.uploadTitle}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.leftPanel.uploadDesc}</p>
                </div>
            </div>
        )}

        <div className="flex gap-3">
            <button onClick={() => onShowAvatarModal(true)} className="flex-1 py-3 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:border-indigo-500 hover:text-indigo-600 transition">
                {t.leftPanel.personalTemplate}
            </button>
             <button onClick={() => onShowAvatarModal(false)} className="flex-1 py-3 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:border-indigo-500 hover:text-indigo-600 transition">
                {t.leftPanel.publicTemplate}
            </button>
        </div>

        <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">上传数字人视频 (自定义)</label>
             <input ref={fileInputRef} type="file" accept="video/*" onChange={handleVideoFileChange} className="hidden" />
             <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full py-3 rounded-xl border border-indigo-200 text-indigo-600 text-sm font-bold hover:bg-indigo-50 transition disabled:opacity-50">
                 {uploading ? '上传中...' : t.leftPanel.customUpload}
             </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-6 flex flex-col gap-6 shadow-lg">
         <div>
             <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3">{t.rightPanel.modeSelection}</h3>
             <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                   <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${mode === 'mode1' ? 'border-indigo-600' : 'border-gray-300'}`}>
                      {mode === 'mode1' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>}
                   </div>
                   <input type="radio" name="mode" className="hidden" checked={mode === 'mode1'} onChange={() => setMode('mode1')} />
                   <span className={`text-sm font-medium ${mode === 'mode1' ? 'text-indigo-600' : 'text-gray-600'}`}>{t.rightPanel.mode1}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                   <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${mode === 'mode2' ? 'border-indigo-600' : 'border-gray-300'}`}>
                      {mode === 'mode2' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>}
                   </div>
                   <input type="radio" name="mode" className="hidden" checked={mode === 'mode2'} onChange={() => setMode('mode2')} />
                   <span className={`text-sm font-medium ${mode === 'mode2' ? 'text-indigo-600' : 'text-gray-600'}`}>{t.rightPanel.mode2}</span>
                </label>
             </div>
          </div>

          <div className="flex-1 flex flex-col gap-4">
             <h3 className="font-bold text-gray-800 dark:text-gray-200">{t.rightPanel.scriptContent}</h3>
             <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-1 flex">
                <button onClick={() => setScriptMode('text')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition flex items-center justify-center gap-2 ${scriptMode === 'text' ? 'bg-white dark:bg-gray-600 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                   <PenTool size={14} /> {t.rightPanel.textToSpeech}
                </button>
                <button onClick={() => setScriptMode('audio')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition flex items-center justify-center gap-2 ${scriptMode === 'audio' ? 'bg-white dark:bg-gray-600 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                   <Music size={14} /> {t.rightPanel.importAudio}
                </button>
             </div>

             {scriptMode === 'text' ? (
                 <>
                    <div className="relative flex-1 min-h-[120px]">
                        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t.rightPanel.textPlaceholder} className="w-full h-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 resize-none text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400">{text.length}/{t.rightPanel.textLimit}</div>
                    </div>
                    <div>
                         <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">{t.rightPanel.voiceType}</h3>
                         <div className="flex flex-col gap-3">
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <select value={selectedVoice?.voiceId || ''} onChange={(e) => setSelectedVoice(voiceList.find(v => v.voiceId === e.target.value) || null)} className="w-full h-10 appearance-none rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 text-sm text-gray-700 dark:text-gray-200 focus:border-indigo-500 outline-none cursor-pointer">
                                        <option value="">{t.rightPanel.publicVoice}</option>
                                        {voiceList.map(voice => (
                                            <option key={voice.voiceId} value={voice.voiceId}>{voice.voiceName} {voice.gender && `(${voice.gender})`}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                         </div>
                    </div>
                 </>
             ) : (
                 <div>
                    <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioFileChange} className="hidden" />
                    {uploadedAudio ? (
                         <div className="relative border-2 border-indigo-500 rounded-xl p-3 bg-indigo-50 dark:bg-indigo-900/20">
                            <div className="flex items-center gap-2">
                                <FileAudio size={20} className="text-indigo-600" />
                                <span className="text-sm font-medium truncate">{uploadedAudio.fileName}</span>
                            </div>
                            <button onClick={() => setUploadedAudio(null)} className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-red-50"><X size={14} className="text-gray-600" /></button>
                         </div>
                    ) : (
                        <button onClick={() => audioInputRef.current?.click()} disabled={uploading} className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:border-indigo-500 hover:text-indigo-600 transition disabled:opacity-50">
                            {uploading ? '上传中...' : '点击上传音频文件'}
                        </button>
                    )}
                 </div>
             )}
             
             <div>
                 <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">{t.rightPanel.aiSubtitle}</h3>
                 <div className="flex flex-wrap gap-2">
                    {captionList.map(cap => (
                        <button key={cap.captionId} onClick={() => setSelectedCaption(cap)} className={`px-3 py-2 rounded-lg border text-sm ${selectedCaption?.captionId === cap.captionId ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-indigo-300'}`}>
                             <img src={cap.thumbnail} alt="caption" className="h-6 object-contain" />
                        </button>
                    ))}
                 </div>
             </div>
          </div>

          {/* Preview Area */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 min-h-[200px] flex items-center justify-center">
              {taskStatus === 'running' ? (
                  <div className="flex flex-col items-center gap-3">
                      <Loader className="animate-spin text-indigo-600" size={32} />
                      <span className="text-sm text-gray-500">视频生成中...</span>
                  </div>
              ) : taskStatus === 'success' && previewVideoUrl ? (
                  <div className="w-full">
                      <video src={previewVideoUrl} controls className="w-full max-h-[300px] rounded-lg mb-3" />
                      <a href={previewVideoUrl} target="_blank" download className="block text-center text-indigo-600 hover:underline text-sm">下载视频</a>
                  </div>
              ) : (
                  <div className="text-gray-400 text-sm">{t.rightPanel.previewPlaceholder}</div>
              )}
          </div>

          <div className="flex gap-4 pt-4 mt-auto">
               <button onClick={() => { setText('示例: 欢迎使用数字人视频制作。'); }} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition">{t.rightPanel.tryExample}</button>
               <button onClick={handleGenerate} disabled={generating || uploading} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {generating ? <Loader className="animate-spin" size={16} /> : t.rightPanel.generate}
               </button>
          </div>
      </div>
    </div>
  );
};

export default DigitalHumanVideo;

