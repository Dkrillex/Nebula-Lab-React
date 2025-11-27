import { useState, useEffect, useCallback, useRef } from 'react';

// 默认检查间隔（分钟）
const DEFAULT_INTERVAL = 5;

export interface VersionWatcherOptions {
  enable?: boolean;
  intervalMinutes?: number;
}

/**
 * 监听应用版本更新 Hook
 * 通过轮询 ETag/Last-Modified 检测是否有新版本
 */
export function useVersionWatcher(options: VersionWatcherOptions = {}) {
  const {
    // 只要不是开发环境，或者是 production 开头的模式，都默认启用
    enable = !import.meta.env.DEV || import.meta.env.MODE.includes('production'),
    intervalMinutes = Number(import.meta.env.VITE_APP_CHECK_UPDATES_INTERVAL) || DEFAULT_INTERVAL
  } = options;

  const [hasUpdate, setHasUpdate] = useState(false);
  const lastVersionTagRef = useRef<string | null>(null);
  const checkingRef = useRef(false);

  // 打印初始化配置，辅助排查
  // useEffect(() => {
  //   console.log('[VersionWatcher] Initialized:', { enable, intervalMinutes, mode: import.meta.env.MODE });
  // }, [enable, intervalMinutes]);

  const checkForUpdates = useCallback(async () => {
    if (!enable || checkingRef.current) return;

    try {
      checkingRef.current = true;
      const url = `/?t=${Date.now()}`;

      const response = await fetch(url, {
        method: 'HEAD',
        cache: 'no-cache',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });

      const etag = response.headers.get('etag');
      const lastModified = response.headers.get('last-modified');

      // 组合 tag 以增加鲁棒性
      const currentTag = [etag, lastModified].filter(Boolean).join('-');

      if (!currentTag) return;

      if (lastVersionTagRef.current && lastVersionTagRef.current !== currentTag) {
        console.log('[VersionWatcher] New version detected:', currentTag, 'Old version:', lastVersionTagRef.current);
        setHasUpdate(true);
      } else {
        if (!lastVersionTagRef.current) {
          // 首次加载，记录当前版本
          // console.log('[VersionWatcher] Initial version tag recorded:', currentTag);
        }
        lastVersionTagRef.current = currentTag;
      }
    } catch (error) {
      console.error('[VersionWatcher] Failed to check for updates:', error);
    } finally {
      checkingRef.current = false;
    }
  }, [enable]);

  useEffect(() => {
    // 开发环境调试辅助
    if (import.meta.env.DEV) {
      (window as any).__TRIGGER_VERSION_UPDATE__ = () => {
        console.log('🐛 [Debug] Manually triggering version update prompt...');
        setHasUpdate(true);
      };
      console.log('🔧 版本检测调试模式已就绪: 在控制台输入 window.__TRIGGER_VERSION_UPDATE__() 可测试弹窗');
    }
  }, []);

  useEffect(() => {
    if (!enable) return;

    // 首次检查
    checkForUpdates();

    // 定时检查
    const intervalId = setInterval(checkForUpdates, intervalMinutes * 60 * 1000);

    // 页面可见性变化时检查
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enable, intervalMinutes, checkForUpdates]);

  return { hasUpdate, reload: () => window.location.reload() };
}
