import React, { useState, useEffect } from 'react';
import { X, Clock, Search, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import BaseModal from '../../../../../components/BaseModal';
import { labProjectService } from '../../../../../services/labProjectService';
import { LabProjectVO, LabProjectQuery } from '../../../../../types';
import { useAuthStore } from '../../../../../stores/authStore';
import toast from 'react-hot-toast';

interface TaskListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskClick: (projectId: string | number) => void;
}

export const TaskListModal: React.FC<TaskListModalProps> = ({ isOpen, onClose, onTaskClick }) => {
  const [tasks, setTasks] = useState<LabProjectVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState<LabProjectQuery>({
    projectType: '1',
    pageNum: 1,
    pageSize: 20,
  });
  const [searchId, setSearchId] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      loadTasks();
    }
  }, [isOpen, filters, pagination.current]);

  const loadTasks = async () => {
    if (!user?.userId) {
      return;
    }
    
    setLoading(true);
    try {
      const queryParams: LabProjectQuery = {
        ...filters,
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        projectType: '1',
        createBy: user.userId, // 只查询当前用户的项目
      };

      if (searchId) {
        queryParams.projectId = searchId;
      }

      const response = await labProjectService.getProjectList(queryParams);
      
      if (response.code === 200) {
        // 按创建时间倒序排序
        const sortedTasks = response.data.rows.sort((a, b) => {
          const timeA = a.createTime ? new Date(a.createTime).getTime() : 0;
          const timeB = b.createTime ? new Date(b.createTime).getTime() : 0;
          return timeB - timeA;
        });
        setTasks(sortedTasks);
        setPagination(prev => ({
          ...prev,
          total: response.data.total,
        }));
      }
    } catch (error: any) {
      console.error('加载任务列表失败:', error);
      toast.error('加载任务列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    loadTasks();
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, current: newPage }));
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

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="全部任务"
      width="max-w-6xl"
    >
      <div className="space-y-4">
        {/* 筛选栏 */}
        <div className="flex flex-col sm:flex-row gap-3 pb-4 border-b border-border">
          <div className="flex-1 flex items-center gap-2">
            <Search size={16} className="text-muted" />
            <input
              type="text"
              placeholder="请输入任务 ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              搜索
            </button>
          </div>
        </div>

        {/* 任务列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted">加载中...</div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 text-muted">暂无任务</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => {
                const thumbnail = getThumbnail(task);
                const stepLabel = getStepLabel(task);
                const taskId = getTaskId(task);
                const timeStr = formatTime(task.createTime);

                return (
                  <div
                    key={task.id}
                    onClick={() => {
                      onTaskClick(task.id);
                      onClose();
                    }}
                    className="p-4 rounded-lg border border-border hover:bg-surface cursor-pointer transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      {thumbnail ? (
                        <div className="w-16 h-24 flex-shrink-0 rounded overflow-hidden bg-gray-100">
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
                        <div className="w-16 h-24 flex-shrink-0 rounded bg-gray-100 flex items-center justify-center">
                          <span className="text-xs text-muted">无图</span>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate mb-1">{taskId}</div>
                        <div className="flex items-center gap-1 mb-2">
                          <Clock size={12} className="text-muted flex-shrink-0" />
                          <span className="text-xs text-muted">{timeStr}</span>
                        </div>
                        <div>
                          <span className="inline-block px-1.5 py-0.5 text-[10px] bg-primary/10 text-primary rounded">
                            {stepLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4 border-t border-border">
                <button
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className="p-2 rounded-lg border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-muted">
                  {pagination.current} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={pagination.current >= totalPages}
                  className="p-2 rounded-lg border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </BaseModal>
  );
};

