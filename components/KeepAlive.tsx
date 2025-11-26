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
  
  // 为 useTool 和 product-replace 路由根据查询参数生成不同的 cacheKey
  // 使用 searchParams.toString() 作为依赖项，确保查询参数变化时能正确更新
  const searchParamsString = searchParams.toString();
  
  // 生成包含所有查询参数的完整 key
  const generateKeyWithParams = (pathname: string): string => {
    if (searchParamsString) {
      // 对查询参数进行排序，确保相同参数的不同顺序生成相同的 key
      const sortedParams = Array.from(searchParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
      return `${pathname}?${sortedParams}`;
    }
    return pathname;
  };
  
  const dynamicKey = useMemo(() => {
    // 判断是否为动态路由：
    // 1. 如果 name 为 undefined（由 router/index.tsx 传入，表示需要动态 key）
    // 2. 或者有查询参数存在
    // 满足任一条件就认为是动态路由，需要根据查询参数生成 key
    const isDynamicRoute = name === undefined || searchParamsString.length > 0;
    
    if (name || cacheKey) {
      // 如果传入了 name 或 cacheKey
      if (isDynamicRoute && searchParamsString.length > 0) {
        // 如果是动态路由且有查询参数，根据查询参数生成 key（忽略传入的 name）
        return generateKeyWithParams(location.pathname);
      }
      // 非动态路由或动态路由但没有查询参数，使用传入的 name/cacheKey
      return name || cacheKey;
    }
    
    // 如果没有传入 name 或 cacheKey，检查是否有查询参数
    if (searchParamsString.length > 0) {
      // 有查询参数，生成包含查询参数的 key
      return generateKeyWithParams(location.pathname);
    }
    
    // 默认使用 pathname
    return location.pathname;
  }, [name, cacheKey, location.pathname, searchParamsString]);
  
  const key = dynamicKey;
  
  // 使用动态 key 作为 React key，确保不同的工具实例被正确识别
  // 这个 key 用于 KeepAlive 组件，必须包含查询参数以区分不同的实例
  const reactKey = useMemo(() => {
    // 如果有查询参数，生成包含所有查询参数的 key
    // 这样任何带查询参数的路由都能被正确区分
    if (searchParamsString.length > 0) {
      return generateKeyWithParams(location.pathname);
    }
    
    // 没有查询参数，使用动态生成的 key
    return key;
  }, [key, location.pathname, searchParamsString]);

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

  // 使用动态生成的 key 作为 React key，确保不同查询参数的实例被正确区分
  // 如果 router/index.tsx 没有传入 key（undefined），则使用动态生成的 reactKey
  const finalReactKey = reactKey;
  
  return (
    <KeepAlive 
      key={finalReactKey}
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
