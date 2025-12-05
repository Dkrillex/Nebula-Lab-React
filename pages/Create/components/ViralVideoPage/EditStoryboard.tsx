import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, BookOpen, Trash2, Loader, ArrowRight } from 'lucide-react';
import { WorkflowProgress } from './components/WorkflowProgress';
import { StoryboardCard } from './components/StoryboardCard';
import { TimelineItem } from './components/TimelineItem';
import { Storyboard, StoryboardVideo, ViralVideoPageProps } from './types';

interface EditStoryboardProps {
  t: ViralVideoPageProps['t'];
  step: number;
  videoId?: string;
  projectId?: string | number | null;
  projectIdStr?: string;
  storyboard: Storyboard | null;
  editedStoryboard: Storyboard | null;
  storyboardVideos: Record<number, StoryboardVideo>;
  generatingScenes: number[];
  onStepChange: (step: number) => void;
  onUpdateSceneLines: (sceneId: number, lines: string) => void;
  onGenerateSceneVideo: (sceneId: number, shotIndex?: number) => void;
  onGenerateAllSceneVideos: () => void;
  onDeleteScene?: (sceneId: number) => void;
  onReorderScenes?: (fromIndex: number, toIndex: number) => void;
  onSelectScene?: (sceneId: number) => void;
  onSave?: () => Promise<void>;
  isSaving?: boolean;
}

export const EditStoryboard: React.FC<EditStoryboardProps> = ({
  t,
  step,
  videoId,
  projectId,
  projectIdStr,
  storyboard,
  editedStoryboard,
  storyboardVideos,
  generatingScenes,
  onStepChange,
  onUpdateSceneLines,
  onGenerateSceneVideo,
  onGenerateAllSceneVideos,
  onDeleteScene,
  onReorderScenes,
  onSelectScene,
  onSave,
  isSaving = false,
}) => {
  const [selectedSceneId, setSelectedSceneId] = useState<number | null>(null);
  const [draggedSceneId, setDraggedSceneId] = useState<number | null>(null);
  const [draggedTimelineIndex, setDraggedTimelineIndex] = useState<number | null>(null);
  const [dragOverSceneId, setDragOverSceneId] = useState<number | null>(null);
  const [dragOverTimelineIndex, setDragOverTimelineIndex] = useState<number | null>(null);

  const currentStoryboard = editedStoryboard || storyboard;

  // 计算预计总时长：所有图片数量 × 5秒
  const totalDuration = useMemo(() => {
    if (!currentStoryboard) return 0;
    const totalImages = currentStoryboard.scenes.reduce((sum, scene) => sum + scene.shots.length, 0);
    return totalImages * 5; // 每张图片5秒
  }, [currentStoryboard]);

  // 检查所有分镜视频是否都已成功生成
  const allVideosGenerated = useMemo(() => {
    if (!currentStoryboard || currentStoryboard.scenes.length === 0) return false;
    return currentStoryboard.scenes.every((scene) => {
      const video = storyboardVideos[scene.id];
      return video && video.status === 'succeeded';
    });
  }, [currentStoryboard, storyboardVideos]);

  // 格式化时长显示
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}分${secs}秒` : `${mins}分钟`;
  };

  // 处理分镜选择
  const handleSceneSelect = (sceneId: number) => {
    setSelectedSceneId(sceneId);
    if (onSelectScene) {
      onSelectScene(sceneId);
    }
  };

  // 处理分镜删除
  const handleDeleteScene = (sceneId: number) => {
    if (window.confirm('确定要删除这个分镜吗？')) {
      if (onDeleteScene) {
        onDeleteScene(sceneId);
      }
    }
  };

  // 处理分镜拖拽开始
  const handleDragStart = (e: React.DragEvent, sceneId: number, isTimeline: boolean = false) => {
    setDraggedSceneId(sceneId);
    if (isTimeline) {
      const index = currentStoryboard?.scenes.findIndex(s => s.id === sceneId) ?? -1;
      setDraggedTimelineIndex(index);
    }
    e.dataTransfer.effectAllowed = 'move';
    // 设置拖拽时的视觉效果
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  // 处理分镜拖拽结束
  const handleDragEnd = () => {
    setDraggedSceneId(null);
    setDraggedTimelineIndex(null);
    setDragOverSceneId(null);
    setDragOverTimelineIndex(null);
  };

  // 处理分镜拖拽进入
  const handleDragEnter = (e: React.DragEvent, targetSceneId: number, isTimeline: boolean = false) => {
    e.preventDefault();
    if (draggedSceneId && draggedSceneId !== targetSceneId) {
      if (isTimeline) {
        const index = currentStoryboard?.scenes.findIndex(s => s.id === targetSceneId) ?? -1;
        setDragOverTimelineIndex(index);
      } else {
        setDragOverSceneId(targetSceneId);
      }
    }
  };

  // 处理分镜拖拽离开
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // 只有当真正离开元素时才清除（不是进入子元素）
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverSceneId(null);
      setDragOverTimelineIndex(null);
    }
  };

  // 处理分镜拖拽放置
  const handleDrop = (e: React.DragEvent, targetSceneId: number, isTimeline: boolean = false) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedSceneId || !onReorderScenes || !currentStoryboard) return;

    const fromIndex = currentStoryboard.scenes.findIndex(s => s.id === draggedSceneId);
    const toIndex = currentStoryboard.scenes.findIndex(s => s.id === targetSceneId);

    if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
      onReorderScenes(fromIndex, toIndex);
    }

    setDraggedSceneId(null);
    setDraggedTimelineIndex(null);
    setDragOverSceneId(null);
    setDragOverTimelineIndex(null);
  };

  // 处理拖拽悬停
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };
  return (
    <div className="bg-background min-h-full flex flex-col h-[calc(100vh-64px)]">
      {/* 工作流进度条 */}
      <WorkflowProgress 
        step={step} 
        videoId={videoId}
        projectId={projectId}
        projectIdStr={projectIdStr}
        onSave={onSave}
        isSaving={isSaving}
        onStepChange={onStepChange}
      />
      
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
          {/* <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-100 text-orange-600 text-sm hover:bg-orange-200 transition-colors font-medium">
            <BookOpen size={16} />
            智能混剪教程
          </button> */}
          <div className="w-px h-6 bg-border"></div>
          <button className="p-2 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={18} />
          </button>
          <button 
            onClick={() => onStepChange(4)}
            disabled={!allVideosGenerated}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border hover:bg-surface text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            <h2 className="text-2xl font-bold text-foreground">{currentStoryboard?.scriptTitle || '分镜编辑'}</h2>
            <span className="text-sm text-muted">{currentStoryboard?.scriptSubtitle || ''}</span>
            <span className="text-sm text-muted border-l border-border pl-4 ml-2">预计总时长: {formatDuration(totalDuration)}</span>
            <button
              onClick={onGenerateAllSceneVideos}
              disabled={generatingScenes.length > 0 || allVideosGenerated}
              className="ml-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {generatingScenes.length > 0 ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  生成中 ({generatingScenes.length})
                </>
              ) : allVideosGenerated ? (
                '全部生成完成'
              ) : (
                '批量生成视频'
              )}
            </button>
          </div>

          {/* Storyboard Cards - Horizontal Scroll */}
          {currentStoryboard && (
            <div className="flex gap-6 overflow-x-auto pb-6">
              {currentStoryboard.scenes.map((scene, sceneIndex) => {
                const video = storyboardVideos[scene.id];
                const isGenerating = generatingScenes.includes(scene.id);
                const isSelected = selectedSceneId === scene.id;
                const isDragging = draggedSceneId === scene.id;
                
                const isDragOver = dragOverSceneId === scene.id;
                
                return (
                  <div
                    key={scene.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, scene.id)}
                    onDragEnd={handleDragEnd}
                    onDragEnter={(e) => handleDragEnter(e, scene.id)}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, scene.id)}
                    className={`flex-shrink-0 transition-all duration-200 ${
                      isDragging 
                        ? 'opacity-40 scale-95 cursor-grabbing' 
                        : isDragOver 
                        ? 'scale-105 ring-2 ring-indigo-400 ring-offset-2' 
                        : 'cursor-grab hover:scale-[1.02]'
                    } ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
                  >
                    <StoryboardCard 
                      index={scene.id}
                      sceneIndex={sceneIndex + 1}
                      images={scene.shots}
                      text={scene.lines}
                      onTextChange={(text) => onUpdateSceneLines(scene.id, text)}
                      videoStatus={video?.status}
                      videoUrl={video?.url}
                      videoProgress={video?.progress}
                      isGenerating={isGenerating}
                      onGenerateVideo={(shotIndex?: number) => onGenerateSceneVideo(scene.id, shotIndex)}
                      onDelete={onDeleteScene ? () => handleDeleteScene(scene.id) : undefined}
                      isSelected={isSelected}
                      onClick={() => handleSceneSelect(scene.id)}
                    />
                  </div>
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
            {currentStoryboard?.scenes.map((scene, idx) => {
              const isSelected = selectedSceneId === scene.id;
              const isDragging = draggedTimelineIndex === idx;
              const isDragOver = dragOverTimelineIndex === idx;
              
              return (
                <div
                  key={scene.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, scene.id, true)}
                  onDragEnd={handleDragEnd}
                  onDragEnter={(e) => handleDragEnter(e, scene.id, true)}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, scene.id, true)}
                  onClick={() => handleSceneSelect(scene.id)}
                  className={`transition-all duration-200 ${
                    isDragging 
                      ? 'opacity-40 scale-95 cursor-grabbing' 
                      : isDragOver 
                      ? 'scale-110 ring-2 ring-indigo-400 ring-offset-1 z-10' 
                      : 'cursor-grab hover:scale-105'
                  } ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
                >
                  <TimelineItem 
                    index={idx + 1}
                    sceneId={scene.id}
                    images={scene.shots.map(shot => shot.img)}
                    width="w-48"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

