import React, { Suspense } from 'react';
import { createHashRouter } from 'react-router-dom';
import KeepAliveBoundary from '../components/KeepAlive';
import { coreRoutes } from './routes/core';
import { localRoutes } from './routes/local';
import { AppRouteObject, AuthGuard } from './AuthGuard';
import { AppContext, useAppOutletContext } from './context';

// 加载指示器
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// 递归处理路由配置，添加 Suspense 和 Wrapper
function processRoutes(routes: AppRouteObject[], parentPath = ''): any[] {
  return routes.map(route => {
    const newRoute: any = { ...route };
    
    // Calculate full path for KeepAlive key generation
    let fullPath = parentPath;
    if (route.path) {
      if (route.path.startsWith('/')) {
        fullPath = route.path;
      } else {
        // Ensure clean path joining without double slashes
        const separator = parentPath.endsWith('/') ? '' : '/';
        fullPath = `${parentPath}${separator}${route.path}`;
      }
    }
    // Remove trailing slash if not root (standardize)
    if (fullPath !== '/' && fullPath.endsWith('/')) {
      fullPath = fullPath.slice(0, -1);
    }

    // 如果有 element，用 Suspense 包裹
    if (newRoute.element) {
      // 如果需要 Wrapper 组件来传递 Outlet Context（兼容旧代码），可以在这里处理
      // 但更推荐在页面组件内部使用 useOutletContext()
      
      // 仅对直接通过 element 定义的组件包裹 Wrapper，
      // 如果 element 是 Layout 组件，通常不需要传递 t，因为 Layout 自己会处理 t
      
      // 构建要渲染的元素
      let elementToRender = route.element;

      // 1. 处理 Suspense (最内层，直接包裹 Lazy 组件，或者由 KeepAlive 包裹它？)
      // 官方推荐：KeepAlive > Suspense > Component
      // 这样 KeepAlive 缓存的是已经 Suspense 完成后的组件结构，
      // 或者是 KeepAlive 自身处理 Suspense 状态。
      // 但如果 Component 是 lazy 的，React Router 需要 Suspense 来等待它加载。
      
      // 修正顺序：
      // 原来：Suspense > KeepAlive > Component
      // 导致：KeepAlive 试图缓存一个正在 Suspense 的组件，可能导致白屏或状态问题。
      
      // 正确顺序建议：
      // KeepAlive 内部应该包含 Suspense，或者 KeepAlive 缓存的是 Suspense 的结果。
      // react-activation 文档指出：
      // <KeepAlive>
      //   <Suspense fallback=...>
      //      <Component />
      //   </Suspense>
      // </KeepAlive>
      
      // 构建基础组件 (Lazy Component)
      let innerElement = route.element;

      // 包裹 Suspense
      innerElement = (
        <Suspense fallback={<LoadingFallback />}>
          {innerElement}
        </Suspense>
      );

      // 包裹 KeepAlive
      if (route.meta?.keepAlive) {
        const cacheName = route.meta.keepAliveKey || fullPath || '/';
        // 判断是否需要动态 key：
        // 如果没有设置 keepAliveKey，让 KeepAliveBoundary 自动判断（根据查询参数）
        // 这样任何带查询参数的路由都能自动使用动态 key，无需硬编码路由路径
        const needsDynamicKey = !route.meta.keepAliveKey;
        // 对于需要动态 key 的路由，不传固定的 name（传 undefined），
        // 让 KeepAliveBoundary 根据查询参数动态生成 key
        const keepAliveName = needsDynamicKey ? undefined : (route.meta.keepAliveKey || cacheName);
        // 对于动态路由，使用 pathname 作为 React key，确保 React 能正确识别组件
        // KeepAliveBoundary 内部会根据查询参数生成最终的 cache key
        // 注意：这里传入的 key 是 React 的 key prop，用于组件识别，不是 KeepAlive 的 cache key
        const keepAliveKey = needsDynamicKey ? fullPath : cacheName;
        innerElement = (
          <KeepAliveBoundary key={keepAliveKey} name={keepAliveName} keepAlive={true}>
            {innerElement}
          </KeepAliveBoundary>
        );
      }

      elementToRender = innerElement;

      // 3. 如果需要认证，包裹 AuthGuard (最外层)
      if (route.meta?.requiresAuth) {
        elementToRender = <AuthGuard>{elementToRender}</AuthGuard>;
      }
      
      newRoute.element = elementToRender;
    }

    if (newRoute.children) {
      newRoute.children = processRoutes(newRoute.children, fullPath);
    }

    return newRoute;
  });
}

// 需要重新组织路由结构以匹配原来的 Layout 嵌套关系
// coreRoutes[0] 是 Layout，包含了 Home 和 Privacy
// localRoutes[0] 是 DashboardLayout，包含 Dashboard 子页面
// 我们需要把 DashboardLayout 放到 Layout 的 children 中

const layoutRoute = coreRoutes.find(r => r.path === '/');
if (layoutRoute && layoutRoute.children) {
  layoutRoute.children.push(...localRoutes);
} else {
  console.error('Failed to merge routes: Layout route not found');
}

// 处理后的路由配置
const finalRoutes = processRoutes(coreRoutes);

export const router = createHashRouter(finalRoutes);

// 显式导出 router 作为默认导出，以兼容某些导入方式
export default router;
