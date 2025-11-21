import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import ModelCard from './ModelCard';
import { ModelCardData } from '../../../types';
import { generateGeminiResponse } from '../service/geminiService';

const MODELS: ModelCardData[] = [
  {
    id: 'gemini',
    name: 'Gemini 3 Pro Preview',
    provider: 'google',
    providerLogo: 'G',
    tags: ['New'],
    isNew: true,
    stats: { tokensPerWeek: '43.7B', latency: '3.3s', weeklyGrowth: '- -' },
    color: 'blue'
  },
  {
    id: 'gpt',
    name: 'GPT - 5',
    provider: 'openai',
    providerLogo: 'O',
    tags: [],
    stats: { tokensPerWeek: '56.0B', latency: '8.8s', weeklyGrowth: '-35.26%', isNegative: true },
    color: 'green'
  },
  {
    id: 'claude',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    providerLogo: 'A',
    tags: [],
    stats: { tokensPerWeek: '587.2B', latency: '1.3s', weeklyGrowth: '-21.14%', isNegative: true },
    color: 'orange'
  },
];

interface RouterDemoProps {
  heroContent?: React.ReactNode;
}

const RouterDemo: React.FC<RouterDemoProps> = ({ heroContent }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  
  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    const targetModelId = activeModelId || 'gemini';
    setActiveModelId(targetModelId);
    setResponse(null);

    setTimeout(async () => {
        const result = await generateGeminiResponse(input);
        setResponse(result);
        setIsProcessing(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleCardClick = (id: string) => {
    setActiveModelId(id === activeModelId ? null : id);
  };

  const getPathAttributes = (isActive: boolean) => ({
    stroke: isActive ? '#8b5cf6' : '#e5e7eb', 
    strokeWidth: isActive ? "2" : "1.5",
    className: isActive ? "beam-animation" : ""
  });

  const getDotFill = (isActive: boolean) => isActive ? "bg-violet-500" : "bg-gray-200";

  const isInputActive = isProcessing || !!activeModelId;

  return (
    // Increased max-width and padding to create more white space on sides
    <div className="w-full max-w-[1600px] mx-auto px-8 lg:px-32 py-10 lg:py-20">
      <div className="relative flex flex-col lg:flex-row items-start justify-between min-h-[500px]">
        
        {/* SVG Layer for Connectors (Desktop Only) */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none z-0">
             <svg className="w-full h-full overflow-visible" viewBox="0 0 1400 560" preserveAspectRatio="none">
                <path 
                    d="M 490 280 L 644 280" 
                    fill="none" 
                    {...getPathAttributes(isInputActive)}
                />
                <path 
                    d="M 644 280 C 700 280, 700 130, 840 130" 
                    fill="none" 
                    {...getPathAttributes(activeModelId === 'gemini')}
                />
                <path 
                    d="M 644 280 C 700 280, 700 280, 840 280" 
                    fill="none" 
                    {...getPathAttributes(activeModelId === 'gpt')}
                />
                <path 
                    d="M 644 280 C 700 280, 700 430, 840 430" 
                    fill="none" 
                    {...getPathAttributes(activeModelId === 'claude')}
                />
             </svg>

             <div className={`absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 left-[35%] top-[50%] ${getDotFill(isInputActive)}`} />
             <div className={`absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 left-[46%] top-[50%] ${getDotFill(isInputActive)}`} />
             
             <div className={`absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2 left-[60%] top-[23.2%] ${getDotFill(activeModelId === 'gemini')}`} />
             <div className={`absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2 left-[60%] top-[50%] ${getDotFill(activeModelId === 'gpt')}`} />
             <div className={`absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2 left-[60%] top-[76.8%] ${getDotFill(activeModelId === 'claude')}`} />
        </div>

        {/* Left Side: Title + Input Area - 35% width for more breathing room */}
        <div className="w-full lg:w-[35%] z-20 relative flex flex-col justify-center self-center min-h-[560px]">
          
          {/* Hero Content - Positioned higher up */}
          <div className="mb-12 lg:absolute lg:top-0 lg:left-0 lg:w-[140%] lg:mb-0 text-left z-30 pointer-events-none pl-2">
             <div className="pointer-events-auto">
                {heroContent}
             </div>
          </div>

          <div 
            className={`
              w-full bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border transition-all duration-300
              ${isProcessing ? 'border-violet-400 ring-1 ring-violet-100' : 'border-gray-200 hover:border-gray-300'}
            `}
          >
            <div className="p-1.5">
                {response ? (
                    <div className="p-4 min-h-[56px]">
                         <div className="flex items-center justify-between mb-2">
                             <span className="text-[10px] uppercase font-bold text-violet-600 tracking-wider">{activeModelId === 'gemini' ? 'Gemini 3 Pro' : activeModelId === 'gpt' ? 'GPT-5' : 'Claude Sonnet'}</span>
                             <button 
                                onClick={() => { setResponse(null); setInput(''); }}
                                className="text-gray-400 hover:text-gray-600"
                             >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                             </button>
                         </div>
                        <p className="text-sm text-gray-800 leading-relaxed">{response}</p>
                    </div>
                ) : (
                    <div className="flex items-center pl-4 pr-1 py-1 h-[52px]">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Start a message..."
                            className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-[15px] focus:outline-none"
                            disabled={isProcessing}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!input.trim() || isProcessing}
                            className={`
                                w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 ml-2
                                ${input.trim() && !isProcessing 
                                    ? 'bg-violet-500 text-white hover:bg-violet-600 shadow-sm' 
                                    : 'bg-gray-50 text-gray-300'
                                }
                            `}
                        >
                            {isProcessing ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <ArrowRight size={18} />
                            )}
                        </button>
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Spacer for visual separation - Increased to 25% */}
        <div className="hidden lg:block w-[25%]"></div>

        {/* Right Side: Model Cards - 40% width */}
        <div className="w-full lg:w-[40%] flex flex-col gap-6 z-20 mt-10 lg:mt-0">
             {/* Header */}
             <div className="flex justify-between items-baseline mb-1 px-1">
                <span className="text-sm font-medium text-gray-500">Featured Models</span>
                <a href="#" className="text-xs text-violet-600 hover:text-violet-700 hover:underline flex items-center gap-0.5 font-medium">
                    View Trending <ArrowUpRight size={12}/>
                </a>
             </div>
             
             {/* Cards Loop */}
             <div className="flex flex-col gap-6">
                {MODELS.map((model) => (
                    <ModelCard 
                        key={model.id} 
                        data={model} 
                        isActive={activeModelId === model.id} 
                        onClick={() => handleCardClick(model.id)}
                    />
                ))}
             </div>
        </div>

      </div>
    </div>
  );
};

export default RouterDemo;
