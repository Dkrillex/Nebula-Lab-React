import React from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import { AliveScope, KeepAlive } from 'react-activation';
import { useCacheStore } from '../stores/cacheStore';
import { AppContext, AppOutletContextType } from '../router/context';

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
  
  // 获取 Outlet Context，用于跨 KeepAlive 传递
  const context = useOutletContext<AppOutletContextType>();
  
  // 优化：如果 context 为空，暂时不渲染 KeepAlive 内部的内容（或渲染 Loading），
  // 避免内部组件因为 Context 丢失而崩溃。
  // 但考虑到某些组件可能不依赖 Context，这里我们至少确保 Provider 接收到的不是 undefined
  
  // 如果在排除列表中，不缓存
  if (excludeCachedComponents.has(key)) {
    return <>{children}</>;
  }

  // 如果 keepAlive 为 true 且不在排除列表中，则缓存
  // 使用 name 属性来标识缓存的组件，id 用于 react-activation 内部管理
  // 使用 AppContext.Provider 传递 context
  // 注意：Provider 必须在 KeepAlive 内部，因为 KeepAlive 可能会导致 context 丢失
  // 但是 KeepAlive 的实现是将 children 渲染到 AliveScope (Portal)
  // 所以 Provider 需要包裹 children 并在 Portal 之后生效
  
  return (
    <KeepAlive 
      id={key} 
      name={key}
      saveScrollPosition="screen"
      cacheKey={key}
    >
      <AppContext.Provider value={context}>
        {children}
      </AppContext.Provider>
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

