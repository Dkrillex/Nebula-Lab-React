import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Moon, Sun, Menu, Globe, X, Home, User as UserIcon, User, LogOut, Settings, CreditCard, Box, Sparkles, Grid, Key, FileText, Layers, Scissors, Film, Image, Repeat, Mic, Hammer, UserCircle, Folder, DollarSign, ChevronDown, ChevronRight, ExternalLink, ChevronLeft, ChevronRight as ChevronRightIcon, Bell } from 'lucide-react';
import { Language, NavItem, View, TabItem } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import MobileSidebar from './MobileSidebar';
import { CURRENT_SYSTEM, SYSTEM_TYPE } from '../constants';
import { getToolsData } from '../pages/Create/data';

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
  onOpenNotification: () => void;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
  t: {
    searchPlaceholder: string;
    signIn: string;
    nav: NavItem[];
    profile?: string;
    notifications?: string;
  };
}

const Header: React.FC<HeaderProps> = ({ 
  isDark, toggleTheme, lang, setLang, onSignIn, onNavClick, 
  currentView, activeTool, sideMenuMap, visitedViews, onTabClick, onTabClose, onOpenNotification, t,
  onMobileMenuToggle, isMobileMenuOpen
}) => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // 标签页滚动相关
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  const toggleLang = () => {
    // 目前只在 zh/en 之间切换，暂时隐藏印尼语
    // if (lang === 'zh') {
    //   setLang('en');
    // } else if (lang === 'en') {
    //   setLang('id');
    // } else {
    //   setLang('zh');
    // }
    if (lang === 'zh') {
      setLang('en');
    } else {
      setLang('zh');
    }
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
    
    // 点击模型中心时跳转到简介页面
    let targetHref = href;
    if (href === '/models') {
      targetHref = '/models-intro';
    }    
    
    onNavClick(targetHref);
    setShowUserMenu(false);
  };

  // 根据当前语言获取工具数据
  const toolsData = useMemo(() => getToolsData(lang), [lang]);

  // Determine active menu item based on URL (same logic as Sidebar)
  const getTabLabel = (tab: TabItem) => {
    if (!sideMenuMap) return tab.view;
    if (tab.view === 'home') return sideMenuMap.home;
    if (tab.view === 'create') {
      if (tab.activeTool) {
        // 首先尝试从 toolsData 中获取 title（根据当前语言）
        const tool = toolsData.find(t => t.key === tab.activeTool || t.route === `/create/${tab.activeTool}`);
        if (tool) {
          let title = tool.title;
          // 对于 product-replace，如果有 taskId，在标题后添加 taskId 的简短标识
          if (tab.activeTool === 'product-replace' && tab.searchParams?.taskId) {
            // 显示 taskId 的后 6 位作为标识
            const shortTaskId = tab.searchParams.taskId.length > 6 ? tab.searchParams.taskId.slice(-6) : tab.searchParams.taskId;
            title = `${title}`;
          }
          return title;
        }
        
        // 如果找不到，尝试从翻译映射中获取
        // 将 aiFaceSwap 映射到 faceSwap 的翻译，tts 映射到 ttsTool 的翻译，3dModel 映射到 glbViewer 的翻译
        let toolKey = tab.activeTool;
        if (tab.activeTool === 'aiFaceSwap') {
          toolKey = 'faceSwap';
        } else if (tab.activeTool === 'tts') {
          toolKey = 'ttsTool';
        } else if (tab.activeTool === '3dModel') {
          toolKey = 'glbViewer';
        } else if (tab.activeTool === 'product-replace') {
          toolKey = 'productReplace';
        }
        let label = sideMenuMap[toolKey] || tab.activeTool;
        // 对于 product-replace，如果有 taskId，在标签后添加 taskId 的简短标识
        if (tab.activeTool === 'product-replace' && tab.searchParams?.taskId) {
          const shortTaskId = tab.searchParams.taskId.length > 6 ? tab.searchParams.taskId.slice(-6) : tab.searchParams.taskId;
          label = `${label}`;
        }
        return label;
      }
      return sideMenuMap.creationCenter;
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

  // Filter nav items based on CURRENT_SYSTEM
  const filteredNav = t.nav.filter(item => {
    if (CURRENT_SYSTEM === SYSTEM_TYPE.BOTH) return true;
    if (item.href === '/profile') return true; // Always show profile
    
    if (CURRENT_SYSTEM === SYSTEM_TYPE.MODEL_CENTER) {
      return item.href === '/models';
    }
    if (CURRENT_SYSTEM === SYSTEM_TYPE.CREATION_CENTER) {
      return item.href === '/create';
    }
    return false;
  });


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
                 {/* <div className="h-8 w-8 rounded-lg bg-foreground text-background flex items-center justify-center transition-colors shadow-sm"> */}
              {/* <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg> */}
              {/* <img src="/public/img/lab.png" alt="NebulaLab" className="w-8 h-8" />
            </div> */}
          <div className="h-8 w-8 flex items-center justify-center">
            {/* <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg> */}
            <img src="/img/lab.png" alt={CURRENT_SYSTEM === SYSTEM_TYPE.MODEL_CENTER ? 'NebulaAPI' : 'NebulaLab'} className="w-8 h-8 object-contain" />
          </div>
            <span className="text-lg font-bold tracking-tight text-foreground hidden sm:block">
              {CURRENT_SYSTEM === SYSTEM_TYPE.MODEL_CENTER ? 'NebulaAPI' : 'NebulaLab'}
            </span>
          </div>
        </div>

        {/* Center: Tags View */}
        <div className="flex-1 flex items-center min-w-0 overflow-hidden">
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
              // 动态获取当前 URL 的所有查询参数（排除 'tool'）
              const currentSearchParams: Record<string, string> = {};
              searchParams.forEach((value, key) => {
                if (key !== 'tool') {
                  currentSearchParams[key] = value;
                }
              });
              
              // 比较 searchParams 的辅助函数
              const compareSearchParams = (params1?: Record<string, string>, params2?: Record<string, string>): boolean => {
                if (!params1 && !params2) return true;
                if (!params1 || !params2) return false;
                const keys1 = Object.keys(params1).sort();
                const keys2 = Object.keys(params2).sort();
                if (keys1.length !== keys2.length) return false;
                return keys1.every(key => params1[key] === params2[key]);
              };
              
              // 首页 Tab 在模型中心简介和创作中心首页时也保持高亮
              const isHomeActive = tab.view === 'home' && 
                (currentView === 'home' || currentView === 'models-intro' || (currentView === 'create' && !activeTool));
              
              const isActive = isHomeActive || (tab.view === currentView && 
                               (tab.view === 'create' 
                                 ? (tab.activeTool === activeTool && compareSearchParams(tab.searchParams, Object.keys(currentSearchParams).length > 0 ? currentSearchParams : undefined))
                                 : tab.view === 'chat'
                                   ? compareSearchParams(tab.searchParams, Object.keys(currentSearchParams).length > 0 ? currentSearchParams : undefined)
                                   : true
                               ));
              
              // 生成唯一的 key，包含所有查询参数（如果存在）
              let tabKey = `${tab.view}-${tab.activeTool || index}`;
              if ((tab.view === 'create' || tab.view === 'chat') && tab.searchParams && Object.keys(tab.searchParams).length > 0) {
                const paramsKey = Object.entries(tab.searchParams)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([key, value]) => `${key}=${value}`)
                  .join('&');
                tabKey = `${tab.view}-${tab.activeTool || ''}-${paramsKey}`;
              }
              return (
                <div 
                  key={tabKey}
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
        </div>

        {/* Right: Nav & Actions */}
        <div className="flex-shrink-0 flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted">
            {filteredNav.map((item) => {
              // Determine if item is active based on current view/path
              const isActive = 
                (item.href === '/models' && ['models-intro','models', 'chat', 'keys'].includes(currentView)) ||
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
            {/* 充值链接 */}
            <a 
              href="/pricing" 
              onClick={(e) => handleNavClick(e, '/pricing')}
              className={`transition-colors ${currentView === 'pricing' ? 'text-foreground font-semibold' : 'hover:text-foreground'}`}
            >
              {lang === 'zh' ? '充值' : lang === 'id' ? 'Isi Ulang' : 'Recharge'}
            </a>
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
                          {t.expenses || 'Expenses'}
                        </button>
                        <button 
                          onClick={() => {
                            onOpenNotification();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-background rounded-lg transition-colors"
                        >
                          <Bell size={16} />
                          {t.notifications || 'Notifications'}
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
                          {t.signOut || 'Sign out'}
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
                 if (onMobileMenuToggle) onMobileMenuToggle();
               }}
               className="lg:hidden text-muted hover:text-foreground transition-colors relative z-[80]"
               aria-label="Toggle mobile menu"
             >
               {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </div>
      </div>
      
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
