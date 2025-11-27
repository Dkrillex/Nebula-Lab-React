import React from 'react';
import { ChevronRight, ChevronLeft, BookOpen, Trash2, Loader, ArrowRight } from 'lucide-react';
import { WorkflowProgress } from './components/WorkflowProgress';
import { StoryboardCard } from './components/StoryboardCard';
import { TimelineItem } from './components/TimelineItem';
import { Storyboard, StoryboardVideo, ViralVideoPageProps } from './types';

interface EditStoryboardProps {
  t: ViralVideoPageProps['t'];
  step: number;
  videoId?: string;
  storyboard: Storyboard | null;
  editedStoryboard: Storyboard | null;
  storyboardVideos: Record<number, StoryboardVideo>;
  generatingScenes: number[];
  onStepChange: (step: number) => void;
  onUpdateSceneLines: (sceneId: number, lines: string) => void;
  onGenerateSceneVideo: (sceneId: number) => void;
  onGenerateAllSceneVideos: () => void;
}

export const EditStoryboard: React.FC<EditStoryboardProps> = ({
  t,
  step,
  videoId,
  storyboard,
  editedStoryboard,
  storyboardVideos,
  generatingScenes,
  onStepChange,
  onUpdateSceneLines,
  onGenerateSceneVideo,
  onGenerateAllSceneVideos,
}) => {
  return (
    <div className="bg-background min-h-full flex flex-col h-[calc(100vh-64px)]">
      {/* 工作流进度条 */}
      <WorkflowProgress step={step} videoId={videoId} />
      
      {/* Top Navigation Bar */}
      <div className="border-b border-border bg-background p-4 flex items-center justify-between shrink-0">
        <button onClick={() => onStepChange(2)} className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border hover:bg-surface text-sm transition-colors">
          <ChevronLeft size={16} />
          上一步
        </button>

        <div className="flex items-center text-sm text-muted">
          {/* Stepper UI */}
          <div className="flex items-center gap-2 opacity-50 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onStepChange(1)}>1. 素材与卖点</div>
          <ChevronRight size={14} className="mx-2 opacity-30" />
          <div className="flex items-center gap-2 opacity-50 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onStepChange(2)}>2. 选择脚本</div>
          <ChevronRight size={14} className="mx-2 opacity-30" />
          <div className="flex items-center gap-2 font-bold text-indigo-600">3. 编辑分镜</div>
          <ChevronRight size={14} className="mx-2 opacity-30" />
          <div className="flex items-center gap-2 opacity-50">4. 生成视频</div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-100 text-orange-600 text-sm hover:bg-orange-200 transition-colors font-medium">
            <BookOpen size={16} />
            智能混剪教程
          </button>
          <div className="w-px h-6 bg-border"></div>
          <button className="p-2 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={18} />
          </button>
          <button 
            onClick={() => onStepChange(4)}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border hover:bg-surface text-sm transition-colors"
          >
            下一步
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-surface/30">
        <div className="max-w-[1600px] mx-auto">
          {/* Title Row */}
          <div className="flex items-baseline gap-4 mb-6">
            <h2 className="text-2xl font-bold text-foreground">{storyboard?.scriptTitle || editedStoryboard?.scriptTitle || '分镜编辑'}</h2>
            <span className="text-sm text-muted">{storyboard?.scriptSubtitle || editedStoryboard?.scriptSubtitle || ''}</span>
            <span className="text-sm text-muted border-l border-border pl-4 ml-2">预计总时长: {storyboard?.totalDuration || editedStoryboard?.totalDuration || '0s'}</span>
            <button
              onClick={onGenerateAllSceneVideos}
              disabled={generatingScenes.length > 0}
              className="ml-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {generatingScenes.length > 0 ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  生成中 ({generatingScenes.length})
                </>
              ) : (
                '批量生成视频'
              )}
            </button>
          </div>

          {/* Storyboard Cards - Horizontal Scroll */}
          {(editedStoryboard || storyboard) && (
            <div className="flex gap-6 overflow-x-auto pb-6">
              {(editedStoryboard || storyboard).scenes.map((scene) => {
                const video = storyboardVideos[scene.id];
                const isGenerating = generatingScenes.includes(scene.id);
                
                return (
                  <StoryboardCard 
                    key={scene.id}
                    index={scene.id}
                    images={scene.shots.map((shot) => shot.img)}
                    text={scene.lines}
                    onTextChange={(text) => onUpdateSceneLines(scene.id, text)}
                    videoStatus={video?.status}
                    videoUrl={video?.url}
                    videoProgress={video?.progress}
                    isGenerating={isGenerating}
                    onGenerateVideo={() => onGenerateSceneVideo(scene.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Timeline Panel */}
      <div className="h-56 border-t border-border bg-background shrink-0 flex flex-col shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
        {/* Time Ruler */}
        <div className="h-8 border-b border-border flex items-end px-4 text-xs text-muted select-none bg-surface/50">
          <div className="flex-1 flex justify-between px-2">
            <span>00:00</span><span>00:10</span><span>00:20</span><span>00:30</span><span>00:40</span><span>00:50</span>
          </div>
          <div className="w-24 text-right border-l border-border pl-2">
            <span className="cursor-pointer hover:text-foreground flex items-center justify-end gap-1">
              <ArrowRight size={12} className="rotate-90" /> 收起
            </span>
          </div>
        </div>
        {/* Tracks */}
        <div className="flex-1 p-4 overflow-x-auto custom-scrollbar">
          <div className="flex gap-1 h-full items-center pl-2">
            {(editedStoryboard || storyboard)?.scenes.map((scene, idx) => (
              <TimelineItem 
                key={scene.id}
                index={scene.id}
                img={scene.shots[0]?.img || ''}
                width="w-48"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

