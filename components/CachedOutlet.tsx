import React from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';

interface CachedOutletProps {
  context?: any; // 可选的 context，如果提供则使用，否则从 useOutletContext 获取
}

/**
 * CachedOutlet 组件
 * 暂时作为普通 Outlet 使用
 * 缓存功能暂时禁用，待找到合适的实现方式
 */
const CachedOutlet: React.FC<CachedOutletProps> = ({ context: propContext }) => {
  const outletContext = useOutletContext();
  // 优先使用 prop 传入的 context，否则使用 useOutletContext 获取的
  const context = propContext !== undefined ? propContext : outletContext;

  // 暂时完全禁用缓存功能，直接渲染 Outlet
  // 原因：react-activation 的 KeepAlive 需要包裹实际的组件实例，
  // 但在 React Router v6 中使用 useOutlet 获取的组件可能无法正确缓存
  return <Outlet context={context} />;
};

export default CachedOutlet;
