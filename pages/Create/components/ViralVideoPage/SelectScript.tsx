import React from 'react';
import { ChevronRight, Clock, LayoutTemplate, Loader } from 'lucide-react';
import { WorkflowProgress } from './components/WorkflowProgress';
import { ScriptOption, Storyboard, ViralVideoPageProps } from './types';

interface SelectScriptProps {
  t: ViralVideoPageProps['t'];
  step: number;
  videoId?: string;
  projectId?: string | number | null;
  projectIdStr?: string;
  availableScripts: ScriptOption[];
  selectedScript: string;
  storyboard: Storyboard | null;
  storyboardsByScriptId?: Record<string, Storyboard>; // 所有脚本的分镜缓存
  isGeneratingScripts: boolean;
  isGeneratingStoryboard: boolean;
  onStepChange: (step: number) => void;
  onScriptSelect: (scriptId: string) => void;
  onConfirmScript: () => void;
  onSave?: () => Promise<void>;
  isSaving?: boolean;
}

export const SelectScript: React.FC<SelectScriptProps> = ({
  t,
  step,
  videoId,
  projectId,
  projectIdStr,
  availableScripts,
  selectedScript,
  storyboard,
  storyboardsByScriptId = {},
  isGeneratingScripts,
  isGeneratingStoryboard,
  onStepChange,
  onScriptSelect,
  onConfirmScript,
  onSave,
  isSaving = false,
}) => {
  // 计算脚本时长：所有分镜的图片总数 × 5秒
  const calculateScriptDuration = (scriptId: string): string => {
    const scriptStoryboard = storyboardsByScriptId[scriptId];
    if (!scriptStoryboard) {
      // 如果分镜未生成，使用脚本的time字段作为占位
      const script = availableScripts.find(s => s.id === scriptId);
      return script?.time || '0s';
    }
    
    // 计算所有分镜的图片总数
    const totalImages = scriptStoryboard.scenes.reduce((sum, scene) => {
      return sum + (scene.shots?.length || 0);
    }, 0);
    
    // 总时长 = 图片数 × 5秒
    const totalSeconds = totalImages * 5;
    
    if (totalSeconds < 60) {
      return `${totalSeconds}s`;
    } else {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return seconds > 0 ? `${minutes}分${seconds}秒` : `${minutes}分钟`;
    }
  };
  return (
    <div className="bg-background min-h-full flex flex-col pb-12">
      {/* 工作流进度条 */}
      <WorkflowProgress 
        step={step} 
        videoId={videoId}
        projectId={projectId}
        projectIdStr={projectIdStr}
        onSave={onSave}
        isSaving={isSaving}
        onStepChange={onStepChange}
        canGoBack={availableScripts.length === 0} // 如果已生成脚本，禁止返回
      />

      {/* Header */}
      <div className="py-8 container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold text-foreground">请选择一个脚本</h1>
        </div>
        <p className="text-xs text-muted">以下内容由AI生成，产品处于持续学习调优阶段，其中可能有不准确或不恰当的信息，不代表平台观点，请您谨慎甄别。</p>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-6xl flex-1 flex flex-col">
        {isGeneratingScripts ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="animate-spin text-indigo-600" size={32} />
            <p className="mt-4 text-muted">正在生成脚本选项...</p>
          </div>
        ) : availableScripts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-muted mb-4">暂无脚本选项</p>
          </div>
        ) : (
          <>
            {/* Script Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
              {availableScripts.map((script) => (
                <button
                  key={script.id}
                  onClick={() => onScriptSelect(script.id)}
                  className={`flex-shrink-0 min-w-[160px] p-4 rounded-xl text-left transition-all border ${
                    selectedScript === script.id 
                      ? 'bg-white dark:bg-zinc-800 border-indigo-500/30 shadow-md' 
                      : 'bg-surface border-transparent hover:bg-white dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="font-bold text-foreground mb-1">{script.title}</div>
                  <div className="text-[10px] text-muted truncate mb-2">{script.subtitle}</div>
                  <div className="flex items-center gap-1 text-[10px] text-muted bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded w-fit">
                    <Clock size={10} />
                    {calculateScriptDuration(script.id)}
                  </div>
                </button>
              ))}
            </div>

            {/* Script Table */}
            {isGeneratingStoryboard ? (
              <div className="flex items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-xl border border-border">
                <div className="text-center">
                  <Loader className="animate-spin text-indigo-600 mx-auto" size={32} />
                  <p className="mt-4 text-muted">正在生成分镜详情...</p>
                </div>
              </div>
            ) : storyboard ? (
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-border shadow-sm overflow-hidden mb-8">
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-surface border-b border-border p-4 text-xs font-bold text-muted uppercase">
                  <div className="col-span-1 text-center">分镜</div>
                  <div className="col-span-2">画面</div>
                  <div className="col-span-4">视频描述</div>
                  <div className="col-span-5">台词</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-border">
                  {storyboard.scenes.map((item, idx) => (
                    <React.Fragment key={item.id || idx}>
                      {/* Shot 1 */}
                      <div className="grid grid-cols-12 p-4 gap-4 hover:bg-surface/30 transition-colors items-start">
                        <div className="col-span-1 flex justify-center pt-2">
                          <span className="font-bold text-lg text-slate-400">{item.scene}</span>
                        </div>
                        <div className="col-span-2">
                          <div className="aspect-video rounded-lg bg-slate-200 overflow-hidden border border-border">
                            <img src={item.shots[0]?.img || ''} alt="Shot 1" className="w-full h-full object-contain" />
                          </div>
                        </div>
                        <div className="col-span-4 text-sm text-foreground pt-1">
                          {item.shots[0]?.desc || ''}
                        </div>
                        {/* Line spans full height of the scene */}
                        <div className="col-span-5 text-sm text-foreground pt-1 row-span-2">
                          {item.lines}
                        </div>
                      </div>

                      {/* Shot 2 (if exists) */}
                      {item.shots[1] && (
                        <div className="grid grid-cols-12 p-4 pt-0 gap-4 hover:bg-surface/30 transition-colors items-start border-none">
                          <div className="col-span-1"></div>
                          <div className="col-span-2">
                            <div className="aspect-video rounded-lg bg-slate-200 overflow-hidden border border-border">
                              <img src={item.shots[1].img} alt="Shot 2" className="w-full h-full object-contain" />
                            </div>
                          </div>
                          <div className="col-span-4 text-sm text-foreground pt-1">
                            {item.shots[1].desc}
                          </div>
                          <div className="col-span-5"></div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-border p-8 text-center text-muted mb-8">
                请选择一个脚本查看分镜详情
              </div>
            )}
          </>
        )}
        
        {/* Bottom Actions */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 flex justify-end items-center mt-auto">
          <button 
            onClick={onConfirmScript}
            disabled={!storyboard}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            喜欢此脚本，就它了
          </button>
        </div>
      </div>
    </div>
  );
};

