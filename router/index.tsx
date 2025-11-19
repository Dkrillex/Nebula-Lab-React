
import React from 'react';
import { createHashRouter, Navigate, useOutletContext } from 'react-router-dom';
import Layout from '../components/Layout';
import DashboardLayout from '../components/DashboardLayout';
import Home from '../pages/Home';
import CreatePage from '../pages/Create';
import KeysPage from '../pages/Keys';
import ChatPage from '../pages/Chat';
import ModelSquarePage from '../pages/Models';
import ExpensesPage from '../pages/Expenses';
import PricingPage from '../pages/Pricing';
import AssetsPage from '../pages/Assets';
import ProfilePage from '../pages/Profile';

// Wrapper components to extract props from Outlet Context
const HomeWrapper = () => {
  const { t } = useOutletContext<any>();
  return <Home t={t} />;
};

const CreatePageWrapper = () => {
  const { t, handleNavClick } = useOutletContext<any>();
  // CreatePage manages its own 'activeMenu' via URL params now
  return <CreatePage t={t.createPage} onNavigate={handleNavClick} />;
};

const KeysPageWrapper = () => {
  const { t } = useOutletContext<any>();
  return <KeysPage t={t.keysPage} />;
};

const ChatPageWrapper = () => {
  const { t } = useOutletContext<any>();
  return <ChatPage t={t.chatPage} />;
};

const ModelSquarePageWrapper = () => {
  const { t } = useOutletContext<any>();
  return <ModelSquarePage t={t.modelSquare} />;
};

const ExpensesPageWrapper = () => {
  const { t } = useOutletContext<any>();
  return <ExpensesPage t={t.expensesPage} />;
};

const PricingPageWrapper = () => {
  const { t } = useOutletContext<any>();
  return <PricingPage t={t.pricingPage} />;
};

const AssetsPageWrapper = () => {
  const { t } = useOutletContext<any>();
  return <AssetsPage t={t.assetsPage} />;
};

const ProfilePageWrapper = () => {
  const { t } = useOutletContext<any>();
  return <ProfilePage t={t.profilePage} />;
};

export const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomeWrapper />,
      },
      {
        path: 'create',
        element: <CreatePageWrapper />,
      },
      {
        element: <DashboardLayout />,
        children: [
          {
            path: 'assets',
            element: <AssetsPageWrapper />,
          },
          {
            path: 'chat',
            element: <ChatPageWrapper />,
          },
          {
            path: 'keys',
            element: <KeysPageWrapper />,
          },
          {
            path: 'models',
            element: <ModelSquarePageWrapper />,
          },
          {
            path: 'expenses',
            element: <ExpensesPageWrapper />,
          },
          {
            path: 'pricing',
            element: <PricingPageWrapper />,
          },
          {
            path: 'profile',
            element: <ProfilePageWrapper />,
          }
        ]
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      }
    ],
  },
]);
