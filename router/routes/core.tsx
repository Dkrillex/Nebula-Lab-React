import React from 'react';
import { Navigate } from 'react-router-dom';
import { AppRouteObject } from '../AuthGuard';
import Layout from '../../components/Layout';

// 懒加载组件
const Home = React.lazy(() => import('../../pages/Home'));
const PrivacyPage = React.lazy(() => import('../../pages/Privacy'));

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
        element: <Home />, // 需要在 RouterProvider 中配合 Suspense
        meta: {
          title: 'Home',
          requiresAuth: false
        }
      },
      {
        path: 'privacy',
        element: <PrivacyPage />,
        meta: {
          title: 'Privacy',
          requiresAuth: false
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

