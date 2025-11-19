
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ModelList from './components/ModelList';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import CreatePage from './components/CreatePage';
import KeysPage from './components/KeysPage';
import ChatPage from './components/ChatPage';
import ModelSquarePage from './components/ModelSquarePage';
import ExpensesPage from './components/ExpensesPage';
import PricingPage from './components/PricingPage';
import AssetsPage from './components/AssetsPage';
import { Language, View, TabItem } from './types';
import { translations } from './translations';
import { authService } from './services/authService'; // Example import

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState<Language>('zh');
  const [view, setView] = useState<View>('home');
  const [activeTool, setActiveTool] = useState('textToImage'); // Sub-state for CreatePage
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Tabs / Tags View State
  const [visitedViews, setVisitedViews] = useState<TabItem[]>([{ view: 'home' }]);

  // Example: Auth State for connected backend
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  // Example: Initial Token Check
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // In a real app, verify token or fetch profile here
      // authService.getProfile().then(res => {
      //   if(res.success) setUser(res.data);
      // }).catch(() => localStorage.removeItem('auth_token'));
    }
  }, []);

  // Update Visited Views (Tabs) when navigation changes
  useEffect(() => {
    setVisitedViews(prev => {
      // Check if tab already exists
      const exists = prev.some(t => 
        t.view === view && 
        (t.view !== 'create' || t.activeTool === activeTool)
      );
      
      if (exists) return prev;

      // Add new tab
      return [...prev, { 
        view, 
        activeTool: view === 'create' ? activeTool : undefined 
      }];
    });
  }, [view, activeTool]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleNavClick = (href: string) => {
    if (href === '#create') {
      setView('create');
    } else if (href === '#keys') {
      setView('keys');
    } else if (href === '#chat') {
      setView('chat');
    } else if (href === '#models') {
      setView('models');
    } else if (href === '#expenses') {
      setView('expenses');
    } else if (href === '#pricing') {
      setView('pricing');
    } else if (href === '#assets') {
      setView('assets');
    } else {
      setView('home');
    }
  };

  const handleTabClick = (tab: TabItem) => {
    setView(tab.view);
    if (tab.activeTool) {
      setActiveTool(tab.activeTool);
    }
  };

  const handleTabClose = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const targetTab = visitedViews[index];
    const newTabs = visitedViews.filter((_, i) => i !== index);
    setVisitedViews(newTabs);

    // If we closed the active tab, navigate to the last available tab
    const isActive = targetTab.view === view && 
                     (targetTab.view !== 'create' || targetTab.activeTool === activeTool);

    if (isActive) {
      if (newTabs.length > 0) {
        const lastTab = newTabs[newTabs.length - 1];
        setView(lastTab.view);
        if (lastTab.activeTool) {
          setActiveTool(lastTab.activeTool);
        }
      } else {
        setView('home');
      }
    }
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-indigo-500/30 transition-colors duration-300 flex flex-col">
      <Header 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        lang={lang} 
        setLang={setLang} 
        onSignIn={() => setIsAuthModalOpen(true)}
        onNavClick={handleNavClick}
        currentView={view}
        activeTool={activeTool}
        sideMenuMap={t.createPage.sideMenu}
        visitedViews={visitedViews}
        onTabClick={handleTabClick}
        onTabClose={handleTabClose}
        t={t.header} 
      />
      
      <main className="flex-1">
        {view === 'home' && (
          <>
            <Hero t={t.hero} />
            <div className="relative z-10 -mt-8">
               <ModelList t={t.modelList} />
            </div>
          </>
        )}
        {view === 'create' && (
          <CreatePage 
            t={t.createPage} 
            onNavigate={handleNavClick} 
            activeMenu={activeTool}
            onMenuChange={setActiveTool}
          />
        )}
        {view === 'keys' && (
           <KeysPage t={t.keysPage} />
        )}
        {view === 'chat' && (
          <ChatPage t={t.chatPage} />
        )}
        {view === 'models' && (
          <ModelSquarePage t={t.modelSquare} />
        )}
        {view === 'expenses' && (
          <ExpensesPage t={t.expensesPage} />
        )}
        {view === 'pricing' && (
          <PricingPage t={t.pricingPage} />
        )}
        {view === 'assets' && (
          <AssetsPage t={t.assetsPage} />
        )}
      </main>

      {view !== 'chat' && view !== 'models' && view !== 'expenses' && view !== 'pricing' && view !== 'assets' && <Footer t={t.footer} />}
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        t={t.auth}
      />
    </div>
  );
};

export default App;
