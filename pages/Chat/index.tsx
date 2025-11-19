import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Settings, Trash2, Save, Plus, RefreshCw, Send, Bot, User, 
  MoreHorizontal, Cpu, MessageSquare, X, Copy, Loader2, Square
} from 'lucide-react';
import { chatService, ChatMessage, ChatRequest } from '../../services/chatService';
import { modelsService, ModelsVO } from '../../services/modelsService';
import { useAuthStore } from '../../stores/authStore';

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

const ChatPage: React.FC<ChatPageProps> = ({ t }) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: t.welcomeMessage,
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [models, setModels] = useState<ModelsVO[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [temperature, setTemperature] = useState(1.0);
  const [presencePenalty, setPresencePenalty] = useState(0.4);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 获取模型列表
  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setModelsLoading(true);
      const res = await modelsService.getModelsList({
        pageNum: 1,
        pageSize: 100,
        status: 1,
        tags: '对话,思考,推理,上下文,图片理解',
      });

      if (res.code === 200 && res.rows) {
        const modelList = res.rows;
        setModels(modelList);
        if (modelList.length > 0 && !selectedModel) {
          setSelectedModel(modelList[0].modelName || '');
        }
      }
    } catch (error) {
      console.error('获取模型列表失败:', error);
    } finally {
      setModelsLoading(false);
    }
  };

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

  // 发送消息
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading || !selectedModel) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputValue.trim();
    setInputValue('');
    setIsLoading(true);
    setIsStreaming(true);

    // 创建AI消息占位符
    const aiMessageId = generateId();
    const aiMsg: ChatMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      reasoning_content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, aiMsg]);

    // 构建消息历史
    const buildMessages = (): ChatRequest['messages'] => {
      const history: ChatRequest['messages'] = [];
      
      // 添加系统提示（可选）
      // history.push({
      //   role: 'system',
      //   content: '你是一个有用的AI助手，请尽力回答用户的问题。',
      // });

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

    // 创建AbortController
    abortControllerRef.current = new AbortController();

    try {
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
          </div>

          {/* Shortcuts */}
          <div className="space-y-4 mb-8 border-b border-border pb-8">
            <h3 className="font-semibold">{t.shortcutsTitle}</h3>
            <div className="grid grid-cols-1 gap-2">
              <ActionButton icon={Trash2} label={t.actions.clear} onClick={handleClear} />
              <ActionButton icon={Save} label={t.actions.save} />
              <ActionButton icon={Plus} label={t.actions.new} onClick={handleClear} />
              <ActionButton icon={RefreshCw} label={t.actions.refresh} onClick={fetchModels} />
            </div>
          </div>

          {/* History */}
          <div className="flex-1 min-h-0 flex flex-col">
             <h3 className="font-semibold mb-4">{t.historyTitle}</h3>
             <div className="flex-1 flex flex-col items-center justify-center text-muted gap-2 opacity-50">
               <MessageSquare size={32} strokeWidth={1.5} />
               <span className="text-sm">{t.noHistory}</span>
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
              
              <div className="flex items-center justify-between px-3 py-2 border-t border-border/50 bg-background/30 rounded-b-xl">
                 <div className="flex gap-2">
                   <button 
                     className="p-1.5 text-muted hover:text-foreground hover:bg-border rounded transition-colors"
                     title="上传图片（暂未实现）"
                   >
                     <Plus size={18} />
                   </button>
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
                       disabled={!inputValue.trim() || isLoading || !selectedModel}
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
  message: ChatMessage;
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
