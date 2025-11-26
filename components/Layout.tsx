
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AuthModal from './AuthModal';
import NotificationModal from './NotificationModal';
import ConfirmDialog from './ConfirmDialog';
import { Language, TabItem, View } from '../types';
import { translations } from '../translations';
import { useAuthStore } from '../stores/authStore';
import { TOOLS_DATA } from '../pages/Create/data';

import MobileSidebar from './MobileSidebar';

import { AliveScope, useAliveController } from './KeepAlive';

const Layout: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState<Language>('zh');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [visitedViews, setVisitedViews] = useState<TabItem[]>([{ view: 'home' }]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchUserInfo, isAuthenticated, firstLoginInfo, clearFirstLoginInfo, user, loading } = useAuthStore();

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
  // 注意：登录成功后，login/phoneLogin 方法中已经调用了 fetchUserInfo()
  // 这里只在用户已经登录但还没有用户信息时调用（比如页面刷新后）
  useEffect(() => {
    if (isAuthenticated && !user && !loading) {
      // 只在用户已登录但没有用户信息且不在加载中时调用
      // 避免在登录过程中重复调用 fetchUserInfo
      fetchUserInfo();
    }
  }, [isAuthenticated, user, loading, fetchUserInfo]);

  const t = translations[lang];

  // Helper to map path to View type and Tool
  const getCurrentViewAndTool = (): { view: View, tool?: string, searchParams?: Record<string, string> } => {
    const path = location.pathname.substring(1) || 'home';
    const params = new URLSearchParams(location.search);
    
    // 优先从 location.state 中获取 toolKey（由 WorkshopPage 传递）
    // 但只在路径中没有明确 tool 时使用（例如 /create/useTool?tool=xxx 的情况）
    const stateToolKey = (location.state as any)?.toolKey;
    
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
          const pathTool = parts[1];
          // 优先使用路径中的 tool（因为路径是当前实际的路由）
          // 如果路径中没有 tool（例如 /create/useTool），则使用 query 参数或 state 中的 toolKey
          if (pathTool && pathTool !== 'useTool') {
            tool = pathTool;
          } else {
            // 对于 /create/useTool 这种情况，使用 query 参数或 state 中的 toolKey
            tool = tool || stateToolKey;
          }
        }
      }
    }
    else if (path === 'keys') view = 'keys';
    else if (path === 'chat') view = 'chat';
    else if (path === 'models') view = 'models';
    else if (path === 'expenses') view = 'expenses';
    else if (path === 'pricing') view = 'pricing';
    else if (path === 'assets') view = 'assets';
    else if (path === 'profile') view = 'profile';

    // 动态提取所有查询参数（排除 'tool'，因为它已经单独处理）
    const searchParams: Record<string, string> = {};
    params.forEach((value, key) => {
      if (key !== 'tool') {
        searchParams[key] = value;
      }
    });

    return { 
      view, 
      tool, 
      searchParams: Object.keys(searchParams).length > 0 ? searchParams : undefined 
    };
  };
  
  // Helper to get tool title from TOOLS_DATA
  const getToolTitle = (toolKey: string | undefined): string | undefined => {
    if (!toolKey) return undefined;
    const tool = TOOLS_DATA.find(t => t.key === toolKey || t.route === `/create/${toolKey}`);
    return tool?.title;
  };

  const { view: currentView, tool: activeTool, searchParams: currentSearchParams } = getCurrentViewAndTool();

  const { drop } = useAliveController();

  // Helper function to compare search params
  const compareSearchParams = (params1?: Record<string, string>, params2?: Record<string, string>): boolean => {
    if (!params1 && !params2) return true;
    if (!params1 || !params2) return false;
    const keys1 = Object.keys(params1).sort();
    const keys2 = Object.keys(params2).sort();
    if (keys1.length !== keys2.length) return false;
    return keys1.every(key => params1[key] === params2[key]);
  };

  // Update Tabs History and Cache
  useEffect(() => {
    setVisitedViews(prev => {
      const exists = prev.some(t => {
        if (t.view !== currentView) return false;
        if (t.view === 'create') {
          // For create view, check both activeTool and searchParams
          if (t.activeTool !== activeTool) return false;
          // Compare all search params dynamically
          return compareSearchParams(t.searchParams, currentSearchParams);
        }
        return true;
      });
      
      if (exists) return prev;

      return [...prev, { 
        view: currentView, 
        activeTool: currentView === 'create' ? activeTool : undefined,
        searchParams: currentView === 'create' ? currentSearchParams : undefined
      }];
    });
  }, [currentView, activeTool, currentSearchParams]);

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
    if (tab.view === 'create') {
      // 对于 create 视图，如果有 activeTool，导航到对应的路由
      if (tab.activeTool) {
        // 检查工具的实际路由配置
        const tool = TOOLS_DATA.find(t => t.key === tab.activeTool);
        if (tool?.route) {
          // 如果工具配置了 route，使用该 route
          // 如果 route 是 /create/useTool，需要添加 tool 参数
          if (tool.route === '/create/useTool') {
            navigate(`/create/useTool?tool=${tab.activeTool}`, { 
              replace: false,
              state: { toolKey: tab.activeTool }
            });
          } else {
            // 动态构建查询参数
            const searchParams = new URLSearchParams();
            if (tab.searchParams) {
              Object.entries(tab.searchParams).forEach(([key, value]) => {
                searchParams.set(key, value);
              });
            }
            const queryString = searchParams.toString();
            navigate(queryString ? `${tool.route}?${queryString}` : tool.route, { 
              replace: false,
              state: { toolKey: tab.activeTool }
            });
          }
        } else {
          // 如果没有配置 route，尝试直接使用路径（向后兼容）
          // 动态构建查询参数
          const searchParams = new URLSearchParams();
          if (tab.searchParams) {
            Object.entries(tab.searchParams).forEach(([key, value]) => {
              searchParams.set(key, value);
            });
          }
          const queryString = searchParams.toString();
          navigate(queryString ? `/create/${tab.activeTool}?${queryString}` : `/create/${tab.activeTool}`, { replace: false });
        }
      } else {
        // 如果没有 activeTool，导航到 create 首页
        navigate('/create', { replace: false });
      }
      return;
    }

    let path = tab.view === 'home' ? '/' : `/${tab.view}`;
    // Legacy support for query params if any other views use them
    if (tab.activeTool) {
      path += `?tool=${tab.activeTool}`;
    }
    navigate(path, { replace: false });
  };

  const handleTabClose = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const targetTab = visitedViews[index];
    const newTabs = visitedViews.filter((_, i) => i !== index);
    setVisitedViews(newTabs);

    // 当标签页关闭时，从缓存中移除对应的组件
    // 根据 view 和 tool 生成缓存 key
    // 必须与 router/index.tsx 中生成的 fullPath 保持一致
    let cacheKey = '/';
    if (targetTab.view === 'create') {
      if (targetTab.activeTool) {
        cacheKey = `/create/${targetTab.activeTool}`;
        // 动态构建查询参数
        if (targetTab.searchParams && Object.keys(targetTab.searchParams).length > 0) {
          const searchParams = new URLSearchParams();
          Object.entries(targetTab.searchParams).forEach(([key, value]) => {
            searchParams.set(key, String(value));
          });
          cacheKey = `${cacheKey}?${searchParams.toString()}`;
        }
      } else {
        cacheKey = '/create';
      }
    } else {
      cacheKey = targetTab.view === 'home' ? '/' : `/${targetTab.view}`;
    }
    
    // 确保没有双斜杠 (除根路径外)
    if (cacheKey !== '/' && cacheKey.endsWith('/')) {
        cacheKey = cacheKey.slice(0, -1);
    }
    
    // Use react-activation controller to drop the cache
    drop(cacheKey);

    // If closing active tab, navigate to last available
    const isActive = targetTab.view === currentView && 
                     (targetTab.view !== 'create' || (targetTab.activeTool === activeTool && 
                      compareSearchParams(targetTab.searchParams, currentSearchParams)));

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
    <AliveScope>
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
    </AliveScope>
  );
};

export default Layout;
    