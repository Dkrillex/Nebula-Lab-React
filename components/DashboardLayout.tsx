import React, { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  onSignIn?: () => void; // 登录弹窗回调
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ onSignIn }) => {
  const { t } = useOutletContext<any>();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-background">
      <Sidebar 
        t={t.createPage.sideMenu} 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed}
        onSignIn={onSignIn}
      />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] min-w-0">
        <Outlet context={{ t }} />
      </main>
    </div>
  );
};

export default DashboardLayout;