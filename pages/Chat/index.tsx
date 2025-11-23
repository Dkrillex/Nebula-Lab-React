import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Settings, Trash2, Save, Plus, RefreshCw, Send, Bot, User, 
  MoreHorizontal, Cpu, MessageSquare, X, Copy, Loader2, Square,
  Image as ImageIcon, Video, MessageCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import toast from 'react-hot-toast';
import { chatService, ChatMessage, ChatRequest } from '../../services/chatService';
import { modelsService, ModelsVO } from '../../services/modelsService';
import { imageGenerateService, ImageGenerateRequest } from '../../services/imageGenerateService';
import { videoGenerateService, VideoGenerateRequest } from '../../services/videoGenerateService';
import { useVideoGenerationStore } from '../../stores/videoGenerationStore';
import { useAuthStore } from '../../stores/authStore';
import { ChatRecord } from '../../types';
import { useAppOutletContext } from '../../router';
import CodeBlock from './components/CodeBlock';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  getImageSizes,
  getVideoRatios,
  getVideoResolutions,
  ModelCapabilities,
  IMAGE_TO_VIDEO_MODES
} from './modelConstants';

// 扩展消息类型，支持图片和视频
interface ExtendedChatMessage extends ChatMessage {
  generatedImages?: Array<{
    id: string;
    url: string;
    prompt?: string;
    timestamp: number;
  }>;
  generatedVideos?: Array<{
    id: string;
    url: string;
    taskId?: string;
    prompt?: string;
    timestamp: number;
    status?: string; // 'processing' | 'succeeded' | 'failed'
  }>;
}

type Mode = 'chat' | 'image' | 'video';

const ChatPage: React.FC = () => {
  const { t: rawT } = useAppOutletContext();
  const t = rawT.chatPage;

  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { getData } = useVideoGenerationStore();
  // 模式切换：对话/图片生成/视频生成
  const [currentMode, setCurrentMode] = useState<Mode>('chat');
  
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: t.welcomeMessage,
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]); // base64图片数组
  const [models, setModels] = useState<ModelsVO[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [temperature, setTemperature] = useState(1.0);
  const [presencePenalty, setPresencePenalty] = useState(0.4);
  
  // 图片生成参数
  const [imageSize, setImageSize] = useState('1024x1024');
  const [imageStyle, setImageStyle] = useState('');
  const [imageQuality, setImageQuality] = useState<'standard' | 'hd'>('standard');
  const [imageN, setImageN] = useState(1); // 生成数量
  const [seed, setSeed] = useState<number | undefined>(undefined); // 随机种子
  
  // 豆包模型专用参数
  const [watermark, setWatermark] = useState(false);
  const [guidanceScale, setGuidanceScale] = useState(2.5);
  const [sequentialImageGeneration, setSequentialImageGeneration] = useState(false);
  
  // qwen模型专用参数
  const [qwenNegativePrompt, setQwenNegativePrompt] = useState('');
  const [qwenPromptExtend, setQwenPromptExtend] = useState(true);

  // 视频生成参数
  const [videoDuration, setVideoDuration] = useState(5);
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoResolution, setVideoResolution] = useState<'720p' | '1080p'>('720p');
  const [imageGenerationMode, setImageGenerationMode] = useState('first_frame'); // first_frame, first_last_frame, reference
  const [cameraFixed, setCameraFixed] = useState(false);
  
  // Wan2.5模型专用参数
  const [wan25SmartRewrite, setWan25SmartRewrite] = useState(true);
  const [wan25GenerateAudio, setWan25GenerateAudio] = useState(true);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [progress, setProgress] = useState(0); // 用于图片/视频生成的进度
  
  // 历史对话相关状态
  const [chatRecords, setChatRecords] = useState<ChatRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | number | null>(null);
  
  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const videoPollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 存储所有模式的模型列表
  const [chatModels, setChatModels] = useState<ModelsVO[]>([]);
  const [imageModels, setImageModels] = useState<ModelsVO[]>([]);
  const [videoModels, setVideoModels] = useState<ModelsVO[]>([]);

  // 初始化时同时获取所有模式的模型
  useEffect(() => {
    fetchAllModels();
  }, []);

  // 同时获取所有模式的模型列表
  const fetchAllModels = async () => {
    try {
      setModelsLoading(true);
      
      // 并行获取三种模式的模型
      const [chatRes, imageRes, videoRes] = await Promise.all([
        modelsService.getModelsList({
          pageNum: 1,
          pageSize: 100,
          status: 1,
          tags: '对话,思考,推理,上下文,图片理解',
        }),
        modelsService.getModelsList({
          pageNum: 1,
          pageSize: 100,
          status: 1,
          tags: '文生图,图生图,图片生成,视觉模型',
        }),
        modelsService.getModelsList({
          pageNum: 1,
          pageSize: 100,
          status: 1,
          tags: '文生视频,图生视频,视频生成',
        }),
      ]);
      
      // 处理聊天模型
      let chatModelList: any[] = [];
      if (chatRes && Array.isArray(chatRes.rows)) {
        chatModelList = chatRes.rows;
      } else if (chatRes.code === 200 && chatRes.rows) {
        chatModelList = Array.isArray(chatRes.rows) ? chatRes.rows : [];
      }
      chatModelList = chatModelList.filter(m => m.modelName);
      setChatModels(chatModelList);
      
      // 处理图片模型 - 白名单过滤
      let imageModelList: any[] = [];
      if (imageRes && Array.isArray(imageRes.rows)) {
        imageModelList = imageRes.rows;
      } else if (imageRes.code === 200 && imageRes.rows) {
        imageModelList = Array.isArray(imageRes.rows) ? imageRes.rows : [];
      }
      const allowedImageModels = new Set([
        'doubao-seededit-3-0-i2i-250628',
        'doubao-seedream-3-0-t2i-250415',
        'doubao-seedream-4-0-250828',
        'gemini-2.5-flash-image',
        'gemini-2.5-flash-image-preview',
        'gemini-3-pro-image-preview',
        'gpt-image-1',
        'gpt-image-1-mini',
        'qwen-image-plus',
        'qwen-image-edit-plus-2025-10-30',
        'qwen-image-edit-plus',
      ]);
      imageModelList = imageModelList.filter(m => m.modelName && allowedImageModels.has(m.modelName));
      setImageModels(imageModelList);
      
      // 处理视频模型 - 黑名单过滤
      let videoModelList: any[] = [];
      if (videoRes && Array.isArray(videoRes.rows)) {
        videoModelList = videoRes.rows;
      } else if (videoRes.code === 200 && videoRes.rows) {
        videoModelList = Array.isArray(videoRes.rows) ? videoRes.rows : [];
      }
      const blockedVideoModels = new Set([
        'jimeng_vgfm_i2v_l20',
        'wan2-1-14b-i2v-250225',
        'veo-3.1-generate-preview',
        'veo-3.0-generate-preview',
      ]);
      videoModelList = videoModelList.filter(m => m.modelName && !blockedVideoModels.has(m.modelName));
      setVideoModels(videoModelList);
      
      // 根据当前模式设置models
      updateModelsForCurrentMode();
      
      console.log('✅ 已同时加载所有模式的模型:', {
        chat: chatModelList.length,
        image: imageModelList.length,
        video: videoModelList.length
      });
    } catch (error) {
      console.error('获取模型列表失败:', error);
      setModels([]);
    } finally {
      setModelsLoading(false);
    }
  };
  
  // 根据当前模式更新显示的模型列表
  const updateModelsForCurrentMode = () => {
    let currentModels: ModelsVO[] = [];
    
    if (currentMode === 'chat') {
      currentModels = chatModels;
    } else if (currentMode === 'image') {
      currentModels = imageModels;
    } else if (currentMode === 'video') {
      currentModels = videoModels;
    }
    
    setModels(currentModels);
    
    // 检查当前选中的模型是否在列表里，如果不在或者未选中，则选择第一个
    const isSelectedValid = selectedModel && currentModels.some(m => m.modelName === selectedModel);
    
    if (currentModels.length > 0 && !isSelectedValid) {
      setSelectedModel(currentModels[0].modelName || '');
    }
  };

  // 监听模式切换，更新模型列表和历史记录
  useEffect(() => {
    setSelectedModel(''); // 切换模式时清空选中的模型
    setChatRecords([]); // 切换模式时清空历史记录
    updateModelsForCurrentMode(); // 使用已加载的模型列表
    
    // 根据模式加载对应的历史记录
    if (user?.nebulaApiId) {
      console.log('🔄 切换模式，加载历史记录:', currentMode);
      if (currentMode === 'chat') {
        fetchChatRecords();
      } else if (currentMode === 'image') {
        fetchImageRecords();
      } else if (currentMode === 'video') {
        fetchVideoRecords();
      }
    }
  }, [currentMode, user?.nebulaApiId]);

  // 监听模型列表变化，自动选择第一个模型
  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      const firstModel = models[0].modelName;
      if (firstModel) {
        setSelectedModel(firstModel);
        console.log('✅ 自动选择第一个模型:', firstModel);
      }
    }
  }, [models, selectedModel]);

  // 调试：监听chatRecords变化
  useEffect(() => {
    console.log('🔍 chatRecords状态变化:', {
      length: chatRecords.length,
      records: chatRecords,
      recordsLoading
    });
  }, [chatRecords, recordsLoading]);
  
  // 监听模型切换,检查是否需要清除图片
  useEffect(() => {
    if (!selectedModel) return;
    
    // 检查当前模型是否支持图片上传
    const supportsUpload = ModelCapabilities.supportsImageUpload(selectedModel, currentMode as 'image' | 'video');
    
    // 如果当前模型不支持图片上传，且有已上传的图片，则清除
    if (!supportsUpload && uploadedImages.length > 0) {
      console.log(`模型 ${selectedModel} 不支持图片上传，清除已上传的图片`);
      setUploadedImages([]);
    }
  }, [selectedModel, currentMode]);

  // 监听 URL 参数，处理"做同款"跳转
  useEffect(() => {
    const mode = searchParams.get('mode');
    const transferId = searchParams.get('transferId');
    const modelName = searchParams.get('model_name');
    
    if (mode && (mode === 'chat' || mode === 'image' || mode === 'video')) {
      setCurrentMode(mode as Mode);
    }

    if (transferId) {
      try {
        const data = getData(transferId);
        
        if (data) {
          console.log('📋 读取到做同款数据:', data);
          
          // 设置提示词
          if (data.sourcePrompt) {
            setInputValue(data.sourcePrompt);
          }
          
          // 设置参考图
          if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            setUploadedImages(data.images); 
          } else {
            setUploadedImages([]);
          }
          
          // 设置模型
          if (modelName) {
            setSelectedModel(modelName);
          }
        }
      } catch (error) {
        console.error('解析做同款数据失败:', error);
      }
    }
  }, [searchParams, getData]);

  // 获取历史对话记录
  const fetchChatRecords = async () => {
    try {
      setRecordsLoading(true);
      const res = await chatService.getChatRecords({
        pageNum: 1,
        pageSize: 10,
        apiType: 'chat-completions',
      });

      console.log('📋 获取对话记录响应 (完整):', JSON.stringify(res, null, 2));
      console.log('📋 获取对话记录响应 (类型):', typeof res, Array.isArray(res));

      // request.get 已经转换了响应
      // 如果后端返回 { code: 200, data: { rows: [...], total: ... } }，request.get 会返回 { rows: [...], total: ... }
      // 如果后端返回 { code: 200, data: { id: ..., ... } }，request.get 会返回 { id: ..., ... }
      let rows: any[] = [];
      
      // 处理不同的响应格式
      if (res && typeof res === 'object') {
        // 格式1: { rows: [...], total: ... } - 标准分页格式
        if (Array.isArray((res as any).rows)) {
          rows = (res as any).rows;
        }
        // 格式2: { data: { rows: [...], total: ... } } - 嵌套的 data 字段
        else if ((res as any).data && Array.isArray((res as any).data.rows)) {
          rows = (res as any).data.rows;
        }
        // 格式3: 直接是数组
        else if (Array.isArray(res)) {
          rows = res;
        }
        // 格式4: 单个记录对象（可能是后端返回格式问题）
        else if ((res as any).id && (res as any).apiType) {
          // 如果是单个记录，包装成数组
          console.warn('⚠️ 列表接口返回了单个记录，而不是列表格式');
          rows = [res];
        }
      }
      
      console.log('📋 对话记录rows (解析后):', rows);
      console.log('📋 对话记录rows 数量:', rows.length);
      
      let records: ChatRecord[] = [];
      
      if (Array.isArray(rows)) {
        records = rows.map((record: any) => {
          let messageCount = 0;
          let model = '';
          let title = `对话 ${record.id}`;

          // 从taskJson获取标题
          try {
            if (record.taskJson) {
              const taskData = JSON.parse(record.taskJson);
              if (taskData.title) {
                title = taskData.title;
              }
            }
          } catch (parseError) {
            console.warn('解析taskJson失败:', parseError);
          }

          // 从apiJson解析消息数量和模型信息
          try {
            if (record.apiJson) {
              const parsedData = JSON.parse(record.apiJson);
              if (parsedData.messages && Array.isArray(parsedData.messages)) {
                messageCount = parsedData.messages.length;
              }
              if (parsedData.settings && parsedData.settings.model) {
                model = parsedData.settings.model;
              }
            }
          } catch (parseError) {
            console.warn('解析apiJson失败:', parseError);
          }

          return {
            id: record.id,
            title,
            apiJson: record.apiJson || '',
            taskJson: record.taskJson || '',
            createTime: record.ctime || record.createTime || Date.now(),
            updateTime: record.mtime || record.updateTime || Date.now(),
            messageCount,
            model,
          };
        });
      }

      console.log('📋 解析后的对话记录列表:', records);
      console.log('📋 记录数量:', records.length);
      setChatRecords(records);
    } catch (error) {
      console.error('❌ 获取对话记录失败:', error);
      setChatRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  };

  // 获取图片生成历史记录
  const fetchImageRecords = async () => {
    try {
      setRecordsLoading(true);
      const res = await chatService.getChatRecords({
        pageNum: 1,
        pageSize: 10,
        apiType: 'image-generates',
      });

      console.log('📋 获取图片生成记录响应 (完整):', JSON.stringify(res, null, 2));
      console.log('📋 获取图片生成记录响应 (类型):', typeof res, Array.isArray(res));

      // request.get 已经转换了响应
      // 如果后端返回 { code: 200, data: { rows: [...], total: ... } }，request.get 会返回 { rows: [...], total: ... }
      // 如果后端返回 { code: 200, data: { id: ..., ... } }，request.get 会返回 { id: ..., ... }
      let rows: any[] = [];
      
      // 处理不同的响应格式
      if (res && typeof res === 'object') {
        // 格式1: { rows: [...], total: ... } - 标准分页格式
        if (Array.isArray((res as any).rows)) {
          rows = (res as any).rows;
        }
        // 格式2: { data: { rows: [...], total: ... } } - 嵌套的 data 字段
        else if ((res as any).data && Array.isArray((res as any).data.rows)) {
          rows = (res as any).data.rows;
        }
        // 格式3: 直接是数组
        else if (Array.isArray(res)) {
          rows = res;
        }
        // 格式4: 单个记录对象（可能是后端返回格式问题）
        else if ((res as any).id && (res as any).apiType) {
          // 如果是单个记录，包装成数组
          console.warn('⚠️ 列表接口返回了单个记录，而不是列表格式');
          rows = [res];
        }
      }
      
      console.log('📋 图片记录rows (解析后):', rows);
      console.log('📋 图片记录rows 数量:', rows.length);
      
      const records = rows.map((record: any) => {
        let imageCount = 0;
        let model = '';
        let title = `图片生成 ${record.id}`;

        // 从taskJson获取标题
        try {
          if (record.taskJson) {
            const taskData = JSON.parse(record.taskJson);
            if (taskData.title) {
              title = taskData.title;
            }
          }
        } catch (parseError) {
          console.warn('解析taskJson失败:', parseError);
        }

        // 从apiJson解析图片数量和模型信息
        try {
          if (record.apiJson) {
            const parsedData = JSON.parse(record.apiJson);
            if (
              parsedData.chatMessages &&
              Array.isArray(parsedData.chatMessages)
            ) {
              // 统计生成的图片数量
              imageCount = parsedData.chatMessages.reduce(
                (total: number, msg: any) => {
                  if (msg.type === 'assistant' && msg.generatedImages) {
                    return total + msg.generatedImages.length;
                  }
                  return total;
                },
                0,
              );
            }
            if (parsedData.settings && parsedData.settings.selectedModel) {
              model = parsedData.settings.selectedModel;
            }
          }
        } catch (parseError) {
          console.warn('解析apiJson失败:', parseError);
        }

        const chatRecord = {
          id: record.id,
          title,
          apiJson: record.apiJson || '',
          taskJson: record.taskJson || '',
          createTime: record.ctime || record.createTime || Date.now(),
          updateTime: record.mtime || record.updateTime || Date.now(),
          messageCount: imageCount,
          model,
        };
        
        console.log('📋 处理后的记录:', chatRecord);
        return chatRecord;
      });

      console.log('📋 解析后的图片生成记录列表:', records);
      console.log('📋 准备设置chatRecords，记录数量:', records.length);
      setChatRecords(records);
      console.log('📋 已调用setChatRecords，设置记录数量:', records.length);
    } catch (error) {
      console.error('❌ 获取图片生成记录失败:', error);
      setChatRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  };

  // 获取视频生成历史记录
  const fetchVideoRecords = async () => {
    try {
      setRecordsLoading(true);
      const res = await chatService.getChatRecords({
        pageNum: 1,
        pageSize: 10,
        apiType: 'video-generates',
      });

      console.log('📋 获取视频生成记录响应 (完整):', JSON.stringify(res, null, 2));
      console.log('📋 获取视频生成记录响应 (类型):', typeof res, Array.isArray(res));

      // request.get 已经转换了响应
      // 如果后端返回 { code: 200, data: { rows: [...], total: ... } }，request.get 会返回 { rows: [...], total: ... }
      // 如果后端返回 { code: 200, data: { id: ..., ... } }，request.get 会返回 { id: ..., ... }
      let rows: any[] = [];
      
      // 处理不同的响应格式
      if (res && typeof res === 'object') {
        // 格式1: { rows: [...], total: ... } - 标准分页格式
        if (Array.isArray((res as any).rows)) {
          rows = (res as any).rows;
        }
        // 格式2: { data: { rows: [...], total: ... } } - 嵌套的 data 字段
        else if ((res as any).data && Array.isArray((res as any).data.rows)) {
          rows = (res as any).data.rows;
        }
        // 格式3: 直接是数组
        else if (Array.isArray(res)) {
          rows = res;
        }
        // 格式4: 单个记录对象（可能是后端返回格式问题）
        else if ((res as any).id && (res as any).apiType) {
          // 如果是单个记录，包装成数组
          console.warn('⚠️ 列表接口返回了单个记录，而不是列表格式');
          rows = [res];
        }
      }
      
      console.log('📋 视频记录rows (解析后):', rows);
      console.log('📋 视频记录rows 数量:', rows.length);
      
      const records = rows.map((record: any) => {
        let videoCount = 0;
        let model = '';
        let title = `视频生成 ${record.id}`;

        // 从taskJson获取标题
        try {
          if (record.taskJson) {
            const taskData = JSON.parse(record.taskJson);
            if (taskData.title) {
              title = taskData.title;
            }
          }
        } catch (parseError) {
          console.warn('解析taskJson失败:', parseError);
        }

        // 从apiJson解析视频数量和模型信息
        try {
          if (record.apiJson) {
            const parsedData = JSON.parse(record.apiJson);
            if (
              parsedData.chatMessages &&
              Array.isArray(parsedData.chatMessages)
            ) {
              // 统计生成的视频数量
              videoCount = parsedData.chatMessages.reduce(
                (total: number, msg: any) => {
                  if (msg.type === 'assistant' && msg.generatedVideos) {
                    return total + msg.generatedVideos.length;
                  }
                  return total;
                },
                0,
              );
            }
            if (parsedData.settings && parsedData.settings.selectedModel) {
              model = parsedData.settings.selectedModel;
            }
          }
        } catch (parseError) {
          console.warn('解析apiJson失败:', parseError);
        }

        return {
          id: record.id,
          title,
          apiJson: record.apiJson || '',
          taskJson: record.taskJson || '',
          createTime: record.ctime || record.createTime || Date.now(),
          updateTime: record.mtime || record.updateTime || Date.now(),
          messageCount: videoCount,
          model,
        };
      });

      console.log('📋 解析后的视频生成记录列表:', records);
      console.log('📋 准备设置chatRecords，记录数量:', records.length);
      setChatRecords(records);
      console.log('📋 已调用setChatRecords，设置记录数量:', records.length);
    } catch (error) {
      console.error('❌ 获取视频生成记录失败:', error);
      setChatRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  };

  // 根据当前模式刷新历史记录
  const refreshRecords = () => {
    if (!user?.nebulaApiId) return;
    
    if (currentMode === 'chat') {
      fetchChatRecords();
    } else if (currentMode === 'image') {
      fetchImageRecords();
    } else if (currentMode === 'video') {
      fetchVideoRecords();
    }
  };

  // 加载指定的对话记录
  // 加载对话记录（chat模式）
  const loadChatRecord = async (recordId: string | number) => {
    try {
      setRecordsLoading(true);
      const res = await chatService.getChatRecordInfo(recordId);

      // request.get已经转换了响应，对于单个对象返回的是 data 字段或整个对象（除了code/msg）
      const recordData = (res as any)?.data || res;

        // 解析聊天消息数据
        let messages: ExtendedChatMessage[] = [];
        let settings: any = null;

        try {
          // 只从apiJson中解析完整的对话数据
          if (recordData.apiJson) {
            const parsedData = JSON.parse(recordData.apiJson);
            if (parsedData.messages && Array.isArray(parsedData.messages)) {
              messages = parsedData.messages.map((msg: any) => ({
                ...msg,
                id: msg.id || `msg-${Date.now()}-${Math.random()}`,
                timestamp: msg.timestamp || Date.now(),
              }));
              settings = parsedData.settings; // 同时恢复设置
            }
          }
        } catch (parseError) {
          console.warn('解析对话内容失败:', parseError);
        }

        // 更新当前对话状态
        setMessages(messages.length > 0 ? messages : [
          {
            id: 'welcome',
            role: 'assistant',
            content: t.welcomeMessage,
            timestamp: Date.now()
          }
        ]);
        setSelectedRecordId(recordId);

        // 恢复设置（如果有的话）
        if (settings) {
          if (settings.model) setSelectedModel(settings.model);
          if (settings.temperature !== undefined) setTemperature(settings.temperature);
          if (settings.presence_penalty !== undefined) setPresencePenalty(settings.presence_penalty);
          console.log('⚙️ 已恢复对话设置');
        }

        console.log('📂 已加载对话记录:', recordId, '消息数量:', messages.length);
        
        // 滚动到底部
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } catch (error) {
      console.error('❌ 加载对话记录失败:', error);
    } finally {
      setRecordsLoading(false);
    }
  };

  // 加载图片生成记录（image模式）
  const loadImageRecord = async (recordId: string | number) => {
    try {
      setRecordsLoading(true);
      const res = await chatService.getChatRecordInfo(recordId);

      // request.get已经转换了响应，对于单个对象返回的是 data 字段或整个对象（除了code/msg）
      const recordData = (res as any)?.data || res;

      // 解析图片生成数据
      let messages: ExtendedChatMessage[] = [];
      let settings: any = null;

      try {
        if (recordData.apiJson) {
          const parsedData = JSON.parse(recordData.apiJson);

          // 恢复聊天消息（图片模式使用 chatMessages）
          if (parsedData.chatMessages && Array.isArray(parsedData.chatMessages)) {
            messages = parsedData.chatMessages.map((msg: any) => ({
              ...msg,
              id: msg.id || `msg-${Date.now()}-${Math.random()}`,
              timestamp: msg.timestamp || Date.now(),
              role: msg.type === 'user' ? 'user' : 'assistant',
            }));
          }

          // 恢复设置
          if (parsedData.settings) {
            settings = parsedData.settings;
          }
        }
      } catch (parseError) {
        console.warn('解析图片生成内容失败:', parseError);
      }

      // 更新当前对话状态
      setMessages(messages.length > 0 ? messages : [
        {
          id: 'welcome',
          role: 'assistant',
          content: t.welcomeMessage,
          timestamp: Date.now()
        }
      ]);
      setSelectedRecordId(recordId);

      // 恢复设置（如果有的话）
      if (settings) {
        if (settings.selectedModel) setSelectedModel(settings.selectedModel);
        if (settings.selectedSize) setImageSize(settings.selectedSize);
        if (settings.selectedStyle) setImageStyle(settings.selectedStyle);
        if (settings.temperature !== undefined) setTemperature(settings.temperature);
        if (settings.watermark !== undefined) setWatermark(settings.watermark);
        if (settings.guidanceScale !== undefined) setGuidanceScale(settings.guidanceScale);
        console.log('⚙️ 已恢复图片生成设置');
      }

      console.log('📂 已加载图片生成记录:', recordId, '消息数量:', messages.length);
      
      // 滚动到底部
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('❌ 加载图片生成记录失败:', error);
    } finally {
      setRecordsLoading(false);
    }
  };

  // 加载视频生成记录（video模式）
  const loadVideoRecord = async (recordId: string | number) => {
    try {
      setRecordsLoading(true);
      const res = await chatService.getChatRecordInfo(recordId);

      // request.get已经转换了响应，对于单个对象返回的是 data 字段或整个对象（除了code/msg）
      const recordData = (res as any)?.data || res;

      // 解析视频生成数据
      let messages: ExtendedChatMessage[] = [];
      let settings: any = null;

      try {
        if (recordData.apiJson) {
          const parsedData = JSON.parse(recordData.apiJson);

          // 恢复聊天消息（视频模式使用 chatMessages）
          if (parsedData.chatMessages && Array.isArray(parsedData.chatMessages)) {
            messages = parsedData.chatMessages.map((msg: any) => ({
              ...msg,
              id: msg.id || `msg-${Date.now()}-${Math.random()}`,
              timestamp: msg.timestamp || Date.now(),
              role: msg.type === 'user' ? 'user' : 'assistant',
            }));
          }

          // 恢复设置
          if (parsedData.settings) {
            settings = parsedData.settings;
          }
        }
      } catch (parseError) {
        console.warn('解析视频生成内容失败:', parseError);
      }

      // 更新当前对话状态
      setMessages(messages.length > 0 ? messages : [
        {
          id: 'welcome',
          role: 'assistant',
          content: t.welcomeMessage,
          timestamp: Date.now()
        }
      ]);
      setSelectedRecordId(recordId);

      // 恢复设置（如果有的话）
      if (settings) {
        if (settings.selectedModel) setSelectedModel(settings.selectedModel);
        if (settings.videoDuration !== undefined) setVideoDuration(settings.videoDuration);
        if (settings.videoAspectRatio) setVideoAspectRatio(settings.videoAspectRatio);
        if (settings.videoResolution) setVideoResolution(settings.videoResolution);
        if (settings.imageGenerationMode) setImageGenerationMode(settings.imageGenerationMode);
        if (settings.cameraFixed !== undefined) setCameraFixed(settings.cameraFixed);
        console.log('⚙️ 已恢复视频生成设置');
      }

      console.log('📂 已加载视频生成记录:', recordId, '消息数量:', messages.length);
      
      // 滚动到底部
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('❌ 加载视频生成记录失败:', error);
    } finally {
      setRecordsLoading(false);
    }
  };

  // 根据当前模式加载对应的记录
  const loadRecord = async (recordId: string | number) => {
    if (currentMode === 'chat') {
      await loadChatRecord(recordId);
    } else if (currentMode === 'image') {
      await loadImageRecord(recordId);
    } else if (currentMode === 'video') {
      await loadVideoRecord(recordId);
    }
  };

  // 删除对话记录
  const deleteChatRecord = async (recordId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      title: '确认删除',
      message: '确定要删除这条对话记录吗？',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await chatService.deleteChatRecord(recordId);
          // request.delete 已经转换了响应，成功时不会抛出异常
          // 如果删除成功，刷新记录列表
          // 如果删除的是当前选中的记录，清空消息
          if (selectedRecordId === recordId) {
            setMessages([{
              id: 'welcome',
              role: 'assistant',
              content: t.welcomeMessage,
              timestamp: Date.now()
            }]);
            setSelectedRecordId(null);
          }
          // 重新获取记录列表
          await refreshRecords();
          toast.success('对话记录已删除');
        } catch (error) {
          toast.error('删除对话记录失败');
          console.error('❌ 删除对话记录失败:', error);
        }
      },
    });
  };

  // 清理轮询定时器
  useEffect(() => {
    return () => {
      if (videoPollingIntervalRef.current) {
        clearTimeout(videoPollingIntervalRef.current);
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 生成唯一ID
  const generateId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // 复制消息
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    // 可以添加提示消息
  };

  // 处理代码引用
  const handleQuoteCode = (code: string) => {
    setInputValue(code);
    // 聚焦到输入框
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      textarea?.focus();
    }, 100);
  };

  // 清空消息
  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: t.welcomeMessage,
      timestamp: Date.now()
      }
    ]);
    setSelectedRecordId(null);
  };

  // 保存对话记录
  const handleSaveChat = async () => {
    // 过滤掉欢迎消息
    const validMessages = messages.filter(msg => msg.id !== 'welcome');
    if (validMessages.length === 0) {
      toast.error('没有可保存的消息');
      return;
    }

    const saveToast = toast.loading('正在保存...');
    
    try {

      let apiType = 'chat-completions';
      let chatData: any = {
        messages: validMessages,
        settings: {
          model: selectedModel,
          temperature,
          presence_penalty: presencePenalty,
        },
        timestamp: Date.now(),
      };

      // 根据模式构建不同的数据结构
      if (currentMode === 'image') {
        apiType = 'image-generates';
        chatData = {
          chatMessages: validMessages,
          generatedImages: validMessages
            .filter(msg => msg.role === 'assistant' && (msg as ExtendedChatMessage).generatedImages)
            .flatMap(msg => (msg as ExtendedChatMessage).generatedImages || []),
          settings: {
            selectedModel: selectedModel,
            selectedSize: imageSize,
            selectedStyle: imageStyle,
            temperature,
            watermark,
            guidanceScale,
            imageQuality,
            imageN,
            seed,
          },
          timestamp: Date.now(),
        };
      } else if (currentMode === 'video') {
        apiType = 'video-generates';
        chatData = {
          chatMessages: validMessages,
          generatedVideos: validMessages
            .filter(msg => msg.role === 'assistant' && (msg as ExtendedChatMessage).generatedVideos)
            .flatMap(msg => (msg as ExtendedChatMessage).generatedVideos || []),
          settings: {
            selectedModel: selectedModel,
            videoDuration,
            videoAspectRatio,
            videoResolution,
            imageGenerationMode,
            cameraFixed,
            wan25SmartRewrite,
            wan25GenerateAudio,
          },
          timestamp: Date.now(),
        };
      }

      // 生成标题
      const firstUserMessage = validMessages.find(msg => msg.role === 'user');
      const title = firstUserMessage?.content?.slice(0, 30) || 
        (currentMode === 'image' ? '新图片生成' : currentMode === 'video' ? '新视频生成' : '新对话');

      const apiTalkData = {
        apiType,
        apiJson: JSON.stringify(chatData),
        taskJson: JSON.stringify({ title }),
      };

      if (selectedRecordId) {
        // 更新现有记录
        await chatService.updateChatRecord({
          ...apiTalkData,
          id: selectedRecordId,
        });
        toast.dismiss(saveToast);
        toast.success('对话记录已更新');
        console.log('💾 对话记录已更新:', selectedRecordId);
      } else {
        // 新增记录
        const response = await chatService.addChatRecord(apiTalkData);
        const newId = (response as any)?.data?.id || (response as any)?.id || (response as any);
        if (newId) {
          setSelectedRecordId(newId);
          toast.dismiss(saveToast);
          toast.success('对话记录已保存');
          console.log('💾 对话记录已保存，ID:', newId);
          // 刷新记录列表
          refreshRecords();
        } else {
          toast.dismiss(saveToast);
          toast.error('保存失败，未获取到记录ID');
        }
      }
    } catch (error) {
      toast.dismiss(saveToast);
      toast.error('保存对话记录失败');
      console.error('❌ 保存对话记录失败:', error);
    }
  };

  // 停止生成
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setIsStreaming(false);
    
    // 更新最后一条AI消息，移除流式状态
    setMessages(prev => {
      const newMessages = [...prev];
      const lastMsg = newMessages[newMessages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant' && lastMsg.isStreaming) {
        lastMsg.isStreaming = false;
      }
      return newMessages;
    });
  };

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          const base64 = event.target?.result as string;
          if (base64) {
            setUploadedImages(prev => [...prev, base64]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // 移除上传的图片
  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // 发送消息（根据模式调用不同的API）
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading || !selectedModel) return;
    if (currentMode === 'image' && uploadedImages.length === 0 && !inputValue.trim()) return;

    const userMsg: ExtendedChatMessage = {
      id: generateId(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now(),
      images: uploadedImages.length > 0 ? [...uploadedImages] : undefined,
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputValue.trim();
    const currentImages = [...uploadedImages];
    setInputValue('');
    setUploadedImages([]);
    setIsLoading(true);
    setIsStreaming(true);
    setProgress(0);

    // 创建AI消息占位符
    const aiMessageId = generateId();
    const aiMsg: ExtendedChatMessage = {
      id: aiMessageId,
        role: 'assistant',
      content: '',
      reasoning_content: '',
      timestamp: Date.now(),
      isStreaming: true,
      generatedImages: currentMode === 'image' ? [] : undefined,
      generatedVideos: currentMode === 'video' ? [] : undefined,
      };

      setMessages(prev => [...prev, aiMsg]);

    // 创建AbortController
    abortControllerRef.current = new AbortController();

    try {
      // 根据模式调用不同的API
      if (currentMode === 'chat') {
        await handleChatGeneration(aiMessageId, currentInput);
      } else if (currentMode === 'image') {
        await handleImageGeneration(aiMessageId, currentInput, currentImages);
      } else if (currentMode === 'video') {
        await handleVideoGeneration(aiMessageId, currentInput, currentImages);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('请求已中止');
        return;
      }
      
      console.error('发送消息失败:', error);
      setIsLoading(false);
      setIsStreaming(false);
      
      // 更新错误消息
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.id === aiMessageId) {
          lastMsg.content = lastMsg.content || `错误: ${error.message || '发送失败，请重试'}`;
          lastMsg.isStreaming = false;
        }
        return newMessages;
      });
    } finally {
      abortControllerRef.current = null;
    }
  };

  // 处理对话生成
  const handleChatGeneration = async (aiMessageId: string, currentInput: string) => {
    // 构建消息历史
    const buildMessages = (): ChatRequest['messages'] => {
      const history: ChatRequest['messages'] = [];
      
      // 添加历史消息（排除欢迎消息和当前正在流式的AI消息）
      messages.forEach(msg => {
        if (msg.id !== 'welcome' && msg.id !== aiMessageId && msg.content.trim()) {
          history.push({
            role: msg.role,
            content: msg.content,
          });
        }
      });

      // 添加当前用户消息
      history.push({
        role: 'user',
        content: currentInput,
      });

      return history;
    };

    const requestData: ChatRequest = {
      model: selectedModel,
      messages: buildMessages(),
      temperature: temperature,
      presence_penalty: presencePenalty,
      stream: true,
    };

    await chatService.chatCompletionsStream(
        requestData,
        (chunk) => {
          // 处理流式数据块
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            
            if (lastMsg && lastMsg.id === aiMessageId && lastMsg.role === 'assistant') {
              // 更新思考内容
              if (chunk.choices?.[0]?.delta?.reasoning_content) {
                lastMsg.reasoning_content = (lastMsg.reasoning_content || '') + chunk.choices[0].delta.reasoning_content;
              }
              
              // 更新回复内容（打字机效果）
              if (chunk.choices?.[0]?.delta?.content) {
                lastMsg.content = (lastMsg.content || '') + chunk.choices[0].delta.content;
              }

              // 检查是否完成
              if (chunk.choices?.[0]?.finish_reason) {
                lastMsg.isStreaming = false;
              }
            }
            
            return newMessages;
          });
          
          scrollToBottom();
        },
        (error) => {
          console.error('流式响应错误:', error);
          setIsLoading(false);
          setIsStreaming(false);
          
          // 更新错误消息
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.id === aiMessageId) {
              lastMsg.content = lastMsg.content || '抱歉，生成回复时出现错误，请重试。';
              lastMsg.isStreaming = false;
            }
            return newMessages;
          });
        },
        abortControllerRef.current.signal
    );

    // 流式响应完成
    setIsLoading(false);
    setIsStreaming(false);
    
    setMessages(prev => {
      const newMessages = [...prev];
      const lastMsg = newMessages[newMessages.length - 1];
      if (lastMsg && lastMsg.id === aiMessageId) {
        lastMsg.isStreaming = false;
      }
      return newMessages;
    });
  };

  // 处理图片生成
  const handleImageGeneration = async (aiMessageId: string, prompt: string, images: string[]) => {
    // 启动进度条动画
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 8) + 2;
        return newProgress > 95 ? 95 : newProgress;
      });
    }, 200);

    try {
      const requestData: ImageGenerateRequest = {
        model: selectedModel,
        prompt: prompt || '生成一张图片',
        size: imageSize,
        style: imageStyle || undefined,
        temperature: temperature,
        quality: imageQuality,
        n: imageN,
        responseFormat: 'url',
        seed: seed,
        watermark: watermark,
      };

      // Doubao specific
      if (selectedModel.includes('doubao')) {
        requestData.guidance_scale = guidanceScale;
      }

      // Qwen specific
      if (selectedModel.includes('qwen')) {
        requestData.extra = {
          input: {
             messages: [
                {
                   role: "user",
                   content: [
                      {
                         text: prompt
                      }
                   ]
                }
             ]
          },
          parameters: {
            negative_prompt: qwenNegativePrompt,
            prompt_extend: qwenPromptExtend,
            watermark: watermark,
            seed: seed,
            n: imageN
          }
        };
      }

      // 如果有上传的图片，添加图生图参数
      if (images && images.length > 0) {
        requestData.image = images[0]; // 使用第一张图片作为参考
      }

      const result = await imageGenerateService.generateImage(requestData);

      // 清除进度条
      clearInterval(progressInterval);
      setProgress(100);

      // 处理返回的图片
      if (result.code === 200 && result.data?.data && result.data.data.length > 0) {
        const imageData = result.data.data;
        
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          
          if (lastMsg && lastMsg.id === aiMessageId) {
            lastMsg.generatedImages = imageData.map((item, index) => ({
              id: generateId(),
              url: item.url || (item.b64_json ? `data:image/png;base64,${item.b64_json}` : ''),
              prompt: item.revised_prompt || prompt,
              timestamp: Date.now(),
            }));
            lastMsg.content = `已为您生成${imageData.length}张图片`;
            lastMsg.isStreaming = false;
          }
          
          return newMessages;
        });
      } else {
        throw new Error(result.msg || '图片生成失败');
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      setProgress(0);
      throw error;
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // 处理视频生成
  const handleVideoGeneration = async (aiMessageId: string, prompt: string, images: string[]) => {
    // 启动进度条动画
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 5) + 1;
        return newProgress > 90 ? 90 : newProgress; // 视频生成进度最多到90%，等待轮询完成
      });
    }, 500);

    try {
      // 计算视频尺寸
      const [width, height] = videoAspectRatio === '16:9' 
        ? videoResolution === '720p' ? [1280, 720] : [1920, 1080]
        : videoResolution === '720p' ? [720, 1280] : [1080, 1920];

      const requestData: VideoGenerateRequest = {
        model: selectedModel,
        prompt: prompt || '生成一个视频',
        width,
        height,
        seconds: videoDuration,
        resolution: videoResolution, // For Veo/Wan
        aspectRatio: videoAspectRatio, // For Veo/Wan
        duration: videoDuration, // For Wan
        durationSeconds: videoDuration, // For Veo
        seed: seed,
        watermark: watermark,
        camera_fixed: cameraFixed,
      };

      // Wan2.5 specific
      if (selectedModel.includes('wan2.5')) {
        requestData.smart_rewrite = wan25SmartRewrite;
        requestData.generate_audio = wan25GenerateAudio;
        requestData.size = videoResolution === '480p' ? '832*480' : 
                           videoResolution === '720p' ? '1280*720' : '1920*1080'; // Simplified logic
      }

      // 如果有上传的图片，添加图生视频参数
      if (images && images.length > 0) {
        requestData.input_reference = images[0]; // sora-2
        requestData.image = images[0]; // veo
        
        // 根据模式设置
        if (imageGenerationMode === 'first_last_frame' && images.length > 1) {
          requestData.lastFrame = images[1];
        }
      }

      const result = await videoGenerateService.submitVideoTask(requestData);

      // 清除进度条动画
      clearInterval(progressInterval);

      if (result.code === 200 && result.data?.task_id) {
        const taskId = result.data.task_id;
        
        // 更新消息，添加视频占位符
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          
          if (lastMsg && lastMsg.id === aiMessageId) {
            if (!lastMsg.generatedVideos) {
              lastMsg.generatedVideos = [];
            }
            lastMsg.generatedVideos.push({
              id: generateId(),
              url: '',
              taskId,
              prompt,
              timestamp: Date.now(),
              status: 'processing',
            });
            lastMsg.content = '视频生成中，请稍候...';
          }
          
          return newMessages;
        });

        // 开始轮询视频任务状态
        pollVideoTask(aiMessageId, taskId);
      } else {
        throw new Error(result.msg || '视频任务提交失败');
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      setProgress(0);
      throw error;
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // 轮询视频任务状态
  const pollVideoTask = async (aiMessageId: string, taskId: string) => {
    const maxRetries = 60; // 最多轮询60次（约10分钟）
    const pollingInterval = 10000; // 10秒轮询间隔
    let retries = 0;

    const poll = async () => {
      if (retries >= maxRetries) {
        // 超时
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.id === aiMessageId && lastMsg.generatedVideos) {
            const video = lastMsg.generatedVideos.find(v => v.taskId === taskId);
            if (video) {
              video.status = 'failed';
            }
            lastMsg.content = '视频生成超时，请重试';
          }
          return newMessages;
        });
        return;
      }

      try {
        const result = await videoGenerateService.queryVideoTask(taskId);
        
        if (result.code === 200 && result.data) {
          const { status, video_url, error } = result.data;
          
          if (status === 'succeeded' && video_url) {
            // 成功
            setProgress(100);
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMsg = newMessages[newMessages.length - 1];
              if (lastMsg && lastMsg.id === aiMessageId && lastMsg.generatedVideos) {
                const video = lastMsg.generatedVideos.find(v => v.taskId === taskId);
                if (video) {
                  video.url = video_url;
                  video.status = 'succeeded';
                }
                lastMsg.content = '视频生成完成';
              }
              return newMessages;
            });
            return;
          } else if (status === 'failed') {
            // 失败
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMsg = newMessages[newMessages.length - 1];
              if (lastMsg && lastMsg.id === aiMessageId && lastMsg.generatedVideos) {
                const video = lastMsg.generatedVideos.find(v => v.taskId === taskId);
                if (video) {
                  video.status = 'failed';
                }
                lastMsg.content = `视频生成失败: ${error || '未知错误'}`;
              }
              return newMessages;
            });
            return;
          } else {
            // 处理中，继续轮询
            retries++;
            videoPollingIntervalRef.current = setTimeout(poll, pollingInterval);
          }
        }
      } catch (error) {
        console.error('查询视频任务状态失败:', error);
        retries++;
        videoPollingIntervalRef.current = setTimeout(poll, pollingInterval);
      }
    };

    // 等待5秒后开始轮询
    setTimeout(() => {
      poll();
    }, 5000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full bg-surface text-foreground overflow-hidden">
      {/* Left Settings Sidebar */}
      <aside className={`
        ${isSettingsOpen ? 'w-80' : 'w-0'} 
        flex-shrink-0 border-r border-border bg-background transition-all duration-300 flex flex-col h-full relative
      `}>
        {!isSettingsOpen && (
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="absolute left-2 top-2 p-2 rounded-lg bg-surface border border-border z-10"
          >
            <Settings size={20} />
          </button>
        )}

        <div className={`flex flex-col h-full overflow-y-auto custom-scrollbar p-5 ${!isSettingsOpen && 'hidden'}`}>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg">{t.settingsTitle}</h2>
            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="lg:hidden p-1 text-muted hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mode Selector */}
          <div className="mb-6">
            <label className="text-sm font-medium text-muted mb-2 block">功能模式</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setCurrentMode('chat')}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                  currentMode === 'chat'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-surface border-border hover:bg-background'
                }`}
              >
                <MessageCircle size={18} />
                <span className="text-xs">对话</span>
              </button>
              <button
                onClick={() => setCurrentMode('image')}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                  currentMode === 'image'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-surface border-border hover:bg-background'
                }`}
              >
                <ImageIcon size={18} />
                <span className="text-xs">图片</span>
              </button>
              <button
                onClick={() => setCurrentMode('video')}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                  currentMode === 'video'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-surface border-border hover:bg-background'
                }`}
              >
                <Video size={18} />
                <span className="text-xs">视频</span>
              </button>
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-3 mb-8">
            <label className="text-sm font-medium text-muted">{t.selectModel}</label>
            <div className="relative">
              <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 text-muted z-10" size={16} />
              {modelsLoading ? (
                <div className="w-full py-2.5 pl-10 pr-8 text-sm text-muted flex items-center">
                  <Loader2 size={14} className="animate-spin mr-2" />
                  加载中...
                </div>
              ) : (
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full appearance-none rounded-lg border border-border bg-surface py-2.5 pl-10 pr-8 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  disabled={models.length === 0}
              >
                  {models.length === 0 ? (
                    <option value="">暂无可用模型</option>
                  ) : (
                    models.map(m => (
                      <option key={m.id} value={m.modelName}>{m.modelName}</option>
                    ))
                  )}
              </select>
              )}
            </div>
          </div>

          {/* Parameters */}
          <div className="space-y-6 mb-8 border-b border-border pb-8">
            <h3 className="font-semibold">{t.paramsTitle}</h3>
            
            {/* 对话模式参数 */}
            {currentMode === 'chat' && (
              <>
                <div className="space-y-2">
                   <div className="flex justify-between text-sm">
                     <span className="font-medium">{t.temperature}</span>
                     <span className="text-primary">{temperature}</span>
                   </div>
                   <input 
                     type="range" min="0" max="2" step="0.1" 
                     value={temperature}
                     onChange={(e) => setTemperature(parseFloat(e.target.value))}
                     className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                   />
                   <p className="text-xs text-muted leading-tight">{t.temperatureDesc}</p>
                </div>

                <div className="space-y-2">
                   <div className="flex justify-between text-sm">
                     <span className="font-medium">{t.presencePenalty}</span>
                     <span className="text-primary">{presencePenalty}</span>
                   </div>
                   <input 
                     type="range" min="-2" max="2" step="0.1" 
                     value={presencePenalty}
                     onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
                     className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                   />
                   <p className="text-xs text-muted leading-tight">{t.presencePenaltyDesc}</p>
                </div>
              </>
            )}

            {/* 图片生成参数 */}
            {currentMode === 'image' && (
              <>
                {/* 图片尺寸 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">图片尺寸</label>
                  <select
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    {getImageSizes(selectedModel).map((size) => (
                      <option key={size.id} value={size.id}>
                        {size.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 图片质量 (仅部分模型支持) */}
                {selectedModel.startsWith('gpt-image') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">图片质量</label>
                    <select
                      value={imageQuality}
                      onChange={(e) => setImageQuality(e.target.value as 'standard' | 'hd')}
                      className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="standard">标准</option>
                      <option value="hd">高清</option>
                    </select>
                  </div>
                )}

                {/* 生成数量 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">生成数量 ({imageN})</label>
                  <input 
                    type="range" min="1" max="4" step="1" 
                    value={imageN}
                    onChange={(e) => setImageN(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* 随机种子 (部分模型不支持) */}
                {ModelCapabilities.supportsSeed(selectedModel) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">随机种子 (可选)</label>
                    <input
                      type="number"
                      placeholder="默认随机"
                      value={seed || ''}
                      onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                )}

                {/* 引导系数 (豆包模型) */}
                {selectedModel.includes('doubao') && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">引导系数 (Guidance Scale)</span>
                      <span className="text-primary">{guidanceScale}</span>
                    </div>
                    <input 
                      type="range" min="1" max="20" step="0.1" 
                      value={guidanceScale}
                      onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                )}

                {/* 水印设置 */}
                {ModelCapabilities.supportsWatermark(selectedModel) && (
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">添加水印</label>
                    <input
                      type="checkbox"
                      checked={watermark}
                      onChange={(e) => setWatermark(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                  </div>
                )}

                {/* 负面提示词 (Qwen模型) */}
                {ModelCapabilities.supportsNegativePrompt(selectedModel) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">负面提示词</label>
                    <textarea
                      value={qwenNegativePrompt}
                      onChange={(e) => setQwenNegativePrompt(e.target.value)}
                      placeholder="不想生成的元素..."
                      className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none h-20"
                    />
                  </div>
                )}
              </>
            )}

            {/* 视频生成参数 */}
            {currentMode === 'video' && (
              <>
                {/* 图生视频模式选择 (仅在有图片且支持时显示) */}
                {uploadedImages.length > 0 && ModelCapabilities.supportsImageUpload(selectedModel, 'video') && !selectedModel.includes('wan2.5-i2v') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">生成模式</label>
                    <select
                      value={imageGenerationMode}
                      onChange={(e) => setImageGenerationMode(e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    >
                      {IMAGE_TO_VIDEO_MODES.map((mode) => (
                        <option key={mode.id} value={mode.id}>{mode.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-muted">
                      {IMAGE_TO_VIDEO_MODES.find(m => m.id === imageGenerationMode)?.description}
                    </p>
                  </div>
                )}

                {/* 视频分辨率 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">分辨率</label>
                  <select
                    value={videoResolution}
                    onChange={(e) => setVideoResolution(e.target.value as '720p' | '1080p' | '480p')}
                    className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    {getVideoResolutions(selectedModel).map((res) => (
                      <option key={res.id} value={res.id}>{res.name}</option>
                    ))}
                  </select>
                </div>

                {/* 视频宽高比 (Wan2.5 i2v 不支持自定义) */}
                {!selectedModel.includes('wan2.5-i2v') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">宽高比</label>
                    <select
                      value={videoAspectRatio}
                      onChange={(e) => setVideoAspectRatio(e.target.value as any)}
                      className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    >
                      {getVideoRatios(selectedModel).map((ratio) => (
                        <option key={ratio.id} value={ratio.id}>{ratio.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 视频时长 (Wan2.5 有特定时长) */}
                {!selectedModel.includes('wan2.5') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">视频时长</label>
                    <select
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(parseInt(e.target.value))}
                      className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="5">5秒</option>
                      <option value="10">10秒</option>
                    </select>
                  </div>
                )}

                {/* 随机种子 */}
                {ModelCapabilities.supportsSeed(selectedModel) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">随机种子 (可选)</label>
                    <input
                      type="number"
                      placeholder="默认随机"
                      value={seed || ''}
                      onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                )}

                {/* 固定摄像头 (豆包模型) */}
                {ModelCapabilities.supportsCameraFixed(selectedModel) && (
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">固定摄像头</label>
                    <input
                      type="checkbox"
                      checked={cameraFixed}
                      onChange={(e) => setCameraFixed(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                  </div>
                )}

                {/* Wan2.5 特定选项 */}
                {ModelCapabilities.supportsSmartRewrite(selectedModel) && (
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">智能扩写提示词</label>
                    <input
                      type="checkbox"
                      checked={wan25SmartRewrite}
                      onChange={(e) => setWan25SmartRewrite(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                  </div>
                )}
                
                {selectedModel.includes('wan2.5') && (
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">生成音效</label>
                    <input
                      type="checkbox"
                      checked={wan25GenerateAudio}
                      onChange={(e) => setWan25GenerateAudio(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* History */}
          <div className="flex-1 min-h-0 flex flex-col" style={{ minHeight: '200px', maxHeight: '100%' }}>
             <div className="flex items-center justify-between mb-4 flex-shrink-0">
               <h3 className="font-semibold text-foreground">{t.historyTitle}</h3>
               <div className="flex items-center gap-1">
                 <button
                   onClick={handleClear}
                   className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded transition-colors"
                   title="清空对话"
                 >
                   <Trash2 size={14} />
                 </button>
                 <button
                   onClick={handleSaveChat}
                   className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded transition-colors"
                   title="保存对话"
                 >
                   <Save size={14} />
                 </button>
                 <button
                   onClick={() => {
                     handleClear();
                     setSelectedRecordId(null);
                   }}
                   className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded transition-colors"
                   title="新建对话"
                 >
                   <Plus size={14} />
                 </button>
                 <button
                   onClick={refreshRecords}
                   disabled={recordsLoading}
                   className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                   title="刷新记录"
                 >
                   <RefreshCw size={14} className={recordsLoading ? 'animate-spin' : ''} />
                 </button>
               </div>
             </div>
             
             <div className="flex-1 min-h-0 overflow-hidden">
               {(() => {
                 console.log('🔍 渲染历史记录 - 当前模式:', currentMode, '记录数量:', chatRecords.length, '加载中:', recordsLoading);
                 
                 if (recordsLoading && chatRecords.length === 0) {
                   return (
                     <div className="h-full flex flex-col items-center justify-center text-foreground gap-2">
                       <Loader2 size={24} className="animate-spin" />
                       <span className="text-sm">加载中...</span>
                     </div>
                   );
                 }
                 
                 if (chatRecords.length === 0) {
                   return (
                     <div className="h-full flex flex-col items-center justify-center text-foreground gap-2 opacity-50">
                       <MessageSquare size={32} strokeWidth={1.5} />
                       <span className="text-sm">{t.noHistory}</span>
                     </div>
                   );
                 }
                 
                 console.log('🔍 开始渲染记录列表，数量:', chatRecords.length);
                 return (
                   <div className="h-full overflow-y-auto space-y-1 custom-scrollbar pr-1">
                     {chatRecords.map((record) => {
                       console.log('🔍 渲染记录:', record.id, record.title);
                       return (
                     <div
                       key={record.id}
                       onClick={() => loadRecord(record.id)}
                       className={`group relative p-2 rounded-lg cursor-pointer transition-colors bg-surface border border-transparent hover:border-border ${
                         selectedRecordId === record.id
                           ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-100 border-indigo-500/30'
                           : 'text-foreground hover:bg-background'
                       }`}
                     >
                         <div className="flex items-start justify-between gap-2">
                           <div className="flex-1 min-w-0">
                             <div className="text-sm font-medium truncate text-foreground">{record.title}</div>
                             {record.model && (
                               <div className="text-xs text-muted-foreground mt-0.5">
                                 {record.model}
                               </div>
                             )}
                             <div className="text-xs text-muted-foreground/70 mt-0.5">
                               {(() => {
                                 const date = new Date(record.updateTime);
                                 const year = date.getFullYear();
                                 const month = String(date.getMonth() + 1).padStart(2, '0');
                                 const day = String(date.getDate()).padStart(2, '0');
                                 const hours = String(date.getHours()).padStart(2, '0');
                                 const minutes = String(date.getMinutes()).padStart(2, '0');
                                 const seconds = String(date.getSeconds()).padStart(2, '0');
                                 return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                               })()}
                             </div>
                           </div>
                           <button
                             onClick={(e) => deleteChatRecord(record.id, e)}
                             className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-600 transition-opacity flex-shrink-0"
                             title="删除记录"
                           >
                             <Trash2 size={12} />
                           </button>
                         </div>
                       </div>
                       );
                     })}
                   </div>
                 );
               })()}
             </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-surface/50 backdrop-blur-sm relative">
        
        {/* Top Bar */}
        <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <MessageSquare className="text-muted" size={20} />
            <h2 className="font-semibold">{t.mainTitle}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded text-xs font-medium border border-indigo-500/20">
               {selectedModel || '未选择模型'}
            </div>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${
              isStreaming 
                ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20' 
                : 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
              {isStreaming ? '生成中...' : t.statusReady}
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="p-1.5 text-muted hover:bg-border rounded"
              >
                <Settings size={16} />
              </button>
              <button 
                onClick={handleClear}
                className="p-1.5 text-muted hover:bg-border rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id} 
              message={msg}
              onCopy={handleCopy}
              onQuoteCode={handleQuoteCode}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="border-2 border-border rounded-xl bg-white transition-all overflow-hidden focus-within:border-indigo-500 focus-within:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]">
              
              {/* 上传的图片预览 */}
              {uploadedImages.length > 0 && (
                <div className="p-4 pb-0 border-b border-gray-100">
                  <div className="flex gap-2 flex-wrap">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                        <img 
                          src={img} 
                          alt={`上传图片 ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                        <button
                          onClick={() => removeUploadedImage(index)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all hover:scale-110 z-10"
                        >
                          <X size={12} strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 进度条 */}
              {progress > 0 && progress < 100 && (
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* 输入区域 */}
              <div className="flex items-end p-4 gap-3">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    currentMode === 'chat' 
                      ? '输入您的问题... (Enter发送, Shift+Enter换行)'
                      : currentMode === 'image'
                      ? '描述您想要生成的图片'
                      : '描述您想要生成的视频,也可以上传参考图片...'
                  }
                  disabled={isLoading || !selectedModel}
                  className="flex-1 border-none outline-none text-sm leading-6 resize-none min-h-[20px] max-h-[120px] bg-transparent text-gray-800 placeholder-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
                  rows={1}
                  style={{ 
                    lineHeight: '1.5',
                    fontFamily: 'inherit'
                  }}
                />
                
                {/* 图片上传按钮 */}
                {(currentMode === 'image' || currentMode === 'video') && (
                  <label className="flex-shrink-0 w-9 h-9 border border-gray-200 rounded-lg bg-white text-indigo-600 cursor-pointer transition-all flex items-center justify-center hover:bg-gray-50 hover:border-indigo-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isLoading || !selectedModel}
                    />
                    <ImageIcon size={16} />
                  </label>
                )}
                
                {/* 发送/停止按钮 */}
                {isStreaming ? (
                  <button 
                    onClick={handleStop}
                    className="flex-shrink-0 w-9 h-9 border-none rounded-lg bg-red-500 text-white cursor-pointer transition-all flex items-center justify-center hover:bg-red-600"
                  >
                    <Square size={16} fill="currentColor" />
                  </button>
                ) : (
                  <button 
                    onClick={handleSend}
                    disabled={(!inputValue.trim() && uploadedImages.length === 0) || isLoading || !selectedModel}
                    className={`flex-shrink-0 w-9 h-9 border-none rounded-lg cursor-pointer transition-all flex items-center justify-center
                      ${(inputValue.trim() || uploadedImages.length > 0) && !isLoading && selectedModel
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:scale-110 hover:shadow-[0_4px_12px_rgba(102,126,234,0.4)]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    <Send size={16} />
                  </button>
                )}
              </div>
              
              {/* 底部提示栏 */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50/50 rounded-b-[10px]">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="bg-gray-200 px-1.5 py-0.5 rounded font-mono text-[0.7rem] font-medium">Enter</span>
                  <span>发送 ·</span>
                  <span className="bg-gray-200 px-1.5 py-0.5 rounded font-mono text-[0.7rem] font-medium">Shift + Enter</span>
                  <span>换行</span>
                  {currentMode === 'image' && ModelCapabilities.supportsImageUpload(selectedModel, 'image') && (
                    <span className="text-orange-500 font-medium">
                      {' '}· 支持格式: {ModelCapabilities.getFormatDisplayText(selectedModel)} · 最大: {ModelCapabilities.getMaxFileSize(selectedModel)}MB
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 font-medium">{inputValue.length}/2000</span>
              </div>
            </div>
            
            {/* 底部温馨提示 */}
            <p className="text-[10px] text-center text-muted mt-2">
              温馨提示: 所有内容均由AI模型生成,准确性和完整性无法保证,不代表平台的态度或观点
            </p>
          </div>
        </div>

      </main>
      
      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        type="danger"
      />
    </div>
  );
};

interface MessageBubbleProps {
  message: ExtendedChatMessage;
  onCopy: (content: string) => void;
  onQuoteCode?: (code: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onCopy, onQuoteCode }) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const [showReasoning, setShowReasoning] = useState(false);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasReasoning = isAssistant && message.reasoning_content && message.reasoning_content.trim().length > 0;

  return (
    <div 
      className={`flex gap-4 max-w-4xl mx-auto ${isUser ? 'flex-row-reverse' : ''} group`}
    >
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border
        ${isUser 
          ? 'bg-indigo-600 border-indigo-600 text-white' 
          : 'bg-background border-border'}
      `}>
        {isAssistant ? (
          <Bot size={16} className="text-indigo-600" />
        ) : (
          <User size={16} />
        )}
      </div>
      
      <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`
          px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
          ${isUser 
            ? 'bg-indigo-600 text-white rounded-tr-sm' 
            : 'bg-background border border-border rounded-tl-sm text-foreground'}
        `}>
          {isAssistant ? (
            <div className="markdown-content">
              {message.content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    code({ className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = String(children).replace(/\n$/, '');
                      const isInline = !props.node || props.node.position?.start.line === props.node.position?.end.line;
                      
                      if (!isInline && match) {
                        // 代码块
                        return (
                          <CodeBlock
                            code={codeString}
                            language={match[1]}
                            onQuote={onQuoteCode}
                          />
                        );
                      }
                      
                      // 行内代码
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : message.isStreaming ? (
                <span>思考中...</span>
              ) : null}
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 bg-indigo-600 ml-1 animate-pulse"></span>
              )}
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
        </div>

        {/* 用户上传的图片 */}
        {isUser && message.images && message.images.length > 0 && (
          <div className="mt-2 flex gap-2 flex-wrap">
            {message.images.map((img, index) => (
              <img 
                key={index}
                src={img} 
                alt={`用户上传 ${index + 1}`}
                className="max-w-xs max-h-64 object-cover rounded-lg border border-border"
              />
            ))}
          </div>
        )}

        {/* AI生成的图片 */}
        {isAssistant && message.generatedImages && message.generatedImages.length > 0 && (
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {message.generatedImages.map((img) => (
              <div key={img.id} className="relative group">
                <img 
                  src={img.url} 
                  alt={img.prompt || '生成的图片'}
                  className="w-full rounded-lg border border-border"
                />
                {img.prompt && (
                  <div className="mt-1 text-xs text-muted truncate">{img.prompt}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* AI生成的视频 */}
        {isAssistant && message.generatedVideos && message.generatedVideos.length > 0 && (
          <div className="mt-2 space-y-3">
            {message.generatedVideos.map((video) => (
              <div key={video.id} className="relative">
                {video.status === 'processing' ? (
                  <div className="w-full aspect-video bg-surface border border-border rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                      <p className="text-sm text-muted">视频生成中...</p>
                    </div>
                  </div>
                ) : video.status === 'succeeded' && video.url ? (
                  <video 
                    src={video.url} 
                    controls
                    className="w-full rounded-lg border border-border"
                  />
                ) : video.status === 'failed' ? (
                  <div className="w-full aspect-video bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-center">
                    <p className="text-sm text-red-600 dark:text-red-400">视频生成失败</p>
                  </div>
                ) : null}
                {video.prompt && (
                  <div className="mt-1 text-xs text-muted">{video.prompt}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 思考内容 */}
        {hasReasoning && (
          <div className="w-full mt-2">
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="text-xs text-muted hover:text-foreground flex items-center gap-1"
            >
              <span>{showReasoning ? '▼' : '▶'}</span>
              <span>思考过程</span>
            </button>
            {showReasoning && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-border text-xs text-muted max-h-48 overflow-y-auto whitespace-pre-wrap">
                {message.reasoning_content}
              </div>
            )}
          </div>
        )}

        <div className="text-[10px] text-muted px-1 flex items-center gap-2">
          <span>{formatTime(message.timestamp)}</span>
          {isAssistant && message.content && (
            <button
              onClick={() => onCopy(message.content)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-border rounded"
              title="复制"
            >
              <Copy size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-sm rounded-lg text-muted hover:bg-surface border border-transparent hover:border-border transition-all group"
  >
    <Icon size={16} className="group-hover:text-foreground" />
    <span className="group-hover:text-foreground">{label}</span>
  </button>
);

export default ChatPage;

// 添加全局markdown样式
const markdownStyles = `
  .markdown-content {
    font-size: 14px;
    line-height: 1.6;
  }

  .markdown-content h1,
  .markdown-content h2,
  .markdown-content h3,
  .markdown-content h4,
  .markdown-content h5,
  .markdown-content h6 {
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    font-weight: 600;
    line-height: 1.3;
  }

  .markdown-content h1 { font-size: 1.5rem; }
  .markdown-content h2 { font-size: 1.3rem; }
  .markdown-content h3 { font-size: 1.1rem; }

  .markdown-content p {
    margin-bottom: 0.75rem;
  }

  .markdown-content ul,
  .markdown-content ol {
    margin-bottom: 0.75rem;
    padding-left: 1.5rem;
  }

  .markdown-content li {
    margin-bottom: 0.25rem;
  }

  .markdown-content code {
    background: rgba(0, 0, 0, 0.05);
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9em;
  }

  .markdown-content pre {
    margin: 1rem 0;
    padding: 0;
    overflow: visible;
  }

  .markdown-content pre code {
    background: transparent;
    padding: 0;
    border-radius: 0;
    font-size: 14px;
  }

  .markdown-content blockquote {
    border-left: 3px solid #667eea;
    padding-left: 1rem;
    margin: 1rem 0;
    color: #4a5568;
    font-style: italic;
  }

  .markdown-content table {
    border-collapse: collapse;
    width: 100%;
    margin: 1rem 0;
  }

  .markdown-content th,
  .markdown-content td {
    border: 1px solid #e2e8f0;
    padding: 0.5rem;
    text-align: left;
  }

  .markdown-content th {
    background: #f7fafc;
    font-weight: 600;
  }

  .markdown-content a {
    color: #667eea;
    text-decoration: none;
  }

  .markdown-content a:hover {
    text-decoration: underline;
  }

  .markdown-content img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1rem 0;
  }

  .markdown-content hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 1.5rem 0;
  }
`;

// 注入样式到head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = markdownStyles;
  document.head.appendChild(styleElement);
}
