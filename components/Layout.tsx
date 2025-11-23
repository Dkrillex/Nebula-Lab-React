
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AuthModal from './AuthModal';
import NotificationModal from './NotificationModal';
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
  const { fetchUserInfo, isAuthenticated } = useAuthStore();

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
  const { updateCachedComponents, removeCachedComponent } = useCacheStore();

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

  // 根据打开的标签页更新缓存列表（类似 Vue3 的 updateCacheTabs）
  useEffect(() => {
    const cachedKeys: string[] = [];
    
    visitedViews.forEach(tab => {
      // 根据 view 和 tool 生成缓存 key
      const cacheKey = tab.view === 'create' && tab.activeTool
        ? `/create?tool=${tab.activeTool}`
        : tab.view === 'home' ? '/' : `/${tab.view}`;
      
      // 检查路由是否配置了 keepAlive（这里简化处理，假设所有标签页都支持缓存）
      // 实际应该根据路由配置来判断
      cachedKeys.push(cacheKey);
    });

    // 更新缓存组件列表
    updateCachedComponents(cachedKeys);
  }, [visitedViews, updateCachedComponents]);

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
        <CachedOutlet />
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
        onLoginSuccess={() => fetchUserInfo()}
        lang={lang}
        t={t.auth}
      />

      <NotificationModal 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />
    </div>
  );
};

export default Layout;
    