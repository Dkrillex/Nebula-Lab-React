import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useOutletContext, useSearchParams } from 'react-router-dom';
import { AliveScope, KeepAlive, useAliveController } from 'react-activation';
import { AppContext, AppOutletContextType } from '../router/context';

// Re-export for use in other components
export { AliveScope, useAliveController };

interface KeepAliveBoundaryProps {
  children: React.ReactNode;
  name?: string;     // Unique name for the cache node
  cacheKey?: string; // Alias for name/id if needed
  keepAlive?: boolean;
  saveScrollPosition?: boolean | string;
}

// Global flag to track if we have handled the initial load.
// This resets on page refresh (browser reload).
let isFirstMount = true;

/**
 * Check if the current session started with a reload
 */
const isPageReload = () => {
  if (typeof window === 'undefined' || !window.performance) return false;
  
  const navEntries = window.performance.getEntriesByType('navigation');
  if (navEntries.length > 0) {
    const navEntry = navEntries[0] as PerformanceNavigationTiming;
    return navEntry.type === 'reload';
  } else if (window.performance.navigation) {
     // Deprecated API fallback
     return window.performance.navigation.type === 1;
  }
  return false;
};

/**
 * KeepAliveBoundary
 * 
 * Wraps components with react-activation's KeepAlive.
 * - Handles context bridging for Outlet context.
 * - Supports conditional caching.
 * - Handles refresh-bypass logic: On page refresh, the current route forces a fresh render (bypasses KeepAlive).
 *   Subsequent navigations restore normal KeepAlive behavior.
 */
export const KeepAliveBoundary: React.FC<KeepAliveBoundaryProps> = ({
  children,
  name,
  cacheKey,
  keepAlive = true,
  saveScrollPosition = "screen"
}) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // 为 useTool 路由根据 tool 参数生成不同的 cacheKey
  const dynamicKey = useMemo(() => {
    // 如果已经指定了 name 或 cacheKey，直接使用
    if (name || cacheKey) {
      return name || cacheKey;
    }
    
    // 对于 useTool 路由，根据 tool 查询参数生成不同的 key
    if (location.pathname.includes('/useTool') || location.pathname.includes('/create/useTool')) {
      const toolParam = searchParams.get('tool');
      if (toolParam) {
        // 包含 tool 参数的完整路径作为 cacheKey
        return `${location.pathname}?tool=${toolParam}`;
      }
    }
    
    // 默认使用 pathname
    return location.pathname;
  }, [name, cacheKey, location.pathname, searchParams]);
  
  const key = dynamicKey;
  
  // 使用动态 key 作为 React key，确保不同的工具实例被正确识别
  const reactKey = useMemo(() => {
    // 对于 useTool 路由，包含 tool 参数
    if (location.pathname.includes('/useTool') || location.pathname.includes('/create/useTool')) {
      const toolParam = searchParams.get('tool');
      if (toolParam) {
        return `${location.pathname}?tool=${toolParam}`;
      }
    }
    return key;
  }, [key, location.pathname, searchParams]);

  // Capture the current Outlet context to bridge it across the KeepAlive barrier
  const outletContext = useOutletContext<AppOutletContextType | null>();

  const { drop } = useAliveController();

  // Determine if we should bypass KeepAlive for this specific mount.
  // This is calculated once on initialization.
  const [bypassKeepAlive] = useState(() => {
    // If this is the very first mount of the session AND it's a reload, bypass cache.
    if (isFirstMount && isPageReload()) {
      console.log(`[KeepAlive] Page reload detected. Bypassing cache for initial route: ${key}`);
      return true;
    }
    return false;
  });

  // After the component mounts, mark the initial load as handled.
  // This ensures future navigations (which create new KeepAliveBoundary instances) won't bypass cache.
  useEffect(() => {
    isFirstMount = false;
  }, []);

  // If keepAlive is disabled via props OR if we are in the "Bypass on Reload" mode
  if (!keepAlive || bypassKeepAlive) {
    return (
      <AppContext.Provider value={outletContext}>
        {children}
      </AppContext.Provider>
    );
  }

  return (
    <KeepAlive 
      key={reactKey}
      name={key} 
      id={key} 
      saveScrollPosition={saveScrollPosition}
    >
      <AppContext.Provider value={outletContext}>
        {children}
      </AppContext.Provider>
    </KeepAlive>
  );
};

export default KeepAliveBoundary;
