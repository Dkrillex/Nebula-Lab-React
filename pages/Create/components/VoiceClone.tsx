import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Upload, 
  X, 
  Loader2, 
  Play, 
  Pause, 
  RotateCcw, 
  Search, 
  Check, 
  AlertCircle,
  FileAudio,
  Download,
  Wand2,
  Trash2,
  Music
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
  emptyState: '配置参数并开始生成，结果将显示在这里',
  resultTitle: '生成结果'
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
      const res = await avatarService.getVoiceList({
        pageNo: page,
        pageSize: voicePagination.pageSize,
        voiceName: searchKeyword,
        gender: genderFilter,
        style: styleFilter,
        language: languageFilter
      });
    console.log("getVoiceList",res)
      if (res.code === '200') {
         const resultData = res?.result;
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
          voiceText: t.desc1,
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

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="w-full border-b border-border bg-card/50 backdrop-blur-sm z-10">
        <div className="px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-foreground">{pageMode === 'clone' ? t.title1 : t.title2}</h1>
            <p className="text-xs text-muted-foreground mt-1 opacity-90">{pageMode === 'clone' ? t.desc1 : t.desc2}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel - Settings */}
        <div className="w-full md:w-[400px] lg:w-[450px] bg-surface border-r border-border flex flex-col p-6 overflow-y-auto custom-scrollbar">
          
          {/* Mode Selection */}
          <div className="mb-6 flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-1 rounded-full gap-1">
            <button
              onClick={() => switchMode('clone')}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                pageMode === 'clone' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {t.title1}
            </button>
            <button
              onClick={() => switchMode('synthesis')}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                pageMode === 'synthesis' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {t.title2}
            </button>
          </div>

          <div className="space-y-6 flex-1">
            {/* Common Name Input */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">{t.audioName} <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  value={audioData.name}
                  onChange={(e) => setAudioData(prev => ({...prev, name: e.target.value}))}
                  placeholder={t.audioNamePlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  maxLength={50}
                />
                <span className="absolute right-3 bottom-3 text-xs text-muted-foreground opacity-70">{audioData.name.length}/50</span>
              </div>
            </div>

            {/* CLONE MODE: Upload / Record */}
            {pageMode === 'clone' && (
              <div>
                <h3 className="font-bold text-foreground mb-3">{t.getAudio}</h3>
                <div className="flex gap-3 mb-3">
                    <button 
                       onClick={() => setUploadMethod('file')}
                       className={`flex-1 py-2 rounded-lg border font-medium text-sm transition flex items-center justify-center gap-2 ${uploadMethod === 'file' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-border hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                        <Upload size={16} /> {t.uploadFile}
                    </button>
                    <button 
                       onClick={() => setUploadMethod('record')}
                       className={`flex-1 py-2 rounded-lg border font-medium text-sm transition flex items-center justify-center gap-2 ${uploadMethod === 'record' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-border hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                        <Mic size={16} /> {t.onlineRecording}
                    </button>
                </div>

                {uploadMethod === 'file' ? (
                   <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                        isDragOver || audioFile ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-border hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                   >
                      <input ref={fileInputRef} type="file" accept=".mp3,.wav,.m4a" onChange={handleFileChange} className="hidden" />
                      {uploadLoading ? (
                         <Loader2 size={24} className="animate-spin text-indigo-600 mb-2" />
                      ) : audioFile ? (
                         <FileAudio size={32} className="text-indigo-500 mb-2" />
                      ) : (
                         <Upload size={24} className="text-muted-foreground mb-2" />
                      )}
                      
                      {audioFile ? (
                          <div className="text-center">
                              <p className="text-sm font-bold text-indigo-600 break-all">{audioFile.fileName}</p>
                              <p className="text-xs text-muted-foreground mt-1">{formatFileSize(audioFile.size)}</p>
                          </div>
                      ) : (
                          <div className="text-center">
                              <p className="text-sm font-medium text-foreground">{t.uploadAudio}</p>
                              <p className="text-xs text-muted-foreground mt-1">{t.supportAudioType}</p>
                          </div>
                      )}
                   </div>
                ) : (
                   <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center">
                       <div className={`text-3xl font-mono font-bold mb-4 ${isRecording ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`}>
                           {formatTime(recordTime)}
                       </div>
                       
                       <div className="flex gap-4 w-full">
                           {!isRecording ? (
                               <button onClick={startRecording} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 text-sm">
                                   <Mic size={16} /> {t.startRecording}
                               </button>
                           ) : (
                               <button onClick={stopRecording} className="flex-1 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition flex items-center justify-center gap-2 text-sm">
                                   <div className="w-2 h-2 bg-white rounded-sm"></div> {t.stopRecording}
                               </button>
                           )}
                       </div>
                       
                       {recordedAudioUrl && (
                           <div className="w-full mt-3 pt-3 border-t border-border">
                               <div className="flex items-center justify-between mb-2">
                                   <span className="text-xs font-bold text-muted-foreground">{t.previewRecording}</span>
                                   <button onClick={clearRecording} className="text-xs text-red-500 hover:underline">{t.clear}</button>
                               </div>
                               <audio src={recordedAudioUrl} controls className="w-full h-8" />
                               <button 
                                  onClick={uploadRecording}
                                  disabled={recordSubmitLoading || !!audioData.originVoiceFileId}
                                  className="w-full mt-2 py-2 bg-green-600 text-white rounded-lg font-bold text-xs hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                               >
                                   {recordSubmitLoading && <Loader2 size={14} className="animate-spin" />}
                                   {audioData.originVoiceFileId ? t.recordUploadSuccess : t.uploadRecording}
                               </button>
                           </div>
                       )}
                   </div>
                )}
              </div>
            )}

            {/* SYNTHESIS MODE: Voice Selection & Text */}
            {pageMode === 'synthesis' && (
              <>
                 <div>
                    <h3 className="font-bold text-foreground mb-3">{t.getTimbre}</h3>
                    <div className="mb-2 relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                       <input 
                          value={searchKeyword}
                          onChange={e => setSearchKeyword(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && getVoiceList(1)}
                          placeholder="搜索音色..."
                          className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                       />
                    </div>
                    
                    <div className="h-48 overflow-y-auto custom-scrollbar border border-border rounded-xl bg-card/50">
                       {voiceLoading ? (
                           <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-indigo-600" /></div>
                       ) : voiceList.length > 0 ? (
                           voiceList.map(voice => (
                               <div 
                                  key={voice.voiceId}
                                  onClick={() => setSelectedVoice(voice)}
                                  className={`p-2 border-b border-border last:border-0 cursor-pointer hover:bg-accent/50 transition flex items-center justify-between ${selectedVoice?.voiceId === voice.voiceId ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                               >
                                   <div className="flex items-center gap-2 overflow-hidden">
                                       <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${selectedVoice?.voiceId === voice.voiceId ? 'bg-indigo-100 text-indigo-600' : 'bg-muted'}`}>
                                           {voice.gender === 'female' ? '👩' : '👨'}
                                       </div>
                                       <div className="min-w-0">
                                           <p className={`font-bold text-sm truncate ${selectedVoice?.voiceId === voice.voiceId ? 'text-indigo-600' : 'text-foreground'}`}>{voice.voiceName}</p>
                                           <span className="text-[10px] text-muted-foreground">{voice.style || voice.gender}</span>
                                       </div>
                                   </div>
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); playDemo(voice); }}
                                      className={`p-1.5 rounded-full hover:bg-accent transition ${currentPlayingDemo === voice.voiceId ? 'text-red-500' : 'text-muted-foreground'}`}
                                   >
                                       {currentPlayingDemo === voice.voiceId ? <Pause size={14} /> : <Play size={14} />}
                                   </button>
                               </div>
                           ))
                       ) : (
                           <div className="flex justify-center items-center h-full text-sm text-muted-foreground">无数据</div>
                       )}
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-foreground mb-2">{t.audioText} <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <textarea
                        value={audioData.text}
                        onChange={(e) => setAudioData(prev => ({...prev, text: e.target.value}))}
                        placeholder={t.audioTextPlaceholder}
                        className="w-full h-32 p-4 rounded-xl border border-border bg-background resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                        maxLength={500}
                      />
                      <span className="absolute bottom-3 right-3 text-xs text-muted-foreground opacity-70">{audioData.text.length}/500</span>
                    </div>
                 </div>
              </>
            )}

            {/* Speed Slider */}
            <div>
               <div className="flex justify-between mb-2">
                   <label className="text-sm font-bold text-foreground">{t.speakingSpeed}</label>
                   <span className="px-2 py-0.5 rounded text-xs font-bold bg-accent text-accent-foreground">{audioData.voiceSpeed}x</span>
               </div>
               <input 
                  type="range" min="0.8" max="1.2" step="0.1"
                  value={audioData.voiceSpeed}
                  onChange={(e) => setAudioData(prev => ({...prev, voiceSpeed: parseFloat(e.target.value)}))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-indigo-600"
               />
               <div className="flex justify-between text-xs text-muted-foreground mt-1">
                   <span>0.8x</span><span>1.0x</span><span>1.2x</span>
               </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 pt-4 border-t border-border">
            <button 
              onClick={handleSubmit}
              disabled={!canSubmit() || isPolling || submitLoading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transform transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {submitLoading || isPolling ? (
                 <>
                   <Loader2 size={18} className="animate-spin" />
                   {t.inProcessing}
                 </>
               ) : (
                 <>
                   <Wand2 size={18} />
                   {pageMode === 'clone' ? t.startCloning : t.startSynthesis}
                 </>
               )}
            </button>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-8 flex flex-col relative overflow-hidden">
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold text-foreground">{t.resultTitle || '生成结果'}</h2>
             {(taskResult || taskError) && (
               <button 
                 onClick={clearAll}
                 className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
               >
                 <RotateCcw size={14} /> {t.clearReset}
               </button>
             )}
           </div>

           {/* Main Preview Area */}
           <div className="flex-1 w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 mb-6 relative overflow-hidden">
              {(submitLoading || isPolling) ? (
                <div className="flex flex-col items-center gap-4 z-10">
                   <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                   <p className="text-indigo-600 font-medium">{t.inProcessing} {taskProgress > 0 && `${taskProgress}%`}</p>
                   <p className="text-xs text-muted-foreground">任务ID: {taskId}</p>
                </div>
              ) : taskResult && taskResult.status === 'success' && taskResult.voice?.demoAudioUrl ? (
                <div className="w-full max-w-md p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
                   <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                      <Music size={32} />
                   </div>
                   <div className="text-center">
                      <h3 className="text-lg font-bold text-foreground">{taskResult.voice.voiceName || 'Generated Voice'}</h3>
                      <p className="text-sm text-muted-foreground">生成成功</p>
                   </div>
                   
                   <audio src={taskResult.voice.demoAudioUrl} controls className="w-full" />
                   
                   <a 
                      href={taskResult.voice.demoAudioUrl} 
                      download 
                      className="flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition w-full"
                   >
                      <Download size={18} /> {t.downloadAudio}
                   </a>
                </div>
              ) : taskError ? (
                 <div className="flex flex-col items-center text-red-500 gap-2">
                    <AlertCircle size={48} />
                    <p className="font-bold">{t.messionPushFail}</p>
                    <p className="text-sm text-muted-foreground">{taskError}</p>
                 </div>
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                   <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                      <Music size={40} className="text-slate-400 dark:text-slate-500" />
                   </div>
                   <p className="text-sm max-w-xs text-center">{t.emptyState}</p>
              </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceClone;
