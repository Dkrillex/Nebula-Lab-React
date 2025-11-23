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

  // 如果 keepAlive 为 true 且不在排除列表中，则缓存
  // 使用 name 属性来标识缓存的组件，id 用于 react-activation 内部管理
  return (
    <KeepAlive 
      id={key} 
      name={key}
      saveScrollPosition="screen"
      cacheKey={key}
    >
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

