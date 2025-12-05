import React, { useState, useEffect } from 'react';
import { Loader, CheckCircle2, Trash2, GripVertical } from 'lucide-react';
import { VideoStatus, Shot } from '../types';

interface StoryboardCardProps {
  index: number;
  sceneIndex: number; // 分镜序号（1, 2, 3...）
  images: Shot[]; // 改为使用 Shot 数组，包含图片和描述
  text: string;
  onTextChange?: (text: string) => void;
  videoStatus?: VideoStatus;
  videoUrl?: string;
  videoProgress?: number;
  isGenerating?: boolean;
  onGenerateVideo?: (shotIndex?: number) => void | Promise<void>; // shotIndex 表示第几个镜头
  onDelete?: () => void;
  isSelected?: boolean;
  onClick?: () => void;
}

export const StoryboardCard: React.FC<StoryboardCardProps> = ({ 
  index,
  sceneIndex,
  images, 
  text, 
  onTextChange,
  videoStatus,
  videoUrl,
  videoProgress,
  isGenerating,
  onGenerateVideo,
  onDelete,
  isSelected = false,
  onClick,
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
    <div 
      className={`min-w-[400px] w-[400px] bg-background border rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all cursor-pointer ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-border'}`}
      onClick={onClick}
    >
      <div className="p-3 border-b border-border text-sm font-bold text-foreground flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical size={16} className="text-muted cursor-move" />
          <span>分镜 {sceneIndex}</span>
        </div>
        <div className="flex items-center gap-2">
          {videoStatus === 'succeeded' && (
            <CheckCircle2 size={16} className="text-green-500" />
          )}
          {isGenerating && (
            <Loader className="animate-spin" size={16} />
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 hover:bg-red-50 hover:text-red-500 rounded transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
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
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ) : (
          /* 显示所有图片，每个图片都有独立的图转视频按钮 */
          images.map((shot, idx) => (
            <div key={idx} className="flex-1 h-full rounded-lg bg-gray-100 dark:bg-zinc-800 overflow-hidden relative border border-border/50 group">
              <img 
                src={shot.img} 
                alt={`Shot ${idx + 1}`} 
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-500" 
              />
              {/* 图转视频按钮 - 悬停时显示 */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onGenerateVideo) {
                      onGenerateVideo(idx);
                    }
                  }}
                  disabled={isGenerating}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="animate-spin" size={12} />
                      生成中
                    </>
                  ) : (
                    '图转视频'
                  )}
                </button>
              </div>
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
        {/* 只在视频未生成成功时显示按钮 */}
        {videoStatus !== 'succeeded' && (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onGenerateVideo) {
                  onGenerateVideo(); // 不传 shotIndex 表示批量生成所有图片
                }
              }}
              disabled={isGenerating || videoStatus === 'pending' || videoStatus === 'processing'}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isGenerating || videoStatus === 'pending' || videoStatus === 'processing' ? (
                <>
                  <Loader className="animate-spin" size={12} />
                  生成中
                </>
              ) : (
                '批量图转视频'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

