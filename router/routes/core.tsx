import React, { useState } from 'react';
import { Navigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { AppRouteObject } from '../AuthGuard';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import { CURRENT_SYSTEM, SYSTEM_TYPE } from '../../constants';
import { translations } from '../../translations';

// 懒加载组件
const Home = React.lazy(() => import('../../pages/Home'));
const PrivacyPage = React.lazy(() => import('../../pages/Privacy'));

// 当 CURRENT_SYSTEM === SYSTEM_TYPE.BOTH 时，创建一个包含 Sidebar 的包装组件
// 因为 DashboardLayout 使用 Outlet，而 index 路由不能有 children
// 所以我们需要创建一个自定义的 Layout 组件，直接渲染 Sidebar 和 Home
const HomeWithSidebar: React.FC = () => {
  const context = useOutletContext<any>();
  const defaultT = translations['zh'];
  const t = context?.t || defaultT;
  const onSignIn = context?.onSignIn || (() => {});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-background">
      <Sidebar 
        t={t?.createPage?.sideMenu} 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed}
        onSignIn={onSignIn}
      />
      <main 
        id="dashboard-main-scroll"
        className="flex-1 overflow-y-auto h-[calc(100vh-64px)] min-w-0"
      >
        <Home />
      </main>
    </div>
  );
};

// 根路径重定向组件：当 CURRENT_SYSTEM === SYSTEM_TYPE.BOTH 时，根据 expand 参数决定是否重定向
const RootRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const expandParam = searchParams.get('expand');
  
  // 如果有 expand 参数，说明是用户点击了一级菜单，显示模型中心首页
  if (expandParam === 'modelCenter') {
    return <HomeWithSidebar />;
  }
  
  // 否则重定向到创作中心首页
  return <Navigate to="/create" replace />;
};

// 包装组件
// Wrapper components to extract props from Outlet Context
// 注意：由于 React Router 6 的数据加载机制变化，这里为了简单迁移，
// 我们可能需要在 Layout 中通过 Outlet context 传递 props，
// 或者在组件内部使用 hooks 获取。
// 这里暂时保持 index.tsx 中的 Wrapper 模式，但在配置中直接引用组件

export const coreRoutes: AppRouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        // 当 CURRENT_SYSTEM === SYSTEM_TYPE.BOTH 时，使用 RootRedirect 组件处理重定向逻辑
        element: CURRENT_SYSTEM === SYSTEM_TYPE.BOTH ? <RootRedirect /> : <Home />,
        meta: {
          title: 'Home',
          requiresAuth: false,
          keepAlive: false // 首页通常不需要缓存
        }
      },
      {
        path: 'privacy',
        element: <PrivacyPage />,
        meta: {
          title: 'Privacy',
          requiresAuth: false,
          keepAlive: false
        }
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
    meta: {
      title: '404',
      hideInMenu: true
    }
  }
];

