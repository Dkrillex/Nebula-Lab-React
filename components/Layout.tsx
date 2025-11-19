
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AuthModal from './AuthModal';
import { Language, TabItem, View } from '../types';
import { translations } from '../translations';
import { useAuthStore } from '../stores/authStore';

const Layout: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState<Language>('zh');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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

  // Update Tabs History
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
        onNavClick={handleNavClick}
        currentView={currentView}
        activeTool={activeTool}
        sideMenuMap={t.createPage.sideMenu}
        visitedViews={visitedViews}
        onTabClick={handleTabClick}
        onTabClose={handleTabClose}
        t={t.header} 
      />
      
      <main className="flex-1">
        <Outlet context={{ t, handleNavClick }} /> 
      </main>

      {/* Conditional Footer rendering based on route can be handled here or CSS */}
      {/* {currentView !== 'chat' && currentView !== 'models' && currentView !== 'expenses' && currentView !== 'pricing' && currentView !== 'assets' && (
        <Footer t={t.footer} />
      )} */}
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLoginSuccess={() => fetchUserInfo()}
        t={t.auth}
      />
    </div>
  );
};

export default Layout;
    