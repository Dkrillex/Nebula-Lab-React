import React from 'react';
import { ChevronRight, CheckCircle2, Copy, ArrowLeft, Save, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface WorkflowProgressProps {
  step: number;
  videoId?: string;
  projectId?: string | number | null;
  projectIdStr?: string; // 前端生成的项目ID字符串（如 nebula_20251202235959）
  onBack?: () => void;
  onSave?: () => Promise<void>;
  isSaving?: boolean;
  onStepChange?: (step: number) => void; // 支持点击步骤跳转
  canGoBack?: boolean; // 是否允许返回（如果为false，则禁止点击"素材与卖点"返回）
}

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({ 
  step, 
  videoId, 
  projectId,
  projectIdStr,
  onBack,
  onSave,
  isSaving = false,
  onStepChange,
  canGoBack = true, // 默认允许返回
}) => {
  const steps = [
    { id: 1, name: '素材与卖点', active: step === 1, completed: step > 1 },
    { id: 2, name: '选择脚本', active: step === 2, completed: step > 2 },
    { id: 3, name: '编辑分镜', active: step === 3, completed: step > 3 },
    { id: 4, name: '生成视频', active: step === 4, completed: step > 4 },
  ];

  return (
    <div className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* 返回按钮 - 仅在 step === 1 时显示 */}
            {step === 1 && onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors text-sm font-medium text-foreground"
              >
                <ArrowLeft size={16} />
                返回
              </button>
            )}
            {steps.map((s, idx) => (
              <React.Fragment key={s.id}>
                <div 
                  className={`flex items-center gap-2 ${
                    onStepChange && (s.completed || s.active) && !(s.id === 1 && canGoBack === false) ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-default'
                  }`}
                  onClick={() => {
                    // 如果canGoBack为false且点击的是"素材与卖点"（step 1），则不执行
                    if (s.id === 1 && canGoBack === false) {
                      return;
                    }
                    if (onStepChange && (s.completed || s.active)) {
                      onStepChange(s.id);
                    }
                  }}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      s.active
                        ? 'bg-primary text-white'
                        : s.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-surface border border-border text-muted'
                    }`}
                  >
                    {s.completed ? <CheckCircle2 size={16} /> : s.id}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      s.active ? 'text-primary' : s.completed ? 'text-green-600' : 'text-muted'
                    }`}
                  >
                    {s.name}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <ChevronRight
                    size={20}
                    className={`${s.completed ? 'text-green-500' : 'text-border'}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          {(projectIdStr || projectId) && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted">
                <span>项目ID: {projectIdStr || projectId || '未创建'}</span>
                {(projectIdStr || projectId) && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(projectIdStr || String(projectId));
                      toast.success('已复制项目ID');
                    }}
                    className="p-1 hover:bg-surface rounded transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                )}
              </div>
              {onSave && (
                <button
                  onClick={onSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-white dark:bg-zinc-800 text-foreground hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader className="animate-spin" size={14} />
                  ) : (
                    <Save size={14} />
                  )}
                  保存
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

