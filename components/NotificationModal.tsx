import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import { notificationService, NotificationItem } from '../services/notificationService';
import { Bell, Check, Clock, Trash2, MailOpen, Mail } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [selectedNotice, setSelectedNotice] = useState<NotificationItem | null>(null);
  const { user } = useAuthStore();

  const fetchNotifications = async () => {
    setLoading(true);
    // 静态数据，暂不请求接口
    setNotifications([
      {
        id: 1,
        title: '🎉 NebulaLab 新版本上线',
        content: `亲爱的用户，您好！

我们非常高兴地宣布 NebulaLab 全新版本正式上线！本次更新带来了众多令人期待的新功能和优化：

✨ 新功能亮点：
• AI 换脸 - 一键实现人脸替换，效果自然逼真
• 风格迁移 - 将您的照片转换为艺术大师风格
• 文生图 - 输入文字描述，AI 为您生成精美图片
• 图生视频 - 让静态图片动起来，创造动态内容
• 智能对话 - 接入多种大语言模型，随时为您解答

🚀 性能优化：
• 全新的用户界面，更加简洁美观
• 处理速度大幅提升，等待时间更短
• 移动端适配优化，随时随地创作

💡 温馨提示：
新用户注册即可获得免费体验额度，快来探索 AI 创作的无限可能吧！

感谢您一直以来的支持与信任，我们将持续为您带来更好的产品体验！

NebulaLab 团队`,
        type: 'system',
        status: 'unread',
        createTime: new Date().toISOString(),
        sender: 'NebulaLab 官方'
      }
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, activeTab]);

  const handleMarkAsRead = async (id: string | number) => {
    try {
      await notificationService.markAsRead([id]);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => n.status === 'unread').map(n => n.id);
    if (unreadIds.length === 0) return;
    
    try {
      await notificationService.markAsRead(unreadIds);
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const handleDelete = async (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.delete([id]);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (selectedNotice?.id === id) setSelectedNotice(null);
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => n.status === 'unread');

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Notifications"
      width="max-w-2xl"
    >
      <div className="flex flex-col h-[500px]">
        {/* Tabs & Actions */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'unread'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Unread
            </button>
          </div>
          
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
          >
            <Check size={16} />
            Mark all as read
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden border rounded-xl dark:border-gray-700 relative">
          {/* List */}
          <div className={`flex-1 overflow-y-auto ${selectedNotice ? 'hidden md:block md:w-1/2 border-r dark:border-gray-700' : 'w-full'}`}>
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Loading...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                <Bell size={32} className="opacity-20" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y dark:divide-gray-700">
                {filteredNotifications.map((notice) => (
                  <div
                    key={notice.id}
                    onClick={() => {
                      setSelectedNotice(notice);
                      if (notice.status === 'unread') handleMarkAsRead(notice.id);
                    }}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      selectedNotice?.id === notice.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                    } ${notice.status === 'unread' ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50 opacity-70'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 overflow-hidden">
                        <div className={`mt-1 p-1.5 rounded-full flex-shrink-0 ${
                          notice.status === 'unread' 
                            ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {notice.status === 'unread' ? <Mail size={14} /> : <MailOpen size={14} />}
                        </div>
                        <div className="min-w-0">
                          <h4 className={`text-sm font-medium truncate ${
                            notice.status === 'unread' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {notice.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-0.5">
                            {notice.content}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Clock size={10} />
                              {formatDate(notice.createTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => handleDelete(notice.id, e)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail View */}
          {selectedNotice && (
             <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-800/50 p-6 overflow-y-auto absolute inset-0 md:relative md:inset-auto z-10">
                <div className="flex items-center justify-between mb-6">
                   <button 
                     onClick={() => setSelectedNotice(null)}
                     className="md:hidden text-gray-500 hover:text-gray-700"
                   >
                     ← Back
                   </button>
                   <div className="flex gap-2 ml-auto">
                      <button
                        onClick={(e) => {
                          if(selectedNotice) handleDelete(selectedNotice.id, e);
                        }}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                   </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedNotice.title}
                </h3>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDate(selectedNotice.createTime)}
                  </span>
                  {selectedNotice.sender && (
                    <span>From: {selectedNotice.sender}</span>
                  )}
                </div>

                <div className="prose dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedNotice.content}
                </div>
             </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
};

export default NotificationModal;

