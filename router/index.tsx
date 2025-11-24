import React, { Suspense } from 'react';
import { createHashRouter } from 'react-router-dom';
import KeepAliveWrapper from '../components/KeepAlive';
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
      
      // 构建要渲染的元素
      let elementToRender = route.element;

      // 1. 处理 KeepAlive 和 Suspense 的顺序
      // 关键修改：
      // 正确的顺序应该是: KeepAlive (外) -> Suspense (内) -> LazyComponent
      // 这样 KeepAlive 可以稳定地保持住 Suspense 的容器，即使内部正在加载。
      // 如果 Suspense 在 KeepAlive 外部，当组件被缓存再恢复时，可能会因为 Suspense 的重新挂载机制
      // 导致 KeepAlive 的 Portal 目标丢失或时序错乱，从而产生白屏。
      
      // 我们先包裹 Suspense，确保组件自身的懒加载被捕获
      elementToRender = (
        <Suspense fallback={<LoadingFallback />}>
          {elementToRender}
        </Suspense>
      );
      
      // 然后再包裹 KeepAlive，将整个 Suspense + Component 作为一个单元进行缓存
      if (route.meta?.keepAlive) {
        elementToRender = (
          <KeepAliveWrapper keepAlive={true}>
            {elementToRender}
          </KeepAliveWrapper>
        );
      }

      // 3. 如果需要认证，包裹 AuthGuard
      if (route.meta?.requiresAuth) {
        elementToRender = <AuthGuard>{elementToRender}</AuthGuard>;
      }
      
      newRoute.element = elementToRender;
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
