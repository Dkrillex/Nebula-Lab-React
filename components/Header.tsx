import React, { useState, useEffect, useRef } from 'react';
import { Command, Moon, Sun, Menu, Globe, X, Home, User as UserIcon, User, LogOut, Settings, CreditCard, Box, Sparkles, Grid, Key, FileText, Layers, Scissors, Film, Image, Repeat, Mic, Hammer, UserCircle, Folder, DollarSign, ChevronDown, ChevronRight, ExternalLink, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { Language, NavItem, View, TabItem } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

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
    profile?: string;
  };
}

const Header: React.FC<HeaderProps> = ({ 
  isDark, toggleTheme, lang, setLang, onSignIn, onNavClick, 
  currentView, activeTool, sideMenuMap, visitedViews, onTabClick, onTabClose, t 
}) => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['modelCenter', 'creationCenter', 'personalCenter']);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // 标签页滚动相关
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  const toggleLang = () => {
    setLang(lang === 'en' ? 'zh' : 'en');
  };

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    
    // 检查是否需要登录的路径
    const path = href.startsWith('/') ? href.substring(1) : href.replace('#', '');
    const requiresAuth = path === 'keys' || path === 'expenses' || path === 'profile';
    
    if (requiresAuth && !isAuthenticated) {
      // 未登录，弹出登录窗口
      onSignIn();
      setShowUserMenu(false);
      return;
    }
    
    onNavClick(href);
    setShowUserMenu(false);
  };

  // Determine active menu item based on URL (same logic as Sidebar)
  const getActiveId = () => {
    const path = location.pathname.substring(1);
    if (path === 'create') {
      const tool = searchParams.get('tool');
      if (tool === 'viralVideo') return 'viralVideo';
      if (tool === 'digitalHuman') return 'digitalHuman';
      if (tool === 'imgToVideo') return 'imgToVideo';
      if (tool === 'textToImage') return 'textToImage';
      if (tool === 'styleTransfer') return 'styleTransfer';
      if (tool === 'voiceClone') return 'voiceClone';
      if (tool === 'workshop') return 'workshop';
      return 'home';
    }
    if (path === 'chat') return 'aiExperience';
    if (path === 'models') return 'modelSquare';
    if (path === 'keys') return 'apiKeys';
    if (path === 'expenses') return 'expenses';
    if (path === 'pricing') return 'pricing';
    if (path === 'assets') return 'assets';
    if (path === 'profile') return 'profile';
    if (path === '') return 'home';
    return '';
  };

  const activeMenu = getActiveId();

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const handleMobileMenuClick = (item: any) => {
    if (item.externalLink) {
      window.open(item.externalLink, '_blank', 'noopener,noreferrer');
      setShowMobileMenu(false);
    } else if (item.path) {
      // 检查是否需要登录的路径
      const requiresAuth = item.path === '/keys' || item.path === '/expenses';
      
      if (requiresAuth && !isAuthenticated) {
        // 未登录，弹出登录窗口
        onSignIn();
        setShowMobileMenu(false);
        return;
      }
      
      navigate(item.path);
      setShowMobileMenu(false);
    } else if (item.tool) {
      navigate(`/create?tool=${item.tool}`);
      setShowMobileMenu(false);
    }
  };

  // Build menu structure same as Sidebar
  // Debug: Log sideMenuMap to check if it's being passed correctly
  // Build menu structure same as Sidebar
  const mobileMenuStructure = React.useMemo(() => {
    if (!sideMenuMap || typeof sideMenuMap !== 'object') {
      console.log('mobileMenuStructure: sideMenuMap invalid');
      return [];
    }
    if (!sideMenuMap.home) {
      console.log('mobileMenuStructure: sideMenuMap.home missing');
      return [];
    }
    
    const structure = [
    { id: 'home', icon: Home, label: sideMenuMap.home, path: '/' },
    { 
      id: 'modelCenter', 
      icon: Box, 
      label: sideMenuMap.modelCenter,
      children: [
        { id: 'aiExperience', icon: Sparkles, label: sideMenuMap.aiExperience, path: '/chat' },
        { id: 'modelSquare', icon: Grid, label: sideMenuMap.modelSquare, path: '/models' },
        { id: 'apiKeys', icon: Key, label: sideMenuMap.apiKeys, path: '/keys' },
        { id: 'apiDocs', icon: FileText, label: sideMenuMap.apiDocs, externalLink: 'https://s.apifox.cn/34d9d7f6-bfe9-4f3a-a084-2d88f34b7ed1/7231166m0' },
      ]
    },
    { 
      id: 'creationCenter', 
      icon: Layers, 
      label: sideMenuMap.creationCenter,
      children: [
        { id: 'viralVideo', icon: Scissors, label: sideMenuMap.viralVideo, tool: 'viralVideo' },
        { id: 'digitalHuman', icon: User, label: sideMenuMap.digitalHuman, tool: 'digitalHuman' },
        { id: 'imgToVideo', icon: Film, label: sideMenuMap.imgToVideo, tool: 'imgToVideo' },
        { id: 'textToImage', icon: Image, label: sideMenuMap.textToImage, tool: 'textToImage' },
        { id: 'styleTransfer', icon: Repeat, label: sideMenuMap.styleTransfer, tool: 'styleTransfer' },
        { id: 'voiceClone', icon: Mic, label: sideMenuMap.voiceClone, tool: 'voiceClone' },
        { id: 'workshop', icon: Hammer, label: sideMenuMap.workshop, tool: 'workshop' },
      ]
    },
    { 
      id: 'personalCenter', 
      icon: UserCircle, 
      label: sideMenuMap.personalCenter,
      children: [
        { id: 'assets', icon: Folder, label: sideMenuMap.assets, path: '/assets' },
        { id: 'pricing', icon: CreditCard, label: sideMenuMap.pricing, path: '/pricing' },
        { id: 'expenses', icon: DollarSign, label: sideMenuMap.expenses, path: '/expenses' },
        { id: 'profile', icon: UserCircle, label: sideMenuMap.profile || '个人中心', path: '/profile' },
      ]
    },
    ];
    
    console.log('mobileMenuStructure built:', structure.length, 'items');
    return structure;
  }, [sideMenuMap]);
  
  React.useEffect(() => {
    if (showMobileMenu) {
      console.log('Mobile menu opened, sideMenuMap:', sideMenuMap);
      console.log('sideMenuMap type:', typeof sideMenuMap);
      console.log('sideMenuMap.home:', sideMenuMap?.home);
      console.log('mobileMenuStructure length:', mobileMenuStructure.length);
      console.log('mobileMenuStructure:', mobileMenuStructure);
    }
  }, [showMobileMenu, sideMenuMap, mobileMenuStructure]);

  const getTabLabel = (tab: TabItem) => {
    if (!sideMenuMap) return tab.view;
    if (tab.view === 'home') return sideMenuMap.home;
    if (tab.view === 'create') {
      return tab.activeTool ? (sideMenuMap[tab.activeTool] || tab.activeTool) : sideMenuMap.home;
    }
    if (tab.view === 'models') return sideMenuMap.modelSquare;
    if (tab.view === 'chat') return sideMenuMap.aiExperience;
    if (tab.view === 'keys') return sideMenuMap.apiKeys;
    if (tab.view === 'expenses') return sideMenuMap.expenses;
    if (tab.view === 'pricing') return sideMenuMap.pricing;
    if (tab.view === 'assets') return sideMenuMap.assets;
    if (tab.view === 'profile') return t.profile || 'Profile';
    return tab.view;
  };

  // 检查是否可以滚动
  const checkScrollability = () => {
    const container = tabsContainerRef.current;
    if (!container) return;
    
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 1);
  };

  // 滚动标签页
  const scrollTabs = (direction: 'left' | 'right') => {
    const container = tabsContainerRef.current;
    if (!container) return;
    
    const scrollAmount = 200; // 每次滚动200px
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;
    
    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  // 监听标签页变化和滚动事件
  useEffect(() => {
    checkScrollability();
    const container = tabsContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      return () => {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [visitedViews]);

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col bg-background/95 backdrop-blur-md border-b border-border transition-all duration-300 shadow-sm">
      {/* Main Toolbar - Changed container mx-auto to w-full for left alignment */}
      <div className="w-full flex h-16 items-center px-4 gap-4">
        {/* Left: Logo & Name */}
        <div className="flex-shrink-0 flex items-center gap-2 md:gap-4">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={(e) => handleNavClick(e, '#')}
          >
            <div className="h-8 w-8 rounded-lg bg-foreground text-background flex items-center justify-center transition-colors shadow-sm">
              {/* <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg> */}
              <img src="/public/img/lab.png" alt="NebulaLab" className="w-8 h-8" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground hidden sm:block">
              NebulaLab
            </span>
          </div>
        </div>

        {/* Center: Command Search (Home) OR Tags View (Other Pages) */}
        <div className="flex-1 flex items-center min-w-0 overflow-hidden">
          {currentView === 'home' ? (
            <div className="hidden md:flex w-full items-center justify-center px-6 max-w-md mx-auto">
              <button className="flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-muted hover:text-foreground hover:border-secondary transition-colors shadow-sm">
                <Command size={14} />
                <span>{t.searchPlaceholder}</span>
                <span className="ml-auto text-xs opacity-70">⌘K</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 w-full relative">
              {/* 左箭头 */}
              {canScrollLeft && (
                <button
                  onClick={() => scrollTabs('left')}
                  className="flex-shrink-0 p-1 rounded-md text-muted hover:text-foreground hover:bg-surface/50 transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              
              {/* 标签页容器 */}
              <div 
                ref={tabsContainerRef}
                className="flex items-center gap-2 overflow-x-auto w-full px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
              {visitedViews && visitedViews.map((tab, index) => {
                const isActive = tab.view === currentView && 
                                 (tab.view !== 'create' || tab.activeTool === activeTool);
                return (
                  <div 
                    key={`${tab.view}-${tab.activeTool || index}`}
                    onClick={() => onTabClick && onTabClick(tab)}
                    className={`
                      group flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer border transition-all
                      ${isActive 
                        ? 'bg-surface border-border text-foreground shadow-sm' 
                        : 'bg-transparent border-transparent text-muted hover:bg-surface/50 hover:text-foreground'}
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
              
              {/* 右箭头 */}
              {canScrollRight && (
                <button
                  onClick={() => scrollTabs('right')}
                  className="flex-shrink-0 p-1 rounded-md text-muted hover:text-foreground hover:bg-surface/50 transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRightIcon size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Nav & Actions */}
        <div className="flex-shrink-0 flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted">
            {t.nav.map((item) => {
              // Determine if item is active based on current view/path
              const isActive = 
                (item.href === '/models' && ['models', 'chat', 'keys'].includes(currentView)) ||
                (item.href === '/create' && currentView === 'create') ||
                (item.href === '/profile' && ['profile', 'assets', 'pricing', 'expenses'].includes(currentView));

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
             
             {isAuthenticated && user ? (
               <div className="flex items-center gap-3 pl-2 relative">
                  <div 
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                     {user.avatar ? (
                       <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full object-cover border border-border group-hover:border-indigo-500 transition-colors" />
                     ) : (
                       <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white group-hover:bg-indigo-600 transition-colors">
                         <UserIcon size={16} />
                       </div>
                     )}
                     <div className="hidden md:flex flex-col items-start">
                       <span className="text-xs font-semibold text-foreground leading-none">{user.realName || user.username || 'User'}</span>
                     </div>
                  </div>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-1">
                        <button 
                          onClick={(e) => handleNavClick(e, '#profile')}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-background rounded-lg transition-colors"
                        >
                          <UserIcon size={16} />
                          {t.profile || 'Profile'}
                        </button>
                        <button 
                          onClick={(e) => handleNavClick(e, '#expenses')}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-background rounded-lg transition-colors"
                        >
                          <CreditCard size={16} />
                          Expenses
                        </button>
                        <div className="h-px bg-border my-1"></div>
                  <button 
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                          <LogOut size={16} />
                          Sign out
                  </button>
                      </div>
                    </div>
                  )}
               </div>
             ) : (
               <button 
                 onClick={onSignIn}
                 className="hidden sm:inline-flex h-9 items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90 shadow-sm"
               >
                 {t.signIn}
               </button>
             )}
             
             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 setShowMobileMenu(!showMobileMenu);
               }}
               className="lg:hidden text-muted hover:text-foreground transition-colors relative z-[80]"
               aria-label="Toggle mobile menu"
             >
               {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {showMobileMenu && (
        <>
          <div 
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setShowMobileMenu(false)}
            style={{ zIndex: 100 }}
          ></div>
          <div 
            className="fixed top-16 left-0 right-0 bottom-0 z-[110] overflow-y-auto lg:hidden shadow-lg"
            style={{ 
              maxHeight: 'calc(100vh - 64px)',
              WebkitOverflowScrolling: 'touch',
              zIndex: 110,
              position: 'fixed',
              top: '64px',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgb(255, 255, 255)',
              color: 'rgb(0, 0, 0)',
              visibility: 'visible',
              opacity: 1,
              display: 'block'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 space-y-1 min-h-full" style={{ backgroundColor: 'rgb(255, 255, 255)', color: 'rgb(0, 0, 0)' }}>
              {/* Debug Info - Remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-2 p-2 bg-blue-100 dark:bg-blue-900/20 rounded text-xs">
                  Debug: Menu items count = {mobileMenuStructure?.length || 0}, 
                  showMobileMenu = {showMobileMenu ? 'true' : 'false'}
                </div>
              )}
              
              {/* Sidebar Menu Structure */}
              {mobileMenuStructure && mobileMenuStructure.length > 0 ? mobileMenuStructure.map((item) => {
                const hasChildren = 'children' in item && item.children;
                const Icon = item.icon;
                const isExpanded = expandedGroups.includes(item.id);
                const isActive = activeMenu === item.id;

                if (hasChildren) {
                  return (
                    <div key={item.id} className="space-y-1">
                      <button
                        onClick={() => toggleGroup(item.id)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                        style={{ 
                          color: 'rgb(107, 114, 128)',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'rgb(0, 0, 0)';
                          e.currentTarget.style.backgroundColor = 'rgb(243, 244, 246)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'rgb(107, 114, 128)';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} />
                          <span>{item.label}</span>
                        </div>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      
                      {isExpanded && (
                        <div className="space-y-1 pl-4">
                          {item.children?.map((child: any) => {
                            const ChildIcon = child.icon;
                            const isChildActive = activeMenu === child.id;
                            const isExternalLink = !!child.externalLink;
                            
                            return (
                              <button
                                key={child.id}
                                onClick={() => handleMobileMenuClick(child)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                                style={{
                                  color: isChildActive ? 'rgb(255, 255, 255)' : 'rgb(107, 114, 128)',
                                  backgroundColor: isChildActive ? 'rgb(0, 0, 0)' : 'transparent',
                                  boxShadow: isChildActive ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isChildActive) {
                                    e.currentTarget.style.color = 'rgb(0, 0, 0)';
                                    e.currentTarget.style.backgroundColor = 'rgb(243, 244, 246)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isChildActive) {
                                    e.currentTarget.style.color = 'rgb(107, 114, 128)';
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }
                                }}
                              >
                                <div className="relative flex items-center gap-2">
                                  <ChildIcon size={16} />
                                  <span>{child.label}</span>
                                  {isExternalLink && <ExternalLink size={12} className="opacity-60" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileMenuClick(item)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{
                      color: isActive ? 'rgb(255, 255, 255)' : 'rgb(107, 114, 128)',
                      backgroundColor: isActive ? 'rgb(0, 0, 0)' : 'transparent',
                      boxShadow: isActive ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = 'rgb(0, 0, 0)';
                        e.currentTarget.style.backgroundColor = 'rgb(243, 244, 246)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = 'rgb(107, 114, 128)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              }) : (
                <div className="text-center py-8 text-muted">
                  <p className="mb-2">菜单加载中...</p>
                  <p className="text-xs opacity-60">
                    {!sideMenuMap ? 'sideMenuMap 未传递' : 
                     typeof sideMenuMap !== 'object' ? 'sideMenuMap 类型错误' :
                     !sideMenuMap.home ? 'sideMenuMap 数据不完整' : 
                     '菜单结构为空'}
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <pre className="text-xs mt-2 p-2 bg-background rounded overflow-auto">
                      {JSON.stringify({ 
                        hasSideMenuMap: !!sideMenuMap,
                        sideMenuMapKeys: sideMenuMap ? Object.keys(sideMenuMap) : [],
                        menuLength: mobileMenuStructure?.length || 0
                      }, null, 2)}
                    </pre>
                  )}
                </div>
              )}
              
              {/* Divider */}
              <div className="h-px my-4" style={{ backgroundColor: 'rgb(229, 231, 235)' }}></div>
              
              {/* User Actions */}
              {isAuthenticated && user ? (
                <div className="space-y-1">
                  <div className="h-px my-2" style={{ backgroundColor: 'rgb(229, 231, 235)' }}></div>
                  <button
                    onClick={() => {
                      logout();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors"
                    style={{
                      color: 'rgb(239, 68, 68)',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgb(254, 242, 242)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <LogOut size={18} />
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onSignIn();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
                  style={{
                    color: 'rgb(255, 255, 255)',
                    backgroundColor: 'rgb(0, 0, 0)'
                  }}
                >
                  {t.signIn}
                </button>
              )}
            </div>
          </div>
        </>
      )}
      
      {/* Overlay to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;
