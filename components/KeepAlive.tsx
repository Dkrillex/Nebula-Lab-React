import React from 'react';
import { useLocation } from 'react-router-dom';
import { AliveScope, KeepAlive } from 'react-activation';
import { useCacheStore } from '../stores/cacheStore';

interface KeepAliveWrapperProps {
  children: React.ReactNode;
  cacheKey?: string;
  keepAlive?: boolean;
}

/**
 * KeepAlive 包装组件
 * 用于缓存组件状态，类似 Vue 的 keep-alive
 */
const KeepAliveWrapper: React.FC<KeepAliveWrapperProps> = ({
  children,
  cacheKey,
  keepAlive = true,
}) => {
  const location = useLocation();
  const key = cacheKey || location.pathname;
  const { cachedComponents, excludeCachedComponents } = useCacheStore();

  // 检查是否应该缓存
  // 如果 keepAlive 为 false，不缓存
  if (!keepAlive) {
    return <>{children}</>;
  }

  // 如果在排除列表中，不缓存
  if (excludeCachedComponents.has(key)) {
    return <>{children}</>;
  }

  // 如果缓存列表为空或者包含当前 key，则缓存
  // 当缓存列表为空时，默认缓存所有配置了 keepAlive 的组件
  const shouldCache = cachedComponents.size === 0 || cachedComponents.has(key);

  if (!shouldCache) {
    return <>{children}</>;
  }

  return (
    <KeepAlive id={key} name={key} saveScrollPosition="screen">
      {children}
    </KeepAlive>
  );
};

/**
 * KeepAliveProvider
 * 需要在应用根组件中使用，提供 AliveScope
 */
export const KeepAliveProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <AliveScope>{children}</AliveScope>;
};

export default KeepAliveWrapper;

