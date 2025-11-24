
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AuthModal from './AuthModal';
import NotificationModal from './NotificationModal';
// import CachedOutlet from './CachedOutlet';
import { Language, TabItem, View } from '../types';
import { translations } from '../translations';
import { useAuthStore } from '../stores/authStore';
import { useCacheStore } from '../stores/cacheStore';

import MobileSidebar from './MobileSidebar';

import { KeepAliveProvider } from './KeepAlive';

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
    
    // Map URL path to View type
    let view: View = 'home';
    let tool = params.get('tool') || undefined;

    // Handle new route structure for create
    if (path === 'create' || path.startsWith('create/')) {
      view = 'create';
      if (path.startsWith('create/')) {
        // Extract tool from path: create/viralVideo -> viralVideo
        const parts = path.split('/');
        if (parts.length > 1) {
          tool = parts[1];
        }
      }
    }
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
    if (tab.view === 'create' && tab.activeTool) {
      navigate(`/create/${tab.activeTool}`);
      return;
    }

    let path = tab.view === 'home' ? '/' : `/${tab.view}`;
    // Legacy support for query params if any other views use them
    if (tab.activeTool && tab.view !== 'create') {
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
    let cacheKey = '/';
    if (targetTab.view === 'create') {
      // 适配新的路由结构生成 key
      cacheKey = targetTab.activeTool ? `/create/${targetTab.activeTool}` : '/create';
    } else {
      cacheKey = targetTab.view === 'home' ? '/' : `/${targetTab.view}`;
    }
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
  // 确保 t 不为空，如果为空则使用默认语言
  // 这在某些极端情况下（如路由跳转过快或 context 丢失）能防止崩溃
  const safeT = t || translations['zh'];
  
  return (
    <KeepAliveProvider>
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
          sideMenuMap={safeT.createPage.sideMenu}
          visitedViews={visitedViews}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
          t={safeT.header} 
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        
        <main className="flex-1">
          <Outlet context={{ t: safeT, handleNavClick, onSignIn: () => setIsAuthModalOpen(true) }} />
        </main>
        
        <MobileSidebar 
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          sideMenuMap={safeT.createPage.sideMenu}
          t={safeT.header}
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
          t={safeT.auth}
        />

        <NotificationModal 
          isOpen={isNotificationOpen} 
          onClose={() => setIsNotificationOpen(false)} 
        />
      </div>
    </KeepAliveProvider>
  );
};

export default Layout;
    