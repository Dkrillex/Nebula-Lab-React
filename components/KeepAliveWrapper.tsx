import React from 'react';
import { KeepAlive } from 'react-activation';

interface KeepAliveWrapperProps {
  children: React.ReactNode;
  cacheKey: string;
}

/**
 * KeepAliveWrapper 组件
 * 用于在路由配置中包裹需要缓存的页面组件
 * 注意：KeepAlive 不会影响 context 传递，context 是通过 Outlet 传递的
 */
export const KeepAliveWrapper: React.FC<KeepAliveWrapperProps> = ({ children, cacheKey }) => {
  // KeepAlive 包裹组件，但不会影响 React Router 的 context 传递
  // context 是通过 Outlet 传递的，而不是通过 props
  return (
    <KeepAlive 
      id={cacheKey} 
      name={cacheKey} 
      saveScrollPosition="screen"
      cacheKey={cacheKey}
    >
      {children}
    </KeepAlive>
  );
};

