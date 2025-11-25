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
  FolderPlus,
  Trash2,
  Music,
  Filter,
  Save
} from 'lucide-react';
import { avatarService, Voice, VoiceCloneResult, UploadedFile } from '../../../services/avatarService';
import { assetsService } from '../../../services/assetsService';
import { useAuthStore } from '../../../stores/authStore';
import UploadComponent from '../../../components/UploadComponent';
import AddMaterialModal from '../../../components/AddMaterialModal';
import toast from 'react-hot-toast';

const SvgPointsIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 1024 1024" 
    version="1.1" 
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <path d="M913.7 430.7c2.9-2.9 7.5-7.4-3.9-21.7L722.6 159.7H302.8l-187 248.9c-11.6 14.6-7 19.2-4.3 21.9l401.2 410.4 401-410.2zM595.5 667.2c-7.7 0-14-6.3-14-14s6.3-14 14-14 14 6.3 14 14c0 7.8-6.3 14-14 14zM746 502.8c6.6 6.6 6.6 17.2 0 23.7L645.2 627.3c-3.3 3.3-7.6 4.9-11.9 4.9-4.3 0-8.6-1.6-11.9-4.9-6.6-6.6-6.6-17.2 0-23.7l100.7-100.7c6.7-6.7 17.3-6.7 23.9-0.1zM346 358.1c-6.7-6.5-6.8-17.1-0.4-23.7 6.4-6.7 17.1-6.8 23.7-0.4l149.6 145 151.5-146.8c6.7-6.5 17.3-6.3 23.7 0.4 6.5 6.7 6.3 17.3-0.4 23.7L535.2 509.9c-0.8 1.8-1.8 3.5-3.3 5-3.3 3.4-7.7 5.1-12.1 5.1-4.2 0-8.4-1.6-11.7-4.7L346 358.1z" fill="#006be6" />
    <path d="M936.4 388.4l-192-255.6c-3.2-4.2-8.1-6.7-13.4-6.7H294.4c-5.3 0-10.3 2.5-13.4 6.7L89.3 388.1c-27.1 34.1-10 57.7-1.6 66.1l413 422.5c3.2 3.2 7.5 5.1 12 5.1s8.8-1.8 12-5.1l412.8-422.4c8.7-8.5 25.7-32.1-1.1-65.9z m-820.5 20.2l187-248.9h419.8L909.9 409c11.3 14.3 6.8 18.8 3.9 21.7l-401 410.2-401.2-410.4c-2.8-2.7-7.3-7.3 4.3-21.9z" fill="#ffffff" className="selected" />
    <path d="M532 514.9c1.4-1.5 2.5-3.2 3.3-5l158.6-153.7c6.7-6.5 6.8-17.1 0.4-23.7-6.5-6.7-17.1-6.8-23.7-0.4L519 478.9 369.4 334c-6.7-6.4-17.3-6.3-23.7 0.4-6.5 6.7-6.3 17.3 0.4 23.7l162.2 157.2c3.3 3.2 7.5 4.7 11.7 4.7 4.3 0 8.7-1.7 12-5.1zM621.5 627.3c3.3 3.3 7.6 4.9 11.9 4.9 4.3 0 8.6-1.6 11.9-4.9L746 526.5c6.6-6.6 6.6-17.2 0-23.7-6.6-6.6-17.2-6.6-23.7 0L621.5 603.5c-6.6 6.6-6.6 17.2 0 23.8z" fill="#ffffff" className="selected" />
    <path d="M595.5 653.3m-14 0a14 14 0 1 0 28 0 14 14 0 1 0-28 0Z" fill="#ffffff" />
  </svg>
);

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
  resultTitle: '生成结果',
  addToLibrary: '添加到素材库',
  addedToLibrary: '已添加到素材库',
  addToLibraryFail: '添加到素材库失败',
  createAudioFile: '生成的音频文件',
  audioReadFail: '无法读取音频数据',
  fileReadFail: '文件读取失败',
  transWAV: '正在转换为 WAV 格式...',
  transWAVSuccess: 'WAV 格式转换完成',
  transWAVFail: '音频格式转换失败，将使用原始格式',
  downloadAll: '批量下载'
};

const selectLanguageList = [
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
  const [tempFile, setTempFile] = useState<File | null>(null);
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
  
  // History State
  const [generatedHistory, setGeneratedHistory] = useState<VoiceCloneResult[]>([]);
  const [currentResult, setCurrentResult] = useState<VoiceCloneResult | null>(null);
  const [isAddedToLib, setIsAddedToLib] = useState(false);
  
  const [isPolling, setIsPolling] = useState(false);
  const loopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mimeTypeRef = useRef<string>('');

  // AddMaterialModal State
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [addMaterialData, setAddMaterialData] = useState<any>(null);

  // --- Helper Functions ---

  // Handle upload complete
  const handleUploadComplete = (uploaded: UploadedFile) => {
    setAudioFile({
      ...uploaded,
      file: tempFile || undefined,
      size: tempFile?.size
    });
    setAudioData(prev => ({ 
      ...prev, 
      originVoiceFileId: uploaded.fileId,
      name: prev.name || uploaded.fileName.replace(/\.[^/.]+$/, '')
    }));
    toast.success(t.uploadSuccess);
  };

  // Convert AudioBuffer to WAV
  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bytesPerSample = 2;
    const blockAlign = numberOfChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * blockAlign;
    const bufferSize = 44 + dataSize;

    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        const sample = Math.max(-1, Math.min(1, channelData[i] || 0));
        view.setInt16(
          offset,
          sample < 0 ? sample * 0x8000 : sample * 0x7fff,
          true
        );
        offset += 2;
      }
    }

    return arrayBuffer;
  };

  // Convert WebM to WAV
  const convertWebmToWav = async (webmBlob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const fileReader = new FileReader();

      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          if (!arrayBuffer) {
            throw new Error(t.audioReadFail);
          }

          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const wavBuffer = audioBufferToWav(audioBuffer);
          const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });

          if (audioContext.state !== 'closed') {
            await audioContext.close();
          }

          resolve(wavBlob);
        } catch (error) {
          if (audioContext.state !== 'closed') {
            await audioContext.close();
          }
          reject(error);
        }
      };

      fileReader.onerror = async () => {
        if (audioContext.state !== 'closed') {
          await audioContext.close();
        }
        reject(new Error(t.fileReadFail));
      };

      fileReader.readAsArrayBuffer(webmBlob);
    });
  };

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

  // Helper to trigger list refresh when filters change
  useEffect(() => {
    if (pageMode === 'synthesis') {
       // Reset to page 1 on filter change
       // Note: getVoiceList handles the current state values
       getVoiceList(1);
    }
  }, [voiceTypeFilter, genderFilter, styleFilter, languageFilter]);

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
    // Do not clear history when resetting input
    setIsPolling(false);
    setSearchKeyword('');
    setIsAddedToLib(false);
    // Don't reset filters on clearAll to keep user preference
    // setGenderFilter('');
    // setStyleFilter('');
    stopAllAudio();
    if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
  };

  const switchMode = (mode: 'clone' | 'synthesis') => {
    setPageMode(mode);
    clearAll();
  };

  // --- File Upload ---
  // Replaced by UploadComponent


  // --- Recording ---

  const startRecording = async () => {
    try {
      setRecordStatus(t.micPermission);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          sampleRate: 44100,
        } 
      });
      streamRef.current = stream;
      
      // Determine supported MIME type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
      ];
      
      let mimeType = 'audio/webm';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      mimeTypeRef.current = mimeType;

      const mediaRecorder = new MediaRecorder(stream, {
        audioBitsPerSecond: 128000,
        mimeType
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mimeTypeRef.current;
        const originalBlob = new Blob(audioChunksRef.current, { type: mimeType });
        let finalBlob = originalBlob;
        let finalExtension = mimeType.includes('webm') ? 'webm' : 'ogg';
        let finalMimeType = mimeType;

        // Convert WebM to WAV
        if (mimeType.includes('webm')) {
          try {
            setRecordStatus(t.transWAV);
            finalBlob = await convertWebmToWav(originalBlob);
            finalExtension = 'wav';
            finalMimeType = 'audio/wav';
            setRecordStatus(t.transWAVSuccess);
          } catch (error) {
            console.error('Audio conversion failed:', error);
            toast.error(t.transWAVFail);
            setRecordStatus(t.transWAVFail);
          }
        }

        const url = URL.createObjectURL(finalBlob);
        setRecordedAudioUrl(url);
        setRecordStatus(t.recordingCompleted);
        
        // Create a File object for upload
        const file = new File([finalBlob], `recording_${Date.now()}.${finalExtension}`, { type: finalMimeType });
        setAudioFile({
            fileId: '', // Not uploaded yet
            fileName: file.name,
            fileUrl: url,
            format: finalExtension,
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
      toast.error(t.micPermissionFail);
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

  const mapRecordedFileType = (file: File) => {
    const mimePart = file.type.split('/')[1] || '';
    let fileType = (mimePart || file.name.split('.').pop() || 'wav').toLowerCase();
    if (fileType === 'mpeg') fileType = 'mp3';
    if (fileType === 'quicktime') fileType = 'mp4';
    if (fileType === 'x-m4a') fileType = 'm4a';
    if (fileType === 'x-wav') fileType = 'wav';
    if (fileType === 'x-msvideo') fileType = 'avi';
    return fileType;
  };

  const uploadRecording = async () => {
    if (!audioFile?.file) {
      toast.error(t.audioFirst);
      return;
    }

    setRecordSubmitLoading(true);
    try {
      const fileToUpload = audioFile.file;
      const fileType = mapRecordedFileType(fileToUpload);

      const credRes = await avatarService.getUploadCredential(fileType);
      if (!credRes || !credRes.result || credRes.code !== '200') {
        console.error('获取录音上传凭证失败:', credRes);
        throw new Error(credRes?.message || 'Failed to get upload credentials');
      }

      const { uploadUrl, fileName, fileId, format } = credRes.result;
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: fileToUpload,
        headers: { 'Content-Type': fileToUpload.type || 'application/octet-stream' }
      });

      if (!uploadRes.ok) {
        console.error('录音上传失败:', uploadRes.status, uploadRes.statusText);
        throw new Error(`Upload failed: ${uploadRes.statusText}`);
      }

      setAudioData(prev => ({ ...prev, originVoiceFileId: fileId }));
      setAudioFile(prev => prev ? ({
        ...prev,
        fileId,
        fileName: fileName || prev.fileName,
        format: format || prev.format
      }) : prev);

      toast.success(t.recordUploadSuccess);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(t.recordUploadFail);
    } finally {
      setRecordSubmitLoading(false);
    }
  };

  // --- Voice List (Synthesis) ---

  const getVoiceList = async (page = 1) => {
    setVoiceLoading(true);
    try {
      if (voiceTypeFilter === 'public') {
        // Public Voices
      const res = await avatarService.getVoiceList({
        pageNo: page,
        pageSize: voicePagination.pageSize,
        voiceName: searchKeyword,
        gender: genderFilter,
        style: styleFilter,
        language: languageFilter
      });
        console.log("getVoiceList Public", res);

        if (res.code === '200' || res.code === 200) {
           const resultData = (res as any).result || res.data?.result;
         if (resultData) {
             setVoiceList(resultData.data || []);
             setVoicePagination(prev => ({ ...prev, current: page, total: resultData.total || 0 }));
         } else {
             setVoiceList([]);
             setVoicePagination(prev => ({ ...prev, current: page, total: 0 }));
           }
        }
      } else {
        // Private Voices
        // Use any cast to pass extra params not in interface if needed, or rely on standard query
        const res = await assetsService.getAssetsList({
          pageNum: page,
          pageSize: voicePagination.pageSize,
          assetType: 8,
          assetName: searchKeyword,
          // @ts-ignore - passing isPrivateModel even if not in interface, consistent with reference
          isPrivateModel: '1'
        } as any);
        console.log("getVoiceList Private", res);

        if (res.code === 200 || res.code === '200') {
            // Map AdsAssetsVO to Voice structure
            const rows = (res.data as any)?.rows || (res as any).rows || [];
            const total = (res.data as any)?.total || (res as any).total || 0;
            
            const mappedVoices: Voice[] = rows.map((item: any) => ({
              voiceId: item.assetId,
              voiceName: item.assetName,
              gender: 'unknown', // Private voices usually don't have this metadata exposed in list
              style: 'private',
              demoAudioUrl: item.assetUrl,
              // Add other fields if available or default
              language: 'unknown'
            }));

            setVoiceList(mappedVoices);
            setVoicePagination(prev => ({ ...prev, current: page, total: total }));
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
        toast.error('播放失败');
    };
    audio.play().catch(e => console.error(e));
  };

  // --- Task Submission ---

  const handleSwitchUploadMethod = (method: 'file' | 'record') => {
    if (method === uploadMethod) return;
    setUploadMethod(method);
    // Clear any existing file or recording when switching methods
    clearRecording();
  };

  const canSubmit = () => {
    if (pageMode === 'clone') {
      return audioData.name.trim() && audioData.originVoiceFileId;
    } else {
      return audioData.name.trim() && audioData.text.trim() && selectedVoice;
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      toast.error(t.msgConfirm);
      return;
    }

    setSubmitLoading(true);
    setTaskStatus('');
    // Don't clear currentResult here so user can still see previous while generating new
    
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
      toast.error(t.messionPushFail);
      setTaskStatus('fail');
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
                
                // Add to history and set as current
                setGeneratedHistory(prev => [result, ...prev]);
                setCurrentResult(result);
                
                setIsPolling(false);
            } else if (result.status === 'fail' || result.status === 'error') {
                toast.error(result.errorMsg || t.messionPushFail);
                setTaskStatus('fail');
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
        toast.error(t.queryFail);
        setTaskStatus('fail');
      }
    };
    
    poll();
  };

  const handleSaveToAssets = (result: VoiceCloneResult) => {
    if (!result || !result.voice?.demoAudioUrl) return;
    
    const materialName = result.voice.voiceName || '声音克隆';
    
    setAddMaterialData({
      assetName: materialName,
      assetUrl: result.voice.demoAudioUrl,
      assetType: 8, // 声音克隆
      assetTag: materialName,
      assetDesc: materialName,
      assetId: result.taskId // Using task ID as asset ID reference
    });
    setShowAddMaterialModal(true);
  };

  const handleDownloadAudio = (url: string, name: string) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name || 'generated-audio'}-${Date.now()}.mp3`; // Assuming MP3/WAV
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    for (const result of generatedHistory) {
        if (result.voice?.demoAudioUrl) {
            handleDownloadAudio(result.voice.demoAudioUrl, result.voice.voiceName || 'audio');
            // Delay to prevent browser blocking multiple downloads
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
  };

  const handleClearHistory = () => {
      setGeneratedHistory([]);
      setCurrentResult(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
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
                              onClick={() => handleSwitchUploadMethod('file')}
                       className={`flex-1 py-2 rounded-lg border font-medium text-sm transition flex items-center justify-center gap-2 ${uploadMethod === 'file' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-border hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                           >
                        <Upload size={16} /> {t.uploadFile}
                           </button>
                           <button 
                              onClick={() => handleSwitchUploadMethod('record')}
                       className={`flex-1 py-2 rounded-lg border font-medium text-sm transition flex items-center justify-center gap-2 ${uploadMethod === 'record' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-border hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                           >
                        <Mic size={16} /> {t.onlineRecording}
                           </button>
                       </div>

                {uploadMethod === 'file' ? (
                   <UploadComponent
                      uploadType="tv"
                      accept="audio/mpeg,audio/mp3,audio/wav,audio/x-m4a,audio/m4a,.mp3,.wav,.m4a"
                      initialUrl={audioFile?.fileUrl}
                      onFileSelected={(file) => setTempFile(file)}
                      onUploadComplete={handleUploadComplete}
                      onClear={() => {
                          setAudioFile(null);
                          setAudioData(prev => ({ ...prev, originVoiceFileId: '', name: '' }));
                      }}
                      maxSize={50}
                   >
                      <div className="text-center text-gray-500 p-6">
                          <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                          <p className="text-sm font-medium">{t.uploadAudio}</p>
                          <p className="text-xs text-muted-foreground mt-1">{t.supportAudioType}</p>
                      </div>
                   </UploadComponent>
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
                    
                    {/* Filter Section */}
                    <div className="mb-3 space-y-2">
                      <div className="flex gap-2">
                           <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                               <input 
                                  value={searchKeyword}
                                  onChange={e => setSearchKeyword(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && getVoiceList(1)}
                                  placeholder="搜索音色..."
                               className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                               />
                           </div>
                         
                         <select 
                           value={voiceTypeFilter}
                           onChange={(e) => setVoiceTypeFilter(e.target.value as 'public' | 'private')}
                           className="w-24 px-2 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                         >
                             <option value="public">{t.commonVoice}</option>
                             <option value="private">{t.privateVoice}</option>
                         </select>
                      </div>

                      <div className="flex gap-2 overflow-x-auto pb-1">
                          {/* Language Filter - Always show */}
                          <select 
                            value={languageFilter}
                            onChange={(e) => setLanguageFilter(e.target.value)}
                            className="flex-1 min-w-[120px] px-2 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                              {selectLanguageList.map(lang => (
                                <option key={lang.value} value={lang.value}>{lang.label}</option>
                              ))}
                          </select>

                          {/* Filters only for Public */}
                          {voiceTypeFilter === 'public' && (
                            <>
                              <select 
                                value={genderFilter}
                                onChange={(e) => setGenderFilter(e.target.value)}
                                className="w-24 px-2 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                              >
                               <option value="">{t.allSex}</option>
                               <option value="male">{t.male}</option>
                               <option value="female">{t.female}</option>
                           </select>

                              <select 
                                value={styleFilter}
                                onChange={(e) => setStyleFilter(e.target.value)}
                                className="w-24 px-2 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                              >
                                  <option value="">{t.allStyle}</option>
                                  <option value="UGC">{t.UGC}</option>
                                  <option value="Advertisement">{t.Advertisement}</option>
                              </select>
                            </>
                          )}
                      </div>
                       </div>

                       {/* Voice List */}
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
                                           <div className="flex gap-1">
                                               {voiceTypeFilter === 'public' && (
                                                 <>
                                                   <span className="text-[10px] text-muted-foreground bg-accent px-1 rounded">{voice.style}</span>
                                                   <span className="text-[10px] text-muted-foreground bg-accent px-1 rounded">{voice.gender === 'male' ? t.male : t.female}</span>
                                                 </>
                                               )}
                                               {voiceTypeFilter === 'private' && (
                                                  <span className="text-[10px] text-muted-foreground bg-accent px-1 rounded">{t.privateVoice}</span>
                                               )}
                                           </div>
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
          <div className="mt-6 pt-4 border-t border-border flex gap-3">
            <button 
              onClick={clearAll}
              className="w-1/3 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={isPolling || submitLoading}
            >
              <Trash2 size={18} />
              {t.clearReset}
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!canSubmit() || isPolling || submitLoading}
              className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transform transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {submitLoading || isPolling ? (
                 <>
                   <Loader2 size={18} className="animate-spin" />
                   {t.inProcessing}
                 </>
               ) : (
                 <>
                   <SvgPointsIcon className="size-6" />
                   2 {pageMode === 'clone' ? t.startCloning : t.startSynthesis}
                 </>
                   )}
            </button>
               </div>
                       </div>
                       
        {/* Right Panel - Preview */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-8 flex flex-col relative overflow-hidden">
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold text-foreground">{t.resultTitle || '生成结果'}</h2>
             <div className="flex gap-2">
                 {/* Clear History Button */}
                 <button
                    onClick={handleClearHistory}
                    disabled={generatedHistory.length === 0}
                    className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors text-muted-foreground disabled:opacity-50"
                 >
                    {t.clear || '清空'}
                 </button>
                 
                 {/* Batch Download Button */}
                 <button
                    onClick={handleDownloadAll}
                    disabled={generatedHistory.length === 0}
                    className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1"
                 >
                    <Download size={12} /> {t.downloadAudio || '批量下载'}
                 </button>
             </div>
           </div>

           {/* Main Preview Area */}
           <div className="w-full h-[450px] shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 mb-6 relative overflow-hidden">
              {(submitLoading || isPolling) ? (
                <div className="flex flex-col items-center gap-4 z-10">
                   <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                   <p className="text-indigo-600 font-medium">{t.inProcessing} {taskProgress > 0 && `${taskProgress}%`}</p>
                   {/* <p className="text-xs text-muted-foreground">任务ID: {taskId}</p> */}
                </div>
              ) : currentResult && currentResult.voice?.demoAudioUrl ? (
                <div className="w-full max-w-md p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
                   <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                      <Music size={32} />
                   </div>
                   <div className="text-center">
                      <h3 className="text-lg font-bold text-foreground">{currentResult.voice.voiceName || 'Generated Voice'}</h3>
                      <p className="text-sm text-muted-foreground">{t.taskSuccess || '生成成功'}</p>
                   </div>
                   
                   <audio src={currentResult.voice.demoAudioUrl} controls className="w-full" />
                   
                   <button 
                      onClick={() => handleDownloadAudio(currentResult.voice!.demoAudioUrl!, currentResult.voice!.voiceName!)}
                      className="flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition w-full"
                   >
                      <Download size={18} /> {t.downloadAudio}
                   </button>
                   
                   <button
                      onClick={() => handleSaveToAssets(currentResult)}
                      className="flex items-center justify-center gap-2 px-6 py-2 border-2 border-indigo-600 text-indigo-600 rounded-full font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition w-full"
                   >
                      <Save size={18} /> {t.addToLibrary || '保存到素材库'}
                   </button>
                </div>
              ) : taskStatus === 'fail' ? (
                 <div className="flex flex-col items-center text-red-500 gap-2">
                    <AlertCircle size={48} />
                    <p className="font-bold">{t.messionPushFail}</p>
                    <p className="text-sm text-muted-foreground">请查看右上角提示信息</p>
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
           
           {/* History Thumbs / List */}
           {generatedHistory.length > 0 && (
             <div className="h-32 flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
               {generatedHistory.map((item, index) => (
                 <div 
                   key={item.taskId || index}
                   onClick={() => setCurrentResult(item)}
                   className={`relative w-32 h-28 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 transition-all flex flex-col bg-white dark:bg-slate-800 shadow-sm ${
                     currentResult === item ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-transparent hover:border-indigo-300'
                   }`}
                 >
                   <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
                        <Music size={24} className="text-slate-400" />
                   </div>
                   <div className="p-2 bg-card text-center">
                        <p className="text-xs font-medium truncate">{item.voice?.voiceName || `Voice ${index + 1}`}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{new Date().toLocaleDateString()}</p>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

      {/* Add Material Modal */}
      <AddMaterialModal
        isOpen={showAddMaterialModal}
        onClose={() => setShowAddMaterialModal(false)}
        onSuccess={() => {
          setShowAddMaterialModal(false);
          // Optional: toast.success('Saved successfully'); // handled in modal
        }}
        initialData={addMaterialData}
        disableAssetTypeSelection={true}
        isImportMode={true}
      />
    </div>
  );
};

export default VoiceClone;
