import React, { useEffect, useState } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
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
  // Determine the cache key: prefer explicit name -> cacheKey -> pathname
  const key = name || cacheKey || location.pathname;

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
