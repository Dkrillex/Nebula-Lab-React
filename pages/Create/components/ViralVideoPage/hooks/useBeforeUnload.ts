import { useEffect } from 'react';

interface UseBeforeUnloadProps {
  enabled: boolean;
  message?: string;
}

export const useBeforeUnload = ({ enabled, message = '退出后，商品素材和卖点将被清空' }: UseBeforeUnloadProps) => {
  useEffect(() => {
    if (!enabled) return;

    // 浏览器关闭/刷新提示
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, message]);
};

