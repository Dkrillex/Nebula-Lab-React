
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ModelList from './components/ModelList';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import CreatePage from './components/CreatePage';
import KeysPage from './components/KeysPage';
import { Language, View } from './types';
import { translations } from './translations';
import { authService } from './services/authService'; // Example import

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState<Language>('zh');
  const [view, setView] = useState<View>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
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

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleNavClick = (href: string) => {
    if (href === '#create') {
      setView('create');
    } else if (href === '#keys') {
      setView('keys');
    } else {
      setView('home');
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
          <CreatePage t={t.createPage} onNavigate={handleNavClick} />
        )}
        {view === 'keys' && (
           <KeysPage t={t.keysPage} />
        )}
      </main>

      <Footer t={t.footer} />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        t={t.auth}
      />
    </div>
  );
};

export default App;
