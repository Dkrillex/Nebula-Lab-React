import React, { useEffect } from 'react';
import { Outlet, useLocation, useMatches, useOutletContext } from 'react-router-dom';
import KeepAliveWrapper from './KeepAlive';
import { useCacheStore } from '../stores/cacheStore';

/**
 * 路由缓存配置映射
 * 根据路径判断是否需要缓存
 */
const routeCacheConfig: Record<string, boolean> = {
  '/': false, // 首页不缓存
  '/privacy': false, // 隐私页不缓存
  '/create': true,
  '/assets': true,
  '/chat': true,
  '/keys': true,
  '/models': true,
  '/expenses': true,
  '/pricing': true,
  '/price-list': true,
  '/profile': true,
};

/**
 * 检查路径是否需要缓存
 */
const shouldCacheRoute = (pathname: string): boolean => {
  // 检查精确匹配
  if (routeCacheConfig[pathname] !== undefined) {
    return routeCacheConfig[pathname];
  }
  
  // 检查前缀匹配（用于带参数的路由，如 /create?tool=xxx）
  for (const [path, shouldCache] of Object.entries(routeCacheConfig)) {
    if (pathname.startsWith(path) && shouldCache) {
      return true;
    }
  }
  
  return false;
};

/**
 * CachedOutlet 组件
 * 用于在路由切换时缓存组件状态
 * 根据路由的 meta.keepAlive 配置决定是否缓存
 */
const CachedOutlet: React.FC = () => {
  const location = useLocation();
  const context = useOutletContext();
  const { updateCachedComponents } = useCacheStore();

  // 根据当前路由更新缓存列表
  // 类似 Vue3 的实现，只缓存配置了 keepAlive 的路由
  useEffect(() => {
    const cacheKey = location.pathname + location.search;
    const shouldCache = shouldCacheRoute(location.pathname);
    
    if (shouldCache) {
      // 如果应该缓存，添加到缓存列表
      updateCachedComponents([cacheKey]);
    }
  }, [location.pathname, location.search, updateCachedComponents]);

  // 获取当前路由的 keepAlive 配置
  const keepAlive = shouldCacheRoute(location.pathname);
  const cacheKey = location.pathname + location.search;

  return (
    <KeepAliveWrapper cacheKey={cacheKey} keepAlive={keepAlive}>
      <Outlet context={context} />
    </KeepAliveWrapper>
  );
};

export default CachedOutlet;

