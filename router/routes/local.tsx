import React from 'react';
import { AppRouteObject } from '../AuthGuard';
import DashboardLayout from '../../components/DashboardLayout';
// 暂时禁用 KeepAliveWrapper，因为它会影响 context 传递
// import { KeepAliveWrapper } from '../../components/KeepAliveWrapper';

// 懒加载组件
const CreatePage = React.lazy(() => import('../../pages/Create'));
const AssetsPage = React.lazy(() => import('../../pages/Assets'));
const ChatPage = React.lazy(() => import('../../pages/Chat'));
const KeysPage = React.lazy(() => import('../../pages/Keys'));
const ModelSquarePage = React.lazy(() => import('../../pages/Models'));
const ExpensesPage = React.lazy(() => import('../../pages/Expenses'));
const PricingPage = React.lazy(() => import('../../pages/Pricing'));
const PriceListPage = React.lazy(() => import('../../pages/PriceList'));
const ProfilePage = React.lazy(() => import('../../pages/Profile'));

// Wrapper components defined inline or imported if complex logic needed
// For now, we assume components can handle their own data fetching or use hooks

export const localRoutes: AppRouteObject[] = [
  {
    element: <DashboardLayout />,
    children: [
      {
        path: 'create',
        element: <CreatePage />,
        meta: {
          title: 'Create',
          icon: 'magic',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'assets',
        element: <AssetsPage />,
        meta: {
          title: 'Assets',
          icon: 'folder',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'chat',
        element: <ChatPage />,
        meta: {
          title: 'Chat',
          icon: 'message',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'keys',
        element: <KeysPage />,
        meta: {
          title: 'Keys',
          icon: 'key',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'models',
        element: <ModelSquarePage />,
        meta: {
          title: 'Models',
          icon: 'grid',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'expenses',
        element: <ExpensesPage />,
        meta: {
          title: 'Expenses',
          icon: 'dollar-sign',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'pricing',
        element: <PricingPage />,
        meta: {
          title: 'Pricing',
          icon: 'credit-card',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'price-list',
        element: <PriceListPage />,
        meta: {
          title: 'Price List',
          icon: 'list',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'profile',
        element: <ProfilePage />,
        meta: {
          title: 'Profile',
          icon: 'user',
          requiresAuth: true,
          keepAlive: true
        }
      }
    ]
  }
];

