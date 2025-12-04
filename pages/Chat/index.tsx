import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Settings, Trash2, Save, Plus, RefreshCw, Send, Bot, User, 
  MoreHorizontal, Cpu, MessageSquare, X, Copy, Loader2, Square,
  Image as ImageIcon, Video, MessageCircle, Eye, Maximize2, Reply,
  Download, FolderPlus
} from 'lucide-react';
import ModelSelect from '../../components/ModelSelect';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import toast from 'react-hot-toast';
import { chatService, ChatMessage, ChatRequest } from '../../services/chatService';
import { modelsService, ModelsVO } from '../../services/modelsService';
import { imageGenerateService, ImageGenerateRequest } from '../../services/imageGenerateService';
import { videoGenerateService, VideoGenerateRequest } from '../../services/videoGenerateService';
import { uploadService } from '../../services/uploadService';
import { useVideoGenerationStore } from '../../stores/videoGenerationStore';
import { useAuthStore } from '../../stores/authStore';
import { ChatRecord } from '../../types';
import { useAppOutletContext } from '../../router/context';
import { translations } from '../../translations';
import CodeBlock from './components/CodeBlock';
import ConfirmDialog from '../../components/ConfirmDialog';
import TooltipIcon from './components/TooltipIcon';
import { DoubaoSeedream4SizeSelector } from './components/DoubaoSeedream4SizeSelector';
import AddMaterialModal from '../../components/AddMaterialModal';
import AuthModal from '../../components/AuthModal';
import BaseModal from '../../components/BaseModal';
import {
  getImageSizes,
  getVideoRatios,
  getVideoResolutions,
  ModelCapabilities,
  IMAGE_TO_VIDEO_MODES,
  VIDEO_RATIOS,
  getImageUploadRestrictions
} from './modelConstants';
import { showImageCrop } from '../../components/use-image-crop';

// 扩展消息类型，支持图片和视频
interface ExtendedChatMessage extends ChatMessage {
  generatedImages?: Array<{
    id: string;
    url: string;
    prompt?: string;
    timestamp: number;
    ossId?: string; // OSS资源ID，用于删除时清理资源
    b64_json?: string; // Base64数据（如果有）
  }>;
  generatedVideos?: Array<{
    id: string;
    url: string;
    taskId?: string;
    genId?: string;
    prompt?: string;
    timestamp: number;
    status?: string; // 'processing' | 'succeeded' | 'failed'
    ossId?: string; // OSS资源ID，用于删除时清理资源
  }>;
  isHtml?: boolean; // 是否包含HTML内容
  action?: 'goFixPrice'; // 可选的后续动作（如余额不足时跳转定价列表）
}

type Mode = 'chat' | 'image' | 'video';
const CREATE_IMAGE_PAYLOAD_KEY = 'createImagePayload';

interface ChatPageProps {
  t?: any;
}

const ChatPage: React.FC<ChatPageProps> = (props) => {
  const { t: rawT } = useAppOutletContext();
  const t = props.t || rawT?.chatPage || translations['zh'].chatPage;
  const componentsT = rawT?.components || translations['zh'].components;

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { getData, setData } = useVideoGenerationStore();
  // 登录框状态
  const [showAuthModal, setShowAuthModal] = useState(false);
  // 模式切换：对话/图片生成/视频生成
  const [currentMode, setCurrentMode] = useState<Mode>('chat');
  // 用于标记从图生视频跳转过来的图片，避免被自动清除
  const imageToVideoImageRef = useRef<string | null>(null);
  // 用于记录已处理的URL model_name 参数，避免重复处理
  const processedModelNameRef = useRef<string | null>(null);
  
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
  const [isDragOverInput, setIsDragOverInput] = useState(false);
  const [models, setModels] = useState<ModelsVO[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [temperature, setTemperature] = useState(1.0);
  const [presencePenalty, setPresencePenalty] = useState(0.4);
  
  // AI角色定义相关状态
  const [showAIRoleModal, setShowAIRoleModal] = useState(false);
  const [aiRoleContent, setAiRoleContent] = useState('');
  const [aiRoleMessageId, setAiRoleMessageId] = useState('');
  
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
  const [sequentialImageGenerationOptions, setSequentialImageGenerationOptions] = useState({
    max_images: 4,
  });
  const [optimizePromptOptionsMode, setOptimizePromptOptionsMode] = useState<'standard' | 'fast'>('standard');
  
  // qwen模型专用参数
  const [qwenNegativePrompt, setQwenNegativePrompt] = useState('');
  const [qwenPromptExtend, setQwenPromptExtend] = useState(true);
  const [qwenImageSize, setQwenImageSize] = useState('1328*1328');
  const [qwenImageWatermark, setQwenImageWatermark] = useState(false);
  
  // qwen-image-edit 专用参数
  const [qwenImageEditN, setQwenImageEditN] = useState(1);
  const [qwenImageEditNegativePrompt, setQwenImageEditNegativePrompt] = useState('');
  const [qwenImageEditWatermark, setQwenImageEditWatermark] = useState(false);
  const [qwenImageEditSeed, setQwenImageEditSeed] = useState<number | undefined>(undefined);
  
  // GPT模型专用参数
  const [gptImageQuality, setGptImageQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [gptImageInputFidelity, setGptImageInputFidelity] = useState<'low' | 'high'>('low');
  const [gptImageN, setGptImageN] = useState(1);
  
  // 视频生成参数
  const [videoDuration, setVideoDuration] = useState(5);
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16' | '4:3' | '1:1' | '3:4' | '21:9' | 'adaptive'>('16:9');
  const [videoResolution, setVideoResolution] = useState<'480p' | '720p' | '1080p'>('720p');
  const [imageGenerationMode, setImageGenerationMode] = useState('first_frame'); // first_frame, first_last_frame, reference
  const [cameraFixed, setCameraFixed] = useState(false);
  
  // Wan2.5模型专用参数
  const [wan25SmartRewrite, setWan25SmartRewrite] = useState(true);
  const [wan25GenerateAudio, setWan25GenerateAudio] = useState(true);
  const [wan25Resolution, setWan25Resolution] = useState<'480p' | '720p' | '1080p'>('720p');
  const [wan25AspectRatio, setWan25AspectRatio] = useState<'16:9' | '9:16' | '1:1' | '4:3' | '3:4'>('16:9');
  const [wan25Seed, setWan25Seed] = useState<number | undefined>(undefined);
  const [wan25AudioFile, setWan25AudioFile] = useState<File | null>(null);
  const [wan25AudioUrl, setWan25AudioUrl] = useState<string>('');
  
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

  // 预览模态框状态
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    type: 'image' | 'video';
    url: string;
  }>({
    isOpen: false,
    type: 'image',
    url: '',
  });

  // 导入素材模态框状态
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [isExportingMaterial, setIsExportingMaterial] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<{
    type: 'image' | 'video';
    url: string;
    prompt?: string;
    assetType: number;
    assetName?: string;
    assetDesc?: string;
    assetId?: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const videoPollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const contentProcessedRef = useRef(false); // 跟踪是否已处理 content 参数

  // 存储所有模式的模型列表
  const [chatModels, setChatModels] = useState<ModelsVO[]>([]);
  const [imageModels, setImageModels] = useState<ModelsVO[]>([]);
  const [videoModels, setVideoModels] = useState<ModelsVO[]>([]);
  // 保存原始的视频模型列表（过滤前），用于 URL 参数匹配
  const allVideoModelsRef = useRef<ModelsVO[]>([]);

  // 消息缓存：为每个模式维护独立的消息列表
  const messagesCacheRef = useRef<{
    chat: ExtendedChatMessage[];
    image: ExtendedChatMessage[];
    video: ExtendedChatMessage[];
  }>({
    chat: [],
    image: [],
    video: [],
  });
  
  // 跟踪上一个模式，用于在切换时保存消息
  const previousModeRef = useRef<Mode>(
    (new URLSearchParams(window.location.search).get('mode') as Mode) || 'chat'
  );

  // 初始化时同时获取所有模式的模型
  useEffect(() => {
    fetchAllModels();
  }, []);

  // 监听模式切换，自动截断超出限制的输入内容
  useEffect(() => {
    const maxLength = currentMode === 'chat' ? 10000 : 2000;
    setInputValue(prev => {
      if (prev.length > maxLength) {
        return prev.slice(0, maxLength);
      }
      return prev;
    });
  }, [currentMode]);

  // 同时获取所有模式的模型列表
  const fetchAllModels = async () => {
    try {
      setModelsLoading(true);
      
      // 读取URL参数，确定当前模式
      const urlMode = new URLSearchParams(window.location.search).get('mode');
      const urlModelName = new URLSearchParams(window.location.search).get('model_name');
      
      // 如果URL中有mode参数，先设置currentMode（同步设置，确保后续逻辑正确）
      if (urlMode && (urlMode === 'chat' || urlMode === 'image' || urlMode === 'video')) {
        setCurrentMode(urlMode as Mode);
      }
      
      const effectiveMode = (urlMode && (urlMode === 'chat' || urlMode === 'image' || urlMode === 'video')) 
        ? urlMode as Mode 
        : currentMode;
      
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
        'doubao-seedream-4-5-251128',
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
      // 保存原始视频模型列表（过滤前），用于 URL 参数匹配
      allVideoModelsRef.current = videoModelList.filter(m => m.modelName);
      const blockedVideoModels = new Set([
        'jimeng_vgfm_i2v_l20',
        'wan2-1-14b-i2v-250225',
        'veo-3.1-generate-preview',
        'veo-3.0-generate-preview',
      ]);
      videoModelList = videoModelList.filter(m => m.modelName && !blockedVideoModels.has(m.modelName));
      setVideoModels(videoModelList);
      
      // 根据有效模式设置models - 使用局部变量而不是state（因为setState是异步的）
      let currentModels: ModelsVO[] = [];
      if (effectiveMode === 'chat') {
        currentModels = chatModelList;
      } else if (effectiveMode === 'image') {
        currentModels = imageModelList;
      } else if (effectiveMode === 'video') {
        currentModels = videoModelList;
      }
      
      setModels(currentModels);
      
      // 注意：不再此处自动选择第一个模型，因为 fetchAllModels 闭包可能持有旧的 selectedModel
      // 导致即使外部已经设置了正确的模型（如从URL），这里也会认为无效而覆盖
      // 自动选择逻辑统一由 useEffect(auto-select) 处理，该 useEffect 依赖了 selectedModel，能感知最新值
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
    
    // 注意：不再此处自动选择第一个模型，理由同 fetchAllModels
    // 自动选择逻辑统一由 useEffect(auto-select) 处理
  };

  // 当模型列表更新后，自动更新当前模式的模型列表
  useEffect(() => {
    // 只有在模型列表已经加载完成时才更新（避免初始化时使用空数组）
    const hasAnyModels = chatModels.length > 0 || imageModels.length > 0 || videoModels.length > 0;
    if (hasAnyModels) {
      console.log('🔄 模型列表已更新，更新当前模式的模型列表:', {
        currentMode,
        chatCount: chatModels.length,
        imageCount: imageModels.length,
        videoCount: videoModels.length
      });
      updateModelsForCurrentMode();
    } else {
      console.log('⏳ 模型列表尚未加载完成，等待加载...');
    }
  }, [chatModels, imageModels, videoModels, currentMode]);

  // 专门处理URL中的model_name参数，确保在模型列表加载完成后能正确选择模型
  useEffect(() => {
    const urlModelName = searchParams.get('model_name');
    if (!urlModelName) return;

    // 如果该 model_name 已经被处理过，不再重复处理
    if (processedModelNameRef.current === urlModelName) {
      return;
    }

    // 从URL直接读取mode参数，而不是依赖currentMode state，避免异步更新导致的时序问题
    const urlMode = searchParams.get('mode');
    const effectiveMode = (urlMode && (urlMode === 'chat' || urlMode === 'image' || urlMode === 'video')) 
      ? urlMode as Mode 
      : currentMode; // 如果URL中没有mode参数，则使用currentMode作为后备

    // 根据URL中的mode参数选择对应的模型列表
    let currentModels: ModelsVO[] = [];
    if (effectiveMode === 'chat') {
      currentModels = chatModels;
    } else if (effectiveMode === 'image') {
      currentModels = imageModels;
    } else if (effectiveMode === 'video') {
      currentModels = videoModels;
    }

    // 如果模型列表还没有加载，对于 video 模式，检查原始视频模型列表是否已加载
    if (currentModels.length === 0) {
      if (effectiveMode === 'video' && allVideoModelsRef.current.length > 0) {
        // video 模式且原始视频模型列表已加载，可以继续查找
      } else {
        // 其他情况，等待模型列表加载
        return;
      }
    }

    // 尝试精确匹配
    let matchedModel = currentModels.find(m => m.modelName === urlModelName);
    
    // 如果精确匹配失败，尝试部分匹配（但优先精确匹配）
    if (!matchedModel) {
      matchedModel = currentModels.find(
        (m) =>
          m.modelName?.toLowerCase() === urlModelName.toLowerCase() ||
          m.modelName?.toLowerCase().includes(urlModelName.toLowerCase()) ||
          urlModelName.toLowerCase().includes(m.modelName || '')
      );
    }

    // 如果在当前模型列表中找不到，尝试从原始视频模型列表中查找（用于黑名单中的模型）
    if (!matchedModel && effectiveMode === 'video') {
      matchedModel = allVideoModelsRef.current.find(m => m.modelName === urlModelName);
      if (!matchedModel) {
        matchedModel = allVideoModelsRef.current.find(
          (m) =>
            m.modelName?.toLowerCase() === urlModelName.toLowerCase() ||
            m.modelName?.toLowerCase().includes(urlModelName.toLowerCase()) ||
            urlModelName.toLowerCase().includes(m.modelName || '')
        );
      }
    }

    if (matchedModel && matchedModel.modelName) {
      setSelectedModel(matchedModel.modelName);
      
      // 如果匹配的模型不在当前 models 列表中（比如黑名单中的模型），将它添加到 models 中
      // 这样 ModelSelect 组件才能正确显示选中的模型
      if (effectiveMode === 'video' && !currentModels.some(m => m.modelName === matchedModel.modelName)) {
        setModels(prev => {
          // 检查是否已经存在，避免重复添加
          if (prev.some(m => m.modelName === matchedModel.modelName)) {
            return prev;
          }
          return [...prev, matchedModel];
        });
      }
      
      // 标记该 model_name 已处理
      processedModelNameRef.current = urlModelName;
    } else {
      // 如果仍然找不到，但用户通过 URL 明确指定了模型，直接使用 URL 中的模型名称
      // 这样可以允许选择黑名单中的模型
      // 直接设置 URL 中的模型名称，即使它不在当前列表中
      setSelectedModel(urlModelName);
      
      // 创建一个临时的模型对象并添加到 models 中，这样 ModelSelect 组件才能正确显示
      const tempModel: ModelsVO = {
        modelName: urlModelName,
        id: urlModelName, // 使用 modelName 作为 id
      } as ModelsVO;
      
      setModels(prev => {
        // 检查是否已经存在，避免重复添加
        if (prev.some(m => m.modelName === urlModelName)) {
          return prev;
        }
        return [...prev, tempModel];
      });
      
      processedModelNameRef.current = urlModelName;
    }
  }, [searchParams, chatModels, imageModels, videoModels, currentMode]);

  // 监听模式切换，更新模型列表和历史记录，并切换消息缓存
  useEffect(() => {
    // 如果模式真的改变了，才进行切换逻辑
    if (previousModeRef.current !== currentMode) {
      // 保存上一个模式的消息（这里需要从messages状态获取，但messages可能还没更新）
      // 所以我们会在messages变化时自动保存，这里主要是切换逻辑
      previousModeRef.current = currentMode;
      
      // 切换模式时处理模型选择
      const urlModelName = searchParams.get('model_name');
      if (!urlModelName) {
        // 没有 URL model_name 参数，清空 selectedModel，让自动选择逻辑生效
        setSelectedModel(''); 
      } else {
        // 有 URL model_name 参数，检查它是否在新模式的模型列表中
        let currentModels: ModelsVO[] = [];
        if (currentMode === 'chat') {
          currentModels = chatModels;
        } else if (currentMode === 'image') {
          currentModels = imageModels;
        } else if (currentMode === 'video') {
          currentModels = videoModels;
        }
        
        // 如果模型列表还没有加载完成，不清空 selectedModel 和 processedModelNameRef
        // 让 model_name 的 useEffect 在模型列表加载完成后处理
        if (currentModels.length === 0) {
          // 等待模型列表加载
        } else {
          // 模型列表已加载，检查 URL 中的 model_name 是否在新模式的模型列表中
          const isModelInList = currentModels.some(m => m.modelName === urlModelName);
          
          if (isModelInList) {
            // 如果在新模式的列表中，不清空 selectedModel，让 model_name 的 useEffect 来处理
          } else {
            // 如果不在新模式的列表中，还需要检查原始视频模型列表（用于黑名单中的模型）
            let isInOriginalList = false;
            if (currentMode === 'video' && allVideoModelsRef.current.length > 0) {
              isInOriginalList = allVideoModelsRef.current.some(m => m.modelName === urlModelName);
            }
            
            if (isInOriginalList) {
              // 在原始视频模型列表中（可能是黑名单中的模型），不清空 selectedModel，让 model_name 的 useEffect 来处理
            } else {
              // 如果不在新模式的列表中，也不在原始列表中，清空 selectedModel 和 processedModelNameRef，让自动选择逻辑生效
              setSelectedModel('');
              processedModelNameRef.current = null; // 重置，让自动选择逻辑生效
            }
          }
        }
      }
      
      setChatRecords([]); // 切换模式时清空历史记录
      setSelectedRecordId(null); // 清空选中的记录ID
      
      // 从缓存中恢复新模式的消息
      const cachedMessages = messagesCacheRef.current[currentMode];
      if (cachedMessages && cachedMessages.length > 0) {
        setMessages(cachedMessages);
      } else {
        if (currentMode === 'chat') {
          setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: t.welcomeMessage,
            timestamp: Date.now()
          }]);
        } else {
          // 图片和视频模式不显示欢迎消息
          setMessages([]);
        }
      }
    }
    
    // 根据模式加载对应的历史记录
    // 当模式切换或用户信息加载完成时，都加载对应的历史记录
    if (user?.nebulaApiId) {
      console.log('🔄 加载历史记录:', currentMode, 'user:', user?.nebulaApiId ? '已加载' : '未加载');
      if (currentMode === 'chat') {
        fetchChatRecords();
      } else if (currentMode === 'image') {
        fetchImageRecords();
      } else if (currentMode === 'video') {
        fetchVideoRecords();
      }
    }
  }, [currentMode, user?.nebulaApiId]);

  // 监听messages变化，自动保存到缓存
  useEffect(() => {
    // 过滤掉欢迎消息后再保存
    const messagesToCache = messages.filter(msg => msg.id !== 'welcome');
    if (messagesToCache.length > 0 || messagesCacheRef.current[currentMode].length > 0) {
      messagesCacheRef.current[currentMode] = messages;
    }
  }, [messages, currentMode]);

  // 监听模型列表变化，自动选择第一个模型
  useEffect(() => {
    // 检查是否有URL参数
    const urlModelName = searchParams.get('model_name');
    
    // 1. 如果 URL 包含 model_name，且已处理（Ref匹配），直接跳过自动选择
    // 因为 model_name useEffect 已经处理了模型选择，即使 selectedModel 暂时为空也只是 State 更新延迟
    // 我们应该等待 State 更新完成，而不是尝试匹配或自动选择
    if (urlModelName && processedModelNameRef.current === urlModelName) {
      return;
    }

    // 2. 如果 URL 包含 model_name，但 processedModelNameRef 不为 null 且不等于 urlModelName
    // 说明是另一个 model_name 尚未处理，跳过（等待 model_name effect）
    // 如果 processedModelNameRef 为 null，说明在模式切换时被重置了（model_name 不在新模式的列表中），应该允许自动选择
    if (urlModelName && processedModelNameRef.current !== null && processedModelNameRef.current !== urlModelName) {
      return;
    }

    if (models.length > 0 && !selectedModel) {
      const firstModel = models[0].modelName;
      if (firstModel) {
        setSelectedModel(firstModel);
      }
    }
  }, [models, selectedModel, searchParams, currentMode]);

  // 调试：监听chatRecords变化
  useEffect(() => {
    console.log('🔍 chatRecords状态变化:', {
      length: chatRecords.length,
      records: chatRecords,
      recordsLoading
    });
  }, [chatRecords, recordsLoading]);
  
  // 监听模型切换,检查是否需要清除图片和重置配置
  useEffect(() => {
    if (!selectedModel) return;
    
    // 检查当前模型是否支持图片上传
    const supportsUpload = ModelCapabilities.supportsImageUpload(selectedModel, currentMode as 'image' | 'video');
    
    // 如果当前模型不支持图片上传，且有已上传的图片，则清除
    // 但是要保留从图生视频跳转过来的图片
    if (!supportsUpload && uploadedImages.length > 0) {
      // 检查是否有从图生视频跳转过来的图片
      const hasImageToVideoImage = imageToVideoImageRef.current && 
        uploadedImages.some(img => img === imageToVideoImageRef.current);
      
      if (!hasImageToVideoImage) {
        console.log(`模型 ${selectedModel} 不支持图片上传，清除已上传的图片`);
        setUploadedImages([]);
      } else {
        console.log(`模型 ${selectedModel} 不支持图片上传，但保留图生视频的图片`);
        // 即使模型不支持，也保留图片，因为这是用户主动从图生视频跳转过来的
      }
    }
    
    // 如果是从图生视频跳转过来的，且模型支持图片上传，确保图片存在
    // 但只有在标记还存在的情况下才保留（如果已经发送成功，标记会被清除）
    if (supportsUpload && imageToVideoImageRef.current && currentMode === 'video') {
      const hasImage = uploadedImages.some(img => img === imageToVideoImageRef.current);
      if (!hasImage) {
        console.log('检测到图生视频跳转，重新设置图片');
        setUploadedImages([imageToVideoImageRef.current]);
        if (!inputValue.trim()) {
          setInputValue('根据这张图片生成视频');
        }
      }
    }
    
    // 如果标记已经被清除（说明已经发送成功），且模型不支持图片上传，应该清除图片和输入内容
    if (!supportsUpload && !imageToVideoImageRef.current && currentMode === 'video') {
      if (uploadedImages.length > 0) {
        console.log('图生视频标记已清除，且模型不支持图片上传，清除已上传的图片');
        setUploadedImages([]);
      }
      // 如果输入内容是"根据这张图片生成视频"，也清除
      if (inputValue.trim() === '根据这张图片生成视频') {
        console.log('图生视频标记已清除，清除默认提示词');
        setInputValue('');
      }
    }

    // 图片模式：根据模型重置配置
    if (currentMode === 'image') {
      // 重置图片尺寸为模型默认值
      if (ModelCapabilities.isDoubaoSeedream4Series(selectedModel)) {
        // doubao-seedream-4 系列使用默认 4K 1:1
        const defaultSize = '2048x2048';
        if (imageSize !== defaultSize) {
          setImageSize(defaultSize);
        }
      } else {
        const sizes = getImageSizes(selectedModel);
        if (sizes.length > 0) {
          if (selectedModel === 'qwen-image-plus') {
            // qwen-image-plus 使用专用尺寸
            if (!sizes.some(s => s.id === qwenImageSize)) {
              setQwenImageSize('1328*1328');
            }
          } else {
            // 其他模型使用通用尺寸
            if (!sizes.some(s => s.id === imageSize)) {
              setImageSize(sizes[0].id);
            }
          }
        }
      }

      // 重置生成数量为默认值
      setImageN(1);
      setGptImageN(1);
      setQwenImageEditN(1);

      // 重置引导系数（有默认值的模型保持默认值，不支持的模型重置为默认值）
      if (selectedModel === 'doubao-seedream-3-0-t2i-250415' || 
          selectedModel === 'doubao-seededit-3-0-i2i-250628') {
        // 这些模型支持引导系数但不显示，保持默认值
        setGuidanceScale(2.5);
      } else if (!ModelCapabilities.supportsGuidanceScale(selectedModel)) {
        // 不支持的模型重置为默认值
        setGuidanceScale(2.5);
      }

      // 重置随机种子
      if (selectedModel === 'doubao-seedream-3-0-t2i-250415' || 
          selectedModel === 'doubao-seededit-3-0-i2i-250628') {
        // 这些模型支持随机种子但不显示，清空
        setSeed(undefined);
      } else if (!ModelCapabilities.supportsSeed(selectedModel)) {
        setSeed(undefined);
      }

      // 重置组图功能
      if (!ModelCapabilities.supportsSequentialImageGeneration(selectedModel)) {
        setSequentialImageGeneration(false);
        setSequentialImageGenerationOptions({
          max_images: 4,
        });
      } else {
        // doubao-seedream-4.x 系列重置组图配置
        setSequentialImageGenerationOptions({
          max_images: 4,
        });
      }

      // 重置提示词优化模式
      if (!ModelCapabilities.supportsOptimizePromptOptions(selectedModel)) {
        setOptimizePromptOptionsMode('standard');
      } else if (ModelCapabilities.isDoubaoSeedream4Or45(selectedModel)) {
        // doubao-seedream-4.5 当前仅支持 standard 模式
        setOptimizePromptOptionsMode('standard');
      }

      // 重置 Qwen 相关配置
      if (selectedModel !== 'qwen-image-plus' && selectedModel !== 'qwen-image-edit-plus' && selectedModel !== 'qwen-image-edit-plus-2025-10-30') {
        setQwenNegativePrompt('');
        setQwenPromptExtend(true);
        setQwenImageWatermark(false);
        setQwenImageEditNegativePrompt('');
        setQwenImageEditWatermark(false);
        setQwenImageEditSeed(undefined);
      } else if (selectedModel === 'qwen-image-plus') {
        // qwen-image-plus 重置
        setQwenImageEditN(1);
        setQwenImageEditNegativePrompt('');
        setQwenImageEditWatermark(false);
        setQwenImageEditSeed(undefined);
      } else if (selectedModel === 'qwen-image-edit-plus' || selectedModel === 'qwen-image-edit-plus-2025-10-30') {
        // qwen-image-edit 重置
        setQwenNegativePrompt('');
        setQwenPromptExtend(true);
        setQwenImageWatermark(false);
      }

      // 重置 GPT 相关配置
      if (!selectedModel.startsWith('gpt-image-')) {
        setGptImageQuality('medium');
        setGptImageInputFidelity('low');
        setGptImageN(1);
      }

      // 重置水印（豆包模型）
      if (!selectedModel.startsWith('doubao-') && !selectedModel.includes('seedance')) {
        setWatermark(false);
      }

      // 重置创意度（仅 Gemini 模型保持，其他模型重置）
      if (selectedModel !== 'gemini-2.5-flash-image-preview' && 
          selectedModel !== 'gemini-2.5-flash-image' && 
          selectedModel !== 'gemini-3-pro-image-preview') {
        // 非 Gemini 模型重置创意度为默认值（但对话模式可能使用，所以不重置）
        // 这里只重置图片模式下的创意度
      }
    }

    // 视频模式：根据模型重置配置
    if (currentMode === 'video') {
      // 重置视频时长选项
      const durationOptions = ModelCapabilities.getVideoDurationOptions(selectedModel);
      if (!durationOptions.includes(videoDuration)) {
        setVideoDuration(durationOptions[0] || 5);
      }

      // sora-2 只支持 4/8/12 秒
      if (selectedModel === 'sora-2') {
        const soraDurations = [4, 8, 12];
        if (!soraDurations.includes(videoDuration)) {
          // 找到最接近的时长
          const closest = soraDurations.reduce((prev, curr) =>
            Math.abs(curr - videoDuration) < Math.abs(prev - videoDuration) ? curr : prev
          );
          setVideoDuration(closest);
        }
        // 重置比例（不支持 adaptive）
        if (videoAspectRatio === 'adaptive') {
          setVideoAspectRatio('16:9');
        }
        // 重置图生模式为首帧
        if (imageGenerationMode !== 'first_frame') {
          setImageGenerationMode('first_frame');
        }
      }

      // doubao-seedance-1-0-lite-i2v-250428 支持所有三种图生模式
      if (selectedModel === 'doubao-seedance-1-0-lite-i2v-250428') {
        // 参考图模式限制
        if (imageGenerationMode === 'reference') {
          if (videoResolution === '1080p') {
            setVideoResolution('720p');
          }
          if (videoAspectRatio === 'adaptive') {
            setVideoAspectRatio('16:9');
          }
          setCameraFixed(false);
        }
      }

      // doubao-seedance-1-0-lite-t2v-250428 只支持文生视频
      if (selectedModel === 'doubao-seedance-1-0-lite-t2v-250428') {
        setImageGenerationMode('first_frame');
        if (videoAspectRatio === 'adaptive') {
          setVideoAspectRatio('16:9');
        }
        // 清空上传的图片
        if (uploadedImages.length > 0) {
          setUploadedImages([]);
        }
      }

      // doubao-seedance-1-0-pro-250528 只支持首帧模式
      if (selectedModel === 'doubao-seedance-1-0-pro-250528') {
        if (imageGenerationMode !== 'first_frame') {
          setImageGenerationMode('first_frame');
        }
      }

      // veo-3.1-fast-generate-preview 支持首帧和首尾帧
      if (selectedModel.toLowerCase().includes('veo-3.1') || selectedModel.toLowerCase().includes('veo_3.1')) {
        // 如果当前是 reference 模式，切换到首帧
        if (imageGenerationMode === 'reference') {
          setImageGenerationMode('first_frame');
        }
      } else if (selectedModel.toLowerCase().includes('veo')) {
        // Veo 3.0 只支持首帧模式
        if (imageGenerationMode !== 'first_frame') {
          setImageGenerationMode('first_frame');
        }
        const veoDurations = [4, 6, 8];
        if (!veoDurations.includes(videoDuration)) {
          setVideoDuration(6); // Veo默认6秒
        }
      }

      // Wan2.5 模型重置专用配置
      if (selectedModel.includes('wan2.5')) {
        if (selectedModel === 'wan2.5-t2v-preview') {
          setWan25AspectRatio('16:9');
          // 清空上传的图片
          if (uploadedImages.length > 0) {
            setUploadedImages([]);
          }
        }
        setWan25Resolution('720p');
        setWan25Seed(undefined);
        setVideoDuration(5);
      }
    }
  }, [selectedModel, currentMode]);

  // 监听 wan2.5-t2v 模型的分辨率变化，自动调整宽高比
  useEffect(() => {
    if (selectedModel === 'wan2.5-t2v-preview' && currentMode === 'video') {
      const availableRatios = ModelCapabilities.getWan25T2VAspectRatios(wan25Resolution);
      // 如果当前宽高比不在可用选项中，调整为第一个可用选项
      if (!availableRatios.includes(wan25AspectRatio)) {
        console.log(`分辨率 ${wan25Resolution} 不支持宽高比 ${wan25AspectRatio}，自动调整为 ${availableRatios[0]}`);
        setWan25AspectRatio(availableRatios[0] as '16:9' | '9:16' | '1:1' | '4:3' | '3:4');
      }
    }
  }, [wan25Resolution, selectedModel, currentMode, wan25AspectRatio]);

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
          
          // 先设置模型，确保模型选择正确
          if (modelName) {
            setSelectedModel(modelName);
          }
          
          // 设置提示词
          if (data.sourcePrompt) {
            setInputValue(data.sourcePrompt);
          }
          
          // 设置参考图 - 延迟设置，确保模型相关的 useEffect 执行完成
          // 这样可以避免图片被模型切换逻辑清空
          if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            console.log('✅ 准备设置 transferId 图片:', {
              images: data.images,
              count: data.images.length,
              currentMode: mode || currentMode,
              selectedModel: modelName || selectedModel
            });
            
            // 延迟设置，确保模型切换的 useEffect 执行完成
            setTimeout(() => {
              console.log('✅ 设置 transferId 图片到 uploadedImages');
              setUploadedImages(data.images); 
              
              // 再次确认图片已设置
              setTimeout(() => {
                console.log('✅ 确认图片已设置，当前 uploadedImages 数量:', data.images.length);
              }, 50);
            }, 200); // 延迟 200ms，确保模型切换的 useEffect 执行完成
          } else {
            console.log('⚠️ transferId 数据中没有图片');
            setUploadedImages([]);
          }
        }
      } catch (error) {
        console.error('解析做同款数据失败:', error);
      }
    }

    // 处理 content 参数（从创作中心首页跳转过来）
    const content = searchParams.get('content');
    if (content && !contentProcessedRef.current) {
      const decodedContent = decodeURIComponent(content);
      setInputValue(decodedContent);
      contentProcessedRef.current = true; // 标记已处理
    }
    
    // 当 URL 参数变化时，重置 contentProcessedRef
    if (!content) {
      contentProcessedRef.current = false;
    }
    // 注意：model_name参数的处理已经在fetchAllModels中完成，这里不需要重复处理
  }, [searchParams, getData]);

  // 处理 Create 页面图片缓存 + content 自动发送
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(CREATE_IMAGE_PAYLOAD_KEY);
      if (cached) {
        sessionStorage.removeItem(CREATE_IMAGE_PAYLOAD_KEY);
        try {
          const payload = JSON.parse(cached);
          const images = Array.isArray(payload?.images) ? payload.images.filter(Boolean) : [];

          if (images.length > 0) {
            setCurrentMode('image');
            setUploadedImages((prev) => [...images, ...prev]);
          }

          if (!searchParams.get('content') && typeof payload?.content === 'string') {
            setInputValue(payload.content);
          }
        } catch (error) {
          console.error('解析 Create 页面图片数据失败:', error);
        }
      }
    }

    const content = searchParams.get('content');
    let autoSendTimer: ReturnType<typeof setTimeout> | undefined;

    if (content && contentProcessedRef.current && inputValue.trim() && selectedModel && !isLoading) {
      autoSendTimer = setTimeout(() => {
        if (inputValue.trim() && selectedModel && !isLoading) {
          handleSend();
          contentProcessedRef.current = false;
        }
      }, 1500);
    }

    return () => {
      if (autoSendTimer) clearTimeout(autoSendTimer);
    };
  }, [inputValue, selectedModel, isLoading, searchParams]);

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
              messages = parsedData.messages.map((msg: any) => {
                // 确保 role 字段正确保留，不能丢失或错误转换
                const role = msg.role || (msg.type === 'user' ? 'user' : 'assistant');
                return {
                ...msg,
                  role: role, // 明确设置 role，确保不会丢失
                id: msg.id || `msg-${Date.now()}-${Math.random()}`,
                timestamp: msg.timestamp || Date.now(),
                };
              });
              console.log('📂 加载的消息列表:', messages.map(m => ({ id: m.id, role: m.role, content: m.content?.slice(0, 20) })));
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
          if (settings.model) {
            console.log('🔍 fetchChatRecords: 恢复历史设置模型:', settings.model);
            setSelectedModel(settings.model);
          }
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
            messages = parsedData.chatMessages.map((msg: any) => {
              // 优先使用 role 字段，如果没有则使用 type 字段作为后备
              const role = msg.role || (msg.type === 'user' ? 'user' : 'assistant');
              return {
                ...msg,
                id: msg.id || `msg-${Date.now()}-${Math.random()}`,
                timestamp: msg.timestamp || Date.now(),
                role: role, // 明确设置 role，确保不会丢失
              };
            });
            console.log('📂 加载的图片生成消息列表:', messages.map(m => ({ id: m.id, role: m.role, content: m.content?.slice(0, 20) })));
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
        if (settings.selectedModel) {
          setSelectedModel(settings.selectedModel);
        }
        if (settings.selectedSize) setImageSize(settings.selectedSize);
        if (settings.selectedStyle) setImageStyle(settings.selectedStyle);
        if (settings.temperature !== undefined) setTemperature(settings.temperature);
        if (settings.watermark !== undefined) setWatermark(settings.watermark);
        if (settings.guidanceScale !== undefined) setGuidanceScale(settings.guidanceScale);
        if (settings.imageQuality) setImageQuality(settings.imageQuality);
        if (settings.imageN !== undefined) setImageN(settings.imageN);
        if (settings.seed !== undefined) setSeed(settings.seed);
        if (settings.sequentialImageGeneration !== undefined) setSequentialImageGeneration(settings.sequentialImageGeneration);
        if (settings.sequentialImageGenerationOptions) setSequentialImageGenerationOptions(settings.sequentialImageGenerationOptions);
        if (settings.optimizePromptOptionsMode) setOptimizePromptOptionsMode(settings.optimizePromptOptionsMode);
        if (settings.qwenNegativePrompt !== undefined) setQwenNegativePrompt(settings.qwenNegativePrompt);
        if (settings.qwenPromptExtend !== undefined) setQwenPromptExtend(settings.qwenPromptExtend);
        if (settings.qwenImageSize) setQwenImageSize(settings.qwenImageSize);
        if (settings.qwenImageWatermark !== undefined) setQwenImageWatermark(settings.qwenImageWatermark);
        if (settings.qwenImageEditN !== undefined) setQwenImageEditN(settings.qwenImageEditN);
        if (settings.qwenImageEditNegativePrompt !== undefined) setQwenImageEditNegativePrompt(settings.qwenImageEditNegativePrompt);
        if (settings.qwenImageEditWatermark !== undefined) setQwenImageEditWatermark(settings.qwenImageEditWatermark);
        if (settings.qwenImageEditSeed !== undefined) setQwenImageEditSeed(settings.qwenImageEditSeed);
        if (settings.gptImageQuality) setGptImageQuality(settings.gptImageQuality);
        if (settings.gptImageInputFidelity) setGptImageInputFidelity(settings.gptImageInputFidelity);
        if (settings.gptImageN !== undefined) setGptImageN(settings.gptImageN);
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
            messages = parsedData.chatMessages.map((msg: any) => {
              // 优先使用 role 字段，如果没有则使用 type 字段作为后备
              const role = msg.role || (msg.type === 'user' ? 'user' : 'assistant');
              return {
                ...msg,
                id: msg.id || `msg-${Date.now()}-${Math.random()}`,
                timestamp: msg.timestamp || Date.now(),
                role: role, // 明确设置 role，确保不会丢失
              };
            });
            console.log('📂 加载的视频生成消息列表:', messages.map(m => ({ id: m.id, role: m.role, content: m.content?.slice(0, 20) })));
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
        if (settings.selectedModel) {
          setSelectedModel(settings.selectedModel);
        }
        if (settings.videoDuration !== undefined) setVideoDuration(settings.videoDuration);
        if (settings.videoAspectRatio) setVideoAspectRatio(settings.videoAspectRatio);
        if (settings.videoResolution) setVideoResolution(settings.videoResolution);
        if (settings.imageGenerationMode) setImageGenerationMode(settings.imageGenerationMode);
        if (settings.cameraFixed !== undefined) setCameraFixed(settings.cameraFixed);
        if (settings.wan25SmartRewrite !== undefined) setWan25SmartRewrite(settings.wan25SmartRewrite);
        if (settings.wan25GenerateAudio !== undefined) setWan25GenerateAudio(settings.wan25GenerateAudio);
        if (settings.wan25Resolution) setWan25Resolution(settings.wan25Resolution);
        if (settings.wan25AspectRatio) setWan25AspectRatio(settings.wan25AspectRatio);
        if (settings.wan25Seed !== undefined) setWan25Seed(settings.wan25Seed);
        if (settings.seed !== undefined) setSeed(settings.seed);
        if (settings.watermark !== undefined) setWatermark(settings.watermark);
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
      title: t.deleteConfirm.title,
      message: t.deleteConfirm.message,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          // 先获取记录详情，提取 ossId
          let ossIds: string[] = [];
          try {
            const recordInfo = await chatService.getChatRecordInfo(recordId);
            const apiJson = (recordInfo as any)?.data?.apiJson || (recordInfo as any)?.apiJson;
            if (apiJson) {
              const apiJsonObj = typeof apiJson === 'string' ? JSON.parse(apiJson) : apiJson;

              // 提取 chatMessages 中 assistant 消息里的 generatedImages.ossId 和 generatedVideos.ossId
              if (apiJsonObj.chatMessages && Array.isArray(apiJsonObj.chatMessages)) {
                apiJsonObj.chatMessages.forEach((msg: any) => {
                  if (msg.type === 'assistant' || msg.role === 'assistant') {
                    // 提取图片的 ossId
                    if (msg.generatedImages && Array.isArray(msg.generatedImages)) {
                      msg.generatedImages.forEach((img: any) => {
                        if (img.ossId) {
                          ossIds.push(img.ossId);
                        }
                      });
                    }
                    // 提取视频的 ossId
                    if (msg.generatedVideos && Array.isArray(msg.generatedVideos)) {
                      msg.generatedVideos.forEach((video: any) => {
                        if (video.ossId) {
                          ossIds.push(video.ossId);
                        }
                      });
                    }
                  }
                });
              }

              // 提取 apiJson 根节点 generatedImages 中的 ossId
              if (apiJsonObj.generatedImages && Array.isArray(apiJsonObj.generatedImages)) {
                apiJsonObj.generatedImages.forEach((img: any) => {
                  if (img.ossId) {
                    ossIds.push(img.ossId);
                  }
                });
              }

              // 提取 apiJson 根节点 generatedVideos 中的 ossId
              if (apiJsonObj.generatedVideos && Array.isArray(apiJsonObj.generatedVideos)) {
                apiJsonObj.generatedVideos.forEach((video: any) => {
                  if (video.ossId) {
                    ossIds.push(video.ossId);
                  }
                });
              }
            }
          } catch (error) {
            console.warn('⚠️ 获取对话记录详情失败，跳过 OSS 资源删除:', error);
          }

          // 删除 OSS 资源
          if (ossIds.length > 0) {
            const uniqueOssIds = [...new Set(ossIds)];
            try {
              await uploadService.deleteOssResource(uniqueOssIds);
              console.log('✅ OSS 资源已删除:', uniqueOssIds);
            } catch (error) {
              console.warn('⚠️ 删除 OSS 资源失败，继续删除对话记录:', error);
            }
          }

          // 删除对话记录
          await chatService.deleteChatRecord(recordId);
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
          toast.success(t.toasts.recordDeleted);
        } catch (error) {
          toast.error(t.toasts.deleteRecordFailed);
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

  // 错误处理函数：识别错误类型并返回友好的错误消息（适用于图片、视频、对话生成）
  const handleApiError = (error: any, code?: number, mode: 'image' | 'video' | 'chat' = 'video'): { message: string; isHtml: boolean; action?: 'goFixPrice' } => {
    const rawMsg = String(error?.message || error?.msg || error || '');
    const errorCode = code || error?.code;

    // 余额不足错误（403或相关消息）
    const isBalanceError = 
      errorCode === 403 ||
      /余额不足|余额已用尽|insufficient balance|insufficient funds|not enough balance|用户余额不足|请充值后再试|用户身份验证失败|余额不足，请充值后再试|HTTP error! status: 403/i.test(rawMsg);

    // 文本敏感词错误
    const isTextSensitiveError =
      /输入文本包含敏感信息|输入内容包含敏感信息|敏感信息|敏感内容|敏感词|InputTextSensitiveContentDetected|input text may contain sensitive information/i.test(rawMsg);

    // 图片敏感内容错误
    const isImageSensitiveError =
      /图片包含敏感内容|上传的图片包含敏感|InputImageSensitiveContentDetected|input image may contain sensitive information/i.test(rawMsg);

    // 视频下载错误
    const isDownloadError =
      /视频下载失败|下载服务异常|下载超时|网络连接失败|Error while extracting response/i.test(rawMsg);

    console.log('错误类型判断:', { 
      isBalanceError, 
      isTextSensitiveError, 
      isImageSensitiveError, 
      isDownloadError, 
      errorCode,
      rawMsg 
    });

    if (isBalanceError) {
      return {
        message: '账户余额不足，请前往 <a href="#" class="link-fix-price">定价列表</a> 充值后再试～',
        isHtml: true,
        action: 'goFixPrice'
      };
    } else if (isTextSensitiveError) {
      const modeText = mode === 'image' ? '图片' : mode === 'video' ? '视频' : '对话';
      return {
        message: `${modeText}生成失败：输入文本包含敏感信息，请修改后重试～`,
        isHtml: false
      };
    } else if (isImageSensitiveError) {
      const modeText = mode === 'image' ? '图片' : '视频';
      return {
        message: `${modeText}生成失败：上传的图片包含敏感内容，请更换图片后重试～`,
        isHtml: false
      };
    } else if (isDownloadError) {
      if (rawMsg.includes('下载服务异常')) {
        return {
          message: '视频已生成成功，但下载服务暂时异常，请稍后刷新页面重试或联系管理员',
          isHtml: false
        };
      } else if (rawMsg.includes('下载超时') || rawMsg.includes('网络连接失败')) {
        return {
          message: '视频已生成成功，但下载时网络连接失败，请检查网络后重试',
          isHtml: false
        };
      } else {
        return {
          message: '视频下载遇到问题，请稍后重试',
          isHtml: false
        };
      }
    } else {
      // 未识别的错误，显示统一的友好提示
      const modeText = mode === 'image' ? '图片' : mode === 'video' ? '视频' : '对话';
      
      // 检测技术性错误消息（包含URL、HTTP错误、网络请求失败等）
      const isTechnicalError = 
        errorCode === 500 ||
        /POST请求失败|GET请求失败|请求失败|HTTP.*error|Network Error|timeout|网络错误|连接失败|服务器错误|Server Error|Failed to fetch|网络连接异常/i.test(rawMsg) ||
        /https?:\/\//.test(rawMsg) || // 包含URL
        rawMsg.length > 100; // 错误消息太长
      
      // 对于技术性错误，显示友好的提示，不显示原始错误信息
      if (isTechnicalError || !rawMsg || rawMsg === '未知错误') {
        return {
          message: `当前${modeText}模型请求异常，请稍后重试或切换其它模型～`,
          isHtml: false
        };
      }
      
      // 对于其他错误，如果消息简短且不包含技术细节，可以显示
      // 但需要过滤掉可能包含技术细节的部分
      let finalMessage = rawMsg;
      // 移除可能包含的URL
      finalMessage = finalMessage.replace(/https?:\/\/[^\s]+/g, '');
      // 移除HTTP状态码
      finalMessage = finalMessage.replace(/HTTP\s+\d+/gi, '');
      // 如果处理后消息为空或太短，使用通用提示
      if (!finalMessage.trim() || finalMessage.trim().length < 5) {
        finalMessage = `当前${modeText}模型请求异常，请稍后重试或切换其它模型～`;
      }
      
      return {
        message: finalMessage,
        isHtml: false
      };
    }
    };

  // 保持向后兼容的别名
  const handleVideoError = handleApiError;

  // 复制消息
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    // 可以添加提示消息
  };

  // 复制图片到剪贴板并添加到输入框
  const handleCopyImage = async (imageUrl: string, textContent?: string) => {
    try {
      // 将图片URL转换为blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // 复制图片到剪贴板
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);

      // 将图片转换为base64并添加到输入框
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const base64 = event.target?.result as string;
        if (base64) {
          // 图片模式下，最多只显示一张图片，替换已有图片
          setUploadedImages([base64]);
          // 如果有文字内容，同时设置到输入框
          if (textContent && textContent.trim()) {
            setInputValue(textContent.trim());
            // 如果同时有文字和图片，显示引用消息的提示
            toast.success('已引用消息内容到输入框');
          } else {
            // 只有图片时，显示图片复制的提示
            toast.success('图片已复制并添加到输入框');
          }
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('复制图片失败:', error);
      // 如果复制失败，至少尝试添加到输入框
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          const base64 = event.target?.result as string;
          if (base64) {
            // 图片模式下，最多只显示一张图片，替换已有图片
            setUploadedImages([base64]);
            // 如果有文字内容，同时设置到输入框
            if (textContent && textContent.trim()) {
              setInputValue(textContent.trim());
              // 如果同时有文字和图片，显示引用消息的提示
              toast.success('已引用消息内容到输入框');
            } else {
              // 只有图片时，显示图片添加的提示
              toast.success('图片已添加到输入框');
            }
          }
        };
        reader.readAsDataURL(blob);
      } catch (fallbackError) {
        console.error('添加图片到输入框失败:', fallbackError);
        toast.error('复制图片失败');
      }
    }
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

  // 引用消息到输入框
  const handleQuoteMessage = (message: ExtendedChatMessage) => {
    let content = message.content || '';
    let images: string[] = [];

    if (currentMode === 'image') {
      // 图片模式：引用用户消息的图片或AI生成的图片
      if (message.role === 'user' && message.images) {
        images = [...message.images];
      } else if (message.role === 'assistant' && message.generatedImages) {
        images = message.generatedImages
          .filter(img => img.url && img.url.trim())
          .map(img => img.url);
      }
    } else if (currentMode === 'video') {
      // 视频模式：通常不引用视频作为输入
      images = [];
    }

    // 设置输入框内容
    setInputValue(content);
    if (images.length > 0) {
      setUploadedImages(images);
    }

    // 聚焦到输入框
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      textarea?.focus();
    }, 100);

    toast.success('已引用消息内容到输入框');
  };

  // 重新发送消息
  const handleResendMessage = async (message: ExtendedChatMessage) => {
    if (isLoading || !selectedModel) return;

    const content = message.content || '';
    const images = message.images || [];

    // 设置输入框内容（但不显示）
    setInputValue(content);
    setUploadedImages(images);

    // 直接发送
    await handleSend();
  };

  // 删除消息
  const handleDeleteMessage = (messageId: string) => {
    // 不允许删除欢迎消息和system消息
    if (messageId === 'welcome') {
      return;
    }

    setMessages(prev => {
      const messageToDelete = prev.find(msg => msg.id === messageId);
      // 不允许删除system消息
      if (messageToDelete?.role === 'system') {
        return prev;
      }

      const filtered = prev.filter(msg => msg.id !== messageId);
      // 如果删除后没有消息了，且不是system消息，显示欢迎消息
      if (filtered.length === 0 || (filtered.length === 1 && filtered[0].role === 'system')) {
        if (currentMode === 'chat') {
          const hasSystemMessage = filtered.some(msg => msg.role === 'system');
          if (hasSystemMessage) {
            return filtered;
          }
          return [{
            id: 'welcome',
            role: 'assistant',
            content: t.welcomeMessage,
            timestamp: Date.now()
          }];
        } else {
          return [];
        }
      }
      return filtered;
    });
  };

  // 清空消息
  const handleClear = () => {
    // 检查是否存在system消息（AI角色定义）
    const hasSystemMessage = messages.some(msg => msg.role === 'system');
    
    if (currentMode === 'chat') {
      if (hasSystemMessage) {
        // 如果定义了AI角色，只保留system消息，不显示欢迎消息
        const systemMessage = messages.find(msg => msg.role === 'system');
        if (systemMessage) {
          setMessages([systemMessage]);
        } else {
          setMessages([]);
        }
      } else {
        // 如果没有定义AI角色，显示欢迎消息
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: t.welcomeMessage,
            timestamp: Date.now()
          }
        ]);
      }
    } else {
      // 图片和视频模式不显示欢迎消息
      setMessages([]);
    }
    setSelectedRecordId(null);
  };

  // 处理定义AI角色
  const handleDefineAIRole = (messageId: string) => {
    setAiRoleMessageId(messageId);
    // 如果消息已存在，使用现有内容；否则使用默认内容
    const message = messages.find(msg => msg.id === messageId);
    const defaultContent = t?.aiRoleDefinition?.defaultContent || '你是一位优秀的AI助手专家，具有丰富的知识和经验，能够帮助用户解决各种问题。';
    if (message && message.role === 'system') {
      setAiRoleContent(message.content || defaultContent);
    } else {
      setAiRoleContent(defaultContent);
    }
    setShowAIRoleModal(true);
  };

  // 确认AI角色定义
  const confirmAIRole = () => {
    if (!aiRoleContent.trim()) {
      toast.error(t?.aiRoleDefinition?.inputRequired || '请输入AI角色定义');
      return;
    }

    // 检查是否已存在system消息
    const existingSystemIndex = messages.findIndex(msg => msg.role === 'system');
    
    if (existingSystemIndex !== -1) {
      // 如果已存在system消息，更新它
      const updatedMessages = [...messages];
      updatedMessages[existingSystemIndex] = {
        ...updatedMessages[existingSystemIndex],
        role: 'system' as const,
        content: aiRoleContent.trim(), // 保存用户在弹窗中输入的角色定义内容
      };
      // 移除欢迎消息（如果存在）
      const filteredMessages = updatedMessages.filter(msg => msg.id !== 'welcome');
      setMessages(filteredMessages);
      console.log('✅ 更新已存在的system消息:', updatedMessages[existingSystemIndex]);
    } else {
      // 如果不存在system消息，创建新的 system 消息
      // role固定传system，content是用户在弹窗中输入的角色定义内容
      const newMessage: ExtendedChatMessage = {
        id: generateId(),
        role: 'system',
        content: aiRoleContent.trim(), // 保存用户在弹窗中输入的角色定义内容
        timestamp: Date.now(),
      };
      // 移除欢迎消息，只保留system消息和其他消息
      const filteredMessages = messages.filter(msg => msg.id !== 'welcome');
      setMessages([newMessage, ...filteredMessages]);
      console.log('✅ 创建新的system消息，已移除欢迎消息:', newMessage);
    }

    setShowAIRoleModal(false);
    setAiRoleContent('');
    setAiRoleMessageId('');
    toast.success(t?.aiRoleDefinition?.updateSuccess || 'AI角色定义已更新');
  };

  // 取消AI角色定义
  const cancelAIRole = () => {
    setShowAIRoleModal(false);
    setAiRoleContent('');
    setAiRoleMessageId('');
  };

  // 下载图片
  const handleDownloadImage = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('图片下载开始');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('下载失败，尝试在新窗口打开');
      window.open(url, '_blank');
    }
  };

  // 下载视频
  const handleDownloadVideo = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `generated-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('视频下载开始');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('下载失败，尝试在新窗口打开');
      window.open(url, '_blank');
    }
  };

  // 图生视频：切换到视频模式并传递图片数据
  const handleImageToVideo = (imageUrl: string, prompt?: string) => {
    // 标记这是从图生视频跳转过来的图片
    imageToVideoImageRef.current = imageUrl;
    
    // 先设置图片和提示词（在切换模式之前）
    setUploadedImages([imageUrl]);
    setInputValue('根据这张图片生成视频');
    
    // 切换到视频模式
    setCurrentMode('video');
    
    // 使用多次 setTimeout 确保图片在模式切换和模型选择完成后仍然存在
    setTimeout(() => {
      setUploadedImages([imageUrl]);
      setInputValue('根据这张图片生成视频');
    }, 100);
    
    setTimeout(() => {
      setUploadedImages([imageUrl]);
      setInputValue('根据这张图片生成视频');
      toast.success(t.toasts.switchToVideoMode);
    }, 500);
  };

  // 导入素材
  const handleExportMaterial = async (type: 'image' | 'video', url: string, prompt?: string) => {
    // 如果正在导入，直接返回
    if (isExportingMaterial) {
      return;
    }
    
    setIsExportingMaterial(true);
    let finalAssetId: string | undefined;
    try {
      let finalUrl = url;
      
      if (type === 'image') {
        // 处理图片上传
        const imageType = detectImageType({ url });

        // 如果已经是 OSS 链接，直接使用
        if (imageType === 'oss') {
          const dateStr = new Date().toISOString().slice(0, 10);
          setSelectedMaterial({
            type,
            url: finalUrl,
            prompt,
            assetType: 13, // AI图片生成
            assetName: `AI图片生成_${dateStr}`,
            assetDesc: `AI图片生成_${dateStr}`,
          });
          setIsAddMaterialModalOpen(true);
          return;
        }

        const ossResult = await processImageToOSS({ url });
        if (ossResult && ossResult.url) {
          finalUrl = ossResult.url;
          finalAssetId = ossResult.ossId;
        } else {
          toast.error(t.toasts.imageUploadFailed, { id: 'upload-oss' });
          setIsExportingMaterial(false);
          return;
        }
      } else {
        // 处理视频上传
        const videoType = detectVideoType({ url });

        // 如果已经是 OSS 链接，直接使用
        if (videoType === 'oss') {
          const dateStr = new Date().toISOString().slice(0, 10);
          setSelectedMaterial({
            type,
            url: finalUrl,
            prompt,
            assetType: 14, // AI视频生成
            assetName: `AI生成视频_${dateStr}`,
            assetDesc: `AI生成视频_${dateStr}`,
          });
          setIsAddMaterialModalOpen(true);
          return;
        }

        // 需要上传到 OSS
        toast.loading(t.toasts.uploadingVideoToOSS, { id: 'upload-oss' });

        const ossResult = await processVideoToOSS({ url });
        if (ossResult && ossResult.url) {
          finalUrl = ossResult.url;
          finalAssetId = ossResult.ossId;
          toast.success(t.toasts.videoUploadSuccess, { id: 'upload-oss' });
        } else {
          toast.error(t.toasts.videoUploadFailed, { id: 'upload-oss' });
          setIsExportingMaterial(false);
          return;
        }
      }
      
      // 使用 OSS 返回的 URL
      const dateStr = new Date().toISOString().slice(0, 10);
      setSelectedMaterial({
        type,
        url: finalUrl,
        prompt,
        assetType: type === 'image' ? 7 : 14, // 7: AI生图, 14: AI视频生成
        assetName: type === 'image' ? `AI生图_${dateStr}` : `AI生成视频_${dateStr}`,
        assetDesc: type === 'image' ? `AI生图_${dateStr}` : `AI生成视频_${dateStr}`,
        assetId: finalAssetId,
      });
      setIsAddMaterialModalOpen(true);
    } catch (error) {
      console.error('导入素材失败:', error);
      toast.error(t.toasts.importMaterialFailed, { id: 'upload-oss' });
      setIsExportingMaterial(false);
    }
  };

  // 保存对话记录
  // 检测图片类型：'base64' | 'url' | 'oss' | 'no-image'
  const detectImageType = (img: { url?: string; b64_json?: string }): 'base64' | 'url' | 'oss' | 'no-image' => {
    const url = img.url || '';
    const b64 = img.b64_json || '';

    // 检查是否已有 ossId，说明已经是 OSS 链接
    if ((img as any).ossId) {
      return 'oss';
    }

    // 检查是否是 OSS 链接（包含 nebula-ads.oss 域名）
    if (url && (url.includes('nebula-ads.oss') || url.includes('oss-'))) {
      return 'oss';
    }

    // 检查是否是 base64（优先检查 b64_json 字段）
    if (b64 && b64.trim() !== '') {
      return 'base64';
    }

    // 检查是否是 data URL 格式的 base64（url 字段中包含 base64）
    if (url && url.startsWith('data:image/')) {
      return 'base64';
    }

    // 检查是否是第三方 URL（http/https）
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      return 'url';
    }

    // 没有图片数据（url 为空且 b64_json 也为空）
    if (!url || url.trim() === '') {
      if (!b64 || b64.trim() === '') {
        return 'no-image';
      }
    }

    // 默认返回 url（可能是相对路径或其他格式）
    return 'url';
  };

  // 检测视频类型：'url' | 'oss' | 'no-video'
  const detectVideoType = (video: { url?: string }): 'url' | 'oss' | 'no-video' => {
    const url = video.url || '';

    // 检查是否已有 ossId，说明已经是 OSS 链接
    if ((video as any).ossId) {
      return 'oss';
    }

    // 检查是否是 OSS 链接（包含 nebula-ads.oss 域名）
    if (url.includes('nebula-ads.oss') || url.includes('oss-')) {
      return 'oss';
    }

    // 检查是否是第三方 URL（http/https）
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return 'url';
    }

    // 没有视频数据
    if (!url) {
      return 'no-video';
    }

    return 'url';
  };

  // 处理图片：将 base64 和第三方链接转换为 OSS 链接
  const processImageToOSS = async (img: { url?: string; b64_json?: string; [key: string]: any }): Promise<{ url: string; ossId: string } | null> => {
    const imageType = detectImageType(img);

    if (imageType === 'oss' || imageType === 'no-image') {
      // 已经是 OSS 链接或没有图片，直接返回
      return img.ossId ? { url: img.url || '', ossId: img.ossId } : null;
    }

    try {
      let uploadResult;

      if (imageType === 'base64') {
        // 处理 base64
        let base64Content: string;
        let extensionType = 'png';

        if (img.b64_json) {
          // 使用 b64_json 字段
          base64Content = `data:image/png;base64,${img.b64_json}`;
        } else if (img.url && img.url.startsWith('data:image/')) {
          // 完整的 Data URL 格式
          base64Content = img.url;
          const match = img.url.match(/data:image\/([^;]+)/);
          if (match && match[1]) {
            extensionType = match[1].toLowerCase();
            if (extensionType === 'jpeg') {
              extensionType = 'jpg';
            }
          }
        } else {
          // 纯 Base64 字符串
          base64Content = `data:image/png;base64,${img.url}`;
        }

        const fileName = `generated_image_${Date.now()}.${extensionType}`;
        uploadResult = await uploadService.uploadByBase64(base64Content, fileName, extensionType);
      } else if (imageType === 'url') {
        // 处理第三方 URL
        const url = img.url || '';
        // 从 URL 中提取扩展名
        let extensionType = 'png';
        const urlMatch = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
        if (urlMatch && urlMatch[1]) {
          extensionType = urlMatch[1].toLowerCase();
          if (extensionType === 'jpeg') {
            extensionType = 'jpg';
          }
        }
        uploadResult = await uploadService.uploadByImageUrl(url, extensionType);
      }

      if (uploadResult && uploadResult.url && uploadResult.ossId) {
        return {
          url: uploadResult.url,
          ossId: uploadResult.ossId,
        };
      }
    } catch (error) {
      console.error('❌ 图片上传到 OSS 失败:', error);
      // 上传失败时，返回 null，保持原始数据
    }

    return null;
  };

  // 处理视频：将第三方链接转换为 OSS 链接
  const processVideoToOSS = async (video: { url?: string; [key: string]: any }): Promise<{ url: string; ossId: string } | null> => {
    const videoType = detectVideoType(video);

    if (videoType === 'oss' || videoType === 'no-video') {
      // 已经是 OSS 链接或没有视频，直接返回
      return video.ossId ? { url: video.url || '', ossId: video.ossId } : null;
    }

    try {
      if (videoType === 'url') {
        const url = video.url || '';
        // 从 URL 中提取扩展名
        let extensionType = 'mp4';
        const urlMatch = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
        if (urlMatch && urlMatch[1]) {
          extensionType = urlMatch[1].toLowerCase();
        }

        const uploadResult = await uploadService.uploadByVideoUrl(url, extensionType);

        if (uploadResult && uploadResult.url && uploadResult.ossId) {
          return {
            url: uploadResult.url,
            ossId: uploadResult.ossId,
          };
        }
      }
    } catch (error) {
      console.error('❌ 视频上传到 OSS 失败:', error);
      // 上传失败时，返回 null，保持原始数据
    }

    return null;
  };

  // 处理所有图片：批量转换为 OSS 链接
  const processAllImages = async (images: Array<{ id: string; url?: string; b64_json?: string; prompt?: string; timestamp: number; [key: string]: any }>): Promise<Array<{ id: string; url: string; prompt?: string; timestamp: number; ossId?: string; b64_json?: string; [key: string]: any }>> => {
    if (!images || images.length === 0) {
      return images as Array<{ id: string; url: string; prompt?: string; timestamp: number; ossId?: string; b64_json?: string; [key: string]: any }>;
    }

    const processedImages = await Promise.all(
      images.map(async (img) => {
        const ossResult = await processImageToOSS(img);
        if (ossResult) {
          return {
            ...img,
            url: ossResult.url,
            ossId: ossResult.ossId,
          };
        }
        // 上传失败或已经是 OSS 链接，保持原样，但确保 url 存在
        return {
          ...img,
          url: img.url || '',
        };
      })
    );

    return processedImages;
  };

  // 处理所有视频：批量转换为 OSS 链接
  const processAllVideos = async (videos: Array<{ id: string; url?: string; taskId?: string; prompt?: string; timestamp: number; status?: string; [key: string]: any }>): Promise<Array<{ id: string; url: string; taskId?: string; prompt?: string; timestamp: number; status?: string; ossId?: string; [key: string]: any }>> => {
    if (!videos || videos.length === 0) {
      return videos as Array<{ id: string; url: string; taskId?: string; prompt?: string; timestamp: number; status?: string; ossId?: string; [key: string]: any }>;
    }

    const processedVideos = await Promise.all(
      videos.map(async (video) => {
        const ossResult = await processVideoToOSS(video);
        if (ossResult) {
          return {
            ...video,
            url: ossResult.url,
            ossId: ossResult.ossId,
          };
        }
        // 上传失败或已经是 OSS 链接，保持原样，但确保 url 存在
        return {
          ...video,
          url: video.url || '',
        };
      })
    );

    return processedVideos;
  };

  // 自动保存记录（后台静默保存，不显示toast提示）
  const autoSaveChat = async (showToast: boolean = false) => {
    // 过滤掉欢迎消息
    const validMessages = messages.filter(msg => msg.id !== 'welcome');
    if (validMessages.length === 0) {
      if (showToast) {
        toast.error(t.toasts.noMessagesToSave);
      }
      return;
    }

    // 调试：检查保存前的消息 role
    console.log('💾 自动保存前的消息列表:', validMessages.map(m => ({ id: m.id, role: m.role, content: m.content?.slice(0, 20) })));

    const saveToast = showToast ? toast.loading(t.toasts.savingAndProcessing) : null;
    
    try {
      // 处理图片和视频，转换为 OSS 链接
      console.log('🔄 开始处理图片和视频，转换为 OSS 链接...');
      const processedMessages = await Promise.all(
        validMessages.map(async (msg) => {
          const extendedMsg = msg as ExtendedChatMessage;
          const processedMsg = { ...extendedMsg };

          // 处理图片
          if (extendedMsg.generatedImages && extendedMsg.generatedImages.length > 0) {
            console.log(`📸 处理 ${extendedMsg.generatedImages.length} 张图片...`);
            processedMsg.generatedImages = await processAllImages(extendedMsg.generatedImages);
            console.log('✅ 图片处理完成');
          }

          // 处理视频
          if (extendedMsg.generatedVideos && extendedMsg.generatedVideos.length > 0) {
            console.log(`🎬 处理 ${extendedMsg.generatedVideos.length} 个视频...`);
            processedMsg.generatedVideos = await processAllVideos(extendedMsg.generatedVideos);
            console.log('✅ 视频处理完成');
          }

          return processedMsg;
        })
      );
      console.log('✅ 所有图片和视频处理完成');

      let apiType = 'chat-completions';
      let chatData: any = {
        messages: processedMessages,
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
        // 从处理后的消息中提取所有图片（已经转换为 OSS 链接）
        const allProcessedImages = processedMessages
          .filter(msg => msg.role === 'assistant' && (msg as ExtendedChatMessage).generatedImages)
          .flatMap(msg => (msg as ExtendedChatMessage).generatedImages || []);
        
        console.log('📸 根节点 generatedImages 数量:', allProcessedImages.length);
        chatData = {
          chatMessages: processedMessages,
          generatedImages: allProcessedImages, // 使用已处理的图片（OSS 链接）
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
            sequentialImageGeneration,
            sequentialImageGenerationOptions,
            optimizePromptOptionsMode,
            qwenNegativePrompt,
            qwenPromptExtend,
            qwenImageSize,
            qwenImageWatermark,
            qwenImageEditN,
            qwenImageEditNegativePrompt,
            qwenImageEditWatermark,
            qwenImageEditSeed,
            gptImageQuality,
            gptImageInputFidelity,
            gptImageN,
          },
          timestamp: Date.now(),
        };
      } else if (currentMode === 'video') {
        apiType = 'video-generates';
        // 从处理后的消息中提取所有视频（已经转换为 OSS 链接）
        const allProcessedVideos = processedMessages
          .filter(msg => msg.role === 'assistant' && (msg as ExtendedChatMessage).generatedVideos)
          .flatMap(msg => (msg as ExtendedChatMessage).generatedVideos || []);
        
        console.log('🎬 根节点 generatedVideos 数量:', allProcessedVideos.length);
        chatData = {
          chatMessages: processedMessages,
          generatedVideos: allProcessedVideos, // 使用已处理的视频（OSS 链接）
          settings: {
            selectedModel: selectedModel,
            videoDuration,
            videoAspectRatio,
            videoResolution,
            imageGenerationMode,
            cameraFixed,
            wan25SmartRewrite,
            wan25GenerateAudio,
            wan25Resolution,
            wan25AspectRatio,
            wan25Seed,
            seed,
            watermark,
          },
          timestamp: Date.now(),
        };
      }

      // 生成标题
      const firstUserMessage = processedMessages.find(msg => msg.role === 'user');
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
        if (showToast && saveToast) {
          toast.dismiss(saveToast);
          toast.success(t.toasts.recordUpdated);
        }
        console.log('💾 对话记录已更新:', selectedRecordId);
      } else {
        // 新增记录
        const response = await chatService.addChatRecord(apiTalkData);
        // API响应可能直接返回ID或包含data字段，也可能data为null但保存成功
        const newId = (response as any)?.data?.id || (response as any)?.id || (response as any);
        if (newId) {
          setSelectedRecordId(newId);
          if (showToast && saveToast) {
            toast.dismiss(saveToast);
            toast.success(t.toasts.recordSaved);
          }
          console.log('💾 对话记录已保存，ID:', newId);
          // 刷新记录列表
          refreshRecords();
        } else {
          // 即使没有返回ID，如果接口调用成功（没有抛出异常），也认为保存成功
          // 参考Vue3实现：即使没有ID也不报错，只是不设置selectedRecordId
          if (showToast && saveToast) {
            toast.dismiss(saveToast);
            toast.success(t.toasts.recordSaved);
          }
          console.log('💾 对话记录已保存（未返回ID）');
          // 刷新记录列表，可能能从列表中获取到ID
          refreshRecords();
        }
      }
    } catch (error) {
      if (showToast && saveToast) {
        toast.dismiss(saveToast);
        toast.error(t.toasts.saveRecordFailed);
      }
      console.error('❌ 保存对话记录失败:', error);
    }
  };

  const handleSaveChat = async () => {
    await autoSaveChat(true);
  };

  // 停止生成
  const handleStop = () => {
    // 中止请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // 停止视频轮询
    if (videoPollingIntervalRef.current) {
      clearTimeout(videoPollingIntervalRef.current);
      videoPollingIntervalRef.current = null;
    }
    
    setIsLoading(false);
    setIsStreaming(false);
    setProgress(0);
    
    // 更新最后一条AI消息，移除流式状态
    setMessages(prev => {
      const newMessages = [...prev];
      const lastMsg = newMessages[newMessages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant') {
        if (lastMsg.isStreaming) {
        lastMsg.isStreaming = false;
        }
        // 如果是视频生成，更新状态
        if (lastMsg.generatedVideos && lastMsg.generatedVideos.length > 0) {
          const processingVideo = lastMsg.generatedVideos.find(v => v.status === 'processing');
          if (processingVideo) {
            processingVideo.status = 'failed';
            lastMsg.content = '视频生成已取消';
          }
        }
      }
      return newMessages;
    });
  };

  // 处理图片上传
  // 验证图片文件
  const validateImageFile = async (
    file: File,
    restrictions: ReturnType<typeof getImageUploadRestrictions>
  ): Promise<{ valid: boolean; error?: string; base64?: string }> => {
    // 验证文件格式
    const fileType = file.type.toLowerCase();
    const normalizedType = fileType.replace(/^image\//, '');
    const allowedTypes = restrictions.allowedFormats.map(f => f.replace(/^image\//, '').toLowerCase());
    
    if (!allowedTypes.includes(normalizedType) && !restrictions.allowedFormats.includes(fileType)) {
      const formatList = restrictions.allowedFormats
        .map(f => f.replace('image/', '').toUpperCase())
        .join('、');
      return {
        valid: false,
        error: `${t.imageValidation.formatNotSupported}${formatList}`,
      };
    }

    // 验证文件大小
    const maxSizeBytes = restrictions.maxFileSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `${t.imageValidation.sizeExceeded}${restrictions.maxFileSize}MB`,
      };
    }

    // 验证图片尺寸
    return validateImageDimensions(await fileToBase64(file), restrictions);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const validateImageDimensions = (
    base64: string,
    restrictions: ReturnType<typeof getImageUploadRestrictions>
  ): Promise<{ valid: boolean; error?: string; base64?: string }> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const width = img.width;
          const height = img.height;

          // doubao 模型检查宽高长度 > 14
          if (selectedModel.startsWith('doubao-')) {
            if (width <= 14 || height <= 14) {
              resolve({
                valid: false,
                error: `图片宽高长度必须大于 14 像素，当前尺寸：${width}x${height}`,
              });
              return;
            }
          }

          // 检查最小/最大尺寸
          if (restrictions.minImageSize && (width < restrictions.minImageSize || height < restrictions.minImageSize)) {
            resolve({
              valid: false,
              error: t.imageValidation.minResolution.replace('{0}', restrictions.minImageSize.toString()),
            });
            return;
          }

          if (restrictions.maxImageSize && (width > restrictions.maxImageSize || height > restrictions.maxImageSize)) {
            resolve({
              valid: false,
              error: t.imageValidation.maxResolution.replace('{0}', restrictions.maxImageSize.toString()),
            });
            return;
          }

          // 检查必须匹配的尺寸（如 sora-2）
          if (restrictions.requiredDimensions && restrictions.requiredDimensions.length > 0) {
            const matches = restrictions.requiredDimensions.some(
              dim => dim.width === width && dim.height === height
            );
            if (!matches) {
              // sora-2 模型：弹出裁剪弹窗
              if (selectedModel === 'sora-2') {
                let targetDim = restrictions.requiredDimensions[0];
                // 如果有多个目标尺寸，尝试智能匹配
                if (restrictions.requiredDimensions.length > 1) {
                   const imgRatio = width / height;
                   // 图片横屏优先匹配横屏目标
                   if (imgRatio > 1) {
                       const landscape = restrictions.requiredDimensions.find(d => d.width > d.height);
                       if (landscape) targetDim = landscape;
                   } else {
                       // 图片竖屏优先匹配竖屏目标
                       const portrait = restrictions.requiredDimensions.find(d => d.width < d.height);
                       if (portrait) targetDim = portrait;
                   }
                }

                const aspectRatioOptions = [
                  { label: '16:9', value: 16 / 9 },
                  { label: '9:16', value: 9 / 16 },
                ];
                showImageCrop({
                    src: base64,
                    targetWidth: targetDim.width,
                    targetHeight: targetDim.height,
                    aspectRatio: targetDim.width / targetDim.height,
                    title: t.imageValidation.sora2CropTitle,
                    aspectRatioOptions,
                    texts: {
                      title: componentsT.imageCrop.title,
                      ratio: componentsT.imageCrop.ratio,
                      reset: componentsT.imageCrop.reset,
                      cancel: componentsT.imageCrop.cancel,
                      confirm: componentsT.imageCrop.confirm,
                    }
                }).then(result => {
                    // 根据返回的 aspectRatio 值，在 aspectRatioOptions 中查找匹配的选项
                    const matchedOption = aspectRatioOptions.find(
                      option => Math.abs(option.value - result.aspectRatio) < 0.01
                    );
                    if (matchedOption) {
                      setVideoAspectRatio(matchedOption.label);
                    }
                    resolve({ valid: true, base64: result.base64 });
                }).catch(() => {
                    const dimsList = restrictions.requiredDimensions!
                        .map(d => `${d.width}×${d.height}`)
                        .join(' 或 ');
                    resolve({
                        valid: false,
                        error: `${t.imageValidation.sora2Requirements}: ${dimsList} (${t.imageValidation.sora2CropCancel})`,
                    });
                });
                return;
              }

              const dimsList = restrictions.requiredDimensions
                .map(d => `${d.width}×${d.height}`)
                .join(' 或 ');
              resolve({
                valid: false,
                error: `${t.imageValidation.sora2Requirements}: ${dimsList}`,
              });
              return;
            }
          }

          // doubao- 模型检查宽高比
          if (selectedModel.startsWith('doubao-')) {
             const aspectRatio = width / height;
             // doubao-seedream-4.0 和 4.5 的宽高比范围是 [1/16, 16]
             // doubao-seededit-3.0 的宽高比范围是 [1/3, 3]
             let minAspectRatio: number;
             let maxAspectRatio: number;
             if (ModelCapabilities.isDoubaoSeedream4Or45(selectedModel)) {
               minAspectRatio = 1 / 16;
               maxAspectRatio = 16;
             } else {
               minAspectRatio = 1 / 3;
               maxAspectRatio = 3;
             }
             if (aspectRatio < minAspectRatio || aspectRatio > maxAspectRatio) {
                 resolve({
                     valid: false,
                     error: `${t.imageValidation.doubaoRequirements}。${t.imageValidation.doubaoRatioHint}，当前宽高比：${aspectRatio.toFixed(2)}`
                 });
                 return;
             }
          }

          resolve({ valid: true });
        };
        img.onerror = () => {
          resolve({
            valid: false,
            error: t.imageValidation.loadFailed,
          });
        };
        img.src = base64;
    });
  };

  // 监听 selectedModel 变化，重新检查已上传的图片
  useEffect(() => {
    if (uploadedImages.length === 0) return;
    
    const checkImages = async () => {
        const newImages = [...uploadedImages];
        let hasChanges = false;
        
        const restrictions = getImageUploadRestrictions(
          selectedModel,
          currentMode as 'image' | 'video',
          videoAspectRatio,
          videoResolution
        );

        if (selectedModel === 'sora-2' || selectedModel.startsWith('doubao-') || selectedModel === 'wan2.5-i2v-preview') {
             // 倒序遍历，方便删除
             for (let i = newImages.length - 1; i >= 0; i--) {
                 const result = await validateImageDimensions(newImages[i], restrictions);
                 if (!result.valid) {
                     if (result.base64) {
                         // 裁剪成功，替换
                         newImages[i] = result.base64;
                         hasChanges = true;
                     } else {
                         // 验证失败（且无裁剪结果），删除
                         toast.error(result.error || '图片不符合当前模型要求，已移除');
                         newImages.splice(i, 1);
                         hasChanges = true;
                     }
                 }
             }
             
             if (hasChanges) {
                 setUploadedImages(newImages);
             }
        }
    };
    
    checkImages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModel, videoAspectRatio, videoResolution]);

  const processImageFiles = async (filesInput: FileList | File[] | null) => {
    if (!filesInput || !selectedModel) return;
    if (currentMode !== 'image' && currentMode !== 'video') return;

    const filesArray = Array.isArray(filesInput)
      ? filesInput
      : Array.from(filesInput as ArrayLike<File>);
    if (filesArray.length === 0) return;

    // 获取当前模式的限制规则
    const restrictions = getImageUploadRestrictions(
      selectedModel,
      currentMode as 'image' | 'video',
      videoAspectRatio,
      videoResolution
    );

    // 视频模式：根据图生模式限制图片数量
    if (currentMode === 'video') {
      const maxImages = ModelCapabilities.getMaxImagesForImageMode(imageGenerationMode);
      const currentCount = uploadedImages.length;
      
      if (currentCount >= maxImages) {
        toast.error(`当前模式最多支持上传 ${maxImages} 张图片`);
        return;
      }

      // 计算还能上传多少张
      const remainingSlots = maxImages - currentCount;
      const filesToProcess = filesArray.slice(0, remainingSlots);
      
      if (filesArray.length > remainingSlots) {
        toast(`最多只能上传 ${maxImages} 张图片，已自动选择前 ${remainingSlots} 张`, { icon: '⚠️' });
      }

      // 验证并处理每个文件
      for (const file of filesToProcess as File[]) {
        if (!file.type.startsWith('image/')) {
          toast.error(`文件 ${file.name} 不是图片格式`);
          continue;
        }

        const validation = await validateImageFile(file, restrictions);
        if (!validation.valid) {
          toast.error(validation.error || '图片验证失败');
          continue;
        }

        // 如果有裁剪后的 base64，直接使用
        if (validation.base64) {
          setUploadedImages(prev => {
            const newImages = [...prev, validation.base64!];
            if (newImages.length > maxImages) {
              return prev;
            }
            return newImages;
          });
          continue;
        }

        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          const base64 = event.target?.result as string;
          if (base64) {
            setUploadedImages(prev => {
              const newImages = [...prev, base64];
              if (newImages.length > maxImages) {
                return prev;
              }
              return newImages;
            });
          }
        };
        reader.readAsDataURL(file);
      }
    } else if (currentMode === 'image') {
      // 图片模式：根据模型限制图片数量
      const maxImages = ModelCapabilities.getMaxImagesForImageModel(selectedModel);
      const currentCount = uploadedImages.length;
      
      if (currentCount >= maxImages) {
        toast.error(`当前模型最多支持上传 ${maxImages} 张图片`);
        return;
      }

      // 计算还能上传多少张
      const remainingSlots = maxImages - currentCount;
      const filesToProcess = filesArray.slice(0, remainingSlots) as File[];
      
      if (filesArray.length > remainingSlots) {
        toast(`最多只能上传 ${maxImages} 张图片，已自动选择前 ${remainingSlots} 张`, { icon: '⚠️' });
      }

      // 验证并处理每个文件
      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) {
          toast.error(`文件 ${file.name} 不是图片格式`);
          continue;
        }

        const validation = await validateImageFile(file, restrictions);
        if (!validation.valid) {
          toast.error(validation.error || '图片验证失败');
          continue;
        }

        // 如果有裁剪后的 base64，直接使用
        if (validation.base64) {
          setUploadedImages(prev => {
            const newImages = [...prev, validation.base64!];
            if (newImages.length > maxImages) {
              return prev;
            }
            return newImages;
          });
          continue;
        }

        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          const base64 = event.target?.result as string;
          if (base64) {
            setUploadedImages(prev => {
              const newImages = [...prev, base64];
              if (newImages.length > maxImages) {
                return prev;
              }
              return newImages;
            });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await processImageFiles(e.target.files);
    
    // 清空文件选择，以便可以再次选择相同文件
    e.target.value = '';
  };

  const isImageDropEnabled = () =>
    currentMode === 'image' &&
    !!selectedModel &&
    ModelCapabilities.supportsImageUpload(selectedModel, 'image');

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isImageDropEnabled()) return;
    if (e.dataTransfer?.types && !Array.from(e.dataTransfer.types).includes('Files')) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverInput(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isImageDropEnabled()) return;
    if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget as Node)) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverInput(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    if (!isImageDropEnabled()) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverInput(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await processImageFiles(files);
    }
  };

  // 移除上传的图片
  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Wan2.5 音频上传处理
  const handleAudioUpload = async (file: File) => {
    // 验证文件格式
    const allowedFormats = ['audio/wav', 'audio/mp3', 'audio/mpeg'];
    if (!allowedFormats.includes(file.type)) {
      toast.error('仅支持 WAV 和 MP3 格式的音频文件');
      return;
    }

    // 验证文件大小（15MB限制）
    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('音频文件大小不能超过15MB');
      return;
    }

    try {
      toast.loading('音频上传中...');
      const result = await uploadService.uploadFile(file);
      toast.dismiss();
      
      if (result && result.url) {
        setWan25AudioFile(file);
        setWan25AudioUrl(result.url);
        console.log('音频上传到OSS成功，URL:', result.url);
        toast.success('音频文件上传成功');
      } else {
        throw new Error('OSS上传返回格式错误');
      }
    } catch (error: any) {
      toast.dismiss();
      console.error('音频上传到OSS失败:', error);
      toast.error(`音频文件上传失败: ${error.message || '请重试'}`);
    }
  };

  // 移除音频文件
  const removeAudio = () => {
    setWan25AudioFile(null);
    setWan25AudioUrl('');
    toast.success('已移除音频文件');
  };

  // 发送消息（根据模式调用不同的API）
  const handleSend = async () => {
    // 检查用户是否登录
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (!inputValue.trim() || isLoading || !selectedModel) return;
    if (currentMode === 'image' && uploadedImages.length === 0 && !inputValue.trim()) return;
    
    // 视频模式：如果上传了图片但模型不支持图片上传，提示并阻止发送
    let shouldBlockSend = false;
    if (currentMode === 'video' && uploadedImages.length > 0) {
      const supportsUpload = ModelCapabilities.supportsImageUpload(selectedModel, 'video');
      if (!supportsUpload) {
        toast.error(t.modelNotSupportImageUpload);
        shouldBlockSend = true;
        return;
      }
    }
    
    // 如果通过了检查（没有阻止发送），且是从图生视频跳转过来的，清除标记
    if (currentMode === 'video' && imageToVideoImageRef.current && uploadedImages.length > 0) {
      // 检查图片是否匹配（说明这是从图生视频跳转过来的）
      const isImageToVideoImage = uploadedImages.some(img => img === imageToVideoImageRef.current);
      if (isImageToVideoImage) {
        console.log('✅ 视频发送请求通过验证，清除图生视频标记');
        imageToVideoImageRef.current = null;
      }
    }

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
        // 中止时，如果消息为空，移除占位符
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.id === aiMessageId) {
            const hasContent = lastMsg.content && lastMsg.content.trim();
            const hasImages = lastMsg.generatedImages && lastMsg.generatedImages.length > 0;
            const hasVideos = lastMsg.generatedVideos && lastMsg.generatedVideos.length > 0;
            
            if (!hasContent && !hasImages && !hasVideos) {
              // 移除空的占位符消息
              return newMessages.filter(msg => msg.id !== aiMessageId);
            } else {
              lastMsg.isStreaming = false;
            }
          }
          return newMessages;
        });
        return;
      }
      
      console.error('发送消息失败:', error);
      setIsLoading(false);
      setIsStreaming(false);
      
      // 尝试从错误中提取状态码
      let errorCode: number | undefined;
      const errorMsg = String(error?.message || error || '');
      const statusMatch = errorMsg.match(/HTTP error! status: (\d+)/);
      if (statusMatch) {
        errorCode = parseInt(statusMatch[1]);
      } else if (error?.code) {
        errorCode = error.code;
      }
      
      // 使用统一的错误处理函数
      const errorInfo = handleApiError(error, errorCode, currentMode);
      
      // 更新错误消息
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.id === aiMessageId) {
          // 如果已经有部分内容（如流式响应中的部分文本），保留；否则使用错误消息
          const hasPartialContent = lastMsg.content && lastMsg.content.trim() && 
                                    !lastMsg.content.includes('错误:') && 
                                    !lastMsg.content.includes('失败');
          
          if (!hasPartialContent) {
            lastMsg.content = errorInfo.message;
            lastMsg.isHtml = errorInfo.isHtml;
            lastMsg.action = errorInfo.action;
          }
          lastMsg.isStreaming = false;
          
          // 如果有图片或视频占位符，更新状态为失败
          if (lastMsg.generatedImages && lastMsg.generatedImages.length > 0) {
            // 图片生成失败，保持占位符但标记为失败
          }
          if (lastMsg.generatedVideos && lastMsg.generatedVideos.length > 0) {
            lastMsg.generatedVideos.forEach(video => {
              if (video.status === 'processing') {
                video.status = 'failed';
              }
            });
          }
        }
        return newMessages;
      });
    } finally {
      abortControllerRef.current = null;
    }
  };

  // 处理对话生成
  const handleChatGeneration = async (aiMessageId: string, currentInput: string) => {
    // 构建消息历史（参考 Nebula1 的实现方式）
    const buildMessages = (): ChatRequest['messages'] => {
      const history: ChatRequest['messages'] = [];
      let systemMessage: { role: 'system'; content: string } | null = null;
      const conversationMessages: ChatRequest['messages'] = [];
      
      // 遍历所有消息，构建完整的对话上下文（排除欢迎消息和当前正在流式的AI消息）
      messages.forEach(msg => {
        // 跳过欢迎消息和当前正在流式的AI消息
        if (msg.id === 'welcome' || msg.id === aiMessageId) {
          return;
        }
        
        // 处理 system 消息：只保留最新的一个（AI角色定义的内容）
        // role固定传system，content是用户在弹窗中输入的角色定义内容
        if (msg.role === 'system' && msg.content && msg.content.trim()) {
          systemMessage = {
            role: 'system',
            content: msg.content.trim(), // 这里就是用户在弹窗中输入的角色定义内容
          };
          return;
        }
        
        // 处理其他消息（user、assistant）
        if ((msg.role === 'user' || msg.role === 'assistant') && msg.content && msg.content.trim()) {
          conversationMessages.push({
            role: msg.role,
            content: msg.content.trim(),
          });
        }
      });

      // 按照 Nebula1 的格式：先添加 system 消息（如果有），然后是对话历史，最后是当前用户消息
      // system消息格式：{ role: "system", content: "AI角色定义的输入内容" }
      if (systemMessage) {
        history.push(systemMessage);
      }
      history.push(...conversationMessages);
      
      // 添加当前用户消息
      history.push({
        role: 'user',
        content: currentInput,
      });

      console.log('📤 构建的消息列表:', JSON.stringify(history, null, 2));
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
            const lastIndex = newMessages.length - 1;
            const lastMsg = newMessages[lastIndex];
            
            if (lastMsg && lastMsg.id === aiMessageId && lastMsg.role === 'assistant') {
              // 创建新对象而不是直接修改，确保React能正确检测到变化
              const updatedMsg: ExtendedChatMessage = {
                ...lastMsg,
                reasoning_content: chunk.choices?.[0]?.delta?.reasoning_content
                  ? (lastMsg.reasoning_content || '') + chunk.choices[0].delta.reasoning_content
                  : lastMsg.reasoning_content,
                content: chunk.choices?.[0]?.delta?.content
                  ? (lastMsg.content || '') + chunk.choices[0].delta.content
                  : lastMsg.content,
                isStreaming: chunk.choices?.[0]?.finish_reason ? false : lastMsg.isStreaming,
              };
              
              newMessages[lastIndex] = updatedMsg;
            }
            
            return newMessages;
          });
          
          scrollToBottom();
        },
        (error: any) => {
          console.error('流式响应错误:', error);
          setIsLoading(false);
          setIsStreaming(false);
          
          // 尝试从错误消息中提取状态码
          let errorCode: number | undefined;
          const errorMsg = String(error?.message || error || '');
          const statusMatch = errorMsg.match(/HTTP error! status: (\d+)/);
          if (statusMatch) {
            errorCode = parseInt(statusMatch[1]);
          } else if (error?.code) {
            errorCode = error.code;
          }
          
          // 处理错误并更新消息
          const errorInfo = handleApiError(error, errorCode, 'chat');
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.id === aiMessageId) {
              // 如果已经有部分内容，保留；否则使用错误消息
              lastMsg.content = lastMsg.content || errorInfo.message;
              lastMsg.isHtml = errorInfo.isHtml;
              lastMsg.action = errorInfo.action;
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
        size: selectedModel === 'qwen-image-plus' ? qwenImageSize : imageSize,
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
        (requestData as any).watermark = watermark;
        (requestData as any).size = imageSize;
        
        // doubao-seedream-4.x 系列专用属性
        if (ModelCapabilities.isDoubaoSeedream4Series(selectedModel)) {
          (requestData as any).sequential_image_generation = sequentialImageGeneration ? 'auto' : 'disabled';
          // 确保不包含 layout 字段
          const { layout, ...optionsWithoutLayout } = sequentialImageGenerationOptions as any;
          (requestData as any).sequential_image_generation_options = optionsWithoutLayout;
          (requestData as any).optimize_prompt_options = {
            mode: optimizePromptOptionsMode,
          };
        }
        
        // doubao-seedream-3.0-t2i 和 doubao-seededit-3.0-i2i 专用属性（如果需要）
        // 注意：Vue3代码中这部分被注释了，暂时不添加
      }

      // Qwen-image-plus specific
      if (selectedModel === 'qwen-image-plus') {
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
            size: qwenImageSize,
            negative_prompt: qwenNegativePrompt,
            prompt_extend: qwenPromptExtend,
            watermark: qwenImageWatermark,
          }
        };
      }

      // Qwen-image-edit specific
      if (selectedModel === 'qwen-image-edit-plus' || selectedModel === 'qwen-image-edit-plus-2025-10-30') {
        // 检查是否有图片输入
        if (!images || images.length === 0) {
          toast.error('图像编辑模型需要至少上传 1 张图片');
          clearInterval(progressInterval);
          setProgress(0);
          return;
        }
        
        // 检查图片数量限制（1-3张）
        if (images.length > 3) {
          toast.error('最多支持 3 张图片');
          clearInterval(progressInterval);
          setProgress(0);
          return;
        }
        
        // 构造 content 数组：先放图片，最后放文本
        const content: Array<{ image?: string; text?: string }> = [];
        
        // 添加图片（支持1-3张）
        images.forEach(image => {
          content.push({ image });
        });
        
        // 添加文本（编辑指令）
        content.push({ text: prompt || '请进行图像编辑' });
        
        // 设置 contents 格式（包含图片和文本）
        requestData.contents = [
          {
            role: 'user',
            parts: content,
          },
        ];
        
        // 设置 parameters
        (requestData as any).parameters = {
          n: qwenImageEditN,
          negative_prompt: qwenImageEditNegativePrompt || '',
          watermark: qwenImageEditWatermark,
        };
        
        // 如果设置了随机种子，添加到参数中
        if (qwenImageEditSeed !== undefined) {
          (requestData as any).parameters.seed = qwenImageEditSeed;
        }
        
        // 清除冗余参数，避免重复
        delete requestData.size;
        delete requestData.n;
        delete requestData.quality;
        delete requestData.style;
        delete requestData.temperature;
        delete requestData.image; // 不使用 image 字段
        
        console.log(`🎨 qwen-image-edit: 使用${images.length}张图片进行编辑，生成${qwenImageEditN}张图片`);
      }
      
      // GPT-image specific
      if (selectedModel.startsWith('gpt-image')) {
        // GPT模型使用quality字段，但需要映射
        const qualityMap: Record<string, string> = {
          'low': 'low',
          'medium': 'medium',
          'high': 'high', // 或者根据实际API调整
        };

        requestData.quality = qualityMap[gptImageQuality] || 'hd';
        requestData.n = gptImageN;
        if (images && images.length > 0) {
          (requestData as any).input_fidelity = gptImageInputFidelity;
        }
      }

      // 如果有上传的图片，添加图生图参数（排除 qwen-image-edit，因为它已经处理过了）
      if (images && images.length > 0) {
        if (selectedModel !== 'qwen-image-edit-plus' && selectedModel !== 'qwen-image-edit-plus-2025-10-30') {
          requestData.image = images[0]; // 使用第一张图片作为参考
        }
      }

      const result = await imageGenerateService.generateImage(requestData);

      // 清除进度条
      clearInterval(progressInterval);
      setProgress(100);

      // 处理返回的图片
      // request.ts 在成功时会返回 resData.data，所以 result 的结构是 { data: [...], created: ... }
      const imageData = (result as any)?.data || (result as any);
      if (Array.isArray(imageData) && imageData.length > 0) {
        
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
            
            // 检查是否有有效的图片 URL
            const hasValidImageUrl = lastMsg.generatedImages.some(img => img.url && img.url.trim() !== '');
            
            // 只有当有有效图片 URL 时才显示"已为您生成X张图片"的提示
            if (hasValidImageUrl) {
              lastMsg.content = `已为您生成${imageData.length}张图片`;
            } else {
              // 没有有效图片 URL 时，不显示提示，content 保持为空或使用 revised_prompt
              lastMsg.content = '';
            }
            
            lastMsg.isStreaming = false;
          }
          
          return newMessages;
        });
      } else {
        // 处理提交失败的错误 - 如果没有图片数据
        const errorMsg = '图片生成失败：未返回有效的图片数据';
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.id === aiMessageId) {
            lastMsg.content = errorMsg;
            lastMsg.isHtml = false;
          }
          return newMessages;
        });
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      setProgress(0);
      
      // 处理错误并更新消息
      const errorInfo = handleApiError(error, error?.code, 'image');
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.id === aiMessageId) {
          lastMsg.content = errorInfo.message;
          lastMsg.isHtml = errorInfo.isHtml;
          lastMsg.action = errorInfo.action;
        }
        return newMessages;
      });
      
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
      let requestData: any = {
        model: selectedModel,
        prompt: prompt || '生成一个视频',
        user_id: user?.nebulaApiId,
      };

      // Sora-2 模型
      if (selectedModel === 'sora-2') {
        const [width, height] = videoAspectRatio === '16:9' 
          ? videoResolution === '720p' ? [1280, 720] : [1920, 1080]
          : videoResolution === '720p' ? [720, 1280] : [1080, 1920];

        requestData.width = width;
        requestData.height = height;
        requestData.seconds = videoDuration;
        
        if (images && images.length > 0) {
          requestData.input_reference = images[0];
        }
      }
      // doubao-seedance 系列模型
      else if (selectedModel.includes('doubao-seedance') || selectedModel.includes('seedance')) {
        const isT2V = selectedModel === 'doubao-seedance-1-0-lite-t2v-250428';
        const isI2V = selectedModel === 'doubao-seedance-1-0-lite-i2v-250428';
        const isPro = selectedModel === 'doubao-seedance-1-0-pro-250528';
        
        // 计算视频尺寸
        const [width, height] = videoAspectRatio === '16:9' 
          ? videoResolution === '480p' ? [832, 480]
          : videoResolution === '720p' ? [1280, 720] : [1920, 1080]
          : videoAspectRatio === '9:16'
          ? videoResolution === '480p' ? [480, 832]
          : videoResolution === '720p' ? [720, 1280] : [1080, 1920]
          : videoAspectRatio === '1:1'
          ? videoResolution === '480p' ? [624, 624]
          : videoResolution === '720p' ? [960, 960] : [1440, 1440]
          : videoAspectRatio === '4:3'
          ? videoResolution === '480p' ? [640, 480]
          : videoResolution === '720p' ? [960, 720] : [1440, 1080]
          : videoAspectRatio === '3:4'
          ? videoResolution === '480p' ? [480, 640]
          : videoResolution === '720p' ? [720, 960] : [1080, 1440]
          : [1280, 720]; // 默认值

        requestData.width = width;
        requestData.height = height;
        requestData.seconds = videoDuration;
        requestData.resolution = videoResolution;
        requestData.aspectRatio = videoAspectRatio;
        requestData.duration = videoDuration;
        requestData.watermark = watermark;
        
        // t2v 模型不支持图片
        if (!isT2V && images && images.length > 0) {
          if (imageGenerationMode === 'first_last_frame' && images.length >= 2) {
            requestData.image = images[0];
            requestData.lastFrame = images[1];
          } else {
            requestData.image = images[0];
            if (imageGenerationMode === 'reference') {
              requestData.reference_image = images[0];
            }
          }
        }
      }
      // Veo 模型
      else if (selectedModel.toLowerCase().includes('veo')) {
        requestData.durationSeconds = videoDuration; // 4/6/8
        requestData.aspectRatio = videoAspectRatio; // 16:9 或 9:16
        requestData.resolution = videoResolution; // 720p 或 1080p
        requestData.fps = 24;
        
        if (images && images.length > 0) {
          if (imageGenerationMode === 'first_last_frame' && images.length >= 2) {
            requestData.image = images[0];
            requestData.lastFrame = images[1];
          } else {
            requestData.image = images[0];
          }
        }
      }
      // Wan2.5 模型
      else if (selectedModel.includes('wan2.5')) {
        const isT2V = selectedModel === 'wan2.5-t2v-preview';
        
        requestData.duration = videoDuration; // 5 or 10
        requestData.smart_rewrite = wan25SmartRewrite;
        requestData.generate_audio = wan25GenerateAudio;
        
        if (isT2V) {
          // t2v 模型：使用 size 参数（根据分辨率和宽高比计算）
          requestData.size = ModelCapabilities.getWan25T2VSize(wan25Resolution, wan25AspectRatio);
          console.log(`📐 wan2.5-t2v 使用 size 参数: ${requestData.size} (分辨率: ${wan25Resolution}, 宽高比: ${wan25AspectRatio})`);
        } else {
          // i2v 模型：使用 resolution 参数
          requestData.resolution = wan25Resolution;
          console.log(`📐 wan2.5-i2v 使用 resolution 参数: ${requestData.resolution}`);
        }
        
        // i2v 模型需要图片，t2v 模型不需要
        if (!isT2V && images && images.length > 0) {
          requestData.image = images[0];
        }
        
        // 添加随机种子（如果设置）
        if (wan25Seed !== undefined && wan25Seed > 0) {
          requestData.seed = wan25Seed;
        }

        // 添加音频文件（如果上传了OSS URL）
        if (wan25AudioUrl) {
          requestData.audio_url = wan25AudioUrl;
          console.log('🎵 添加音频URL:', wan25AudioUrl);
        }
      }
      // Doubao 模型（使用content格式）
      else {
        // 计算视频尺寸
        const [width, height] = videoAspectRatio === '16:9' 
          ? videoResolution === '720p' ? [1280, 720] : [1920, 1080]
          : videoResolution === '720p' ? [720, 1280] : [1080, 1920];

        requestData.width = width;
        requestData.height = height;
        requestData.seconds = videoDuration;
        requestData.resolution = videoResolution;
        requestData.aspectRatio = videoAspectRatio;
        requestData.duration = videoDuration;
        requestData.durationSeconds = videoDuration;
        requestData.seed = seed !== undefined ? seed : -1;
        requestData.watermark = watermark;
        requestData.camera_fixed = cameraFixed;
        
      if (images && images.length > 0) {
          requestData.input_reference = images[0];
          requestData.image = images[0];
        
        if (imageGenerationMode === 'first_last_frame' && images.length > 1) {
          requestData.lastFrame = images[1];
          }
        }
      }

      const result = await videoGenerateService.submitVideoTask(requestData);

      // 清除进度条动画
      clearInterval(progressInterval);

      // request.ts 在成功时会返回 resData.data，所以 result 已经是 data 对象
      // 根据实际响应结构，task_id 可能在 result.task_id 或 result.output.task_id
      const taskId = (result as any)?.task_id || (result as any)?.output?.task_id;
        
      if (taskId) {
        
        // 更新消息，添加视频占位符（只添加一个，避免重复）
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          
          if (lastMsg && lastMsg.id === aiMessageId) {
            // 如果已经有视频占位符，不重复添加
            if (!lastMsg.generatedVideos || lastMsg.generatedVideos.length === 0) {
              lastMsg.generatedVideos = [{
              id: generateId(),
              url: '',
              taskId,
              prompt,
              timestamp: Date.now(),
              status: 'processing',
              }];
            } else {
              // 如果已有视频占位符，更新第一个的taskId
              lastMsg.generatedVideos[0].taskId = taskId;
              lastMsg.generatedVideos[0].status = 'processing';
            }
            // 不设置content，让视频进度条来显示状态
            lastMsg.content = '';
          }
          
          return newMessages;
        });

        // 开始轮询视频任务状态
        pollVideoTask(aiMessageId, taskId);
      } else {
        // 处理提交失败的错误（result 是 data 对象，不包含 code 和 msg）
        const errorInfo = handleVideoError({ message: '视频任务提交失败：未返回 task_id' });
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.id === aiMessageId) {
            lastMsg.content = errorInfo.message;
            lastMsg.isHtml = errorInfo.isHtml;
            lastMsg.action = errorInfo.action;
          }
          return newMessages;
        });
        throw new Error('视频任务提交失败：未返回 task_id');
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      setProgress(0);
      
      // 处理错误并更新消息
      const errorInfo = handleVideoError(error, error?.code);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.id === aiMessageId) {
          lastMsg.content = errorInfo.message;
          lastMsg.isHtml = errorInfo.isHtml;
          lastMsg.action = errorInfo.action;
          
          // 如果有视频占位符，更新状态为失败
          if (lastMsg.generatedVideos && lastMsg.generatedVideos.length > 0) {
            const video = lastMsg.generatedVideos[lastMsg.generatedVideos.length - 1];
            if (video.status === 'processing') {
              video.status = 'failed';
            }
          }
        }
        return newMessages;
      });
      
      throw error;
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // 轮询视频任务状态
  const pollVideoTask = async (aiMessageId: string, taskId: string) => {
    const maxPollAttempts = 120; // 最多轮询120次（20分钟，每10秒一次）
    const pollInterval = 10000; // 10秒轮询间隔
    let pollAttempts = 0;
    let isPolling = true;

    const poll = async (): Promise<void> => {
      // 检查是否应该停止轮询
      if (!isPolling || pollAttempts >= maxPollAttempts) {
        if (pollAttempts >= maxPollAttempts) {
        // 超时
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.id === aiMessageId && lastMsg.generatedVideos) {
            const video = lastMsg.generatedVideos.find(v => v.taskId === taskId);
            if (video) {
              video.status = 'failed';
            }
              lastMsg.content = '视频生成超时（20分钟），请重试';
          }
          return newMessages;
        });
          setProgress(0);
        }
        return;
      }

      try {
        pollAttempts++;
        console.log(`🔍 轮询查询任务状态 (${pollAttempts}/${maxPollAttempts}):`, taskId);

        // 检查是否被中止
        if (abortControllerRef.current?.signal.aborted) {
          console.log('⏹️ 轮询已中止');
          isPolling = false;
          return;
        }

        const result = await videoGenerateService.queryVideoTask(taskId, abortControllerRef.current?.signal);
        
        // request.ts 在成功时会返回 resData.data，所以 result 已经是 data 对象
        // 如果请求失败，request.ts 会抛出 ApiError，不会到达这里
        const { status, video_url, url, error } = result;
        
        // 使用 video_url 或 url（不同模型可能使用不同的字段名）
        const finalVideoUrl = video_url || url;
          
        console.log('📊 当前任务状态:', status, '完整结果:', result);

          // 根据状态更新进度条
          if (status === 'queued') {
            setProgress(prev => Math.min(30, prev + 3));
          } else if (status === 'in_progress') {
            setProgress(prev => Math.min(95, prev + 5));
          }

          switch (status) {
            case 'queued': {
              console.log('📋 任务排队中...');
              // 等待后继续下一次轮询
              await new Promise(resolve => setTimeout(resolve, pollInterval));
              if (isPolling) {
                videoPollingIntervalRef.current = setTimeout(poll, 0);
              }
              break;
            }

            case 'in_progress': {
              console.log('⚙️ 任务执行中...');
              // 等待后继续下一次轮询
              await new Promise(resolve => setTimeout(resolve, pollInterval));
              if (isPolling) {
                videoPollingIntervalRef.current = setTimeout(poll, 0);
              }
              break;
            }

            case 'succeeded': {
              console.log('✅ 视频生成成功:', result);
              
              let finalVideoUrl = '';

              // 检查是否是 sora-2 模型（需要下载 base64）
              if (selectedModel === 'sora-2') {
                // sora-2 模型：轮询完成后进入下载阶段
                setProgress(100);
                
                console.log('🎬 检测到 sora-2 模型，开始下载视频...');
                console.log('📦 任务结果:', result);

                try {
                  // Sora 2: 从返回的 task_id 或 metadata.id 获取 video_id
                  const videoId = result.task_id || result.metadata?.id || taskId;
                  console.log('🎥 使用 video_id 下载:', videoId);
                  
                  // 使用 video_id 作为 genId 下载
                  const genId = videoId;
                  
                  console.log('📥 下载参数:', { taskId, genId });
                  
                  // 调用下载接口获取 base64 视频
                  let downloadResult: any;
                  try {
                    downloadResult = await videoGenerateService.downloadSoraVideo(taskId, genId, abortControllerRef.current?.signal);
                  } catch (err: any) {
                    if (err?.name === 'AbortError') {
                      isPolling = false;
                      return;
                    }
                    throw err;
                  }
                  
                  if (downloadResult && downloadResult.data_url) {
                    finalVideoUrl = downloadResult.data_url;
                    console.log('✅ Sora 视频下载成功，使用 data_url');
                  } else {
                    throw new Error('下载的视频数据格式不正确');
                  }

                  // Sora-2 视频信息更新到消息中
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg && lastMsg.id === aiMessageId && lastMsg.generatedVideos) {
                      const video = lastMsg.generatedVideos.find(v => v.taskId === taskId);
                      if (video) {
                        video.url = finalVideoUrl;
                        video.status = 'succeeded';
                        video.genId = videoId; // Sora 2: 使用 video_id
                      }
                      lastMsg.content = '视频生成完成！';
                    }
                    return newMessages;
                  });

                } catch (downloadError: any) {
                   console.error('❌ Sora 视频下载失败:', downloadError);
                   
                   // 友好的错误提示
                   const errorMsg = String(downloadError?.message || downloadError || '');
                   
                   // 构造错误信息
                   const errorInfo = handleVideoError({ 
                     message: errorMsg.includes('下载服务异常') ? '视频已生成成功，但下载服务暂时异常，请稍后刷新页面重试或联系管理员' :
                              (errorMsg.includes('timeout') || errorMsg.includes('超时') || errorMsg.includes('Network')) ? '视频已生成成功，但下载时网络连接失败，请检查网络后重试' :
                              '视频下载遇到问题，请稍后重试'
                   });
                   
                   setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg && lastMsg.id === aiMessageId) {
                        lastMsg.content = errorInfo.message;
                        lastMsg.isHtml = errorInfo.isHtml; // Ensure HTML flag is set if needed
                        if (lastMsg.generatedVideos) {
                            const video = lastMsg.generatedVideos.find(v => v.taskId === taskId);
                            if (video) video.status = 'failed';
                        }
                    }
                    return newMessages;
                   });
                   
                   isPolling = false;
                   setProgress(0);
                   return;
                }
              } else {
                 // Veo 和其他模型（非 sora-2）直接使用返回的 URL（data URI 或 HTTP URL）
                 const { video_url, url } = result;
                 finalVideoUrl = video_url || url || '';

                 if (finalVideoUrl) {
                   setProgress(100);
                   
                   setMessages(prev => {
                      const newMessages = [...prev];
                      const lastMsg = newMessages[newMessages.length - 1];
                      if (lastMsg && lastMsg.id === aiMessageId && lastMsg.generatedVideos) {
                        const video = lastMsg.generatedVideos.find(v => v.taskId === taskId);
                        if (video) {
                          video.url = finalVideoUrl;
                          video.status = 'succeeded';
                        }
                        lastMsg.content = '视频生成完成';
                      }
                      return newMessages;
                   });
                 } else {
                   throw new Error('任务成功但未返回视频URL');
                 }
              }

              isPolling = false;

              // 显示任务元数据 (Console log)
              if (result.metadata) {
                const videoId = result.task_id || result.metadata?.id || taskId;
                const genId = result.metadata.generations?.[0]?.id || videoId;
                
                const actualSeconds = result.metadata.seconds
                  ? typeof result.metadata.seconds === 'string'
                    ? parseInt(result.metadata.seconds)
                    : result.metadata.seconds
                  : result.metadata.n_seconds;
                  
                console.log('📊 生成统计:', {
                  task_id: taskId,
                  video_id: videoId,
                  gen_id: genId,
                  model: result.metadata.model,
                  status: result.metadata.status,
                  seconds: actualSeconds,
                  size: result.metadata.size,
                  n_seconds: result.metadata.n_seconds,
                  width: result.metadata.width,
                  height: result.metadata.height,
                  prompt: result.metadata.prompt,
                  resolution: result.metadata.resolution,
                  duration: result.metadata.duration,
                  ratio: result.metadata.ratio,
                  framespersecond: result.metadata.framespersecond,
                });
                
                 // 警告：如果请求时长与实际时长不符
                const expectedSeconds = actualSeconds || result.metadata.n_seconds;
                if (expectedSeconds && videoDuration && expectedSeconds !== videoDuration) {
                   console.warn('⚠️ 时长不匹配:', {
                    请求时长: `${videoDuration}秒`,
                    实际时长: `${expectedSeconds}秒`,
                    可能原因: 'API限制、remix特殊处理或后端调整',
                  });
                }
              }

              // 视频生成成功后自动保存历史记录
              // 使用 setTimeout 确保消息状态已更新后再保存
              setTimeout(() => {
                console.log('💾 视频生成完成，开始自动保存历史记录...');
                autoSaveChat(false).catch((error) => {
                  console.error('❌ 视频生成后自动保存失败:', error);
                  // 静默失败，不影响用户体验
                });
                scrollToBottom();
              }, 500);
            
              return;
            }

            case 'failed': {
              console.error('❌ 视频生成失败:', result);
              setProgress(0);
              isPolling = false;
              
              // 提取错误消息
              const errorMsg = typeof error === 'string' 
                ? error 
                : error?.message || result.metadata?.reason || '视频生成失败';
              
              const errorInfo = handleVideoError({ message: errorMsg });
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMsg = newMessages[newMessages.length - 1];
              if (lastMsg && lastMsg.id === aiMessageId && lastMsg.generatedVideos) {
                const video = lastMsg.generatedVideos.find(v => v.taskId === taskId);
                if (video) {
                  video.status = 'failed';
                }
                  lastMsg.content = errorInfo.message;
                  lastMsg.isHtml = errorInfo.isHtml;
                  lastMsg.action = errorInfo.action;
              }
              return newMessages;
            });
            return;
            }

            default: {
              // 未知状态，继续轮询
              console.log(`⚠️ 未知状态: ${status}，继续轮询...`);
              await new Promise(resolve => setTimeout(resolve, pollInterval));
              if (isPolling) {
                videoPollingIntervalRef.current = setTimeout(poll, 0);
              }
              break;
          }
        }
      } catch (error: any) {
        // 检查是否被中止
        if (error?.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
          console.log('⏹️ 轮询已中止');
          isPolling = false;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.id === aiMessageId) {
              lastMsg.content = '视频生成已取消';
            }
            return newMessages;
          });
          return;
        }

        console.error('查询视频任务状态失败:', error);
        // 网络错误等，继续轮询
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        if (isPolling) {
          videoPollingIntervalRef.current = setTimeout(poll, 0);
        }
      }
    };

    // 等待5秒后开始轮询（让后端有时间处理任务）
    console.log('⏳ 等待5秒后开始轮询查询...');
    videoPollingIntervalRef.current = setTimeout(() => {
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
    <div className="flex h-[calc(100vh-4rem)] bg-surface text-foreground overflow-hidden">
      {/* Left Settings Sidebar */}
      <aside className={`
        ${isSettingsOpen ? 'w-80' : 'w-0'} 
        flex-shrink-0 border-r border-border bg-background transition-all duration-300 flex flex-col relative
      `}>
        {!isSettingsOpen && (
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="absolute left-2 top-2 p-2 rounded-lg bg-surface border border-border z-10"
          >
            <Settings size={20} />
          </button>
        )}

        <div className={`flex flex-col h-full p-5 ${!isSettingsOpen && 'hidden'}`}>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <h2 className="font-bold text-lg">{t.settingsTitle}</h2>
            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="lg:hidden p-1 text-muted hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mode Selector */}
          <div className="mb-6 flex-shrink-0">
            <label className="text-sm font-medium text-muted mb-2 block">{t.functionMode?.title || '功能模式'}</label>
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
                <span className="text-xs">{t.functionMode?.chat || '对话'}</span>
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
                <span className="text-xs">{t.functionMode?.image || '图片'}</span>
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
                <span className="text-xs">{t.functionMode?.video || '视频'}</span>
              </button>
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-3 mb-4 flex-shrink-0">
            <label className="text-sm font-medium text-muted">{t.selectModel}</label>
            <ModelSelect
              value={selectedModel}
              onChange={(val) => {
                setSelectedModel(val);
              }}
              models={models}
              loading={modelsLoading}
              placeholder="暂无可用模型"
              loadingText="加载中..."
            />
          </div>

          {/* Parameters - 可滚动区域 */}
          <div className="flex-shrink-0 max-h-[45%] min-h-0 mb-4 border-b border-border pb-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="space-y-6">
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
                {ModelCapabilities.isDoubaoSeedream4Series(selectedModel) ? (
                  <DoubaoSeedream4SizeSelector
                    value={imageSize}
                    onChange={(size) => setImageSize(size)}
                    t={t}
                  />
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">图片尺寸</label>
                    <select
                      value={selectedModel === 'qwen-image-plus' ? qwenImageSize : imageSize}
                      onChange={(e) => {
                        if (selectedModel === 'qwen-image-plus') {
                          setQwenImageSize(e.target.value);
                        } else {
                          setImageSize(e.target.value);
                        }
                      }}
                      className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    >
                      {getImageSizes(selectedModel).map((size) => (
                        <option key={size.id} value={size.id}>
                          {size.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 创意度 (仅 Gemini 模型) */}
                {(selectedModel === 'gemini-2.5-flash-image-preview' || 
                  selectedModel === 'gemini-2.5-flash-image' || 
                  selectedModel === 'gemini-3-pro-image-preview') && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">创意度</span>
                      <TooltipIcon
                        title="调整创意度"
                        content={
                          <div>
                            <div>0: 输出更精准稳定、少随机创意，适合事实问答</div>
                            <div>2: 表达更多元灵活、富惊喜感，适合脑洞创作</div>
                          </div>
                        }
                        size={16}
                      />
                    </div>
                    <span className="text-primary">{temperature}</span>
                  </div>
                  <input 
                    type="range" min="0" max="2" step="0.1" 
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted">
                    <span>精准稳定</span>
                    <span>灵活创意</span>
                  </div>
                </div>
                )}

                {/* 生成数量 - 排除特定模型 */}
                {!ModelCapabilities.supportsGptImageQuality(selectedModel) && 
                 !ModelCapabilities.supportsQwenImageEditN(selectedModel) &&
                 selectedModel !== 'qwen-image-plus' &&
                 selectedModel !== 'doubao-seedream-4-0-250828' &&
                 selectedModel !== 'doubao-seedream-4-5-251128' &&
                 selectedModel !== 'doubao-seededit-3-0-i2i-250628' &&
                 selectedModel !== 'doubao-seedream-3-0-t2i-250415' &&
                 selectedModel !== 'gemini-2.5-flash-image-preview' &&
                 selectedModel !== 'gemini-2.5-flash-image' &&
                 selectedModel !== 'gemini-3-pro-image-preview' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">生成数量 ({imageN})</label>
                  <input 
                    type="range" min="1" max="4" step="1" 
                    value={imageN}
                    onChange={(e) => setImageN(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                )}

                {/* 随机种子 - 排除特定模型 */}
                {ModelCapabilities.supportsSeed(selectedModel) &&
                 selectedModel !== 'doubao-seededit-3-0-i2i-250628' &&
                 selectedModel !== 'doubao-seedream-3-0-t2i-250415' && (
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

                {/* 引导系数 - 排除特定模型 */}
                {ModelCapabilities.supportsGuidanceScale(selectedModel) &&
                 selectedModel !== 'doubao-seededit-3-0-i2i-250628' &&
                 selectedModel !== 'doubao-seedream-3-0-t2i-250415' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">引导系数 (Guidance Scale)</span>
                        <TooltipIcon
                          title="引导比例系数说明"
                          content={
                            <div>
                              • 控制生成图像与提示词的匹配程度<br />
                              • 数值越高，越严格遵循提示词<br />
                              • 数值越低，AI创意发挥更自由<br />
                              • 建议范围：1.0 - 10.0，默认2.5
                            </div>
                          }
                          size={16}
                        />
                      </div>
                      <span className="text-primary">{guidanceScale}</span>
                  </div>
                  <input 
                      type="range" min="1" max="20" step="0.1" 
                      value={guidanceScale}
                      onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <p className="text-xs text-muted">控制生成图像与提示词的匹配程度，值越高越严格遵循提示词</p>
                </div>
                )}

                {/* 组图功能 (doubao-seedream-4-0) */}
                {ModelCapabilities.supportsSequentialImageGeneration(selectedModel) && (
                <div className="space-y-3 border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <label className="text-sm font-medium">组图功能</label>
                      <TooltipIcon
                        title={t?.sequentialImageGeneration?.multiImageGenerationTitle || '多图生成功能说明'}
                        content={
                          <div>
                            <div className="mb-2">
                              <strong>{t?.sequentialImageGeneration?.enableMultiImageTitle || '一、启用多图生成模式'}</strong>
                              <br />
                              {t?.sequentialImageGeneration?.enableMultiImageDesc || '当开启多图生成功能时，支持基于文本或参考图片生成一组内容关联的图片，具体场景包括：'}
                              <br />
                              <span dangerouslySetInnerHTML={{ __html: t?.sequentialImageGeneration?.textToMultiImage || '1. <strong>文生多图</strong>：仅通过文本提示词，生成一组内容关联的图片，最多可生成4张；' }} />
                              <br />
                              <span dangerouslySetInnerHTML={{ __html: t?.sequentialImageGeneration?.imageToMultiImage || '2. <strong>单图生多图</strong>：上传1张参考图片+补充文本提示词，生成一组与参考图内容关联的图片，最多可生成4张；' }} />
                              <br />
                              <span dangerouslySetInnerHTML={{ __html: t?.sequentialImageGeneration?.multiImageToMultiImage || '3. <strong>多图生多图</strong>：上传2-7张参考图片+补充文本提示词，生成一组与参考图内容关联的图片，且「参考图片总数+生成图片数」不超过11张。' }} />
                            </div>
                            <div>
                              <strong>{t?.sequentialImageGeneration?.disableMultiImageTitle || '二、关闭多图生成模式（默认单图生成）'}</strong>
                              <br />
                              {t?.sequentialImageGeneration?.disableMultiImageDesc || '当关闭多图生成功能时，仅支持基于文本或参考图片生成单张图片，具体场景包括：'}
                              <br />
                              <span dangerouslySetInnerHTML={{ __html: t?.sequentialImageGeneration?.textToSingleImage || '1. <strong>文生单图</strong>：仅通过文本提示词，生成1张符合描述的图片；' }} />
                              <br />
                              <span dangerouslySetInnerHTML={{ __html: t?.sequentialImageGeneration?.imageToSingleImage || '2. <strong>单图生单图</strong>：上传1张参考图片+补充文本提示词，生成1张与参考图内容关联的图片；' }} />
                              <br />
                              <span dangerouslySetInnerHTML={{ __html: t?.sequentialImageGeneration?.multiImageToSingleImage || '3. <strong>多图生单图</strong>：上传2-7张参考图片+补充文本提示词，生成1张融合参考图核心元素的图片。' }} />
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <strong>{t?.sequentialImageGeneration?.importantNote || '重要提示'}</strong>：{t?.sequentialImageGeneration?.importantNoteContent || '最多可生成4张图片，实际数量受文本提示词影响'}
                            </div>
                          </div>
                        }
                        size={14}
                      />
                    </div>
                    <input
                      type="checkbox"
                      checked={sequentialImageGeneration}
                      onChange={(e) => setSequentialImageGeneration(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                  </div>
                  {sequentialImageGeneration && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">生成图像数量 ({sequentialImageGenerationOptions.max_images})</label>
                        <input 
                          type="range" min="1" max={ModelCapabilities.getMaxImagesForDoubaoSeedream4(selectedModel)} step="1" 
                          value={sequentialImageGenerationOptions.max_images}
                          onChange={(e) => setSequentialImageGenerationOptions({
                            ...sequentialImageGenerationOptions,
                            max_images: parseInt(e.target.value)
                          })}
                          className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <p className="text-xs text-muted">{t?.sequentialImageGeneration?.maxImagesNote || '最多可生成4张图片，实际数量受文本提示词影响'}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <label className="text-sm font-medium">提示词优化模式</label>
                          <TooltipIcon
                            title="提示词优化模式"
                            content={
                              <div>
                                <div><strong>标准模式</strong>：质量更高但耗时较长</div>
                                <div><strong>快速模式</strong>：耗时更短但质量一般</div>
                              </div>
                            }
                            size={14}
                          />
                        </div>
                        <select
                          value={optimizePromptOptionsMode}
                          onChange={(e) => setOptimizePromptOptionsMode(e.target.value as 'standard' | 'fast')}
                          className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        >
                          <option value="standard">标准模式</option>
                          {!ModelCapabilities.isDoubaoSeedream4Or45(selectedModel) && (
                            <option value="fast">快速模式</option>
                          )}
                        </select>
                      </div>
                    </>
                  )}
                </div>
                )}

                {/* GPT图片质量 (GPT模型) */}
                {ModelCapabilities.supportsGptImageQuality(selectedModel) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <label className="text-sm font-medium">图片质量</label>
                    <TooltipIcon
                      title="图像质量"
                      content={
                        <div>
                          <div className="mb-2"><strong>标准</strong>：标准画质</div>
                          <div className="mb-2"><strong>高清</strong>：高清画质</div>
                          <div className="mb-2"><strong>超清</strong>：超清画质</div>
                          <div className="mt-2 pt-2 border-t border-gray-200 text-gray-500">
                            💡 质量越高，输出图片的分辨率和细节越好，费用也越高
                          </div>
                        </div>
                      }
                      size={16}
                    />
                  </div>
                  <select
                    value={gptImageQuality}
                    onChange={(e) => setGptImageQuality(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="low">低质量</option>
                    <option value="medium">中等质量</option>
                    <option value="high">高质量</option>
                  </select>
                </div>
                )}

                {/* GPT图片输入保真度 (GPT模型，仅图生图) */}
                {ModelCapabilities.supportsGptImageInputFidelity(selectedModel) && uploadedImages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <label className="text-sm font-medium">细节保留</label>
                    <TooltipIcon
                      title="细节保留说明"
                      content={
                        <div>
                          <div className="mb-2">
                            <strong>Low：创意优先</strong>
                            <div className="ml-4 text-gray-500 text-xs">允许大幅修改原图，适合风格转换、艺术创作</div>
                          </div>
                          <div className="mb-2">
                            <strong>High：细节优先</strong>
                            <div className="ml-4 text-gray-500 text-xs">最大保留原图细节，保留人脸、品牌标识等关键元素</div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-200 text-orange-500 text-xs">
                            ⚠️ 费用说明：选择"High"会显著增加Token消耗，适合需要保留人脸特征或品牌标识的场景
                          </div>
                        </div>
                      }
                      size={16}
                    />
                  </div>
                  <select
                    value={gptImageInputFidelity}
                    onChange={(e) => setGptImageInputFidelity(e.target.value as 'low' | 'high')}
                    className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="low">低</option>
                    <option value="high">高</option>
                  </select>
                </div>
                )}

                {/* GPT生成数量 (GPT模型) */}
                {ModelCapabilities.supportsGptImageQuality(selectedModel) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">生成数量 ({gptImageN})</label>
                  <input 
                    type="range" min="1" max="10" step="1" 
                    value={gptImageN}
                    onChange={(e) => setGptImageN(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                )}

                {/* Qwen提示词扩展 (qwen-image-plus) */}
                {ModelCapabilities.supportsQwenPromptExtend(selectedModel) && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <label className="text-sm font-medium">提示词扩展</label>
                    <TooltipIcon
                      title="提示词扩展"
                      content={
                        <div>
                          <p>开启后，系统会自动扩展和优化您的提示词，使生成的图片更加丰富和精准。</p>
                          <p><strong>建议：</strong>对于简短的提示词，建议开启此功能以获得更好的效果。</p>
                        </div>
                      }
                      size={14}
                    />
                  </div>
                  <input
                    type="checkbox"
                    checked={qwenPromptExtend}
                    onChange={(e) => setQwenPromptExtend(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                </div>
                )}

                {/* Qwen编辑生成数量 (qwen-image-edit) */}
                {ModelCapabilities.supportsQwenImageEditN(selectedModel) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <label className="text-sm font-medium">输出图像数量 ({qwenImageEditN})</label>
                    <TooltipIcon
                      title="生成数量"
                      content={
                        <div>
                          最多可生成6张图片，实际数量受图片内容和编辑复杂度影响
                        </div>
                      }
                      size={16}
                    />
                  </div>
                  <input 
                    type="range" min="1" max="6" step="1" 
                    value={qwenImageEditN}
                    onChange={(e) => setQwenImageEditN(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                )}

                {/* 水印设置 - 豆包模型 */}
                {ModelCapabilities.supportsWatermark(selectedModel) && !selectedModel.startsWith('qwen-image') && (
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

                {/* qwen-image-plus 水印设置 */}
                {selectedModel === 'qwen-image-plus' && (
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">添加水印</label>
                    <input
                      type="checkbox"
                      checked={qwenImageWatermark}
                      onChange={(e) => setQwenImageWatermark(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                  </div>
                )}

                {/* 负面提示词 (qwen-image-plus) */}
                {selectedModel === 'qwen-image-plus' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <label className="text-sm font-medium">负面提示词（可选）</label>
                      <TooltipIcon
                        title="负面提示词"
                        content={
                          <div>
                            <p>描述您不希望在图片中出现的内容、风格或元素。</p>
                            <p>例如：模糊、低质量、文字、水印等</p>
                          </div>
                        }
                        size={16}
                      />
                    </div>
                    <textarea
                      value={qwenNegativePrompt}
                      onChange={(e) => setQwenNegativePrompt(e.target.value)}
                      placeholder="描述您不希望在图片中出现的内容、风格或元素..."
                      className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none h-20"
                      maxLength={500}
                    />
                  </div>
                )}

                {/* qwen-image-edit 负面提示词 */}
                {(selectedModel === 'qwen-image-edit-plus' || selectedModel === 'qwen-image-edit-plus-2025-10-30') && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <label className="text-sm font-medium">负面提示词（可选）</label>
                      <TooltipIcon
                        title="负面提示词（可选）"
                        content={
                          <div>
                            <p>描述您不希望在编辑后的图片中出现的内容、风格或元素。</p>
                            <p><strong>常用示例：</strong></p>
                            <ul className="list-disc list-inside ml-2 mt-1">
                              <li>人物编辑：扭曲、变形、多余的肢体、错误的比例</li>
                              <li>风格迁移：过度渲染、失真、色彩不匹配</li>
                              <li>物体编辑：不自然、违和感、接缝明显</li>
                            </ul>
                          </div>
                        }
                        size={16}
                      />
                    </div>
                    <textarea
                      value={qwenImageEditNegativePrompt}
                      onChange={(e) => setQwenImageEditNegativePrompt(e.target.value)}
                      placeholder="描述您不希望在编辑后的图片中出现的内容、风格或元素..."
                      className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none h-20"
                      maxLength={500}
                    />
                  </div>
                )}

                {/* qwen-image-edit 随机种子 */}
                {(selectedModel === 'qwen-image-edit-plus' || selectedModel === 'qwen-image-edit-plus-2025-10-30') && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <label className="text-sm font-medium">随机种子（可选）</label>
                      <TooltipIcon
                        title="随机种子（可选）"
                        content={
                          <div>
                            <p>使用相同的种子、相同的输入和参数，可以获得相似的生成结果。</p>
                            <p><strong>取值范围：</strong>0 - 2147483647</p>
                            <p><strong>建议：</strong>留空则每次随机生成</p>
                          </div>
                        }
                        size={16}
                      />
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="2147483647"
                      placeholder="留空则每次随机生成"
                      value={qwenImageEditSeed || ''}
                      onChange={(e) => setQwenImageEditSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                )}

                {/* qwen-image-edit 水印设置 */}
                {(selectedModel === 'qwen-image-edit-plus' || selectedModel === 'qwen-image-edit-plus-2025-10-30') && (
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">添加水印</label>
                    <input
                      type="checkbox"
                      checked={qwenImageEditWatermark}
                      onChange={(e) => setQwenImageEditWatermark(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                  </div>
                )}
              </>
            )}

            {/* 视频生成参数 */}
            {currentMode === 'video' && (
              <>
                {/* 图生视频模式选择 (如果模型支持图片上传则显示) */}
                {ModelCapabilities.supportsImageUpload(selectedModel, 'video') && !selectedModel.includes('wan2.5-i2v') && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">生成模式</label>
                  <select
                      value={imageGenerationMode}
                      onChange={(e) => {
                        const newMode = e.target.value;
                        setImageGenerationMode(newMode);
                        // 参考图模式限制
                        if (newMode === 'reference') {
                          if (videoResolution === '1080p') {
                            setVideoResolution('720p');
                          }
                          if (videoAspectRatio === 'adaptive') {
                            setVideoAspectRatio('16:9');
                          }
                          setCameraFixed(false);
                          // 参考图模式只支持一张图片
                          if (uploadedImages.length > 1) {
                            setUploadedImages([uploadedImages[0]]);
                            toast('参考图模式只支持一张图片，已自动保留第一张', { icon: 'ℹ️' });
                          }
                        }
                        // 如果切换到首帧模式，且当前有多张图片，只保留第一张
                        else if (newMode === 'first_frame' && uploadedImages.length > 1) {
                          setUploadedImages([uploadedImages[0]]);
                          toast('首帧模式只支持一张图片，已自动保留第一张', { icon: 'ℹ️' });
                        }
                        // 如果切换到首尾帧模式，且当前只有一张图片，提示用户需要两张
                        else if (newMode === 'first_last_frame' && uploadedImages.length === 1) {
                          toast('首尾帧生成模式需要上传两张图片', { icon: 'ℹ️' });
                        }
                      }}
                    className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                      {ModelCapabilities.getAvailableImageToVideoModes(selectedModel).map((mode) => (
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
                    value={selectedModel.includes('wan2.5') ? wan25Resolution : videoResolution}
                    onChange={(e) => {
                      if (selectedModel.includes('wan2.5')) {
                        setWan25Resolution(e.target.value as '480p' | '720p' | '1080p');
                      } else {
                        setVideoResolution(e.target.value as '720p' | '1080p' | '480p');
                      }
                    }}
                    className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    {getVideoResolutions(selectedModel, imageGenerationMode).map((res) => (
                      <option key={res.id} value={res.id}>{res.name}</option>
                    ))}
                  </select>
                </div>

                {/* 视频宽高比 */}
                {!selectedModel.includes('wan2.5-i2v') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">宽高比</label>
                  <select
                    value={selectedModel.includes('wan2.5-t2v') ? wan25AspectRatio : videoAspectRatio}
                    onChange={(e) => {
                      if (selectedModel.includes('wan2.5-t2v')) {
                        setWan25AspectRatio(e.target.value as '16:9' | '9:16' | '1:1' | '4:3' | '3:4');
                      } else {
                        setVideoAspectRatio(e.target.value as any);
                      }
                    }}
                    className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                      {selectedModel.includes('wan2.5-t2v') 
                        ? ModelCapabilities.getWan25T2VAspectRatios(wan25Resolution).map((ratioId) => {
                            const ratio = VIDEO_RATIOS.find(r => r.id === ratioId);
                            return ratio ? (
                        <option key={ratio.id} value={ratio.id}>{ratio.name}</option>
                            ) : null;
                          })
                        : getVideoRatios(selectedModel, undefined, imageGenerationMode).map((ratio) => (
                            <option key={ratio.id} value={ratio.id}>{ratio.name}</option>
                          ))
                      }
                  </select>
                </div>
                )}

                {/* 视频时长 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">视频时长</label>
                  <select
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(parseInt(e.target.value))}
                    className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    {ModelCapabilities.getVideoDurationOptions(selectedModel).map((dur) => (
                      <option key={dur} value={dur}>{dur}秒</option>
                    ))}
                  </select>
                </div>

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

                {/* Wan2.5 音频上传 */}
                {ModelCapabilities.supportsAudioUpload(selectedModel) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">音频文件 (可选)</label>
                    {!wan25AudioFile ? (
                      <label className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                        <input
                          type="file"
                          accept=".wav,.mp3"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleAudioUpload(file);
                          }}
                          className="hidden"
                        />
                        <span className="text-sm text-muted">🎵 上传音频 (WAV/MP3, 最大15MB)</span>
                      </label>
                    ) : (
                      <div className="flex items-center justify-between px-3 py-2 bg-surface rounded-lg border border-border">
                        <span className="text-sm truncate flex-1">{wan25AudioFile.name}</span>
                        <button
                          type="button"
                          onClick={removeAudio}
                          className="ml-2 text-red-500 hover:text-red-600 transition-colors"
                          title="移除音频"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Wan2.5 随机种子 */}
                {selectedModel.includes('wan2.5') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">随机种子 (可选)</label>
                    <input
                      type="number"
                      placeholder="默认随机"
                      value={wan25Seed || ''}
                      onChange={(e) => setWan25Seed(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                )}

                {/* 水印设置 (视频模式) */}
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
              </>
            )}
            </div>
          </div>

          {/* History */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
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
          {messages.map((msg, index) => (
            <MessageBubble
              key={msg.id} 
              message={msg}
              onCopy={handleCopy}
              onCopyImage={handleCopyImage}
              onQuoteCode={handleQuoteCode}
              onPreview={(type, url) => setPreviewModal({ isOpen: true, type, url })}
              onDownloadImage={handleDownloadImage}
              onDownloadVideo={handleDownloadVideo}
              onExportMaterial={handleExportMaterial}
              onImageToVideo={handleImageToVideo}
              isExportingMaterial={isExportingMaterial}
              progress={progress}
              onQuote={handleQuoteMessage}
              onResend={handleResendMessage}
              onDelete={handleDeleteMessage}
              onDefineAIRole={handleDefineAIRole}
              currentMode={currentMode}
              isLoading={isLoading}
              isLastMessage={index === messages.length - 1}
              t={t}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div
              className={`border-2 border-border rounded-xl bg-white dark:bg-gray-800 transition-all overflow-hidden focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:shadow-[0_0_0_3px_rgba(102,126,234,0.1)] dark:focus-within:shadow-[0_0_0_3px_rgba(102,126,234,0.2)] ${
                isImageDropEnabled() && isDragOverInput
                  ? 'border-indigo-400 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-900/30'
                  : ''
              }`}
              onDragOver={isImageDropEnabled() ? handleDragOver : undefined}
              onDragLeave={isImageDropEnabled() ? handleDragLeave : undefined}
              onDrop={isImageDropEnabled() ? handleDrop : undefined}
            >
              
              {/* 上传的图片预览 */}
              {uploadedImages.length > 0 && (
                <div className="p-4 pb-0 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex gap-2 flex-wrap">
                  {uploadedImages.map((img, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
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
              
              {/* 输入区域 */}
              <div className="flex items-end p-4 gap-3">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    currentMode === 'chat' 
                      ? t.inputPlaceholders.chat
                      : currentMode === 'image'
                      ? t.inputPlaceholders.image
                      : t.inputPlaceholders.video
                  }
                  disabled={isLoading || !selectedModel}
                  className="flex-1 border-none outline-none text-sm leading-6 resize-none min-h-[20px] max-h-[120px] bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
                  rows={2}
                  style={{ 
                    lineHeight: '1.2',
                    fontFamily: 'inherit'
                  }}
                />
                
                {/* 图片上传按钮 - 只有支持图片上传的模型才显示 */}
                   {currentMode === 'image' && ModelCapabilities.supportsImageUpload(selectedModel, 'image') && (
                  <label className="flex-shrink-0 w-9 h-9 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 cursor-pointer transition-all flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
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
                   {/* 视频模式：只有支持图片上传的模型才显示上传按钮 */}
                   {currentMode === 'video' && ModelCapabilities.supportsImageUpload(selectedModel, 'video') && (
                  <label className="flex-shrink-0 w-9 h-9 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 cursor-pointer transition-all flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
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
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      }`}
                   >
                     <Send size={16} />
                   </button>
                   )}
                 </div>
              
              {/* 底部提示栏 */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-[10px]">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <span className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono text-[0.7rem] font-medium">Enter</span>
                  <span>{t.inputHints.send} ·</span>
                  <span className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono text-[0.7rem] font-medium">Shift + Enter</span>
                  <span>{t.inputHints.newline}</span>
                  {currentMode === 'image' && ModelCapabilities.supportsImageUpload(selectedModel, 'image') && (
                    <span className="text-orange-500 dark:text-orange-400 font-medium">
                      {' '}· {t.inputHints.supportedFormats}: {ModelCapabilities.getFormatDisplayText(selectedModel)} · {t.inputHints.maxSize}: {ModelCapabilities.getMaxFileSize(selectedModel)}MB
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{inputValue.length}/{currentMode === 'chat' ? 10000 : 2000}</span>
              </div>
            </div>
            
            {/* 底部温馨提示 */}
            <p className="text-[10px] text-center text-muted mt-2">
              {t.footerTip || '温馨提示: 所有内容均由AI模型生成,准确性和完整性无法保证,不代表平台的态度或观点'}
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
        confirmText={t.deleteConfirm.confirmText}
        cancelText={t.deleteConfirm.cancelText}
      />

      {/* 预览模态框 */}
      {previewModal.isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewModal({ isOpen: false, type: 'image', url: '' })}
        >
          <div 
            className="relative max-w-7xl max-h-[90vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setPreviewModal({ isOpen: false, type: 'image', url: '' })}
              className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-colors"
              title="关闭"
            >
              <X size={20} />
            </button>

            {/* 复制链接按钮 */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(previewModal.url);
                toast.success(t.toasts.linkCopied);
              }}
              className="absolute top-4 right-16 z-10 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-colors"
              title="复制链接"
            >
              <Copy size={20} />
            </button>

            {/* 预览内容 */}
            {previewModal.type === 'image' ? (
              <img 
                src={previewModal.url} 
                alt="预览图片"
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />
            ) : (
              <video 
                src={previewModal.url} 
                controls
                autoPlay
                className="w-full h-auto max-h-[90vh] rounded-lg"
              />
            )}
          </div>
        </div>
      )}

      {/* 导入素材模态框 */}
      {selectedMaterial && (
        <AddMaterialModal
          isOpen={isAddMaterialModalOpen}
          onClose={() => {
            setIsAddMaterialModalOpen(false);
            setSelectedMaterial(null);
            setIsExportingMaterial(false);
          }}
          onSuccess={() => {
            setIsAddMaterialModalOpen(false);
            setSelectedMaterial(null);
            setIsExportingMaterial(false);
            toast.success(t.toasts.materialImported);
          }}
          initialData={{
            assetUrl: selectedMaterial.url,
            assetId: selectedMaterial.assetId,
            assetName: selectedMaterial.assetName || (selectedMaterial.prompt 
              ? `${selectedMaterial.type === 'image' ? 'AI生图' : 'AI生成视频'}-${selectedMaterial.prompt.slice(0, 10)}`
              : selectedMaterial.type === 'image' ? 'AI生图' : 'AI生成视频'),
            assetType: selectedMaterial.assetType,
            assetTag: selectedMaterial.type === 'image' ? 'AI生图' : 'AI视频生成',
            assetDesc: selectedMaterial.assetDesc || selectedMaterial.prompt || (selectedMaterial.type === 'image' ? 'AI生图' : 'AI生成视频'),
          }}
          disableAssetTypeSelection={true}
          isImportMode={true}
        />
      )}

      {/* 登录框 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={() => {
          setShowAuthModal(false);
          // 登录成功后可以继续发送消息
        }}
        t={t.authModal || {
          loginTitle: '登录',
          tabPassword: '密码登录',
          tabPhone: '手机登录',
          accountLabel: '账号',
          accountPlaceholder: '请输入账号',
          passwordLabel: '密码',
          passwordPlaceholder: '请输入密码',
          phoneLabel: '手机号',
          phonePlaceholder: '请输入手机号',
          codeLabel: '验证码',
          codePlaceholder: '请输入验证码',
          sendCode: '发送验证码',
          codeSent: '验证码已发送',
          signIn: '登录',
          privacyPolicy: '隐私政策',
          terms: '服务条款',
        }}
      />

      {/* AI角色定义弹窗 */}
      <BaseModal
        isOpen={showAIRoleModal}
        onClose={cancelAIRole}
        title={t?.aiRoleDefinition?.title || '定义AI助手角色'}
        width="max-w-2xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t?.aiRoleDefinition?.description || '请定义AI助手的角色和特点，这将影响AI的回复风格和行为方式。'}
          </p>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t?.aiRoleDefinition?.label || 'AI角色定义：'}
            </label>
            <textarea
              value={aiRoleContent}
              onChange={(e) => setAiRoleContent(e.target.value)}
              placeholder={t?.aiRoleDefinition?.placeholder || '例如：你是一位优秀的编程专家，擅长Python、JavaScript等编程语言，能够帮助用户解决各种编程问题...'}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100 resize-y min-h-[120px]"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-indigo-500">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <span>💡</span>
              <span>{t?.aiRoleDefinition?.hint || '提示：'}</span>
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
              {t?.aiRoleDefinition?.tips?.map((tip: string, index: number) => (
                <li key={index}>{tip}</li>
              )) || [
                '可以定义AI的专业领域（如编程、设计、写作等）',
                '可以设置AI的性格特点（如友好、专业、幽默等）',
                '可以指定AI的回复风格（如简洁、详细、创意等）'
              ].map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={cancelAIRole}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              {t?.aiRoleDefinition?.cancel || '取消'}
            </button>
            <button
              onClick={confirmAIRole}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              {t?.aiRoleDefinition?.confirm || '确定'}
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
};

interface MessageBubbleProps {
  message: ExtendedChatMessage;
  onCopy: (content: string) => void;
  onCopyImage?: (imageUrl: string, textContent?: string) => Promise<void>; // 复制图片到剪贴板并添加到输入框
  onQuoteCode?: (code: string) => void;
  onPreview?: (type: 'image' | 'video', url: string) => void;
  onDownloadImage?: (url: string) => void;
  onDownloadVideo?: (url: string) => void;
  onExportMaterial?: (type: 'image' | 'video', url: string, prompt?: string) => void;
  onImageToVideo?: (imageUrl: string, prompt?: string) => void; // 图生视频
  isExportingMaterial?: boolean; // 是否正在导入素材
  progress?: number; // 视频/图片生成进度
  onQuote?: (message: ExtendedChatMessage) => void; // 引用消息
  onResend?: (message: ExtendedChatMessage) => void; // 重新发送
  onDelete?: (messageId: string) => void; // 删除消息
  onDefineAIRole?: (messageId: string) => void; // 定义AI助手角色
  currentMode?: 'chat' | 'image' | 'video'; // 当前模式
  isLoading?: boolean; // 是否正在加载（用于判断生成中状态）
  isLastMessage?: boolean; // 是否是最后一条消息（用于判断是否显示生成中提示）
  t?: any; // 翻译对象
}

// 视频播放器组件，支持fallback到iframe
const VideoPlayer: React.FC<{ url: string }> = ({ url }) => {
  const [useIframe, setUseIframe] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoError = () => {
    console.warn('Video标签加载失败，尝试使用iframe');
    setUseIframe(true);
  };

  if (useIframe) {
    return (
      <iframe
        src={url}
        className="w-full max-w-md aspect-video rounded-lg border border-border"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        frameBorder="0"
      />
    );
  }

  // 先尝试不使用crossOrigin，如果失败再尝试crossOrigin
  return (
    <video
      ref={videoRef}
      src={url}
      controls
      preload="metadata"
      className="w-full max-w-md rounded-lg border border-border"
      onError={(e) => {
        const videoElement = e.currentTarget;
        // 如果还没有设置crossOrigin，先尝试设置
        if (!videoElement.crossOrigin) {
          videoElement.crossOrigin = 'anonymous';
          videoElement.load();
        } else {
          // 如果crossOrigin也失败，使用iframe
          handleVideoError();
        }
      }}
    />
  );
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  onCopy, 
  onCopyImage,
  onQuoteCode, 
  onPreview,
  onDownloadImage,
  t,
  onDownloadVideo,
  onExportMaterial,
  onImageToVideo,
  isExportingMaterial = false,
  progress = 0,
  onQuote,
  onResend,
  onDelete,
  onDefineAIRole,
  currentMode = 'chat',
  isLoading = false,
  isLastMessage = false
}) => {
  const navigate = useNavigate();
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';
  const isWelcomeMessage = message.id === 'welcome';
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
          : isSystem
          ? 'bg-gray-500 border-gray-500 text-white'
          : 'bg-background border-border'}
      `}>
        {isSystem ? (
          <Settings size={16} className="text-white" />
        ) : isAssistant ? (
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
            : isSystem
            ? 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-tl-sm text-foreground'
            : 'bg-background border border-border rounded-tl-sm text-foreground'}
        `}>
          {isSystem ? (
            <div className="text-foreground">
              <div className="flex items-center gap-2 mb-2">
                <Settings size={14} className="text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t?.aiRoleDefinition?.roleLabel || 'AI角色定义'}
                </span>
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          ) : isAssistant ? (
            <div className="markdown-content">
              {/* 如果有正在生成的视频，不显示content文本，只显示视频进度条 */}
              {message.content && message.content.trim() !== '' && !(message.generatedVideos && message.generatedVideos.some(v => v.status === 'processing')) ? (
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
                    a({ href, className, children, ...props }: any) {
                      // 处理定价列表链接
                      if (className?.includes('link-fix-price') || message.action === 'goFixPrice') {
                        return (
                          <a
                            href={href || '#'}
                            className={className}
                            onClick={(e) => {
                              e.preventDefault();
                              navigate('/pricing');
                            }}
                            {...props}
                          >
                            {children}
                          </a>
                        );
                      }
                      // 普通链接
                      return (
                        <a href={href} className={className} {...props}>
                          {children}
                        </a>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : message.isStreaming && currentMode === 'chat' ? (
                <span>思考中...</span>
              ) : null}
              {message.isStreaming && currentMode === 'chat' && (
                <span className="inline-block w-2 h-4 bg-indigo-600 ml-1 animate-pulse"></span>
              )}

              {/* AI生成的视频 - 显示在气泡框内部 */}
              {message.generatedVideos && message.generatedVideos.length > 0 && (
                <div className="mt-3">
                  {(() => {
                    // 只显示第一个视频（处理中的或已完成的）
                    const video = message.generatedVideos[0];
                    return (
                    <div key={video.id} className="relative group">
                      {video.status === 'processing' ? (
                        <div className="px-4 py-3 rounded-lg bg-surface/50 border border-border/50">
                          <div className="flex items-center gap-3">
                            <Loader2 className="animate-spin text-primary" size={20} />
                            <div className="flex-1">
                              <p className="text-sm text-foreground font-medium">
                                {(() => {
                                  // 根据进度显示不同文本
                                  if (progress < 10) return '任务提交成功，等待处理...';
                                  if (progress < 20) return '正在准备生成任务，请稍候...';
                                  return '正在创作精美视频...';
                                })()}
                              </p>
                              <div className="mt-2 flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted font-medium min-w-[3rem] text-right">
                                  {progress}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : video.status === 'succeeded' && video.url ? (
                        <div className="relative group">
                          {/* 先尝试使用video标签，如果失败则使用iframe */}
                          <VideoPlayer url={video.url} />
                          {/* 操作按钮 - 右上角 */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2 z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onPreview?.('video', video.url);
                              }}
                              className="p-1.5 bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-md hover:scale-105 transition-transform backdrop-blur-sm"
                              title="预览"
                            >
                              <Eye size={16} className="text-gray-700 dark:text-gray-300" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDownloadVideo?.(video.url);
                              }}
                              className="p-1.5 bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-md hover:scale-105 transition-transform backdrop-blur-sm"
                              title="下载"
                            >
                              <Download size={16} className="text-gray-700 dark:text-gray-300" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onExportMaterial?.('video', video.url, video.prompt);
                              }}
                              disabled={isExportingMaterial}
                              className={`p-1.5 bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-md transition-transform backdrop-blur-sm ${
                                isExportingMaterial 
                                  ? 'opacity-50 cursor-not-allowed' 
                                  : 'hover:scale-105 cursor-pointer'
                              }`}
                              title={isExportingMaterial ? '正在导入素材...' : '导入素材'}
                            >
                              <svg 
                                className="w-4 h-4 text-gray-700 dark:text-gray-300" 
                                viewBox="0 0 1024 1024" 
                                version="1.1" 
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                              >
                                <path d="M832 464h-64v192c0 44.16-35.84 80-80 80H336c-44.16 0-80-35.84-80-80V464h-64c-17.68 0-32-14.32-32-32V192c0-17.68 14.32-32 32-32h640c17.68 0 32 14.32 32 32v240c0 17.68-14.32 32-32 32zM512 320L336 496h128v128h64V496h128L512 320z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : video.status === 'failed' ? (
                        <div className="w-full aspect-video bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-center">
                          <p className="text-sm text-red-600 dark:text-red-400">视频生成失败</p>
                        </div>
                      ) : null}
                      {video.prompt && (
                        <div className="mt-1 text-xs text-muted">{video.prompt}</div>
                      )}
                    </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ) : (
            message.content && message.content.trim() !== '' && (
              <div className="whitespace-pre-wrap">{message.content}</div>
            )
          )}

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
        {isAssistant && message.generatedImages && message.generatedImages.length > 0 && 
         message.generatedImages.some(img => img.url && img.url.trim() !== '') && (() => {
           const validImages = message.generatedImages.filter(img => img.url && img.url.trim() !== '');
           const imageCount = validImages.length;
           const useGrid = imageCount >= 2;
           
           return (
             <div className={`mt-2 grid grid-cols-1 ${useGrid ? 'sm:grid-cols-2' : ''} gap-3`}>
               {validImages.map((img) => (
                 <div key={img.id} className={`relative group flex flex-col ${!useGrid ? 'items-center' : ''}`}>
                   <div className={`relative ${!useGrid ? 'flex justify-center' : ''}`}>
                     <img 
                       src={img.url} 
                       alt={img.prompt || '生成的图片'}
                       className={`${!useGrid ? 'w-auto h-auto max-w-full max-h-[75vh] object-contain' : 'w-full'} rounded-lg border border-border cursor-pointer`}
                       onClick={() => onPreview?.('image', img.url)}
                     />
                    {/* 操作按钮 - 右上角 */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview?.('image', img.url);
                    }}
                    className="p-1.5 bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-md hover:scale-105 transition-transform backdrop-blur-sm"
                    title="预览"
                  >
                    <Eye size={16} className="text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadImage?.(img.url);
                    }}
                    className="p-1.5 bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-md hover:scale-105 transition-transform backdrop-blur-sm"
                    title="下载"
                  >
                    <Download size={16} className="text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExportMaterial?.('image', img.url, img.prompt);
                    }}
                    disabled={isExportingMaterial}
                    className={`p-1.5 bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-md transition-transform backdrop-blur-sm ${
                      isExportingMaterial 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:scale-105 cursor-pointer'
                    }`}
                    title={isExportingMaterial ? '正在导入素材...' : '导入素材'}
                  >
                    <svg 
                      className="w-4 h-4 text-gray-700 dark:text-gray-300" 
                      viewBox="0 0 1024 1024" 
                      version="1.1" 
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                    >
                      <path d="M832 464h-64v192c0 44.16-35.84 80-80 80H336c-44.16 0-80-35.84-80-80V464h-64c-17.68 0-32-14.32-32-32V192c0-17.68 14.32-32 32-32h640c17.68 0 32 14.32 32 32v240c0 17.68-14.32 32-32 32zM512 320L336 496h128v128h64V496h128L512 320z" />
                    </svg>
                  </button>
                  {onImageToVideo && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onImageToVideo(img.url, img.prompt);
                      }}
                      className="p-1.5 bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-md hover:scale-105 transition-transform backdrop-blur-sm cursor-pointer"
                      title="图生视频"
                    >
                      <Video size={16} className="text-gray-700 dark:text-gray-300" />
                    </button>
                  )}
                    </div>
                   </div>
                   {/* {img.prompt && (
                     <div className={`mt-1 text-xs text-muted ${!useGrid ? 'text-center' : 'truncate'}`}>{img.prompt}</div>
                   )} */}
                 </div>
               ))}
             </div>
           );
         })()}

        {/* 没有图片URL但有revised_prompt时显示文本卡片 */}
        {isAssistant && currentMode === 'image' && message.generatedImages && message.generatedImages.length > 0 && 
         message.generatedImages.some(img => (!img.url || img.url.trim() === '') && img.prompt && img.prompt.trim() !== '') && (
          <div className="mt-2">
            {message.generatedImages
              .filter(img => (!img.url || img.url.trim() === '') && img.prompt && img.prompt.trim() !== '')
              .map((img) => (
              <div 
                key={img.id} 
                className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/30 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                      {img.prompt}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 生成中状态 - 参考旧系统设计（仅图片模式） */}
        {currentMode === 'image' && 
         isAssistant && 
         isLastMessage && 
         (isLoading || message.isStreaming) && 
         (!message.generatedImages || message.generatedImages.length === 0) && (
          <div 
            className="generating-placeholder mt-2"
            style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
              border: '2px dashed rgba(102, 126, 234, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center',
              animation: 'pulse 2s infinite'
            }}
          >
            <div className="generating-content">
              <div 
                className="generating-animation"
                style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}
              >
                <div 
                  className="paint-brush"
                  style={{
                    fontSize: '3rem',
                    animation: 'bounce 2s ease-in-out infinite'
                  }}
                >
                  🖌️
                </div>
                <div 
                  className="sparkles"
                  style={{
                    display: 'flex',
                    gap: '0.5rem'
                  }}
                >
                  <span style={{
                    fontSize: '1.5rem',
                    animation: 'twinkle 1.5s ease-in-out infinite'
                  }}>✨</span>
                  <span style={{
                    fontSize: '1.5rem',
                    animation: 'twinkle 1.5s ease-in-out infinite 0.3s'
                  }}>✨</span>
                  <span style={{
                    fontSize: '1.5rem',
                    animation: 'twinkle 1.5s ease-in-out infinite 0.6s'
                  }}>✨</span>
                </div>
              </div>
              <p 
                className="generating-text"
                style={{
                  fontWeight: 600,
                  color: '#2d3748',
                  fontSize: '1rem',
                  marginBottom: '1rem'
                }}
              >
                {t?.aiCreatingImage || 'AI正在为您创作精美图片...'}
              </p>
              <div 
                className="progress-bar"
                style={{
                  width: '300px',
                  height: '8px',
                  overflow: 'hidden',
                  background: '#e2e8f0',
                  borderRadius: '4px',
                  margin: '0 auto 0.5rem'
                }}
              >
                <div
                  className="progress-fill"
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #667eea, #764ba2)',
                    transition: 'width 0.3s ease',
                    width: `${progress}%`
                  }}
                />
              </div>
              <span 
                className="progress-text"
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#667eea'
                }}
              >
                {progress}%
              </span>
            </div>
          </div>
        )}
                    </div>

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
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            {/* 复制按钮 */}
            {(message.content || message.generatedImages?.length || message.generatedVideos?.length || (isUser && message.images?.length)) && (
            <button
                onClick={async () => {
                  // 图片模式下，优先复制图片（无论是用户上传的图片还是AI生成的图片）
                  if (currentMode === 'image' && onCopyImage) {
                    // 优先检查AI生成的图片
                    if (message.generatedImages?.length && message.generatedImages[0]?.url) {
                      // 如果有文字内容，一起传递
                      await onCopyImage(message.generatedImages[0].url, message.content);
                      return;
                    }
                    // 其次检查用户上传的图片
                    if (isUser && message.images?.length && message.images[0]) {
                      // 如果有文字内容，一起传递
                      await onCopyImage(message.images[0], message.content);
                      return;
                    }
                  }
                  
                  // 非图片模式，或者图片模式下没有图片时，复制文本内容
                  if (message.content) {
                    onCopy(message.content);
                    toast.success('已复制到剪贴板');
                  } else if (message.generatedImages?.length) {
                    const urls = message.generatedImages.map(img => img.url).join('\n');
                    onCopy(urls);
                    toast.success('图片链接已复制');
                  } else if (message.generatedVideos?.length && message.generatedVideos[0]?.url) {
                    onCopy(message.generatedVideos[0].url);
                    toast.success('视频链接已复制');
                  }
                }}
                className="p-1 hover:bg-border rounded transition-colors"
              title="复制"
            >
              <Copy size={12} />
            </button>
          )}
            {/* 定义AI助手角色按钮 - 欢迎消息或system消息 */}
            {onDefineAIRole && currentMode === 'chat' && (isWelcomeMessage || isSystem) && (
              <button
                onClick={() => onDefineAIRole(message.id)}
                className="p-1 hover:bg-border rounded transition-colors"
                title={isSystem ? (t?.aiRoleDefinition?.editRole || '编辑AI角色') : (t?.aiRoleDefinition?.title || '定义AI助手角色')}
              >
                <Settings size={12} />
              </button>
            )}
            {/* 引用按钮 - 只对用户消息和部分AI消息显示，图片模式下如果没有图片则不显示 */}
            {onQuote && (isUser || (isAssistant && message.action !== 'goFixPrice' && message.id !== 'welcome')) && 
              !(currentMode === 'image' && isAssistant && (!message.generatedImages || message.generatedImages.length === 0)) && (
              <button
                onClick={() => onQuote(message)}
                className="p-1 hover:bg-border rounded transition-colors"
                title="引用"
              >
                <Reply size={12} />
              </button>
            )}
            {/* 重新发送按钮 - 只对用户消息显示 */}
            {onResend && isUser && (
              <button
                onClick={() => onResend(message)}
                className="p-1 hover:bg-border rounded transition-colors"
                title="重新发送"
              >
                <RefreshCw size={12} />
              </button>
            )}
            {/* 删除按钮 - 只在对话模式下显示，用户消息和AI消息都显示，但不显示在欢迎消息和system消息上 */}
            {onDelete && currentMode === 'chat' && !isWelcomeMessage && !isSystem && (
              <button
                onClick={() => onDelete(message.id)}
                className="p-1 hover:bg-border rounded transition-colors"
                title={t?.deleteMessage || '删除消息'}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
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
  
  // 添加生成中状态的动画样式（参考旧系统）
  const generatingStyles = `
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-10px);
      }
      60% {
        transform: translateY(-5px);
      }
    }
    
    @keyframes twinkle {
      0%, 100% {
        opacity: 0.3;
        transform: scale(0.8);
      }
      50% {
        opacity: 1;
        transform: scale(1.2);
      }
    }
    
    @keyframes pulse {
      0% {
        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.45);
      }
      50% {
        box-shadow: 0 6px 24px rgba(102, 126, 234, 0.65);
      }
      100% {
        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.45);
      }
    }
  `;
  
  // 检查是否已经添加过动画样式
  if (!document.getElementById('generating-animations')) {
    const animationStyleElement = document.createElement('style');
    animationStyleElement.id = 'generating-animations';
    animationStyleElement.textContent = generatingStyles;
    document.head.appendChild(animationStyleElement);
  }
}
