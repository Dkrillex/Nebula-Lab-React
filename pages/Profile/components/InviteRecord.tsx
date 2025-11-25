import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, User, Calendar, Gift } from 'lucide-react';
import { userInviteService, NebulaUserInviteVO } from '../../../services/userInviteService';
import { useAuthStore } from '../../../stores/authStore';
import toast from 'react-hot-toast';

interface InviteRecordProps {
  t?: any;
}

const InviteRecord: React.FC<InviteRecordProps> = ({ t }) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [inviteList, setInviteList] = useState<NebulaUserInviteVO[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(10);

  // 获取邀请记录列表
  const fetchInviteList = useCallback(async () => {
    if (!user?.userId) {
      return;
    }

    setLoading(true);
    try {
      const response = await userInviteService.getUserInviteList({
        channelId: user.userId, // 查询当前用户作为邀请人的记录
        systemId: 3, // Lab 系统
        pageNum,
        pageSize
      });

      if (response && response.rows) {
        setInviteList(response.rows);
        setTotal(response.total || 0);
      }
    } catch (error: any) {
      console.error('Failed to fetch invite list:', error);
      toast.error(error.message || '获取邀请记录失败');
    } finally {
      setLoading(false);
    }
  }, [user?.userId, pageNum, pageSize]);

  useEffect(() => {
    fetchInviteList();
  }, [fetchInviteList]);

  // 格式化时间（后端已返回正确格式，直接返回）
  const formatTime = (time?: string) => {
    return time || '-';
  };

  // 计算总页数
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-foreground">推广邀请记录</h3>
        <p className="text-sm text-muted mt-1">查看通过您的邀请码注册的用户记录</p>
      </div>

      {!loading && inviteList.length === 0 && total === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted" style={{ minHeight: '400px' }}>
          <User size={48} className="mb-4 opacity-50" />
          <p>暂无邀请记录</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto" style={{ minHeight: '400px' }}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-foreground">邀请码</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-foreground">受邀用户账号</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-foreground">注册时间</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-12">
                      <div className="flex items-center justify-center">
                        <Loader2 className="animate-spin text-indigo-600" size={32} />
                      </div>
                    </td>
                  </tr>
                ) : inviteList.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12">
                      <div className="flex flex-col items-center justify-center text-muted">
                        <User size={48} className="mb-4 opacity-50" />
                        <p>暂无邀请记录</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  inviteList.map((item) => (
                    <tr key={item.id} className="border-b border-border hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Gift size={16} className="text-muted" />
                          <span className="text-foreground font-mono">{item.channelInviteCode || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-muted" />
                          <span className="text-foreground">{item.invitedUserName || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-muted" />
                          <span className="text-foreground">{formatTime(item.createTime)}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <div className="text-sm text-muted">
              共 {total} 条记录{totalPages > 0 && `，第 ${pageNum} / ${totalPages} 页`}
            </div>
            {totalPages > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPageNum(1)}
                  disabled={pageNum === 1}
                  className="px-3 py-2 border border-border rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  首页
                </button>
                <button
                  onClick={() => setPageNum((prev) => Math.max(1, prev - 1))}
                  disabled={pageNum === 1}
                  className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <span className="px-4 py-2 text-sm text-foreground">
                  {pageNum} / {totalPages}
                </span>
                <button
                  onClick={() => setPageNum((prev) => Math.min(totalPages, prev + 1))}
                  disabled={pageNum === totalPages}
                  className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
                <button
                  onClick={() => setPageNum(totalPages)}
                  disabled={pageNum === totalPages}
                  className="px-3 py-2 border border-border rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  末页
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default InviteRecord;

