import React from 'react';
import { ModelCardData } from '../../../types';

interface ModelCardProps {
  data: ModelCardData;
  isActive: boolean;
  onClick?: () => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ data, isActive, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        relative w-full bg-white rounded-xl p-5 border transition-all duration-300 cursor-pointer group select-none
        ${isActive 
          ? `border-${data.color}-500 shadow-[0_0_0_1px_rgba(59,130,246,1)] shadow-blue-100` 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-[15px]">{data.name}</h3>
            {data.isNew && (
              <span className="bg-gray-100 text-gray-600 text-[10px] font-medium px-1.5 py-0.5 rounded-[4px]">New</span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-xs text-gray-500">by</span>
            <span className="text-xs font-medium text-gray-700 hover:underline decoration-gray-400">{data.provider}</span>
          </div>
        </div>
        
        {/* Provider Icon */}
        {data.id === 'gemini' ? (
             <div className="w-5 h-5 rounded-full flex items-center justify-center overflow-hidden">
                {/* Google Sparkle Gradient */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                   <defs>
                     <linearGradient id="g_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4285F4" />
                        <stop offset="50%" stopColor="#9B72CB" />
                        <stop offset="100%" stopColor="#D96570" />
                     </linearGradient>
                   </defs>
                   <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" fill="url(#g_grad)" />
                </svg>
             </div>
        ) : data.id === 'gpt' ? (
            <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white">
               <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/></svg>
            </div>
        ) : (
            <div className="w-5 h-5 rounded-full bg-[#d97757] flex items-center justify-center text-white text-[9px] font-bold">
                Ai
            </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-[13px] font-bold text-green-600">{data.stats.tokensPerWeek}</p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">Tokens/wk</p>
        </div>
        <div>
          <p className="text-[13px] font-bold text-gray-900">{data.stats.latency}</p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">Latency</p>
        </div>
        <div>
          <p className={`text-[13px] font-bold ${data.stats.isNegative ? 'text-red-500' : 'text-gray-300'}`}>
            {data.stats.weeklyGrowth}
          </p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">Weekly growth</p>
        </div>
      </div>
      
      {/* Connector Dot for SVG alignment visualization (optional, but SVG draws it) */}
    </div>
  );
};

export default ModelCard;

