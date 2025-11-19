
import React from 'react';
import { Command, Moon, Sun, Menu, Globe, ChevronRight, X, Home } from 'lucide-react';
import { Language, NavItem, View, TabItem } from '../types';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onSignIn: () => void;
  onNavClick: (href: string) => void;
  currentView: View;
  activeTool?: string;
  sideMenuMap?: any;
  visitedViews?: TabItem[];
  onTabClick?: (tab: TabItem) => void;
  onTabClose?: (e: React.MouseEvent, index: number) => void;
  t: {
    searchPlaceholder: string;
    signIn: string;
    nav: NavItem[];
  };
}

const Header: React.FC<HeaderProps> = ({ 
  isDark, toggleTheme, lang, setLang, onSignIn, onNavClick, 
  currentView, activeTool, sideMenuMap, visitedViews, onTabClick, onTabClose, t 
}) => {
  
  const toggleLang = () => {
    setLang(lang === 'en' ? 'zh' : 'en');
  };

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    onNavClick(href);
  };

  const getTabLabel = (tab: TabItem) => {
    if (!sideMenuMap) return tab.view;
    if (tab.view === 'home') return sideMenuMap.home;
    if (tab.view === 'create') return sideMenuMap[tab.activeTool!] || tab.activeTool;
    if (tab.view === 'models') return sideMenuMap.modelSquare;
    if (tab.view === 'chat') return sideMenuMap.aiExperience;
    if (tab.view === 'keys') return sideMenuMap.apiKeys;
    if (tab.view === 'expenses') return sideMenuMap.expenses;
    if (tab.view === 'pricing') return sideMenuMap.pricing;
    if (tab.view === 'assets') return sideMenuMap.assets;
    return tab.view;
  };

  const renderBreadcrumbs = () => {
    if (!sideMenuMap || currentView === 'home') return null;

    const crumbs = [{ label: sideMenuMap.home, href: '#' }];

    if (currentView === 'create') {
      crumbs.push({ label: sideMenuMap.creationCenter, href: '#create' });
      if (activeTool && sideMenuMap[activeTool]) {
        crumbs.push({ label: sideMenuMap[activeTool], href: '' });
      }
    } else if (currentView === 'models') {
      crumbs.push({ label: sideMenuMap.modelCenter, href: '' });
      crumbs.push({ label: sideMenuMap.modelSquare, href: '#models' });
    } else if (currentView === 'chat') {
      crumbs.push({ label: sideMenuMap.modelCenter, href: '' });
      crumbs.push({ label: sideMenuMap.aiExperience, href: '#chat' });
    } else if (currentView === 'keys') {
      crumbs.push({ label: sideMenuMap.modelCenter, href: '' });
      crumbs.push({ label: sideMenuMap.apiKeys, href: '#keys' });
    } else if (currentView === 'expenses') {
      crumbs.push({ label: sideMenuMap.personalCenter, href: '' });
      crumbs.push({ label: sideMenuMap.expenses, href: '#expenses' });
    } else if (currentView === 'pricing') {
      crumbs.push({ label: sideMenuMap.personalCenter, href: '' });
      crumbs.push({ label: sideMenuMap.pricing, href: '#pricing' });
    } else if (currentView === 'assets') {
      crumbs.push({ label: sideMenuMap.personalCenter, href: '' });
      crumbs.push({ label: sideMenuMap.assets, href: '#assets' });
    }

    return (
      <nav className="hidden md:flex items-center gap-1 ml-6 pl-6 border-l border-border/60 h-6">
        {crumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight size={14} className="text-muted/60" />}
            {crumb.href && index < crumbs.length - 1 ? (
               <a 
                 href={crumb.href} 
                 onClick={(e) => { if(crumb.href) handleNavClick(e, crumb.href) }}
                 className="text-xs md:text-sm text-muted hover:text-foreground transition-colors"
               >
                 {crumb.label}
               </a>
            ) : (
              <span className={`text-xs md:text-sm ${index === crumbs.length - 1 ? 'font-medium text-foreground' : 'text-muted'}`}>
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col bg-background/95 backdrop-blur-md border-b border-border transition-all duration-300 shadow-sm">
      {/* Main Toolbar */}
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Logo & Name & Breadcrumbs */}
        <div className="flex items-center gap-2 md:gap-4">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={(e) => handleNavClick(e, '#')}
          >
            <div className="h-8 w-8 rounded-lg bg-foreground text-background flex items-center justify-center transition-colors shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground hidden sm:block">
              OpenRouter
            </span>
          </div>
          
          {/* Breadcrumbs */}
          {renderBreadcrumbs()}
        </div>

        {/* Center: Command Search (Visual Only) - Only show on Home view */}
        {currentView === 'home' && (
          <div className="hidden md:flex flex-1 items-center justify-center px-6 max-w-md mx-auto">
            <button className="flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-muted hover:text-foreground hover:border-secondary transition-colors shadow-sm">
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
               className="hidden sm:inline-flex h-9 items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90 shadow-sm"
             >
               {t.signIn}
             </button>
             
             <button className="md:hidden text-muted">
               <Menu size={24} />
             </button>
          </div>
        </div>
      </div>

      {/* Tags View (Opened Tabs) */}
      {visitedViews && visitedViews.length > 0 && (
        <div className="w-full border-t border-border bg-surface/50 h-10 flex items-center px-4 gap-2 overflow-x-auto custom-scrollbar">
          {visitedViews.map((tab, index) => {
            const isActive = tab.view === currentView && 
                             (tab.view !== 'create' || tab.activeTool === activeTool);
            return (
              <div 
                key={`${tab.view}-${tab.activeTool || index}`}
                onClick={() => onTabClick && onTabClick(tab)}
                className={`
                  group flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer border transition-all
                  ${isActive 
                    ? 'bg-background border-border text-foreground shadow-sm' 
                    : 'bg-transparent border-transparent text-muted hover:bg-background/50 hover:text-foreground'}
                `}
              >
                {tab.view === 'home' && <Home size={12} />}
                <span className="whitespace-nowrap">{getTabLabel(tab)}</span>
                {visitedViews.length > 1 && (
                  <button 
                    onClick={(e) => onTabClose && onTabClose(e, index)}
                    className={`rounded-full p-0.5 transition-colors ${isActive ? 'hover:bg-border' : 'opacity-0 group-hover:opacity-100 hover:bg-border'}`}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default Header;
