import React, { useState, useEffect } from 'react';
import { X, Sparkles, Zap, Shield, Rocket, Palette } from 'lucide-react';

// 版本号 - 更新此版本号将重新显示公告
const ANNOUNCEMENT_VERSION = 'V2.0';
const STORAGE_KEY = `nebula_announcement_${ANNOUNCEMENT_VERSION}`;

interface AnnouncementModalProps {
  // 可选：是否自动检查 localStorage（默认 true）
  autoCheck?: boolean;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ autoCheck = true }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 检查是否需要显示公告
  useEffect(() => {
    if (!autoCheck) {
      setIsOpen(true);
      return;
    }
    
    const hasSeenAnnouncement = localStorage.getItem(STORAGE_KEY);
    if (!hasSeenAnnouncement) {
      // 延迟显示，让页面先加载完成
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoCheck]);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* 顶部渐变装饰 */}
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X size={20} />
        </button>

        {/* 内容区域 */}
        <div className="p-6 pt-8">
          {/* 标题 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                🎉 NebulaLab {ANNOUNCEMENT_VERSION} 发布
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">全新升级，更强大的 AI 体验</p>
            </div>
          </div>

          {/* 更新亮点 */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-100 dark:border-orange-800/30">
                <Palette className="flex-shrink-0 w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">全新 UI 界面</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">焕然一新的视觉设计，更简洁、更高效、更美观的操作体验</p>
                </div>
                </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30">
              <Zap className="flex-shrink-0 w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">全新 AI 对话体验</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">支持切换对话、图片生成、视频生成等在线体验</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800/30">
              <Rocket className="flex-shrink-0 w-5 h-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">模型广场全面升级</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">新增现有模型排行榜,接入超100+主流大模型，一键调用，开箱即用</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800/30">
              <Shield className="flex-shrink-0 w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">数字人 & 创作工坊</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">AI数字人、换脸、图片生成、视频生成等创意工具一站式体验</p>
              </div>
            </div>

            
          </div>

          {/* 底部按钮 */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              开始体验
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
            >
              稍后再看
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;

