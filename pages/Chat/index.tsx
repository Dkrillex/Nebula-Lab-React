
import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings, Trash2, Save, Plus, RefreshCw, Send, Bot, User, 
  MoreHorizontal, Cpu, MessageSquare, X
} from 'lucide-react';
import { ChatMessage } from '../../types';
import { MODELS } from '../../constants';

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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: t.welcomeMessage,
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODELS[4].id); // Default to GPT-4o-mini
  const [temperature, setTemperature] = useState(1.0);
  const [penalty, setPenalty] = useState(0.4);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true); // Mobile toggle

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "This is a simulated response. In a real application, this would connect to the backend API to generate a response based on the selected model and parameters.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
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
              <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full appearance-none rounded-lg border border-border bg-surface py-2.5 pl-10 pr-8 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              >
                {MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
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
                 <span className="text-primary">{penalty}</span>
               </div>
               <input 
                 type="range" min="-2" max="2" step="0.1" 
                 value={penalty}
                 onChange={(e) => setPenalty(parseFloat(e.target.value))}
                 className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
               />
               <p className="text-xs text-muted leading-tight">{t.presencePenaltyDesc}</p>
            </div>
          </div>

          {/* Shortcuts */}
          <div className="space-y-4 mb-8 border-b border-border pb-8">
            <h3 className="font-semibold">{t.shortcutsTitle}</h3>
            <div className="grid grid-cols-1 gap-2">
              <ActionButton icon={Trash2} label={t.actions.clear} onClick={() => setMessages([])} />
              <ActionButton icon={Save} label={t.actions.save} />
              <ActionButton icon={Plus} label={t.actions.new} />
              <ActionButton icon={RefreshCw} label={t.actions.refresh} />
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
               {MODELS.find(m => m.id === selectedModel)?.name || selectedModel}
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded text-xs font-medium border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              {t.statusReady}
            </div>
            <div className="flex gap-1">
              <button className="p-1.5 text-muted hover:bg-border rounded"><Settings size={16} /></button>
              <button className="p-1.5 text-muted hover:bg-border rounded"><User size={16} /></button>
              <button className="p-1.5 text-muted hover:bg-border rounded"><Trash2 size={16} /></button>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border
                ${msg.role === 'assistant' 
                  ? 'bg-background border-border' 
                  : 'bg-primary border-primary text-white'}
              `}>
                {msg.role === 'assistant' ? (
                   <img src="https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Felix" alt="AI" className="w-6 h-6" />
                ) : (
                   <User size={16} />
                )}
              </div>
              
              <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`
                  px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-sm' 
                    : 'bg-background border border-border rounded-tl-sm text-foreground'}
                `}>
                  {msg.content}
                </div>
                <div className="text-[10px] text-muted px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  {msg.role === 'assistant' && (
                    <span className="ml-2 gap-1 inline-flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyIcon />
                      <SettingsIcon />
                    </span>
                  )}
                </div>
              </div>
            </div>
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
                className="w-full max-h-48 min-h-[80px] bg-transparent border-none p-4 text-sm focus:ring-0 resize-none placeholder-muted"
                rows={3}
              />
              
              <div className="flex items-center justify-between px-3 py-2 border-t border-border/50 bg-background/30 rounded-b-xl">
                 <div className="flex gap-2">
                   <button className="p-1.5 text-muted hover:text-foreground hover:bg-border rounded transition-colors">
                     <Plus size={18} />
                   </button>
                   <button className="p-1.5 text-muted hover:text-foreground hover:bg-border rounded transition-colors">
                     <MoreHorizontal size={18} />
                   </button>
                 </div>
                 
                 <div className="flex items-center gap-3">
                   <span className="text-xs text-muted hidden sm:inline-block">{inputValue.length}/2000</span>
                   <button 
                     onClick={handleSend}
                     disabled={!inputValue.trim()}
                     className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                   >
                     <Send size={16} />
                   </button>
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

const ActionButton = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-sm rounded-lg text-muted hover:bg-surface border border-transparent hover:border-border transition-all group"
  >
    <Icon size={16} className="group-hover:text-foreground" />
    <span className="group-hover:text-foreground">{label}</span>
  </button>
);

const CopyIcon = () => (
  <svg className="w-3 h-3 cursor-pointer hover:text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-3 h-3 cursor-pointer hover:text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

export default ChatPage;
