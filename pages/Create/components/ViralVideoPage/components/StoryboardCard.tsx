import React, { useState, useEffect } from 'react';
import { Loader, CheckCircle2 } from 'lucide-react';
import { VideoStatus } from '../types';

interface StoryboardCardProps {
  index: number;
  images: string[];
  text: string;
  onTextChange?: (text: string) => void;
  videoStatus?: VideoStatus;
  videoUrl?: string;
  videoProgress?: number;
  isGenerating?: boolean;
  onGenerateVideo?: () => void | Promise<void>;
}

export const StoryboardCard: React.FC<StoryboardCardProps> = ({ 
  index, 
  images, 
  text, 
  onTextChange,
  videoStatus,
  videoUrl,
  videoProgress,
  isGenerating,
  onGenerateVideo
}) => {
  const [localText, setLocalText] = useState(text);

  useEffect(() => {
    setLocalText(text);
  }, [text]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setLocalText(newText);
    if (onTextChange) {
      onTextChange(newText);
    }
  };

  return (
    <div className="min-w-[400px] w-[400px] bg-background border border-border rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
      <div className="p-3 border-b border-border text-sm font-bold text-foreground flex items-center justify-between">
        <span>分镜 {index}</span>
        {videoStatus === 'succeeded' && (
          <CheckCircle2 size={16} className="text-green-500" />
        )}
        {isGenerating && (
          <Loader className="animate-spin" size={16} />
        )}
      </div>
      <div className="p-3 flex gap-2 h-64 bg-surface/50">
        {/* 如果视频生成成功，显示视频；否则显示图片 */}
        {videoStatus === 'succeeded' && videoUrl ? (
          <div className="w-full h-full rounded-lg bg-gray-100 dark:bg-zinc-800 overflow-hidden relative border border-border/50">
            <video 
              src={videoUrl} 
              controls
              className="w-full h-full object-contain"
              preload="metadata"
            />
          </div>
        ) : (
          images.map((img, idx) => (
            <div key={idx} className="flex-1 h-full rounded-lg bg-gray-100 dark:bg-zinc-800 overflow-hidden relative border border-border/50">
              <img src={img} alt={`Shot ${idx}`} className="w-full h-full object-contain hover:scale-105 transition-transform duration-500" />
            </div>
          ))
        )}
      </div>
      <div className="p-4 bg-background border-t border-border flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted font-bold uppercase tracking-wider">台词</span>
          <span className="text-[10px] text-muted/60">{localText.length} 字</span>
        </div>
        <div className="relative flex-1 mb-3">
          <textarea 
            value={localText}
            onChange={handleTextChange}
            className="w-full h-24 bg-surface/30 rounded-lg border border-transparent focus:border-indigo-500/50 focus:bg-surface resize-none text-sm text-foreground focus:outline-none p-3 leading-relaxed transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          {videoStatus === 'succeeded' && videoUrl ? (
            <div className="flex-1 text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 size={12} />
              视频已生成
            </div>
          ) : videoStatus === 'processing' ? (
            <div className="flex-1">
              <div className="text-xs text-muted mb-1">生成中 {videoProgress || 0}%</div>
              <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all"
                  style={{ width: `${videoProgress || 0}%` }}
                />
              </div>
            </div>
          ) : videoStatus === 'failed' ? (
            <div className="flex-1 text-xs text-red-600">生成失败</div>
          ) : null}
          <button
            onClick={onGenerateVideo}
            disabled={isGenerating || videoStatus === 'processing'}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {isGenerating || videoStatus === 'processing' ? (
              <>
                <Loader className="animate-spin" size={12} />
                生成中
              </>
            ) : videoStatus === 'succeeded' ? (
              '重新生成'
            ) : (
              '生成视频'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

