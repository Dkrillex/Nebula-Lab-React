import React, { useState, useEffect, useRef } from 'react';
import { Upload, PenTool, Mic, Music, ChevronDown, FileAudio, X, Play, Loader, Check, AlertCircle, Video as VideoIcon, Image as ImageIcon } from 'lucide-react';
import { avatarService } from '../../../services/avatarService';
import { AiAvatar, Voice, Caption, UploadedFile } from '../../../types';
import { useAuthStore } from '../../../stores/authStore';

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
}

const DigitalHumanPage: React.FC<DigitalHumanPageProps> = ({ t }) => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'video' | 'product' | 'singing'>('video');
  const [scriptMode, setScriptMode] = useState<'text' | 'audio'>('text');
  const [mode, setMode] = useState<'mode1' | 'mode2'>('mode1');
  const [text, setText] = useState('');
  
  // 数字人相关
  const [avatarList, setAvatarList] = useState<AiAvatar[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<AiAvatar | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  
  // 语音相关
  const [voiceList, setVoiceList] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  
  // 字幕相关
  const [captionList, setCaptionList] = useState<Caption[]>([]);
  const [selectedCaption, setSelectedCaption] = useState<Caption | null>(null);
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  
  // 文件上传
  const [uploadedVideo, setUploadedVideo] = useState<UploadedFile | null>(null);
  const [uploadedAudio, setUploadedAudio] = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  // 任务相关
  const [generating, setGenerating] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<'idle' | 'running' | 'success' | 'fail'>('idle');
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // 产品链接（营销视频模式）
  const [productLink, setProductLink] = useState('');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  
  // 视频预览状态
  const [videoPreviewStates, setVideoPreviewStates] = useState<Record<string, boolean>>({});
  
  // 分页和筛选
  const [avatarPagination, setAvatarPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
    gender: 'male' as 'male' | 'female',
  });
  const [isCustomAvatar, setIsCustomAvatar] = useState(false);
  
  // 加载语音和字幕列表（在组件挂载时加载）
  useEffect(() => {
    loadVoiceList();
    loadCaptionList();
  }, []);
  
  // 当模态框打开时加载数字人列表
  useEffect(() => {
    if (showAvatarModal) {
      loadAvatarList();
    }
  }, [showAvatarModal, avatarPagination.current, avatarPagination.pageSize, avatarPagination.gender, isCustomAvatar]);
  
  const loadAvatarList = async () => {
    try {
      setAvatarLoading(true);
      setAvatarList([]); // 清空列表
      const res = await avatarService.getAiAvatarList({ 
        pageNo: avatarPagination.current, 
        pageSize: avatarPagination.pageSize,
        gender: avatarPagination.gender,
        isCustom: isCustomAvatar,
      });
      
      // 根据旧项目，API返回结构可能是 res.result.data 或 res.data.result.data
      if (res.code === 200) {
        let avatarData: AiAvatar[] = [];
        let total = 0;
        
        // 尝试多种响应结构
        if ((res as any).result?.data) {
          // 旧项目结构：{ code, message, result: { data, total } }
          avatarData = (res as any).result.data;
          total = (res as any).result.total || 0;
        } else if (res.data?.result?.data) {
          // 嵌套结构：{ code, data: { result: { data, total } } }
          avatarData = res.data.result.data;
          total = res.data.result.total || 0;
        } else if (res.data && typeof res.data === 'object' && 'data' in res.data) {
          // 简单结构：{ code, data: { data, total } }
          const dataObj = res.data as unknown as { data?: AiAvatar[]; total?: number };
          avatarData = Array.isArray(dataObj.data) ? dataObj.data : [];
          total = dataObj.total || 0;
        } else if (Array.isArray(res.data)) {
          // 直接数组
          avatarData = res.data;
        } else if (Array.isArray((res as any).result)) {
          // result 直接是数组
          avatarData = (res as any).result;
        }
        
        console.log('数字人列表响应:', { res, avatarData, total });
        setAvatarList(avatarData);
        setAvatarPagination(prev => ({ ...prev, total }));
      }
    } catch (error) {
      console.error('加载数字人列表失败:', error);
      setErrorMessage('加载数字人列表失败');
    } finally {
      setAvatarLoading(false);
    }
  };
  
  const loadVoiceList = async () => {
    try {
      setVoiceLoading(true);
      const res = await avatarService.getVoiceList({ pageNo: 1, pageSize: 100 });
      
      // 处理多种响应结构
      let voiceData: Voice[] = [];
      if (res.code === 200) {
        if ((res as any).result?.data) {
          voiceData = (res as any).result.data;
        } else if (res.data?.result?.data) {
          voiceData = res.data.result.data;
        } else if (res.data && typeof res.data === 'object' && 'data' in res.data) {
          const dataObj = res.data as unknown as { data?: Voice[] };
          voiceData = Array.isArray(dataObj.data) ? dataObj.data : [];
        } else if (Array.isArray(res.data)) {
          voiceData = res.data;
        } else if (Array.isArray((res as any).result)) {
          voiceData = (res as any).result;
        }
      }
      setVoiceList(voiceData);
    } catch (error) {
      console.error('加载语音列表失败:', error);
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
          captionData = Array.isArray((res as any).result) ? (res as any).result : [];
        } else if (res.data) {
          captionData = Array.isArray(res.data) ? res.data : [];
        }
      }
      setCaptionList(captionData);
    } catch (error) {
      console.error('加载字幕列表失败:', error);
    }
  };
  
  // 文件上传处理
  const handleFileUpload = async (file: File, type: 'video' | 'audio') => {
    try {
      setUploading(true);
      setErrorMessage(null);
      
      // 获取文件扩展名
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      let format = fileExtension;
      
      // 处理特殊格式
      if (format === 'mpeg') format = 'mp3';
      if (format === 'quicktime') format = 'mp4';
      if (format === 'webm' && type === 'audio') format = 'mp3';
      
      // 获取上传凭证
      const credentialRes = await avatarService.getUploadCredential(format);
      if (credentialRes.code !== 200 || !credentialRes.data) {
        throw new Error('获取上传凭证失败');
      }
      
      const { uploadUrl, fileId, fileName } = credentialRes.data;
      
      // 上传文件到OSS
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      
      if (!uploadRes.ok) {
        throw new Error(`上传失败: ${uploadRes.status}`);
      }
      
      // 保存文件信息
      const uploadedFile: UploadedFile = {
        fileId,
        fileName,
        format,
        fileUrl: uploadUrl,
      };
      
      if (type === 'video') {
        setUploadedVideo(uploadedFile);
      } else {
        setUploadedAudio(uploadedFile);
      }
      
      return uploadedFile;
    } catch (error: any) {
      console.error('文件上传失败:', error);
      setErrorMessage(error.message || '文件上传失败');
      throw error;
    } finally {
      setUploading(false);
    }
  };
  
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file, 'video');
    }
  };
  
  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file, 'audio');
      setScriptMode('audio');
    }
  };
  
  // 积分计算逻辑
  const calculatePoints = () => {
    if (activeTab === 'video') {
      // 视频创作模式
      if (mode === 'mode2') { // avatar2
        return 4;
      }
      const textLength = text.length;
      if (scriptMode === 'text' && textLength) {
        return Math.floor((textLength + 399) / 400) * 1 || 1;
      }
      if (scriptMode === 'audio' && uploadedAudio?.duration) {
        return Math.floor((uploadedAudio.duration + 29) / 30) * 1 || 1;
      }
    } else if (activeTab === 'product') {
      // 营销视频模式
      return 2; // 默认值，根据实际需求调整
    }
    return 0;
  };

  // 提交任务
  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setErrorMessage(null);
      
      const points = calculatePoints();
      console.log('预计扣除积分:', points);
      
      // 验证必填项
      if (activeTab === 'video') {
        // 视频创作模式
        if (!uploadedVideo && !selectedAvatar) {
          setErrorMessage('请上传数字人视频或选择数字人');
          return;
        }
        
        if (scriptMode === 'text') {
          if (!text.trim()) {
            setErrorMessage('请输入文本内容');
            return;
          }
          if (!selectedVoice) {
            setErrorMessage('请选择音色');
            return;
          }
        } else {
          if (!uploadedAudio) {
            setErrorMessage('请上传音频文件');
            return;
          }
        }
      } else if (activeTab === 'product') {
        // 营销视频模式
        if (!selectedAvatar) {
          setErrorMessage('请选择数字人');
          return;
        }
        if (!productLink && !productName) {
          setErrorMessage('请填写产品链接或产品名称');
          return;
        }
        if (!productLink && !productDescription) {
          setErrorMessage('请填写产品描述');
          return;
        }
        if (!uploadedVideo && !productLink) {
          setErrorMessage('请上传素材或填写产品链接');
          return;
        }
      }
      
      let submitRes;
      
      if (activeTab === 'video') {
        // 视频创作任务
        const params = {
          avatarSourceFrom: uploadedVideo ? 0 : 1, // 0-用户上传，1-公模
          videoFileId: uploadedVideo?.fileId || '',
          aiAvatarId: selectedAvatar?.aiavatarId || '',
          audioSourceFrom: scriptMode === 'text' ? 1 : 0,
          audioFileId: uploadedAudio?.fileId || '',
          ttsText: scriptMode === 'text' ? text : '',
          voiceoverId: selectedVoice?.voiceId || '',
          noticeUrl: '',
          score: String(points), // 积分
          deductPoints: points, // 扣除积分
          modeType: mode === 'mode1' ? 0 : 1,
          captionId: selectedCaption?.captionId || '',
        };
        
        submitRes = await avatarService.submitVideoCreationTask(params);
      } else {
        // 营销视频任务
        const params = {
          aiavatarId: selectedAvatar?.aiavatarId || '',
          aspectRatio: '9:16',
          captionId: selectedCaption?.captionId,
          language: 'zh-CN',
          voiceId: selectedVoice?.voiceId,
          productLink: productLink || undefined,
          productName: productName || undefined,
          productDescription: productDescription || undefined,
          fileIds: uploadedVideo ? [uploadedVideo.fileId] : undefined,
          preview: true,
          videoLengthType: 2, // 15-30s
        };
        
        submitRes = await avatarService.submitMarketingTask(params);
      }
      
      console.log('提交任务响应:', submitRes);
      
      // 深度解析响应数据，兼容 { data: { result: ... } } 或 { result: ... } 或 { data: ... }
      let taskData: any = submitRes;
      if (submitRes.data) {
        if ((submitRes.data as any).result) {
          taskData = (submitRes.data as any).result;
        } else {
          taskData = submitRes.data;
        }
      } else if ((submitRes as any).result) {
        taskData = (submitRes as any).result;
      }
      
      const newTaskId = taskData?.taskId || taskData?.subTaskId;
      
      // 只要获取到了 taskId，就认为请求成功（request.ts 已拦截了 HTTP 错误）
      if (newTaskId) {
        console.log('任务提交成功，TaskId:', newTaskId);
        setTaskId(newTaskId);
        setTaskStatus('running');
        // 开始轮询任务状态
        pollTaskStatus(newTaskId);
      } else {
        throw new Error(submitRes.msg || taskData?.errorMsg || '任务提交失败：未获取到 TaskId');
      }
    } catch (error: any) {
      console.error('生成失败:', error);
      setErrorMessage(error.message || '生成失败，请重试');
      setTaskStatus('fail');
    } finally {
      setGenerating(false);
    }
  };
  
  // 轮询任务状态
  const pollTaskStatus = async (taskId: string) => {
    const maxAttempts = 60; // 最多轮询60次
    const interval = 5000; // 5秒轮询一次
    let attempts = 0;
    
    const poll = async () => {
      try {
        const res = activeTab === 'video'
          ? await avatarService.queryVideoCreationTask(taskId)
          : await avatarService.queryMarketingTask(taskId);
        
        console.log('查询任务状态响应:', res);
        
        // 深度解析响应数据
        let taskData: any = res;
        if (res.data) {
          if ((res.data as any).result) {
            taskData = (res.data as any).result;
          } else {
            taskData = res.data;
          }
        } else if ((res as any).result) {
          taskData = (res as any).result;
        }
        
        if (taskData) {
          const status = taskData.status;
          console.log('当前任务状态:', status);
          
          if (status === 'success') {
            setTaskStatus('success');
            if (activeTab === 'video') {
              setPreviewVideoUrl(taskData.outputVideoUrl);
            } else {
              // 营销视频可能在 previewVideos 或 exportVideos 中
              if (taskData.previewVideos && taskData.previewVideos.length > 0) {
                setPreviewVideoUrl(taskData.previewVideos[0].videoUrl);
              } else if (taskData.exportVideos && taskData.exportVideos.length > 0) {
                setPreviewVideoUrl(taskData.exportVideos[0].videoUrl);
              }
            }
            return;
          } else if (status === 'fail') {
            setTaskStatus('fail');
            setErrorMessage(taskData.errorMsg || '任务执行失败');
            return;
          } else {
            // running, init 或其他状态
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(poll, interval);
            } else {
              setTaskStatus('fail');
              setErrorMessage('任务超时，请稍后查询');
            }
          }
        }
      } catch (error) {
        console.error('查询任务状态失败:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, interval);
        } else {
          setTaskStatus('fail');
          setErrorMessage('查询任务状态失败');
        }
      }
    };
    
    poll();
  };

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900 p-4 md:p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      
      {/* Header */}
      <div className="text-center text-gray-800 dark:text-gray-100 space-y-2 flex-shrink-0">
        <h1 className="text-3xl font-bold tracking-wide">{t.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm opacity-90">{t.subtitle}</p>
      </div>

      {/* Top Tabs */}
      <div className="flex justify-center">
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
            <span className="text-lg leading-none">🎨</span>
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

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[600px]">
        
        {/* Left Panel - Asset Management */}
        <div className="w-full lg:w-1/3 bg-white rounded-2xl p-6 flex flex-col gap-6 shadow-2xl flex-shrink-0">
          <h2 className="font-bold text-slate-800 text-lg">{t.leftPanel.myDigitalHuman}</h2>
          
          {/* 数字人选择 */}
          {selectedAvatar ? (
            <div className="relative">
              <div className="border-2 border-indigo-500 rounded-xl overflow-hidden">
                <img 
                  src={selectedAvatar.thumbnailUrl || selectedAvatar.coverUrl} 
                  alt={selectedAvatar.aiavatarName}
                  className="w-full h-48 object-cover"
                />
                <div className="p-3 bg-indigo-50">
                  <p className="font-semibold text-slate-800">{selectedAvatar.aiavatarName}</p>
                  <p className="text-xs text-slate-500">{selectedAvatar.gender}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAvatar(null)}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-50"
              >
                <X size={16} className="text-slate-600" />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => setShowAvatarModal(true)}
              className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex-1 flex flex-col items-center justify-center gap-4 group min-h-[300px]"
            >
             <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all duration-300">
                <Upload size={32} />
             </div>
             <div className="text-center px-4">
                <p className="text-base font-bold text-slate-700 mb-1">{t.leftPanel.uploadTitle}</p>
                <p className="text-xs text-slate-400 mb-2">{t.leftPanel.uploadFormat}</p>
                <p className="text-xs text-indigo-500 font-medium">{t.leftPanel.uploadDesc}</p>
             </div>
          </div>
          )}

          <div className="flex gap-3">
            <button 
              onClick={() => setShowAvatarModal(true)}
              className="flex-1 py-3 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:border-indigo-500 hover:text-indigo-600 transition-all"
            >
               {t.leftPanel.personalTemplate}
             </button>
            <button 
              onClick={() => setShowAvatarModal(true)}
              className="flex-1 py-3 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:border-indigo-500 hover:text-indigo-600 transition-all"
            >
               {t.leftPanel.publicTemplate}
             </button>
          </div>

          {/* 视频上传 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">上传数字人视频</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoFileChange}
              className="hidden"
            />
            {uploadedVideo ? (
              <div className="relative border-2 border-indigo-500 rounded-xl p-3 bg-indigo-50">
                <div className="flex items-center gap-2">
                  <VideoIcon size={20} className="text-indigo-600" />
                  <span className="text-sm font-medium text-slate-800 truncate">{uploadedVideo.fileName}</span>
                </div>
                <button
                  onClick={() => setUploadedVideo(null)}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-red-50"
                >
                  <X size={14} className="text-slate-600" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full py-3 rounded-xl border border-indigo-200 text-indigo-600 text-sm font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50"
              >
                {uploading ? '上传中...' : t.leftPanel.customUpload}
          </button>
            )}
          </div>
        </div>

        {/* Right Panel - Configuration */}
        <div className="flex-1 bg-white rounded-2xl p-6 flex flex-col gap-6 shadow-2xl">
          
          {/* 错误提示 */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}
          
          {/* 产品链接输入（营销视频模式） */}
          {activeTab === 'product' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">产品链接</label>
                <input
                  type="text"
                  value={productLink}
                  onChange={(e) => setProductLink(e.target.value)}
                  placeholder="请输入产品链接（可选）"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">产品名称</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="请输入产品名称"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">产品描述</label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="请输入产品描述"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>
          )}
          
          {/* Mode Selection */}
          {activeTab === 'video' && (
          <div>
             <h3 className="font-bold text-slate-800 mb-3">{t.rightPanel.modeSelection}</h3>
             <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                   <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${mode === 'mode1' ? 'border-indigo-600' : 'border-slate-300'}`}>
                      {mode === 'mode1' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>}
                   </div>
                   <input type="radio" name="mode" className="hidden" checked={mode === 'mode1'} onChange={() => setMode('mode1')} />
                   <span className={`text-sm font-medium ${mode === 'mode1' ? 'text-indigo-600' : 'text-slate-600'}`}>{t.rightPanel.mode1}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                   <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${mode === 'mode2' ? 'border-indigo-600' : 'border-slate-300'}`}>
                      {mode === 'mode2' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>}
                   </div>
                   <input type="radio" name="mode" className="hidden" checked={mode === 'mode2'} onChange={() => setMode('mode2')} />
                   <span className={`text-sm font-medium ${mode === 'mode2' ? 'text-indigo-600' : 'text-slate-600'}`}>{t.rightPanel.mode2}</span>
                </label>
             </div>
          </div>
          )}

          {/* Script Content */}
          <div className="flex-1 flex flex-col gap-4">
             <h3 className="font-bold text-slate-800">{t.rightPanel.scriptContent}</h3>
             
             <div className="bg-slate-50 rounded-xl p-1 flex">
                <button 
                   onClick={() => setScriptMode('text')}
                   className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${scriptMode === 'text' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                   <PenTool size={14} />
                   {t.rightPanel.textToSpeech}
                </button>
                <button 
                   onClick={() => setScriptMode('audio')}
                   className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${scriptMode === 'audio' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                   <Music size={14} />
                   {t.rightPanel.importAudio}
                </button>
             </div>

            {scriptMode === 'text' ? (
             <div className="relative flex-1 min-h-[120px]">
                <textarea 
                   value={text}
                   onChange={(e) => setText(e.target.value)}
                   placeholder={t.rightPanel.textPlaceholder}
                   className="w-full h-full p-4 rounded-xl border border-slate-200 bg-white resize-none text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                   {text.length}/{t.rightPanel.textLimit}
                </div>
             </div>
            ) : (
              <div>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                  className="hidden"
                />
                {uploadedAudio ? (
                  <div className="relative border-2 border-indigo-500 rounded-xl p-3 bg-indigo-50">
                    <div className="flex items-center gap-2">
                      <FileAudio size={20} className="text-indigo-600" />
                      <span className="text-sm font-medium text-slate-800 truncate">{uploadedAudio.fileName}</span>
                    </div>
                    <button
                      onClick={() => setUploadedAudio(null)}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-red-50"
                    >
                      <X size={14} className="text-slate-600" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => audioInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:border-indigo-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
                  >
                    {uploading ? '上传中...' : '点击上传音频文件'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Voice Settings */}
          {scriptMode === 'text' && (
          <div>
             <h3 className="text-sm font-medium text-slate-600 mb-3">{t.rightPanel.voiceType}</h3>
             <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-slate-700">{t.rightPanel.aiVoice}</label>
                <div className="flex gap-3">
                   <div className="flex-1 relative">
                    <select 
                      value={selectedVoice?.voiceId || ''}
                      onChange={(e) => {
                        const voice = voiceList.find(v => v.voiceId === e.target.value);
                        setSelectedVoice(voice || null);
                      }}
                      className="w-full h-10 appearance-none rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-indigo-500 outline-none cursor-pointer"
                    >
                      <option value="">{t.rightPanel.publicVoice}</option>
                      {voiceList.map(voice => (
                        <option key={voice.voiceId} value={voice.voiceId}>
                          {voice.voiceName} {voice.gender && `(${voice.gender})`}
                        </option>
                      ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                   </div>
                  <button 
                    onClick={() => setShowVoiceModal(true)}
                    className="flex-1 h-10 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                  >
                      {t.rightPanel.selectVoice}
                   </button>
                </div>
                {selectedVoice && (
                  <div className="text-xs text-slate-500">
                    已选择: {selectedVoice.voiceName} {selectedVoice.style && `(${selectedVoice.style})`}
                  </div>
                )}
             </div>
          </div>
          )}

          {/* Subtitles */}
          <div>
             <h3 className="text-xs font-bold text-slate-700 mb-2">{t.rightPanel.aiSubtitle}</h3>
            <button 
              onClick={() => setShowCaptionModal(true)}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
            >
              {selectedCaption ? `已选择字幕样式` : t.rightPanel.selectSubtitleStyle}
             </button>
          </div>

          {/* Preview Area */}
          <div className="bg-slate-50 rounded-xl p-6 text-center text-slate-500 text-sm min-h-[200px] flex items-center justify-center">
            {taskStatus === 'running' ? (
              <div className="flex flex-col items-center gap-3">
                <Loader className="animate-spin text-indigo-600" size={32} />
                <span>视频生成中，请稍候...</span>
              </div>
            ) : taskStatus === 'success' && previewVideoUrl ? (
              <div className="w-full">
                <video 
                  src={previewVideoUrl} 
                  controls 
                  className="w-full rounded-lg mb-3"
                />
                <div className="flex items-center justify-between">
                  <p className="text-green-600 font-medium flex items-center gap-2">
                    <Check size={16} /> 生成成功！
                  </p>
                  <a 
                    href={previewVideoUrl} 
                    download="generated-video.mp4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-indigo-100 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors"
                  >
                    下载视频
                  </a>
                </div>
              </div>
            ) : (
              <div>{t.rightPanel.previewPlaceholder}</div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-auto pt-4">
            <button 
              onClick={() => {
                setText('这是一个示例文本，用于演示数字人视频生成功能。');
                setProductName('示例产品');
                setProductDescription('这是一个示例产品描述，展示了产品的特点和优势。');
              }}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
                {t.rightPanel.tryExample}
             </button>
            <button 
              onClick={handleGenerate}
              disabled={generating || uploading}
              className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  <span>生成中...</span>
                </>
              ) : (
                t.rightPanel.generate
              )}
             </button>
          </div>

        </div>

      </div>
      
      {/* 数字人选择模态框 */}
      {showAvatarModal && (
        <AvatarModal
          avatars={avatarList}
          selected={selectedAvatar}
          onSelect={(avatar) => {
            setSelectedAvatar(avatar);
            setShowAvatarModal(false);
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
      
      {/* 语音选择模态框 */}
      {showVoiceModal && (
        <VoiceModal
          voices={voiceList}
          selected={selectedVoice}
          onSelect={(voice) => {
            setSelectedVoice(voice);
            setShowVoiceModal(false);
          }}
          onClose={() => setShowVoiceModal(false)}
          loading={voiceLoading}
        />
      )}
      
      {/* 字幕选择模态框 */}
      {showCaptionModal && (
        <CaptionModal
          captions={captionList}
          selected={selectedCaption}
          onSelect={(caption) => {
            setSelectedCaption(caption);
            setShowCaptionModal(false);
          }}
          onClose={() => setShowCaptionModal(false)}
        />
      )}
    </div>
  );
};

// 数字人选择模态框组件
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">{isCustom ? '个人模板' : '公共模板'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        
        {/* 筛选和切换 */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onCustomChange(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !isCustom 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              公共模板
            </button>
            <button
              onClick={() => onCustomChange(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isCustom 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              个人模板
            </button>
          </div>
          
          {!isCustom && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">性别筛选：</label>
              <select
                value={pagination.gender}
                onChange={(e) => onGenderChange(e.target.value as 'male' | 'female')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="male">男性</option>
                <option value="female">女性</option>
              </select>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="animate-spin text-indigo-600" size={32} />
              <span className="ml-3 text-slate-600">正在加载数字人列表...</span>
            </div>
          ) : avatars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <p className="text-lg mb-2">暂无数字人数据</p>
              <p className="text-sm">请稍后再试</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {avatars.map(avatar => (
                  <div
                    key={avatar.aiavatarId}
                    onMouseEnter={() => onVideoPreview(avatar.aiavatarId, true)}
                    onMouseLeave={() => onVideoPreview(avatar.aiavatarId, false)}
                    onClick={() => onSelect(avatar)}
                    className={`relative aspect-[9/16] w-full rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                      selected?.aiavatarId === avatar.aiavatarId 
                        ? 'ring-2 ring-offset-2 ring-indigo-500' 
                        : 'border-2 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {previewStates[avatar.aiavatarId] && avatar.previewVideoUrl ? (
                      <video
                        src={avatar.previewVideoUrl}
                        className="absolute inset-0 w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <img 
                        src={avatar.thumbnailUrl || avatar.coverUrl} 
                        alt={avatar.aiavatarName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/images/nullAvatar.png';
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
              
              {/* 分页 */}
              {pagination.total > pagination.pageSize && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => onPaginationChange(pagination.current - 1, pagination.pageSize)}
                    disabled={pagination.current <= 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  <span className="text-sm text-slate-600">
                    第 {pagination.current} 页 / 共 {Math.ceil(pagination.total / pagination.pageSize)} 页
                  </span>
                  <button
                    onClick={() => onPaginationChange(pagination.current + 1, pagination.pageSize)}
                    disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// 语音选择模态框组件
const VoiceModal: React.FC<{
  voices: Voice[];
  selected: Voice | null;
  onSelect: (voice: Voice) => void;
  onClose: () => void;
  loading: boolean;
}> = ({ voices, selected, onSelect, onClose, loading }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  
  const handlePlay = (voice: Voice) => {
    if (playingId === voice.voiceId) {
      setPlayingId(null);
    } else {
      setPlayingId(voice.voiceId || null);
      if (voice.demoAudioUrl) {
        const audio = new Audio(voice.demoAudioUrl);
        audio.play();
        audio.onended = () => setPlayingId(null);
      }
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">选择音色</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : (
            <div className="space-y-2">
              {voices.map(voice => (
                <div
                  key={voice.voiceId}
                  onClick={() => onSelect(voice)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selected?.voiceId === voice.voiceId ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{voice.voiceName}</p>
                      <div className="flex gap-2 mt-1 text-xs text-slate-500">
                        {voice.gender && <span>性别: {voice.gender}</span>}
                        {voice.age && <span>年龄: {voice.age}</span>}
                        {voice.style && <span>风格: {voice.style}</span>}
                        {voice.accent && <span>口音: {voice.accent}</span>}
                      </div>
                    </div>
                    {voice.demoAudioUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlay(voice);
                        }}
                        className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
                      >
                        {playingId === voice.voiceId ? <Loader className="animate-spin" size={16} /> : <Play size={16} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 字幕选择模态框组件
const CaptionModal: React.FC<{
  captions: Caption[];
  selected: Caption | null;
  onSelect: (caption: Caption) => void;
  onClose: () => void;
}> = ({ captions, selected, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">选择字幕样式</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {captions.map(caption => (
              <div
                key={caption.captionId}
                onClick={() => onSelect(caption)}
                className={`border-2 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                  selected?.captionId === caption.captionId ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200'
                }`}
              >
                <img 
                  src={caption.thumbnail} 
                  alt={`字幕样式 ${caption.captionId}`}
                  className="w-full h-24 object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalHumanPage;
