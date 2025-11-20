import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Settings, Trash2, Save, Plus, RefreshCw, Send, Bot, User, 
  MoreHorizontal, Cpu, MessageSquare, X, Copy, Loader2, Square,
  Image as ImageIcon, Video, MessageCircle
} from 'lucide-react';
import { chatService, ChatMessage, ChatRequest } from '../../services/chatService';
import { modelsService, ModelsVO } from '../../services/modelsService';
import { imageGenerateService, ImageGenerateRequest } from '../../services/imageGenerateService';
import { videoGenerateService, VideoGenerateRequest } from '../../services/videoGenerateService';
import { useAuthStore } from '../../stores/authStore';
import { ChatRecord } from '../../types';

interface ChatPageProps {
  t: {
    settingsTitle: string;
    selectModel: string;
    paramsTitle: string;
    temperature: string;
    temperatureDesc: string;
    presencePenalty: string;
    presencePenaltyDesc: string;
    shortcutsTitle: string;
    actions: {
      clear: string;
      save: string;
      new: string;
      refresh: string;
    };
    historyTitle: string;
    noHistory: string;
    mainTitle: string;
    statusReady: string;
    inputPlaceholder: string;
    send: string;
    welcomeMessage: string;
    footerTip: string;
  };
}

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

const ChatPage: React.FC<ChatPageProps> = ({ t }) => {
  const { user } = useAuthStore();
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
  
  // 视频生成参数
  const [videoDuration, setVideoDuration] = useState(5);
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoResolution, setVideoResolution] = useState<'720p' | '1080p'>('720p');
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [progress, setProgress] = useState(0); // 用于图片/视频生成的进度
  
  // 历史对话相关状态
  const [chatRecords, setChatRecords] = useState<ChatRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const videoPollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 获取模型列表
  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setModelsLoading(true);
      let tags = '对话,思考,推理,上下文,图片理解';
      
      // 根据模式获取不同的模型标签
      if (currentMode === 'image') {
        tags = '图片生成,文生图,图生图';
      } else if (currentMode === 'video') {
        tags = '视频生成,文生视频,图生视频';
      }
      
      const res = await modelsService.getModelsList({
        pageNum: 1,
        pageSize: 100,
        status: 1,
        tags,
      });

      if (res.code === 200 && res.rows) {
        const modelList = Array.isArray(res.rows) ? res.rows : [];
        setModels(modelList);
        if (modelList.length > 0 && !selectedModel) {
          setSelectedModel(modelList[0].modelName || '');
        }
      } else {
        setModels([]);
      }
    } catch (error) {
      console.error('获取模型列表失败:', error);
    } finally {
      setModelsLoading(false);
    }
  };

  // 监听模式切换，重新获取模型列表
  useEffect(() => {
    fetchModels();
  }, [currentMode]);

  // 获取历史对话记录
  const fetchChatRecords = async () => {
    try {
      setRecordsLoading(true);
      const res = await chatService.getChatRecords({
        pageNum: 1,
        pageSize: 10,
        apiType: 'chat-completions',
      });

      console.log('📋 获取对话记录响应:', res);

      let records: ChatRecord[] = [];
      if (res.code === 200) {
        const rows = (res as any).data?.rows || (res as any).rows || [];
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
      setChatRecords(records);
    } catch (error) {
      console.error('❌ 获取对话记录失败:', error);
      setChatRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  };

  // 加载指定的对话记录
  const loadChatRecord = async (recordId: string | number) => {
    try {
      setRecordsLoading(true);
      const res = await chatService.getChatRecordInfo(recordId);

      if (res.code === 200) {
        const recordData = (res as any).data || res;

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
      }
    } catch (error) {
      console.error('❌ 加载对话记录失败:', error);
    } finally {
      setRecordsLoading(false);
    }
  };

  // 删除对话记录
  const deleteChatRecord = async (recordId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定要删除这条对话记录吗？')) {
      return;
    }

    try {
      const res = await chatService.deleteChatRecord(recordId);
      if (res.code === 200) {
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
        await fetchChatRecords();
      }
    } catch (error) {
      console.error('❌ 删除对话记录失败:', error);
    }
  };

  // 初始化时获取历史记录
  useEffect(() => {
    if (user?.nebulaApiId) {
      fetchChatRecords();
    }
  }, [user?.nebulaApiId]);

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
        n: 1,
        responseFormat: 'url',
      };

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
      };

      // 如果有上传的图片，添加图生视频参数
      if (images && images.length > 0) {
        requestData.input_reference = images[0]; // 使用第一张图片作为参考
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">图片尺寸</label>
                  <select
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="1024x1024">1024×1024 (正方形)</option>
                    <option value="1024x1792">1024×1792 (竖屏)</option>
                    <option value="1792x1024">1792×1024 (横屏)</option>
                  </select>
                </div>

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
                </div>
              </>
            )}

            {/* 视频生成参数 */}
            {currentMode === 'video' && (
              <>
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">宽高比</label>
                  <select
                    value={videoAspectRatio}
                    onChange={(e) => setVideoAspectRatio(e.target.value as '16:9' | '9:16')}
                    className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="16:9">16:9 (横屏)</option>
                    <option value="9:16">9:16 (竖屏)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">分辨率</label>
                  <select
                    value={videoResolution}
                    onChange={(e) => setVideoResolution(e.target.value as '720p' | '1080p')}
                    className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Shortcuts */}
          <div className="space-y-4 mb-8 border-b border-border pb-8">
            <h3 className="font-semibold">{t.shortcutsTitle}</h3>
            <div className="grid grid-cols-1 gap-2">
              <ActionButton icon={Trash2} label={t.actions.clear} onClick={handleClear} />
              <ActionButton icon={Save} label={t.actions.save} />
              <ActionButton icon={Plus} label={t.actions.new} onClick={() => {
                handleClear();
                setSelectedRecordId(null);
              }} />
              <ActionButton icon={RefreshCw} label={t.actions.refresh} onClick={fetchChatRecords} />
            </div>
          </div>

          {/* History */}
          <div className="flex-1 min-h-0 flex flex-col">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-semibold">{t.historyTitle}</h3>
               <button
                 onClick={fetchChatRecords}
                 disabled={recordsLoading}
                 className="p-1 text-muted hover:text-foreground transition-colors"
                 title="刷新历史记录"
               >
                 <RefreshCw size={14} className={recordsLoading ? 'animate-spin' : ''} />
               </button>
             </div>
             
             {recordsLoading && chatRecords.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-muted gap-2">
                 <Loader2 size={24} className="animate-spin" />
                 <span className="text-sm">加载中...</span>
               </div>
             ) : chatRecords.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-muted gap-2 opacity-50">
                 <MessageSquare size={32} strokeWidth={1.5} />
                 <span className="text-sm">{t.noHistory}</span>
               </div>
             ) : (
               <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                 {chatRecords.map((record) => (
                   <div
                     key={record.id}
                     onClick={() => loadChatRecord(record.id)}
                     className={`group relative p-2 rounded-lg cursor-pointer transition-colors ${
                       selectedRecordId === record.id
                         ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-100'
                         : 'hover:bg-border/50 text-muted hover:text-foreground'
                     }`}
                   >
                     <div className="flex items-start justify-between gap-2">
                       <div className="flex-1 min-w-0">
                         <div className="text-sm font-medium truncate">{record.title}</div>
                         <div className="text-xs opacity-70 mt-0.5">
                           {record.messageCount} 条消息
                           {record.model && ` · ${record.model}`}
                         </div>
                         <div className="text-xs opacity-50 mt-0.5">
                           {new Date(record.updateTime).toLocaleString('zh-CN', {
                             month: '2-digit',
                             day: '2-digit',
                             hour: '2-digit',
                             minute: '2-digit',
                           })}
                         </div>
                       </div>
                       <button
                         onClick={(e) => deleteChatRecord(record.id, e)}
                         className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-600 transition-opacity"
                         title="删除记录"
                       >
                         <Trash2 size={12} />
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
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
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-xl border border-border bg-surface shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.inputPlaceholder}
                disabled={isLoading || !selectedModel}
                className="w-full max-h-48 min-h-[80px] bg-transparent border-none p-4 text-sm focus:ring-0 resize-none placeholder-muted disabled:opacity-50 disabled:cursor-not-allowed"
                rows={3}
              />
              
              {/* 上传的图片预览 */}
              {uploadedImages.length > 0 && (
                <div className="px-4 py-2 border-b border-border/50 flex gap-2 flex-wrap">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={img} 
                        alt={`上传图片 ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg border border-border"
                      />
                      <button
                        onClick={() => removeUploadedImage(index)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 进度条 */}
              {progress > 0 && progress < 100 && (
                <div className="px-4 py-2 border-b border-border/50">
                  <div className="w-full bg-surface rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between px-3 py-2 border-t border-border/50 bg-background/30 rounded-b-xl">
                 <div className="flex gap-2">
                   {(currentMode === 'image' || currentMode === 'video') && (
                     <label className="p-1.5 text-muted hover:text-foreground hover:bg-border rounded transition-colors cursor-pointer">
                       <input
                         type="file"
                         accept="image/*"
                         multiple
                         onChange={handleImageUpload}
                         className="hidden"
                       />
                       <ImageIcon size={18} />
                     </label>
                   )}
                 </div>
                 
                 <div className="flex items-center gap-3">
                   <span className="text-xs text-muted hidden sm:inline-block">{inputValue.length}/2000</span>
                   {isStreaming ? (
                     <button 
                       onClick={handleStop}
                       className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm flex items-center gap-1"
                     >
                       <Square size={14} fill="currentColor" />
                       <span className="text-xs">停止</span>
                     </button>
                   ) : (
                     <button 
                       onClick={handleSend}
                       disabled={(!inputValue.trim() && uploadedImages.length === 0) || isLoading || !selectedModel}
                       className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                     >
                       <Send size={16} />
                     </button>
                   )}
                 </div>
              </div>
            </div>
            <p className="text-[10px] text-center text-muted mt-2">
              {t.footerTip}
            </p>
          </div>
        </div>

      </main>
    </div>
  );
};

interface MessageBubbleProps {
  message: ExtendedChatMessage;
  onCopy: (content: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onCopy }) => {
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
            <div className="whitespace-pre-wrap">
              {message.content || (message.isStreaming ? '思考中...' : '')}
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
