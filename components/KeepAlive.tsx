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
  // 确保 key 是稳定的字符串，避免因为 location 对象变化导致重新渲染
  const key = cacheKey || location.pathname;
  const { cachedComponents, excludeCachedComponents } = useCacheStore();
  
  // 获取 Outlet Context，用于跨 KeepAlive 传递
  // 注意：useOutletContext 只能在 Router 的上下文中调用
  // 使用 useOutletContext 而不是自定义的 useAppOutletContext，因为 KeepAliveWrapper 是在 Router 内部使用的
  // 且 useAppOutletContext 依赖于 React Router 的 useOutletContext
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
  
  // 关键修复：
  // 移除 saveScrollPosition="screen"，因为我们已经在 CreateHome 中手动处理了滚动恢复。
  // 自动保存滚动位置有时会与手动逻辑冲突，或者在 Portal 切换时导致闪烁。
  // 当 id 变化时，KeepAlive 会卸载旧的并挂载新的，这里 key 必须稳定。
  
  return (
    <KeepAlive 
      id={key} 
      name={key}
      cacheKey={key}
      // 暂时禁用自动滚动恢复，避免闪烁白屏问题
      // saveScrollPosition="screen" 
    >
      {/* 显式检查 context 是否存在，避免传 undefined 进去 */}
      {context ? (
        <AppContext.Provider value={context}>
          {children}
        </AppContext.Provider>
      ) : (
        children
      )}
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
