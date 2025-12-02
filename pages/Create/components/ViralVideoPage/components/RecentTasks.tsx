import React, { useState, useEffect } from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { labProjectService } from '../../../../../services/labProjectService';
import { LabProjectVO } from '../../../../../types';
import { useAuthStore } from '../../../../../stores/authStore';
import toast from 'react-hot-toast';

interface RecentTasksProps {
  onTaskClick: (projectId: string | number) => void;
  onShowAllTasks: () => void;
}

export const RecentTasks: React.FC<RecentTasksProps> = ({ onTaskClick, onShowAllTasks }) => {
  const [tasks, setTasks] = useState<LabProjectVO[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    loadRecentTasks();
  }, []);

  const loadRecentTasks = async () => {
    if (!user?.userId) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await labProjectService.getProjectList({
        pageNum: 1,
        pageSize: 10,
        projectType: '1', // 营销视频
        createBy: user.userId, // 只查询当前用户的项目
      });
      
      if (response.code === 200) {
        // 按创建时间倒序排序
        const sortedTasks = response.data.rows.sort((a, b) => {
          const timeA = a.createTime ? new Date(a.createTime).getTime() : 0;
          const timeB = b.createTime ? new Date(b.createTime).getTime() : 0;
          return timeB - timeA;
        });
        setTasks(sortedTasks.slice(0, 10)); // 最多显示10个
      }
    } catch (error: any) {
      console.error('加载最近任务失败:', error);
      toast.error('加载最近任务失败');
    } finally {
      setLoading(false);
    }
  };

  const getThumbnail = (project: LabProjectVO): string | null => {
    if (!project.projectJson) return null;
    try {
      const data = JSON.parse(project.projectJson);
      if (data.uploadedImages && data.uploadedImages.length > 0) {
        return data.uploadedImages[0].url;
      }
      if (data.finalVideoUrl) {
        return data.finalVideoUrl;
      }
    } catch (e) {
      // 忽略解析错误
    }
    return null;
  };

  const getStepLabel = (project: LabProjectVO): string => {
    if (!project.projectJson) return '未开始';
    try {
      const data = JSON.parse(project.projectJson);
      const step = data.step || 0;
      const stepLabels = ['首页', '素材与卖点', '选择脚本', '编辑分镜', '生成视频'];
      return stepLabels[step] || '未知';
    } catch (e) {
      return '未知';
    }
  };

  const formatTime = (timeStr?: string): string => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${month}.${day}生成`;
    } catch (e) {
      return '';
    }
  };

  const getTaskId = (project: LabProjectVO): string => {
    return project.projectId || `任务-${project.id}`;
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium text-foreground">最近任务</h3>
        </div>
        <div className="text-center py-3 text-muted text-xs">加载中...</div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium text-foreground">最近任务</h3>
        </div>
        <div className="text-center py-3 text-muted text-xs">暂无任务</div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-foreground">最近任务</h3>
      </div>
      
      <div className="space-y-1">
        {tasks.map((task) => {
          const thumbnail = getThumbnail(task);
          const stepLabel = getStepLabel(task);
          const taskId = getTaskId(task);
          const timeStr = formatTime(task.createTime);

          return (
            <div
              key={task.id}
              onClick={() => onTaskClick(task.id)}
              className="flex items-start gap-1.5 p-1 rounded border border-border hover:bg-surface cursor-pointer transition-colors group"
            >
              {thumbnail ? (
                <div className="w-8 h-11 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                  <img
                    src={thumbnail}
                    alt={taskId}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-8 h-11 flex-shrink-0 rounded bg-gray-100 flex items-center justify-center">
                  <span className="text-[9px] text-muted">无</span>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-medium text-foreground truncate leading-tight mb-0.5">{stepLabel}</div>
                <div className="text-[9px] text-muted truncate leading-tight">{taskId}</div>
                <div className="text-[9px] text-muted leading-tight mt-0.5">{timeStr}</div>
              </div>
            </div>
          );
        })}
      </div>
      
      <button
        onClick={onShowAllTasks}
        className="w-full mt-2 text-[10px] text-muted hover:text-foreground transition-colors flex items-center justify-center gap-0.5 pt-1 border-t border-border"
      >
        全部任务
        <ChevronRight size={10} />
      </button>
    </div>
  );
};

