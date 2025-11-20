import React, { Suspense } from 'react';
import { createHashRouter, useOutletContext } from 'react-router-dom';
import { coreRoutes } from './routes/core';
import { localRoutes } from './routes/local';
import { AppRouteObject, AuthGuard } from './AuthGuard';

// 加载指示器
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// 递归处理路由配置，添加 Suspense 和 Wrapper
function processRoutes(routes: AppRouteObject[]): any[] {
  return routes.map(route => {
    const newRoute: any = { ...route };
    
    // 如果有 element，用 Suspense 包裹
    if (newRoute.element) {
      // 如果需要 Wrapper 组件来传递 Outlet Context（兼容旧代码），可以在这里处理
      // 但更推荐在页面组件内部使用 useOutletContext()
      
      // 仅对直接通过 element 定义的组件包裹 Wrapper，
      // 如果 element 是 Layout 组件，通常不需要传递 t，因为 Layout 自己会处理 t
      
      newRoute.element = (
        <Suspense fallback={<LoadingFallback />}>
          {/* 
             如果需要包装器逻辑，可以在这里动态生成
             目前我们直接渲染 element，页面组件内部负责 context 消费
          */}
          {/* 
             应用 AuthGuard
             注意：通常 Layout 不需要 AuthGuard，而是其子路由需要
             这里简单处理：如果 meta.requiresAuth 为 true，则包裹 AuthGuard
          */}
          {route.meta?.requiresAuth ? (
            <AuthGuard>{route.element}</AuthGuard>
          ) : (
            route.element
          )}
        </Suspense>
      );
    }

    if (newRoute.children) {
      newRoute.children = processRoutes(newRoute.children);
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

// 为了保持组件中使用的 useOutletContext 类型提示，这里导出一个 hook
export function useAppOutletContext() {
  return useOutletContext<{
    t: any;
    handleNavClick: (href: string) => void;
    onSignIn: () => void;
  }>();
}
