import React from 'react';
import { ChevronRight, CheckCircle2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface WorkflowProgressProps {
  step: number;
  videoId?: string;
}

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({ step, videoId }) => {
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
            {steps.map((s, idx) => (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-2">
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
          <div className="flex items-center gap-2 text-sm text-muted">
            <span>项目ID: {videoId || '未创建'}</span>
            {videoId && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(videoId);
                  toast.success('已复制项目ID');
                }}
                className="p-1 hover:bg-surface rounded"
              >
                <Copy size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

