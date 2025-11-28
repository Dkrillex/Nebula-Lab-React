import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, PenTool, Music, ChevronDown, FileAudio, X, Play, Loader, Check, AlertCircle, Video as VideoIcon, Plus, Trash2, Download, Maximize2 } from 'lucide-react';
import { avatarService, AiAvatar, Voice, Caption, UploadedFile } from '../../../services/avatarService';
import { useAuthStore } from '../../../stores/authStore';
import { showAuthModal } from '../../../lib/authModalManager';
import VoiceModal from './VoiceModal';
import CaptionModal from './CaptionModal';
import demoVideo from '../../../assets/demo/ec6-4dbbffde26e2.mp4';
import demoAudio from '../../../assets/demo/file_example_MP3_700KB.mp3';
import { uploadTVFile } from '@/utils/upload';
import toast from 'react-hot-toast';
import { createTaskPoller, PollingController } from '../../../utils/taskPolling';
import AddMaterialModal from '@/components/AddMaterialModal';
import UploadComponent, { UploadComponentRef } from '@/components/UploadComponent';
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

interface GeneratedVideo {
  id: string;
  url: string;
  timestamp: number;
  addState?: boolean;
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
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
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
  const resultsSectionRef = useRef<HTMLDivElement>(null);

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
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const taskPollerRef = useRef<PollingController | null>(null);
  const videoUploadRef = useRef<UploadComponentRef>(null);

  useEffect(() => {
    if (!resultsSectionRef.current) return;
    if (generatedVideos.length > 0 || generating || taskStatus !== 'idle') {
      resultsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [generatedVideos.length, generating, taskStatus]);

  // Removed initial load of voice/caption lists as they are now handled in Modals

  const stopTaskPolling = useCallback(() => {
    if (taskPollerRef.current) {
      taskPollerRef.current.stop();
      taskPollerRef.current = null;
    }
    setGenerating(false);
  }, []);

  useEffect(() => {
    return () => {
      stopTaskPolling();
    };
  }, [stopTaskPolling]);

  const handleVideoUploadComplete = (file: UploadedFile) => {
    setUploadedVideo(file);
    setSelectedAvatar(null);
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

  const trySample = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isAuthenticated) {
      showAuthModal();
      return;
    }
    
    try {
      setIsSampleLoading(true);
      
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

  const handleGenerate = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isAuthenticated) {
      showAuthModal();
      return;
    }
    
    try {
      stopTaskPolling();
      setPreviewVideoUrl(null);
      setGenerating(true);

      // 判断用户是否上传了视频或者选择了数字人
      if (!uploadedVideo && !selectedAvatar) {
        // 如果没有已上传的视频，也没有选择数字人，
        // 进一步检查是否选择了待上传的文件（通过 videoUploadRef）
        const hasPendingFile = videoUploadRef.current && videoUploadRef.current.file;
        
        if (!hasPendingFile) {
          toast.error('请上传数字人视频或选择数字人');
          return;
        }
      }

      if (scriptMode === 'text') {
        if (!text.trim()) {
          toast.error('请输入文本内容');
          return;
        }
        if (!selectedVoice) {
          toast.error('请选择音色');
          return;
        }
      } else {
        if (!uploadedAudio) {
          toast.error('请上传音频文件');
          return;
        }
      }

      let currentVideoFileId = uploadedVideo?.fileId;

      // Handle delayed upload for video
      if (!selectedAvatar && (!currentVideoFileId || currentVideoFileId === '')) {
          if (videoUploadRef.current && videoUploadRef.current.file) {
              try {
                  // Toast for upload starting? Maybe too noisy since button says "Generate"
                  const uploaded = await videoUploadRef.current.triggerUpload();
                  if (uploaded && uploaded.fileId) {
                      currentVideoFileId = uploaded.fileId;
                      // Update state to reflect successful upload
                      handleVideoUploadComplete(uploaded);
                  } else {
                      throw new Error('Video upload failed');
                  }
              } catch (err) {
                  console.error(err);
                  toast.error('视频上传失败');
                  return; // Stop generation
              }
          } else {
               // Should have been caught by !uploadedVideo check, but just in case
               toast.error('请上传数字人视频');
               return;
          }
      }

      const points = pointsTip;
      // Reconstruct params to match index.vue logic
      const params: any = {
        avatarSourceFrom: currentVideoFileId ? 0 : 1, // 0: User uploaded video, 1: Public avatar
        videoFileId: currentVideoFileId || '',
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
        startTaskPolling(newTaskId);
      } else {
        throw new Error('任务提交失败：未获取到 TaskId');
      }

    } catch (error: any) {
      console.error('Generate error:', error);
      toast.error(error.message || '生成失败');
      setTaskStatus('fail');
      setGenerating(false);
      stopTaskPolling();
    }
  };

  const startTaskPolling = useCallback((id: string) => {
    if (!id) return;
    stopTaskPolling();
    setGenerating(true);
    setTaskStatus('running');

    const poller = createTaskPoller<any>({
      request: async () => {
        const res = await avatarService.queryVideoCreationTask(id);
        if ((res as any).result) return (res as any).result;
        if ((res as any).data) return (res as any).data;
        return res;
      },
      parseStatus: data => data?.status,
      isSuccess: status => status === 'success',
      isFailure: status => status === 'fail',
      onProgress: () => {},
      onSuccess: taskData => {
        setTaskStatus('success');
        setPreviewVideoUrl(taskData.outputVideoUrl);
        setGeneratedVideos(prev => {
          if (prev.some(v => v.id === id)) return prev;
          return [{ id, url: taskData.outputVideoUrl, timestamp: Date.now() }, ...prev];
        });
        setGenerating(false);
        stopTaskPolling();
      },
      onFailure: taskData => {
        setTaskStatus('fail');
        setGenerating(false);
        toast.error(taskData?.errorMsg || '任务执行失败');
        stopTaskPolling();
      },
      onTimeout: () => {
        setTaskStatus('fail');
        setGenerating(false);
        toast.error('任务超时');
        stopTaskPolling();
      },
      onError: error => {
        console.error('查询失败', error);
        setTaskStatus('fail');
        setGenerating(false);
        toast.error('查询失败');
        stopTaskPolling();
      },
      intervalMs: 10_000,
      progressMode: 'fast',
      continueOnError: () => false,
    });

    taskPollerRef.current = poller;
    poller.start();
  }, [stopTaskPolling]);

  const handleAddToMaterials = () => {
      if (!previewVideoUrl) return;
      setShowMaterialModal(true);
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `digital_human_${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success(t.tips?.downloadStarted || '开始下载...');
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  const handleDownloadAll = async () => {
    for (const video of generatedVideos) {
      await handleDownload(video.url);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const handleClearAll = () => {
    setGeneratedVideos([]);
    setPreviewVideoUrl(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left Panel */}
      <div className="flex flex-col h-full w-full lg:w-1/3 bg-white dark:bg-gray-800 rounded-2xl p-6 flex flex-col gap-6 shadow-lg">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">{t.leftPanel.myDigitalHuman}</h2>
          
          {/* Avatar Selection Display */}
          {selectedAvatar && (
              <div className="relative">
                  <div className="border-2 border-indigo-500 rounded-xl overflow-hidden aspect-[9/16] bg-gray-100 max-h-[57vh] mx-auto">
                      {selectedAvatar.previewVideoUrl ? (
                          <video 
                            src={selectedAvatar.previewVideoUrl} 
                            className="w-full h-full object-cover" 
                            controls 
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
          )}
          
          {!selectedAvatar && uploadedVideo && (
              <div className="relative border-2 border-indigo-500 rounded-xl overflow-hidden aspect-[9/16] max-h-[570px] mx-auto bg-gray-100">
                  <video 
                    src={uploadedVideo.url || uploadedVideo.fileUrl} 
                    className="w-full h-full object-cover" 
                    controls 
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
                  <button onClick={() => {
                      setUploadedVideo(null);
                      videoUploadRef.current?.clear();
                  }} className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-red-50">
                      <X size={16} className="text-gray-600" />
                  </button>
              </div>
          )}

          <div className={selectedAvatar || uploadedVideo ? 'hidden' : 'block'}>
              <UploadComponent
                  ref={videoUploadRef}
                  onUploadComplete={handleVideoUploadComplete}
                  uploadType="tv"
                  accept=".mp4,.mov,.webm"
                  maxSize={200}
                  immediate={false}
                  showConfirmButton={false}
                  onFileSelected={(file) => {
                      setUploadedVideo({
                          fileId: '',
                          fileName: file.name,
                          fileUrl: URL.createObjectURL(file),
                          format: file.name.split('.').pop() || '',
                          duration: 0
                      });
                      setSelectedAvatar(null);
                  }}
                  className="min-h-[300px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer group"
                  showPreview={false}
              >
                  <div className="flex flex-col items-center justify-center gap-4 w-full h-full">
                      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-600 shadow flex items-center justify-center text-gray-400 group-hover:text-indigo-500 transition">
                          <Upload size={32} />
                      </div>
                      <div className="text-center px-4">
                          <p className="text-base font-bold text-gray-700 dark:text-gray-300 mb-1">{t.leftPanel.uploadTitle}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t.leftPanel.uploadDesc}</p>
                      </div>
                  </div>
              </UploadComponent>
          </div>

        </div>
        <div>
          <div className="flex gap-3">
              <button onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isAuthenticated) {
                  showAuthModal();
                  return;
                }
                onShowAvatarModal(true);
              }} className="flex-1 py-3 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:border-indigo-500 hover:text-indigo-600 transition">
                  {t.leftPanel.personalTemplate}
              </button>
              <button onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isAuthenticated) {
                  showAuthModal();
                  return;
                }
                onShowAvatarModal(false);
              }} className="flex-1 py-3 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:border-indigo-500 hover:text-indigo-600 transition">
                  {t.leftPanel.publicTemplate}
              </button>
          </div>
          
          <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.leftPanel.customUpload}</label>
              <button onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isAuthenticated) {
                  showAuthModal();
                  return;
                }
                navigate('/create/uploadCustomAvatar');
              }} className="w-full py-3 rounded-xl border border-indigo-200 text-indigo-600 text-sm font-bold hover:bg-indigo-50 transition">
                  {t.leftPanel.customUpload}
              </button>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="h-[calc(100vh-230px)] flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg relative overflow-visible flex flex-col">
         <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-32 mb-[80px]">
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
                    
                    <div className="absolute top-full left-0 mt-2 w-72 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-50 hidden group-hover:block pointer-events-none">
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
                    
                    <div className="absolute top-full left-0 mt-2 w-72 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-50 hidden group-hover:block pointer-events-none">
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

          <div className="flex-1 flex flex-col gap-4 mt-6">
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
                                {selectedVoice && (
                                    <div className="selected-voice flex gap-2 items-center p-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg max-w-[200px]">
                                        <span 
                                            className="voice-name text-sm font-medium text-indigo-700 dark:text-indigo-300 truncate" 
                                            title={selectedVoice.voiceName}
                                        >
                                            {selectedVoice.voiceName}
                                        </span>
                                        <button 
                                            className="voice-remove flex items-center justify-center w-5 h-5 text-xs text-white bg-indigo-600 rounded-full hover:bg-indigo-700 flex-shrink-0"
                                            onClick={(e) => { e.stopPropagation(); setSelectedVoice(null); }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                                
                                <button 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (!isAuthenticated) {
                                        showAuthModal();
                                        return;
                                      }
                                      setShowVoiceModal(true);
                                    }} 
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
                        <button onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!isAuthenticated) {
                            showAuthModal();
                            return;
                          }
                          audioInputRef.current?.click();
                        }} disabled={uploading} className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:border-indigo-500 hover:text-indigo-600 transition disabled:opacity-50">
                            {uploading ? '上传中...' : '点击上传音频文件'}
                        </button>
                    )}
                 </div>
             )}
             
            {scriptMode === 'text' && (
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
                           onClick={(e) => {
                             e.preventDefault();
                             e.stopPropagation();
                             if (!isAuthenticated) {
                               showAuthModal();
                               return;
                             }
                             setShowCaptionModal(true);
                           }} 
                           className="caption-select-btn px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:border-indigo-500 transition-colors hover:bg-gray-50"
                       >
                           {selectedCaption ? (t.rightPanel.selectSubtitleStyle?.replace('Select', 'Change') || 'Change Style') : (t.rightPanel.selectSubtitleStyle || 'Select Style')}
                       </button>
                    </div>
                </div>
            )}
          </div>

             {/* Results Area (New) */}
             {(generatedVideos.length > 0 || generating || taskStatus !== 'idle') && (
            <div ref={resultsSectionRef} className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-800 dark:text-gray-200">{t.rightPanel.resultTitle || '生成结果'}</h3>
                    <div className="flex gap-2">
                        <button
                             onClick={handleClearAll}
                             disabled={generatedVideos.length === 0}
                             className={`px-3 py-1.5 border rounded-lg text-xs flex items-center gap-1 transition-colors ${
                               generatedVideos.length === 0
                                 ? 'border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 opacity-50 cursor-not-allowed'
                                 : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                             }`}
                        >
                           <Trash2 size={12} />
                           {t.actions?.clearAll || '清空'}
                        </button>
                        <button
                             onClick={handleDownloadAll}
                             disabled={generatedVideos.length === 0}
                             className={`px-3 py-1.5 border rounded-lg text-xs flex items-center gap-1 transition-colors ${
                               generatedVideos.length === 0
                                 ? 'border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 opacity-50 cursor-not-allowed'
                                 : 'border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
                             }`}
                        >
                           <Download size={12} /> {t.actions?.downloadAll || '下载全部'}
                        </button>
                    </div>
                </div>

                {/* Main Preview */}
                <div className="w-full h-[450px] shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/50 mb-6 relative overflow-hidden group">
                    {generating || taskStatus === 'running' ? (
                         <div className="flex flex-col items-center gap-4 z-10">
                            <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                            <p className="text-indigo-600 font-medium">
                              {t.rightPanel?.previewGeneratingTip || '正在生成您的视频...'}
                            </p>
                         </div>
                    ) : previewVideoUrl ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-black/5 dark:bg-black/20">
                             <video 
                                src={previewVideoUrl} 
                                controls 
                                className="max-w-full max-h-full rounded-lg shadow-lg"
                             />
                             <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => handleDownload(previewVideoUrl!)}
                                  className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                                  title={t.actions?.download || '下载'}
                                >
                                  <Download size={18} />
                                </button>
                                <button 
                                  onClick={handleAddToMaterials}
                                  className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                                  title={t.actions?.addToMaterials || '加入素材库'}
                                >
                                  <Plus size={18} />
                                </button>
                             </div>
                        </div>
                    ) : (
                         <div className="flex flex-col items-center text-slate-400">
                             <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <VideoIcon size={40} className="text-slate-300 dark:text-slate-600" />
                             </div>
                             <p className="text-sm max-w-xs text-center">{t.rightPanel.previewPlaceholder || '生成结果将在这里显示'}</p>
                         </div>
                    )}
                </div>

                {/* History Thumbs */}
                {generatedVideos.length > 0 && (
                     <div className="h-24 flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                       {generatedVideos.map((video) => (
                         <div 
                           key={video.id}
                           onClick={() => setPreviewVideoUrl(video.url)}
                           className={`relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all bg-black/5 ${
                             previewVideoUrl === video.url ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-transparent hover:border-indigo-300'
                           }`}
                         >
                           <video 
                             src={video.url} 
                             className="w-full h-full object-cover pointer-events-none" 
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
                           {video.addState && (
                             <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                                <Check size={8} className="text-white" />
                             </div>
                           )}
                           <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                <Play size={20} className="text-white opacity-80" />
                           </div>
                         </div>
                       ))}
                     </div>
                )}
             </div>
             )}
          </div>

         {/* Fixed Controls */}
         <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-6 border-t border-gray-100 dark:border-gray-700 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <div className="generation-controls flex flex-col gap-4">
                <div className="cost-info p-3 text-center bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl">
                  <div className="cost-tip text-sm text-gray-500 dark:text-gray-400 mb-1">{buttonTip}</div>
                  {pointsTip > 0 && (
                    <div className="cost-display flex items-center justify-center gap-2">
                        <VideoIcon className="cost-icon w-4 h-4 text-indigo-600" />
                        <span className="cost-amount text-base font-bold text-indigo-600">
                            {pointsTip} {t.rightPanel.diamondCoin || '积分'}
                        </span>
                    </div>
                  )}
                </div>

                <div className="action-controls flex gap-4 justify-center">
                  <button 
                    className="action-btn secondary px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap" 
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
                    disabled={generating || uploading || pointsTip === 0 || (!selectedAvatar && !uploadedVideo) || (scriptMode === 'text' ? (!text.trim() || !selectedVoice) : !uploadedAudio)}
                  >
                    {generating ? (
                      <span className="flex items-center gap-2">
                        <Loader className="animate-spin" size={16} />
                        <span>{t.rightPanel?.generatingLabel || '生成中...'}</span>
                      </span>
                    ) : (
                      pointsTip > 0 ? t.rightPanel.generate : (t.rightPanel.awaitWorking || '开始生成')
                    )}
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
              setShowMaterialModal(false);
          }}
          initialData={{
              assetName: `数字人视频_${new Date().toISOString().slice(0,10)}`,
              assetTag: `数字人视频_${new Date().toISOString().slice(0,10)}`,
              assetDesc: `数字人视频_${new Date().toISOString().slice(0,10)}`,
              assetUrl: previewVideoUrl || '',
              assetType: 3 // Video
          }}
          disableAssetTypeSelection={true}
          isImportMode={true}
       />
    </div>
  );
};

export default DigitalHumanVideo;
