
import React from 'react';
import { createHashRouter, Navigate, useOutletContext } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../components/Home';
import CreatePage from '../components/CreatePage';
import KeysPage from '../components/KeysPage';
import ChatPage from '../components/ChatPage';
import ModelSquarePage from '../components/ModelSquarePage';
import ExpensesPage from '../components/ExpensesPage';
import PricingPage from '../components/PricingPage';
import AssetsPage from '../components/AssetsPage';

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
        path: 'keys',
        element: <KeysPageWrapper />,
      },
      {
        path: 'chat',
        element: <ChatPageWrapper />,
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
        path: 'assets',
        element: <AssetsPageWrapper />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      }
    ],
  },
]);
