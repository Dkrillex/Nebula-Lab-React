import React, { useState, useEffect, useRef } from 'react';
import { Upload, PenTool, Music, ChevronDown, FileAudio, X, Play, Loader, Check, AlertCircle, Video as VideoIcon, Plus } from 'lucide-react';
import { avatarService, AiAvatar, Voice, Caption, UploadedFile } from '../../../services/avatarService';
import { useAuthStore } from '../../../stores/authStore';
import VoiceModal from './VoiceModal';
import CaptionModal from './CaptionModal';
import demoVideo from '../../../assets/demo/ec6-4dbbffde26e2.mp4';
import demoAudio from '../../../assets/demo/file_example_MP3_700KB.mp3';
import { uploadTVFile } from '@/utils/upload';
import { toast } from '@/components/Toast';
import AddMaterialModal from '@/components/AddMaterialModal';
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
  const [voiceType, setVoiceType] = useState<number>(2); // 1: My Voice, 2: Common Voice
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  
  // 字幕相关
  const [selectedCaption, setSelectedCaption] = useState<Caption | null>(null);
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  
  // 音频上传
  const [uploadedAudio, setUploadedAudio] = useState<UploadedFile | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenAudioRef = useRef<HTMLAudioElement>(null);

  // 监听音频变化，如果没有时长则获取时长
  useEffect(() => {
    if (uploadedAudio && (uploadedAudio.url || uploadedAudio.fileUrl) && !uploadedAudio.duration) {
        if (hiddenAudioRef.current) {
            hiddenAudioRef.current.src = uploadedAudio.url || uploadedAudio.fileUrl || '';
        }
    }
  }, [uploadedAudio]);

  const handleAudioMetadata = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
      const duration = e.currentTarget.duration;
      if (duration > 0 && uploadedAudio) {
        // 如果时长发生显著变化，才更新状态以避免无限循环
        if (!uploadedAudio.duration || Math.abs(uploadedAudio.duration - duration) > 0.1) {
             setUploadedAudio(prev => prev ? ({ ...prev, duration }) : null);
        }
      }
  };
  
  // 任务相关
  const [generating, setGenerating] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<'idle' | 'running' | 'success' | 'fail'>('idle');
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [isSampleLoading, setIsSampleLoading] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);

  // Removed initial load of voice/caption lists as they are now handled in Modals

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
              setSelectedAvatar(null);
          } catch (error) {
              // Error handled in parent
          }
      }
  }

  const calculatePoints = () => {
    // This function is no longer used as we switched to pointsTip computed value
    // But keeping it for reference or if other parts need it
    return 0; 
  };

  const textareaMaxLength = mode === 'mode1' ? 8000 : 80;

  const pointsTip = (() => {
    if (mode === 'mode2') return 4;
    const textLength = text.length;
    if (scriptMode === 'text' && textLength) {
      return Math.floor((textLength + 399) / 400) * 1 || 1;
    }
    if (scriptMode === 'audio') {
      if (!uploadedAudio?.duration) return 0;
      return Math.floor(Math.floor(Number(uploadedAudio.duration) + 29) / 30) * 1 || 1;
    }
    return 0;
  })();

  const buttonTip = (() => {
    if (scriptMode === 'text') {
      if (text.length === 0) {
        return t.rightPanel.buttonTip?.text || 'Please enter text.';
      }
    } else {
      if (!uploadedAudio) {
        return t.rightPanel.buttonTip?.audio || 'Please upload audio.';
      }
    }
    return t.rightPanel.buttonTip?.default || '1 point = 30s or 400 chars';
  })();

  const trySample = async () => {
    try {
      setIsSampleLoading(true);
      setErrorMessage(null);

      // 1. Switch to audio mode (对应 Vue 中 segmentedValue.value = 1)
      setScriptMode('audio');

      // 2. Fetch demo files
      const [videoRes, audioRes] = await Promise.all([
        fetch(demoVideo),
        fetch(demoAudio),
      ]);

      const videoBlob = await videoRes.blob();
      const audioBlob = await audioRes.blob();

      // Create Object URLs for display
      const videoUrl = URL.createObjectURL(videoBlob);
      const audioUrl = URL.createObjectURL(audioBlob);

      const videoFile = new File([videoBlob], 'demo-video.mp4', {
        type: 'video/mp4',
      });
      const audioFile = new File([audioBlob], 'demo-audio.mp3', {
        type: 'audio/mpeg',
      });
      console.log(videoFile, audioFile);
      
      const [videoUploadRes, audioUploadRes] = await Promise.all([
        uploadTVFile(videoFile),
        uploadTVFile(audioFile),
      ]);
      
      setUploadedVideo({
        ...videoUploadRes,
        fileUrl: videoUrl,
        url: videoUrl
      });
      setSelectedAvatar(null);
      setUploadedAudio({
        ...audioUploadRes,
        fileUrl: audioUrl,
        url: audioUrl
      });
      
    } catch (error: any) {
      console.error('Failed to load sample:', error);
      toast.error(error.message || 'Failed to load sample files');
    } finally {
      setIsSampleLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setTaskStatus('running');
      setPreviewVideoUrl(null);

      if (!uploadedVideo && !selectedAvatar) {
        toast.error('请上传数字人视频或选择数字人');
        setGenerating(false);
        return;
      }

      if (scriptMode === 'text') {
        if (!text.trim()) {
          toast.error('请输入文本内容');
          setGenerating(false);
          return;
        }
        if (!selectedVoice) {
          toast.error('请选择音色');
          setGenerating(false);
          return;
        }
      } else {
        if (!uploadedAudio) {
          toast.error('请上传音频文件');
          setGenerating(false);
          return;
        }
      }

      const points = pointsTip;
      // Reconstruct params to match index.vue logic
      const params: any = {
        avatarSourceFrom: uploadedVideo ? 0 : 1, // 0: User uploaded video, 1: Public avatar
        videoFileId: uploadedVideo?.fileId || '',
        aiAvatarId: selectedAvatar?.aiavatarId || '',
        audioSourceFrom: scriptMode === 'text' ? 1 : 0, // 0: User uploaded audio, 1: TTS
        audioFileId: uploadedAudio?.fileId || '',
        ttsText: scriptMode === 'text' ? text : '',
        voiceoverId: selectedVoice?.voiceId || '',
        noticeUrl: '',
        score: String(points),
        deductPoints: points,
        modeType: mode === 'mode1' ? 0 : 1,
        captionId: selectedCaption?.captionId || '',
        isSave2CustomAiAvatar: false,
        imageFileId: '',
        audioDuration: scriptMode === 'audio' ? (uploadedAudio?.duration || 0) : 0,
      };

      // Clear fields based on source type (matching index.vue handleSubmitTask logic)
      if (params.avatarSourceFrom === 0) {
          params.aiAvatarId = '';
      } else if (params.avatarSourceFrom === 1) {
          params.videoFileId = '';
      }

      if (params.audioSourceFrom === 0) {
          params.ttsText = '';
          params.voiceoverId = '';
      } else if (params.audioSourceFrom === 1) {
          params.audioFileId = '';
      }

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
      toast.error(error.message || '生成失败');
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

  const handleAddToMaterials = () => {
      if (!previewVideoUrl) return;
      setShowMaterialModal(true);
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
            <div className="relative border-2 border-indigo-500 rounded-xl overflow-hidden aspect-[9/16] max-h-[570px] mx-auto bg-gray-100">
                 <video src={uploadedVideo.url || uploadedVideo.fileUrl} className="w-full h-full object-cover" controls />
                 <button onClick={() => setUploadedVideo(null)} className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-red-50">
                    <X size={16} className="text-gray-600" />
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
             <input ref={fileInputRef} type="file" accept=".mp4,.mov,.webm" onChange={handleVideoFileChange} className="hidden" />
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
                <div className="relative group">
                    <label className="flex items-center gap-2 cursor-pointer">
                       <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${mode === 'mode1' ? 'border-indigo-600' : 'border-gray-300'}`}>
                          {mode === 'mode1' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>}
                       </div>
                       <input type="radio" name="mode" className="hidden" checked={mode === 'mode1'} onChange={() => setMode('mode1')} />
                       <span className={`text-sm font-medium ${mode === 'mode1' ? 'text-indigo-600' : 'text-gray-600'}`}>{t.rightPanel.mode1}</span>
                    </label>
                    
                    <div className="absolute bottom-full left-0 mb-2 w-72 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-50 hidden group-hover:block pointer-events-none">
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">{t.rightPanel.mode1}</h4>
                         <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                            <div className="flex gap-2 items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 shrink-0"></span>
                                <p>{t.rightPanel.mode1_intro?.p1}</p>
                            </div>
                            <div className="flex gap-2 items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 shrink-0"></span>
                                <p>{t.rightPanel.mode1_intro?.p2}</p>
                            </div>
                             <div className="flex gap-2 items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 shrink-0"></span>
                                <p>{t.rightPanel.mode1_intro?.p3}</p>
                            </div>
                         </div>
                    </div>
                </div>

                <div className="relative group">
                    <label className="flex items-center gap-2 cursor-pointer">
                       <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${mode === 'mode2' ? 'border-indigo-600' : 'border-gray-300'}`}>
                          {mode === 'mode2' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>}
                       </div>
                       <input type="radio" name="mode" className="hidden" checked={mode === 'mode2'} onChange={() => setMode('mode2')} />
                       <span className={`text-sm font-medium ${mode === 'mode2' ? 'text-indigo-600' : 'text-gray-600'}`}>{t.rightPanel.mode2}</span>
                    </label>
                    
                    <div className="absolute bottom-full left-0 mb-2 w-72 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-50 hidden group-hover:block pointer-events-none">
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">{t.rightPanel.mode2}</h4>
                         <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                            <div className="flex gap-2 items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 shrink-0"></span>
                                <p>{t.rightPanel.mode2_intro?.p1}</p>
                            </div>
                            <div className="flex gap-2 items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 shrink-0"></span>
                                <p>{t.rightPanel.mode2_intro?.p2}</p>
                            </div>
                             <div className="flex gap-2 items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 shrink-0"></span>
                                <p>{t.rightPanel.mode2_intro?.p3}</p>
                            </div>
                         </div>
                    </div>
                </div>
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
                        <textarea 
                            value={text} 
                            onChange={(e) => setText(e.target.value)} 
                            placeholder={t.rightPanel.textPlaceholder} 
                            className="w-full h-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 resize-none text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            maxLength={textareaMaxLength}
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400">{text.length}/{textareaMaxLength}</div>
                    </div>
                    <div>
                         <div className="param-group mb-2">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {t.rightPanel.voiceType}
                            </label>
                         </div>
                         <div className="voice-selection flex flex-col gap-3">
                            <div className="voice-label text-sm font-medium text-gray-600 dark:text-gray-400">
                                {t.rightPanel.aiVoice}
                            </div>
                            <div className="voice-container flex gap-4 items-center">
                                {/* Voice Type Selector - mimicking Select */}
                                {/* <div className="relative">
                                    <select 
                                        value={voiceType} 
                                        onChange={(e) => setVoiceType(Number(e.target.value))}
                                        className="p-2 pr-8 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                                    >
                                        <option value={1}>{t.rightPanel.myVoice || 'My Voice'}</option>
                                        <option value={2}>{t.rightPanel.publicVoice || 'Common Voice'}</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                                </div> */}

                                {selectedVoice && (
                                    <div className="selected-voice flex gap-2 items-center p-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                                        <span className="voice-name text-sm font-medium text-indigo-700 dark:text-indigo-300">{selectedVoice.voiceName}</span>
                                        <button 
                                            className="voice-remove flex items-center justify-center w-5 h-5 text-xs text-white bg-indigo-600 rounded-full hover:bg-indigo-700"
                                            onClick={(e) => { e.stopPropagation(); setSelectedVoice(null); }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                                
                                <button 
                                    onClick={() => setShowVoiceModal(true)} 
                                    className="voice-select-btn px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:border-indigo-500 transition-colors hover:bg-gray-50"
                                >
                                    {selectedVoice ? (t.rightPanel.selectVoice?.replace('Select', 'Change') || 'Change Voice') : (t.rightPanel.selectVoice || 'Select Voice')}
                                </button>
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
                            <audio
                                ref={hiddenAudioRef}
                                style={{ display: 'none' }}
                                onLoadedMetadata={handleAudioMetadata}
                                src={uploadedAudio.url || uploadedAudio.fileUrl}
                            />
                            <button onClick={() => setUploadedAudio(null)} className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-red-50"><X size={14} className="text-gray-600" /></button>
                         </div>
                    ) : (
                        <button onClick={() => audioInputRef.current?.click()} disabled={uploading} className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:border-indigo-500 hover:text-indigo-600 transition disabled:opacity-50">
                            {uploading ? '上传中...' : '点击上传音频文件'}
                        </button>
                    )}
                 </div>
             )}
             
             {/* AI Generated Subtitle */}
             <div className="caption-selection flex flex-col gap-3 mt-4">
                 <label className="caption-label text-sm font-medium text-gray-600 dark:text-gray-400">
                     {t.rightPanel.aiSubtitle}
                 </label>
                 <div className="caption-container flex gap-4 items-center">
                    {selectedCaption && (
                        <div className="selected-caption flex gap-2 items-center p-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                            <img src={selectedCaption.thumbnail} alt="caption" className="caption-name h-6 object-contain" />
                            <button 
                                className="caption-remove flex items-center justify-center w-5 h-5 text-xs text-white bg-indigo-600 rounded-full hover:bg-indigo-700"
                                onClick={() => setSelectedCaption(null)}
                            >
                                ×
                            </button>
                        </div>
                    )}
                    <button 
                        onClick={() => setShowCaptionModal(true)} 
                        className="caption-select-btn px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:border-indigo-500 transition-colors hover:bg-gray-50"
                    >
                        {selectedCaption ? (t.rightPanel.selectSubtitleStyle?.replace('Select', 'Change') || 'Change Style') : (t.rightPanel.selectSubtitleStyle || 'Select Style')}
                    </button>
                 </div>
             </div>
          </div>

          {/* Preview Area */}
          {taskStatus !== 'idle' && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 min-h-[200px] flex items-center justify-center">
              {taskStatus === 'running' ? (
                  <div className="flex flex-col items-center gap-3">
                      <Loader className="animate-spin text-indigo-600" size={32} />
                      <span className="text-sm text-gray-500">视频生成中...</span>
                  </div>
              ) : taskStatus === 'success' && previewVideoUrl ? (
                  <div className="w-full">
                      <video src={previewVideoUrl} controls className="w-full max-h-[300px] rounded-lg mb-3" />
                      <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                if (!previewVideoUrl) return;
                                const link = document.createElement('a');
                                link.href = previewVideoUrl;
                                link.download = `singing_avatar_${new Date().getTime()}.mp4`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }} 
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transform hover:-translate-y-0.5"
                        >
                            <VideoIcon size={20} />
                            下载视频
                        </button>
                        <button 
                            onClick={handleAddToMaterials}
                            className="px-6 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition font-medium shadow-sm flex items-center gap-2"
                        >
                            <Plus size={20} />
                            加入素材库
                        </button>
                      </div>
                  </div>
              ) : (
                  <div className="text-gray-400 text-sm">{t.rightPanel.previewPlaceholder}</div>
              )}
          </div>
          )}

          <div className="control-section mt-6">
              <div className="generation-controls flex flex-col gap-6">
                <div className="cost-info p-4 text-center bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl">
                  <div className="cost-tip text-sm text-gray-500 dark:text-gray-400 mb-2">{buttonTip}</div>
                  {pointsTip > 0 && (
                    <div className="cost-display flex items-center justify-center gap-2">
                        <VideoIcon className="cost-icon w-5 h-5 text-indigo-600" />
                        <span className="cost-amount text-lg font-bold text-indigo-600">
                            {pointsTip} {t.rightPanel.diamondCoin || '积分'}
                        </span>
                    </div>
                  )}
                </div>

                <div className="action-controls flex gap-4 justify-center">
                  <button 
                    className="action-btn secondary px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed" 
                    onClick={trySample}
                    disabled={isSampleLoading || uploading}
                  >
                    {isSampleLoading ? (
                        <div className="flex items-center gap-2">
                            <Loader className="animate-spin" size={16} />
                            <span>Loading...</span>
                        </div>
                    ) : t.rightPanel.tryExample}
                  </button>
                  <button
                    className="action-btn primary large flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    onClick={handleGenerate}
                    disabled={generating || uploading || pointsTip === 0 || (!selectedAvatar && !uploadedVideo) || (scriptMode === 'text' ? !text.trim() : !uploadedAudio)}
                  >
                    {generating ? <Loader className="animate-spin" size={16} /> : (pointsTip > 0 ? t.rightPanel.generate : (t.rightPanel.awaitWorking || '设置完成之后生成'))}
                  </button>
                </div>
              </div>
            </div>
          </div>
      
      <VoiceModal 
        isOpen={showVoiceModal} 
        onClose={() => setShowVoiceModal(false)} 
        onSelect={setSelectedVoice} 
        selectedVoiceId={selectedVoice?.voiceId}
        t={t?.voiceModal}
      />
      
      <CaptionModal 
        isOpen={showCaptionModal} 
        onClose={() => setShowCaptionModal(false)} 
        onSelect={setSelectedCaption} 
        selectedCaptionId={selectedCaption?.captionId}
      />
      {/* Add Material Modal */}
      <AddMaterialModal
          isOpen={showMaterialModal}
          onClose={() => setShowMaterialModal(false)}
          onSuccess={() => {
              toast.success('已添加到素材库');
          }}
          initialData={{
              assetName: `数字人视频_${new Date().toISOString().slice(0,10)}`,
              assetUrl: previewVideoUrl || '',
              assetType: 4 // Video
          }}
       />
    </div>
  );
};

export default DigitalHumanVideo;