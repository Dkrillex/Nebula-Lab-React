
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AuthModal from './AuthModal';
import NotificationModal from './NotificationModal';
import ConfirmDialog from './ConfirmDialog';
import CachedOutlet from './CachedOutlet';
import { Language, TabItem, View } from '../types';
import { translations } from '../translations';
import { useAuthStore } from '../stores/authStore';
import { useCacheStore } from '../stores/cacheStore';

import MobileSidebar from './MobileSidebar';

const Layout: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState<Language>('zh');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [visitedViews, setVisitedViews] = useState<TabItem[]>([{ view: 'home' }]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchUserInfo, isAuthenticated, firstLoginInfo, clearFirstLoginInfo } = useAuthStore();

  // Theme handling
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  // Auth handling
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserInfo();
    }
  }, [isAuthenticated]);

  const t = translations[lang];

  // Helper to map path to View type and Tool
  const getCurrentViewAndTool = (): { view: View, tool?: string } => {
    const path = location.pathname.substring(1) || 'home';
    const params = new URLSearchParams(location.search);
    const tool = params.get('tool') || undefined;

    // Map URL path to View type
    let view: View = 'home';
    if (path === 'create') view = 'create';
    else if (path === 'keys') view = 'keys';
    else if (path === 'chat') view = 'chat';
    else if (path === 'models') view = 'models';
    else if (path === 'expenses') view = 'expenses';
    else if (path === 'pricing') view = 'pricing';
    else if (path === 'assets') view = 'assets';

    return { view, tool };
  };

  const { view: currentView, tool: activeTool } = getCurrentViewAndTool();
  const { removeCachedComponent } = useCacheStore();

  // Update Tabs History and Cache
  useEffect(() => {
    setVisitedViews(prev => {
      const exists = prev.some(t => 
        t.view === currentView && 
        (t.view !== 'create' || t.activeTool === activeTool)
      );
      
      if (exists) return prev;

      return [...prev, { 
        view: currentView, 
        activeTool: currentView === 'create' ? activeTool : undefined 
      }];
    });
  }, [currentView, activeTool]);

  // 注意：缓存列表由 CachedOutlet 自动管理，这里不需要手动更新
  // 只在标签页关闭时清除对应的缓存

  // Navigation Handlers
  const handleNavClick = (href: string) => {
    if (href === '#') navigate('/');
    else if (href.startsWith('#')) {
        const path = href.substring(1);
        navigate(path === 'home' ? '/' : `/${path}`);
    } else {
        navigate(href);
    }
  };

  const handleTabClick = (tab: TabItem) => {
    let path = tab.view === 'home' ? '/' : `/${tab.view}`;
    if (tab.activeTool) {
      path += `?tool=${tab.activeTool}`;
    }
    navigate(path);
  };

  const handleTabClose = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const targetTab = visitedViews[index];
    const newTabs = visitedViews.filter((_, i) => i !== index);
    setVisitedViews(newTabs);

    // 当标签页关闭时，从缓存中移除对应的组件
    // 根据 view 和 tool 生成缓存 key
    const cacheKey = targetTab.view === 'create' && targetTab.activeTool
      ? `/create?tool=${targetTab.activeTool}`
      : targetTab.view === 'home' ? '/' : `/${targetTab.view}`;
    removeCachedComponent(cacheKey);

    // If closing active tab, navigate to last available
    const isActive = targetTab.view === currentView && 
                     (targetTab.view !== 'create' || targetTab.activeTool === activeTool);

    if (isActive) {
      if (newTabs.length > 0) {
        const lastTab = newTabs[newTabs.length - 1];
        handleTabClick(lastTab);
      } else {
        navigate('/');
      }
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Props to pass down to Outlet context if needed, 
  // but standard prop passing is usually done via routes.
  // Here we clone the element logic in Router, or use Context.
  // For simplicity in this refactor, we render standard components.

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-indigo-500/30 transition-colors duration-300 flex flex-col">
      <Header 
        isDark={isDark} 
        toggleTheme={() => setIsDark(!isDark)} 
        lang={lang} 
        setLang={setLang} 
        onSignIn={() => setIsAuthModalOpen(true)}
        onOpenNotification={() => setIsNotificationOpen(true)}
        onNavClick={handleNavClick}
        currentView={currentView}
        activeTool={activeTool}
        sideMenuMap={t.createPage.sideMenu}
        visitedViews={visitedViews}
        onTabClick={handleTabClick}
        onTabClose={handleTabClose}
        t={t.header} 
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      <main className="flex-1">
        <CachedOutlet context={{ t, handleNavClick, onSignIn: () => setIsAuthModalOpen(true) }} />
      </main>

      {/* Conditional Footer rendering based on route can be handled here or CSS */}
      {/* {currentView !== 'chat' && currentView !== 'models' && currentView !== 'expenses' && currentView !== 'pricing' && currentView !== 'assets' && (
        <Footer t={t.footer} />
      )} */}
      
      <MobileSidebar 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        sideMenuMap={t.createPage.sideMenu}
        t={t.header}
        isAuthenticated={isAuthenticated}
        user={useAuthStore.getState().user}
        onSignIn={() => {
          setIsMobileMenuOpen(false);
          setIsAuthModalOpen(true);
        }}
        logout={() => {
           useAuthStore.getState().logout();
           setIsMobileMenuOpen(false);
        }}
      />

      <AuthModal 
        isOpen={isAuthModalOpen}  
        onClose={() => setIsAuthModalOpen(false)} 
        onLoginSuccess={() => {
          // fetchUserInfo will be called automatically by useEffect when isAuthenticated changes
          // No need to call it here to avoid duplicate calls
        }}
        lang={lang}
        t={t.auth}
      />

      {/* 首次登录提示对话框 - 在 Layout 层级显示，确保即使 AuthModal 关闭也能显示 */}
      <ConfirmDialog
        isOpen={!!firstLoginInfo}
        title="首次登录提醒"
        message={firstLoginInfo ? `您的账号已自动注册成功！\n默认密码为：${firstLoginInfo.defaultPassword}\n\n为了保障账号安全，建议您立即修改密码。` : ''}
        confirmText="立即修改"
        cancelText="稍后修改"
        onConfirm={() => {
          clearFirstLoginInfo();
          navigate('/profile?tab=security');
        }}
        onCancel={() => {
          clearFirstLoginInfo();
        }}
        type="info"
      />

      <NotificationModal 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />
    </div>
  );
};

export default Layout;
    