import React, { useState } from 'react';
import { useOutletContext, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
// import CachedOutlet from './CachedOutlet';
// import KeepAliveWrapper from './KeepAlive'; 
import { translations } from '../translations';

interface DashboardLayoutProps {
  onSignIn?: () => void; // 登录弹窗回调
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ onSignIn: propOnSignIn }) => {
  const context = useOutletContext<any>();
  
  // 如果 context 为 null，说明 Layout 没有正确传递 context
  // 使用默认的 translations 作为后备
  const defaultT = translations['zh']; // 默认使用中文
  const t = context?.t || defaultT;
  
  // 优先使用 prop 传入的 onSignIn，如果没有则使用 context 中的
  const onSignIn = propOnSignIn || context?.onSignIn || (() => {});

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 确保 context 不为 null，如果为 null 则使用默认值
  const outletContext = context || { 
    t: defaultT, 
    handleNavClick: () => {}, 
    onSignIn: () => {},
    lang: 'zh',
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-background">
      <Sidebar 
        t={t?.createPage?.sideMenu} 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed}
        onSignIn={onSignIn}
      />
      
      {/* Main Content Area */}
      <main 
        id="dashboard-main-scroll"
        className="flex-1 overflow-y-auto h-[calc(100vh-64px)] min-w-0"
      >
        <Outlet context={outletContext} />
      </main>
    </div>
  );
};

export default DashboardLayout;