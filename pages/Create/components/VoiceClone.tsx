import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Upload, 
  X, 
  Loader, 
  Play, 
  Pause, 
  RotateCcw, 
  Search, 
  Check, 
  AlertCircle,
  FileAudio,
  Download
} from 'lucide-react';
import { avatarService, Voice, VoiceCloneResult, UploadedFile } from '../../../services/avatarService';
import { uploadService } from '../../../services/uploadService';
import { useAuthStore } from '../../../stores/authStore';

interface VoiceCloneProps {
  t?: any; // Optional translation object
}

// Fallback translation object if t is not provided
const defaultT = {
  title1: '声音克隆',
  title2: '声音合成',
  desc1: '上传或录制一段音频，AI 将克隆出与您声音高度相似的数字人声音',
  desc2: '选择喜欢的音色，输入文本，一键生成高品质语音',
  attribute: '数据属性',
  audioParameters: '配置音频参数',
  audioName: '音频名称',
  audioNamePlaceholder: '给您的音频起个名字',
  speakingSpeed: '语速控制',
  audioText: '音频文本',
  audioTextPlaceholder: '请输入要合成的文本内容...',
  fileStatus: '文件状态',
  audioStatus: '音色状态',
  audioUploaded: '音色已选择',
  audioInfo: '音频信息',
  timbreInfo: '音色信息',
  fileName: '文件名',
  fileSize: '文件大小',
  fileFormat: '格式',
  audioName2: '音色名称',
  sex: '性别',
  male: '男性',
  female: '女性',
  style: '风格',
  getAudio: '音频获取',
  getTimbre: '音色选择',
  uploadOrOnline: '上传文件或在线录音',
  selectVoice: '选择现有音色',
  uploadFile: '文件上传',
  onlineRecording: '在线录音',
  uploadAudio: '拖拽或点击上传音频文件',
  supportAudioType: '支持 MP3、WAV 格式，文件大小不超过 50MB',
  startRecording: '开始录音',
  stopRecording: '停止录音',
  uploadRecording: '上传录音',
  previewRecording: '录音预览',
  clear: '清除',
  commonVoice: '公共音色',
  privateVoice: '私有音色',
  allSex: '全部性别',
  allStyle: '全部风格',
  UGC: '用户自制',
  Advertisement: '广告',
  voiceLoading: '加载音色列表...',
  previousPage: '上一页',
  nextPage: '下一页',
  page: '第',
  total: '共',
  syntheticEffect: '合成效果',
  previewRes: '预览和管理结果',
  operationProcess: '操作流程',
  syntheticText: '合成文本',
  ready: '准备就绪',
  inPreparation: '准备中...',
  taskRes: '任务结果',
  taskStatus: '任务状态',
  outputAudio: '输出音频',
  downloadAudio: '下载音频',
  clearReset: '清空重置',
  startCloning: '开始克隆',
  startSynthesis: '开始合成',
  inProcessing: '处理中...',
  recordingCompleted: '录音完成，请点击上传',
  recording: '录音_',
  uploadSuccess: '文件上传成功',
  uploadFail: '文件上传失败',
  micPermission: '请求麦克风权限...',
  micPermissionFail: '无法访问麦克风，请检查权限设置',
  recording2: '正在录音...',
  recordingFail: '录音失败',
  audioFirst: '请先录制音频',
  recordUploadSuccess: '录音上传成功',
  recordUploadFail: '录音上传失败',
  recordPrepare: '准备录音',
  msgConfirm: '请确保已填写必要信息',
  messionPushFail: '任务提交失败',
  taskSuccess: '任务完成',
  durationInvalid: '视频时长无效，需要10s~5分钟，请重新上传',
  queryFail: '查询任务状态失败',
  trialListening: '试听',
};

const VoiceClone: React.FC<VoiceCloneProps> = ({ t = defaultT }) => {
  const { user } = useAuthStore();
  
  // Page Mode: 'clone' | 'synthesis'
  const [pageMode, setPageMode] = useState<'clone' | 'synthesis'>('clone');
  
  // Audio Data State
  const [audioData, setAudioData] = useState({
    name: '',
    voiceSpeed: 1.0,
    text: '',
    originVoiceFileId: '',
  });
  
  // Upload & Recording State
  const [uploadMethod, setUploadMethod] = useState<'file' | 'record'>('file');
  const [isDragOver, setIsDragOver] = useState(false);
  const [audioFile, setAudioFile] = useState<UploadedFile & { file?: File; size?: number } | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // Recording Logic
  const [isRecording, setIsRecording] = useState(false);
  const [recordStatus, setRecordStatus] = useState(t.recordPrepare);
  const [recordTime, setRecordTime] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [recordSubmitLoading, setRecordSubmitLoading] = useState(false);

  // Voice List State
  const [voiceList, setVoiceList] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voicePagination, setVoicePagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [voiceTypeFilter, setVoiceTypeFilter] = useState<'public' | 'private'>('public');
  const [genderFilter, setGenderFilter] = useState('');
  const [styleFilter, setStyleFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('zh-CN');
  
  // Audio Player
  const [currentPlayingDemo, setCurrentPlayingDemo] = useState<string>('');
  const demoAudioRef = useRef<HTMLAudioElement | null>(null);

  // Task State
  const [submitLoading, setSubmitLoading] = useState(false);
  const [taskId, setTaskId] = useState<string>('');
  const [taskStatus, setTaskStatus] = useState<string>('');
  const [taskProgress, setTaskProgress] = useState(0);
  const [taskResult, setTaskResult] = useState<VoiceCloneResult | null>(null);
  const [taskError, setTaskError] = useState<string>('');
  const [isPolling, setIsPolling] = useState(false);
  const loopTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Lifecycle & Effects ---

  useEffect(() => {
    if (pageMode === 'synthesis') {
      getVoiceList();
    }
    return () => {
      stopAllAudio();
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    };
  }, [pageMode]);

  // --- Helper Functions ---

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const stopAllAudio = () => {
    if (demoAudioRef.current) {
      demoAudioRef.current.pause();
      setCurrentPlayingDemo('');
    }
  };

  const clearAll = () => {
    setAudioData({
      name: '',
      voiceSpeed: 1.0,
      text: '',
      originVoiceFileId: '',
    });
    setAudioFile(null);
    setSelectedVoice(null);
    clearRecording();
    setUploadMethod('file');
    setTaskStatus('');
    setTaskId('');
    setTaskProgress(0);
    setTaskResult(null);
    setTaskError('');
    setIsPolling(false);
    setSearchKeyword('');
    setGenderFilter('');
    setStyleFilter('');
    stopAllAudio();
    if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
  };

  const switchMode = (mode: 'clone' | 'synthesis') => {
    setPageMode(mode);
    clearAll();
  };

  // --- File Upload ---

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const processFile = async (file: File) => {
    // Validate type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-m4a', 'audio/m4a'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a)$/i)) {
      alert(t.supportAudioType);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert(t.supportAudioType);
      return;
    }

    setUploadLoading(true);
    try {
      const res = await uploadService.uploadFile(file);
      if (res.code === 200 && res.data) {
        const uploaded: UploadedFile & { file?: File; size?: number } = {
          fileId: res.data.ossId,
          fileName: res.data.fileName,
          fileUrl: res.data.url,
          format: file.name.split('.').pop() || '',
          file: file,
          size: file.size
        };
        setAudioFile(uploaded);
        setAudioData(prev => ({ 
            ...prev, 
            originVoiceFileId: res.data.ossId,
            name: prev.name || file.name.replace(/\.[^/.]+$/, '')
        }));
      }
    } catch (error) {
      console.error('Upload failed', error);
      alert(t.uploadFail);
    } finally {
      setUploadLoading(false);
    }
  };

  // --- Recording ---

  const startRecording = async () => {
    try {
      setRecordStatus(t.micPermission);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        setRecordStatus(t.recordingCompleted);
        
        // Create a File object for upload
        const file = new File([blob], `recording_${Date.now()}.wav`, { type: 'audio/wav' });
        setAudioFile({
            fileId: '', // Not uploaded yet
            fileName: file.name,
            fileUrl: url,
            format: 'wav',
            file: file,
            size: file.size
        });
        setAudioData(prev => ({
            ...prev,
            name: prev.name || `${t.recording}${Date.now()}`
        }));
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordStatus(t.recording2);
      setRecordTime(0);
      
      recordTimerRef.current = setInterval(() => {
        setRecordTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Recording failed', error);
      setRecordStatus(t.recordingFail);
      alert(t.micPermissionFail);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const clearRecording = () => {
    if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    setRecordedAudioUrl('');
    setAudioFile(null);
    setRecordStatus(t.recordPrepare);
    setRecordTime(0);
    setAudioData(prev => ({ ...prev, originVoiceFileId: '' }));
  };

  const uploadRecording = async () => {
    if (!audioFile?.file) {
        alert(t.audioFirst);
        return;
    }
    setRecordSubmitLoading(true);
    try {
        const res = await uploadService.uploadFile(audioFile.file);
        if (res.code === 200 && res.data) {
            setAudioData(prev => ({ ...prev, originVoiceFileId: res.data.ossId }));
            setAudioFile(prev => prev ? ({ ...prev, fileId: res.data.ossId }) : null);
            alert(t.recordUploadSuccess);
        }
    } catch (error) {
        console.error(error);
        alert(t.recordUploadFail);
    } finally {
        setRecordSubmitLoading(false);
    }
  };

  // --- Voice List (Synthesis) ---

  const getVoiceList = async (page = 1) => {
    setVoiceLoading(true);
    try {
      // If private filter is selected, use different logic/API if needed, 
      // but here we assume getVoiceList handles public/private via params or separate API?
      // The reference uses `adsAssetsList` for private. For simplicity, let's assume public first.
      // NOTE: `getVoiceList` in service currently maps to `VoiceQuery`.
      
      const res = await avatarService.getVoiceList({
        pageNo: page,
        pageSize: voicePagination.pageSize,
        voiceName: searchKeyword,
        gender: genderFilter,
        style: styleFilter,
        language: languageFilter
      });

      if (res.code === 200) {
         const resultData = res.data?.result;
         console.log('resultData', resultData);
         if (resultData) {
             setVoiceList(resultData.data || []);
             setVoicePagination(prev => ({ ...prev, current: page, total: resultData.total || 0 }));
         } else {
             setVoiceList([]);
             setVoicePagination(prev => ({ ...prev, current: page, total: 0 }));
         }
      }
    } catch (error) {
      console.error('Failed to fetch voices', error);
    } finally {
      setVoiceLoading(false);
    }
  };

  const playDemo = (voice: Voice) => {
    if (!voice.demoAudioUrl) return;

    if (currentPlayingDemo === voice.voiceId) {
      demoAudioRef.current?.pause();
      setCurrentPlayingDemo('');
      return;
    }

    if (demoAudioRef.current) demoAudioRef.current.pause();
    
    const audio = new Audio(voice.demoAudioUrl);
    demoAudioRef.current = audio;
    setCurrentPlayingDemo(voice.voiceId);
    
    audio.onended = () => setCurrentPlayingDemo('');
    audio.onerror = () => {
        setCurrentPlayingDemo('');
        alert('播放失败');
    };
    audio.play().catch(e => console.error(e));
  };

  // --- Task Submission ---

  const canSubmit = () => {
    if (pageMode === 'clone') {
      return audioData.name.trim() && audioData.originVoiceFileId;
    } else {
      return audioData.name.trim() && audioData.text.trim() && selectedVoice;
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      alert(t.msgConfirm);
      return;
    }

    setSubmitLoading(true);
    setTaskStatus('');
    setTaskError('');
    setTaskResult(null);

    try {
      let res: any;
      if (pageMode === 'clone') {
        res = await avatarService.submitVoiceCloneTask({
          name: audioData.name,
          originVoiceFileId: audioData.originVoiceFileId,
          voiceSpeed: audioData.voiceSpeed,
          voiceText: t.desc1, // Default text for cloning reference? Or empty.
          score: 2
        });
      } else {
        res = await avatarService.submitText2VoiceTask({
          name: audioData.name,
          voiceText: audioData.text,
          voiceId: selectedVoice?.voiceId,
          voiceSpeed: audioData.voiceSpeed,
          voiceName: selectedVoice?.voiceName,
          score: 2
        });
      }

      const result = (res as any).result || (res.data as any)?.result || res.data;
      
      if (result && result.taskId) {
        setTaskId(result.taskId);
        setTaskStatus(result.status);
        startPolling(result.taskId);
      } else {
        throw new Error('No taskId returned');
      }
    } catch (error: any) {
      console.error('Submit failed', error);
      setTaskError(t.messionPushFail);
    } finally {
      setSubmitLoading(false);
    }
  };

  // --- Polling ---

  const startPolling = (tid: string) => {
    setIsPolling(true);
    setTaskProgress(0);
    
    const poll = async () => {
      try {
        let res: any;
        if (pageMode === 'clone') {
          res = await avatarService.queryVoiceCloneTask(tid);
        } else {
          res = await avatarService.queryText2VoiceTask(tid);
        }
        
        const result = (res as any).result || (res.data as any)?.result || res.data;
        
        if (result) {
            setTaskStatus(result.status);
            if (result.status === 'success') {
                setTaskProgress(100);
                setTaskResult(result);
                setIsPolling(false);
            } else if (result.status === 'fail' || result.status === 'error') {
                setTaskError(result.errorMsg || t.messionPushFail);
                setIsPolling(false);
            } else {
                // Running
                setTaskProgress(prev => prev < 90 ? prev + Math.floor(Math.random() * 10) : 95);
                loopTimerRef.current = setTimeout(poll, 3000);
            }
        }
      } catch (error) {
        console.error('Poll error', error);
        setIsPolling(false);
        setTaskError(t.queryFail);
      }
    };
    
    poll();
  };

  // --- Render ---

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900 p-4 md:p-8 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="text-center mb-8 text-gray-800 dark:text-gray-100">
        <h1 className="text-3xl font-bold mb-2">{pageMode === 'clone' ? t.title1 : t.title2}</h1>
        <p className="text-gray-600 dark:text-gray-400">{pageMode === 'clone' ? t.desc1 : t.desc2}</p>
      </div>

      {/* Mode Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-gray-800 p-1.5 rounded-full flex gap-2 border border-gray-200 dark:border-gray-700 shadow-sm">
          <button 
            onClick={() => switchMode('clone')}
            className={`px-6 py-2 rounded-full font-medium transition flex items-center gap-2 ${pageMode === 'clone' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <span className="text-lg">🧪</span> {t.title1}
          </button>
          <button 
            onClick={() => switchMode('synthesis')}
            className={`px-6 py-2 rounded-full font-medium transition flex items-center gap-2 ${pageMode === 'synthesis' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <span className="text-lg">🎨</span> {t.title2}
          </button>
        </div>
      </div>

      {/* Main Content - 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1600px] mx-auto">
        
        {/* 1. Attributes Panel */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
           <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30">⚙️</div>
               <div>
                   <h3 className="font-bold text-gray-800 text-lg">{t.attribute}</h3>
                   <p className="text-gray-500 text-sm">{t.audioParameters}</p>
               </div>
           </div>
           <div className="p-6 flex-1 flex flex-col gap-6">
               {/* Name */}
               <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">{t.audioName} <span className="text-red-500">*</span></label>
                   <div className="relative">
                       <input 
                          value={audioData.name}
                          onChange={(e) => setAudioData(prev => ({...prev, name: e.target.value}))}
                          placeholder={t.audioNamePlaceholder}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 outline-none transition bg-gray-50 focus:bg-white"
                          maxLength={50}
                       />
                       <span className="absolute right-3 bottom-3 text-xs text-gray-400">{audioData.name.length}/50</span>
                   </div>
               </div>

               {/* Speed */}
               <div>
                   <div className="flex justify-between mb-2">
                       <label className="text-sm font-bold text-gray-700">{t.speakingSpeed}</label>
                       <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-sm font-bold border border-indigo-100">{audioData.voiceSpeed}x</span>
                   </div>
                   <input 
                      type="range" min="0.8" max="1.2" step="0.1"
                      value={audioData.voiceSpeed}
                      onChange={(e) => setAudioData(prev => ({...prev, voiceSpeed: parseFloat(e.target.value)}))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                   />
                   <div className="flex justify-between text-xs text-gray-400 mt-1">
                       <span>0.8x</span><span>1.0x</span><span>1.2x</span>
                   </div>
               </div>

               {/* Text (Synthesis Mode) */}
               {pageMode === 'synthesis' && (
                   <div className="flex-1">
                       <label className="block text-sm font-bold text-gray-700 mb-2">{t.audioText} <span className="text-red-500">*</span></label>
                       <div className="relative h-full min-h-[120px]">
                           <textarea 
                              value={audioData.text}
                              onChange={(e) => setAudioData(prev => ({...prev, text: e.target.value}))}
                              placeholder={t.audioTextPlaceholder}
                              className="w-full h-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 outline-none transition bg-gray-50 focus:bg-white resize-none"
                              maxLength={500}
                           />
                           <span className="absolute right-3 bottom-3 text-xs text-gray-400">{audioData.text.length}/500</span>
                       </div>
                   </div>
               )}

               {/* Status Info */}
               <div className="mt-auto bg-gray-50 rounded-xl p-4 border border-gray-100">
                   <div className="flex items-center gap-2 mb-3">
                       <span className="w-2 h-2 rounded-full bg-green-500"></span>
                       <span className="font-bold text-gray-700 text-sm">{pageMode === 'clone' ? t.fileStatus : t.audioStatus}</span>
                   </div>
                   {((pageMode === 'clone' && audioFile) || (pageMode === 'synthesis' && selectedVoice)) ? (
                       <div className="space-y-2 text-sm">
                           {pageMode === 'clone' && audioFile && (
                               <>
                                <div className="flex justify-between"><span className="text-gray-500">{t.fileName}</span><span className="font-medium text-gray-800 truncate max-w-[120px]">{audioFile.fileName}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">{t.fileSize}</span><span className="font-medium text-gray-800">{formatFileSize(audioFile.size)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">{t.fileFormat}</span><span className="uppercase font-medium text-gray-800">{audioFile.format}</span></div>
                               </>
                           )}
                           {pageMode === 'synthesis' && selectedVoice && (
                               <>
                                <div className="flex justify-between"><span className="text-gray-500">{t.audioName2}</span><span className="font-medium text-gray-800">{selectedVoice.voiceName}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">{t.sex}</span><span className="font-medium text-gray-800">{selectedVoice.gender === 'male' ? t.male : t.female}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">{t.style}</span><span className="font-medium text-gray-800">{selectedVoice.style || '-'}</span></div>
                               </>
                           )}
                       </div>
                   ) : (
                       <div className="text-center text-gray-400 text-sm py-2">{t.inPreparation}</div>
                   )}
               </div>
           </div>
        </div>

        {/* 2. Source Panel (Upload/Select) */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl shadow-lg shadow-green-500/30">📁</div>
               <div>
                   <h3 className="font-bold text-gray-800 text-lg">{pageMode === 'clone' ? t.getAudio : t.getTimbre}</h3>
                   <p className="text-gray-500 text-sm">{pageMode === 'clone' ? t.uploadOrOnline : t.selectVoice}</p>
               </div>
           </div>
           <div className="p-6 flex-1 flex flex-col">
               {pageMode === 'clone' ? (
                   <>
                       {/* Method Switch */}
                       <div className="flex gap-3 mb-6">
                           <button 
                              onClick={() => setUploadMethod('file')}
                              className={`flex-1 py-3 rounded-xl border-2 font-medium transition flex flex-col items-center gap-1 ${uploadMethod === 'file' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                           >
                               <Upload size={20} /> {t.uploadFile}
                           </button>
                           <button 
                              onClick={() => setUploadMethod('record')}
                              className={`flex-1 py-3 rounded-xl border-2 font-medium transition flex flex-col items-center gap-1 ${uploadMethod === 'record' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                           >
                               <Mic size={20} /> {t.onlineRecording}
                           </button>
                       </div>

                       {/* Upload Area */}
                       {uploadMethod === 'file' && (
                           <div 
                              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                              onDragLeave={() => setIsDragOver(false)}
                              onDrop={handleDrop}
                              onClick={() => fileInputRef.current?.click()}
                              className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-6 cursor-pointer transition ${isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}`}
                           >
                               <input ref={fileInputRef} type="file" accept=".mp3,.wav,.m4a" onChange={handleFileChange} className="hidden" />
                               <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                                   {uploadLoading ? <Loader className="animate-spin" /> : <FileAudio size={32} />}
                               </div>
                               <h4 className="font-bold text-gray-700 mb-1">{t.uploadAudio}</h4>
                               <p className="text-xs text-gray-400 max-w-[200px]">{t.supportAudioType}</p>
                           </div>
                       )}

                       {/* Record Area */}
                       {uploadMethod === 'record' && (
                           <div className="flex-1 bg-gray-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-gray-200">
                               <div className={`text-2xl font-mono font-bold mb-6 ${isRecording ? 'text-red-500' : 'text-gray-400'}`}>
                                   {formatTime(recordTime)}
                               </div>
                               
                               <div className="flex gap-4 mb-6">
                                   {!isRecording ? (
                                       <button onClick={startRecording} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition flex items-center gap-2">
                                           <Mic size={18} /> {t.startRecording}
                                       </button>
                                   ) : (
                                       <button onClick={stopRecording} className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg hover:bg-red-600 transition flex items-center gap-2">
                                           <span className="w-3 h-3 bg-white rounded-sm animate-pulse"></span> {t.stopRecording}
                                       </button>
                                   )}
                               </div>
                               
                               <p className="text-sm text-gray-500 mb-4">{recordStatus}</p>

                               {recordedAudioUrl && (
                                   <div className="w-full bg-white p-3 rounded-xl border border-gray-200">
                                       <div className="flex items-center justify-between mb-2">
                                           <span className="text-xs font-bold text-gray-600">{t.previewRecording}</span>
                                           <button onClick={clearRecording} className="text-xs text-red-500 hover:underline">{t.clear}</button>
                                       </div>
                                       <audio src={recordedAudioUrl} controls className="w-full h-8" />
                                       <button 
                                          onClick={uploadRecording}
                                          disabled={recordSubmitLoading || !!audioData.originVoiceFileId}
                                          className="w-full mt-3 py-2 bg-green-500 text-white rounded-lg font-bold text-sm hover:bg-green-600 disabled:opacity-50 transition"
                                       >
                                           {recordSubmitLoading ? <Loader className="animate-spin mx-auto" size={16} /> : (audioData.originVoiceFileId ? t.recordUploadSuccess : t.uploadRecording)}
                                       </button>
                                   </div>
                               )}
                           </div>
                       )}
                   </>
               ) : (
                   // Synthesis Mode: Voice Selection
                   <div className="flex flex-col h-full">
                       {/* Search & Filters */}
                       <div className="flex gap-2 mb-4">
                           <div className="relative flex-1">
                               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                               <input 
                                  value={searchKeyword}
                                  onChange={e => setSearchKeyword(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && getVoiceList(1)}
                                  placeholder="搜索音色..."
                                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-500"
                               />
                           </div>
                           <select className="px-2 py-2 rounded-lg border border-gray-200 text-sm outline-none" value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
                               <option value="">{t.allSex}</option>
                               <option value="male">{t.male}</option>
                               <option value="female">{t.female}</option>
                           </select>
                       </div>

                       {/* Voice List */}
                       <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[300px] border border-gray-100 rounded-xl bg-gray-50">
                           {voiceLoading ? (
                               <div className="flex justify-center py-10"><Loader className="animate-spin text-indigo-600" /></div>
                           ) : voiceList.map(voice => (
                               <div 
                                  key={voice.voiceId}
                                  onClick={() => setSelectedVoice(voice)}
                                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition flex items-center justify-between ${selectedVoice?.voiceId === voice.voiceId ? 'bg-indigo-50 hover:bg-indigo-50' : 'bg-white'}`}
                               >
                                   <div className="flex items-center gap-3 overflow-hidden">
                                       <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${selectedVoice?.voiceId === voice.voiceId ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                                           {voice.gender === 'female' ? '👩' : '👨'}
                                       </div>
                                       <div className="min-w-0">
                                           <p className={`font-bold text-sm truncate ${selectedVoice?.voiceId === voice.voiceId ? 'text-indigo-700' : 'text-gray-800'}`}>{voice.voiceName}</p>
                                           <div className="flex gap-1 text-[10px] text-gray-500 flex-wrap">
                                               <span className="bg-gray-100 px-1.5 py-0.5 rounded">{voice.gender === 'male' ? t.male : t.female}</span>
                                               {voice.style && <span className="bg-gray-100 px-1.5 py-0.5 rounded">{voice.style}</span>}
                                               {voice.accent && <span className="bg-gray-100 px-1.5 py-0.5 rounded">{voice.accent}</span>}
                                               {voice.bestSupportLanguage && <span className="bg-gray-100 px-1.5 py-0.5 rounded">{voice.bestSupportLanguage}</span>}
                                           </div>
                                       </div>
                                   </div>
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); playDemo(voice); }}
                                      className={`p-2 rounded-full hover:bg-gray-200 transition ${currentPlayingDemo === voice.voiceId ? 'text-red-500 bg-red-50' : 'text-gray-400'}`}
                                   >
                                       {currentPlayingDemo === voice.voiceId ? <Pause size={16} /> : <Play size={16} />}
                                   </button>
                               </div>
                           ))}
                       </div>

                       {/* Pagination */}
                       <div className="flex justify-center gap-2 mt-4">
                           <button onClick={() => getVoiceList(voicePagination.current - 1)} disabled={voicePagination.current <= 1} className="px-3 py-1 rounded border text-xs hover:bg-gray-50 disabled:opacity-50">{t.previousPage}</button>
                           <span className="text-xs text-gray-500 py-1">{voicePagination.current} / {Math.ceil(voicePagination.total / voicePagination.pageSize) || 1}</span>
                           <button onClick={() => getVoiceList(voicePagination.current + 1)} disabled={voicePagination.current >= Math.ceil(voicePagination.total / voicePagination.pageSize)} className="px-3 py-1 rounded border text-xs hover:bg-gray-50 disabled:opacity-50">{t.nextPage}</button>
                       </div>
                   </div>
               )}
           </div>
        </div>

        {/* 3. Effect/Result Panel */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
             <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100 flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-2xl shadow-lg shadow-orange-500/30">🎨</div>
               <div>
                   <h3 className="font-bold text-gray-800 text-lg">{t.syntheticEffect}</h3>
                   <p className="text-gray-500 text-sm">{t.previewRes}</p>
               </div>
           </div>
           <div className="p-6 flex-1 flex flex-col">
               {/* Checklist */}
               <div className="mb-6 space-y-3">
                   <h4 className="font-bold text-gray-700 text-sm mb-2">{t.operationProcess}</h4>
                   <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                       <span className="text-sm text-gray-600 flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${audioData.name ? 'bg-green-500' : 'bg-gray-300'}`}></span> {t.audioName}
                       </span>
                       {audioData.name ? <Check size={16} className="text-green-500" /> : <span className="text-xs text-gray-400">⏳</span>}
                   </div>
                   <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                       <span className="text-sm text-gray-600 flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${(pageMode === 'clone' ? audioFile : selectedVoice) ? 'bg-green-500' : 'bg-gray-300'}`}></span> 
                           {pageMode === 'clone' ? '音频文件' : '音色选择'}
                       </span>
                       {(pageMode === 'clone' ? audioFile : selectedVoice) ? <Check size={16} className="text-green-500" /> : <span className="text-xs text-gray-400">⏳</span>}
                   </div>
                   {pageMode === 'synthesis' && (
                       <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                           <span className="text-sm text-gray-600 flex items-center gap-2">
                               <span className={`w-2 h-2 rounded-full ${audioData.text ? 'bg-green-500' : 'bg-gray-300'}`}></span> {t.syntheticText}
                           </span>
                           {audioData.text ? <Check size={16} className="text-green-500" /> : <span className="text-xs text-gray-400">⏳</span>}
                       </div>
                   )}
               </div>

               {/* Task Status / Result */}
               {(taskStatus || isPolling) && (
                   <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                       <div className="flex items-center gap-2 mb-3">
                           {taskStatus === 'success' ? '✅' : (taskStatus === 'fail' ? '❌' : <Loader className="animate-spin text-blue-600" size={16} />)}
                           <span className="font-bold text-gray-700">{taskStatus === 'success' ? t.taskSuccess : (taskStatus === 'fail' ? t.messionPushFail : t.inProcessing)}</span>
                       </div>
                       
                       {(isPolling || taskStatus === 'running') && (
                           <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${taskProgress}%` }}></div>
                           </div>
                       )}

                       {taskError && (
                           <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
                               <AlertCircle size={12} /> {taskError}
                           </div>
                       )}
                   </div>
               )}

               {/* Success Result */}
               {taskResult && taskResult.status === 'success' && taskResult.voice?.demoAudioUrl && (
                   <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-100">
                       <h4 className="font-bold text-green-800 mb-3">{t.taskRes}</h4>
                       <div className="flex flex-col gap-3">
                           <audio src={taskResult.voice.demoAudioUrl} controls className="w-full h-8" />
                           <a href={taskResult.voice.demoAudioUrl} download className="flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition">
                               <Download size={16} /> {t.downloadAudio}
                           </a>
                       </div>
                   </div>
               )}

               {/* Actions */}
               <div className="mt-auto flex gap-3">
                   <button 
                      onClick={clearAll}
                      disabled={isPolling}
                      className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 disabled:opacity-50 transition"
                   >
                       <RotateCcw size={20} />
                   </button>
                   <button 
                      onClick={handleSubmit}
                      disabled={!canSubmit() || isPolling || submitLoading}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:shadow-none transition flex items-center justify-center gap-2"
                   >
                       {submitLoading || isPolling ? <Loader className="animate-spin" /> : (pageMode === 'clone' ? t.startCloning : t.startSynthesis)}
                   </button>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceClone;

