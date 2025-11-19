import React from 'react';
import { Command, Moon, Sun, Menu, Globe } from 'lucide-react';
import { Language, NavItem, View } from '../types';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onSignIn: () => void;
  onNavClick: (href: string) => void;
  currentView: View;
  t: {
    searchPlaceholder: string;
    signIn: string;
    nav: NavItem[];
  };
}

const Header: React.FC<HeaderProps> = ({ isDark, toggleTheme, lang, setLang, onSignIn, onNavClick, currentView, t }) => {
  const toggleLang = () => {
    setLang(lang === 'en' ? 'zh' : 'en');
  };

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    onNavClick(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Logo & Name */}
        <div className="flex items-center gap-2 md:gap-4">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={(e) => handleNavClick(e, '#')}
          >
            <div className="h-8 w-8 rounded-lg bg-foreground text-background flex items-center justify-center transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground hidden sm:block">
              OpenRouter
            </span>
          </div>
        </div>

        {/* Center: Command Search (Visual Only) - Only show on Home view */}
        {currentView === 'home' && (
          <div className="hidden md:flex flex-1 items-center justify-center px-6 max-w-md mx-auto">
            <button className="flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-muted hover:text-foreground hover:border-secondary transition-colors">
              <Command size={14} />
              <span>{t.searchPlaceholder}</span>
              <span className="ml-auto text-xs opacity-70">⌘K</span>
            </button>
          </div>
        )}

        {/* Right: Nav & Actions */}
        <div className={`flex items-center gap-4 ${currentView !== 'home' ? 'ml-auto' : ''}`}>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted">
            {t.nav.map((item) => {
              const isActive = item.href === '#create' && currentView === 'create';
              return (
                <a 
                  key={item.label} 
                  href={item.href} 
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`transition-colors ${isActive ? 'text-foreground font-semibold' : 'hover:text-foreground'}`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
          
          <div className="flex items-center gap-3 pl-2 border-l border-border">
             <button 
               onClick={toggleLang}
               className="text-muted hover:text-foreground transition-colors flex items-center gap-1 text-sm font-medium"
               aria-label="Switch language"
             >
               <Globe size={18} />
               <span className="uppercase">{lang}</span>
             </button>

             <button 
               onClick={toggleTheme}
               className="text-muted hover:text-foreground transition-colors"
               aria-label="Toggle theme"
             >
               {isDark ? <Moon size={20} /> : <Sun size={20} />}
             </button>
             
             <button 
               onClick={onSignIn}
               className="hidden sm:inline-flex h-9 items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-background"
             >
               {t.signIn}
             </button>
             
             <button className="md:hidden text-muted">
               <Menu size={24} />
             </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
