
import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import GlobalAuthModal from './GlobalAuthModal';
import NotificationModal from './NotificationModal';
import ConfirmDialog from './ConfirmDialog';
import { Language, TabItem, View } from '../types';
import { translations } from '../translations';
import { useAuthStore } from '../stores/authStore';
import { TOOLS_DATA } from '../pages/Create/data';
import { showAuthModal } from '../lib/authModalManager';

import MobileSidebar from './MobileSidebar';

import { AliveScope, useAliveController } from './KeepAlive';
import { CURRENT_SYSTEM, SYSTEM_TYPE } from '../constants';

const Layout: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState<Language>('zh');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // 当 CURRENT_SYSTEM === SYSTEM_TYPE.BOTH 时，不初始化任何 tab（初始状态不选中任何）
  const getInitialVisitedViews = (): TabItem[] => {
    if (CURRENT_SYSTEM === SYSTEM_TYPE.BOTH) {
      // BOTH 模式时，初始状态不添加任何 tab
      return [];
    }
    return [{ view: 'home' }];
  };
  
  const [visitedViews, setVisitedViews] = useState<TabItem[]>(getInitialVisitedViews());
  
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

  // 当 CURRENT_SYSTEM === SYSTEM_TYPE.BOTH 且访问根路径时，自动导航到创作中心首页
  // 只在首次加载时执行，避免循环导航
  // 但是如果有 expand 参数，说明是用户点击了一级菜单，不应该重定向
  // 注意：重定向逻辑已移至 router/routes/core.tsx 中，使用 Navigate 组件处理
  // 这样可以避免 React Router 和 KeepAlive 的冲突

  const t = translations[lang];

  // Helper to map path to View type and Tool
  const getCurrentViewAndTool = (): { view: View, tool?: string, searchParams?: Record<string, string> } => {
    const path = location.pathname.substring(1) || 'home';
    const params = new URLSearchParams(location.search);
    
    // 优先从 location.state 中获取 toolKey（由 WorkshopPage 传递）
    // 但只在路径中没有明确 tool 时使用（例如 /create/useTool?tool=xxx 的情况）
    const stateToolKey = (location.state as any)?.toolKey;
    
    // Map URL path to View type
    // 当 CURRENT_SYSTEM === SYSTEM_TYPE.BOTH 且路径为 '/' 时，返回 'models' view（模型中心首页）
    let view: View = 'home';
    if (path === 'home' || path === '') {
      if (CURRENT_SYSTEM === SYSTEM_TYPE.BOTH) {
        // BOTH 模式时，路径 '/' 对应模型中心首页
        view = 'models';
      } else {
        view = 'home';
      }
    }
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

    // 动态提取所有查询参数（排除 'tool' 和 'expand'，因为它们已经单独处理或用于内部逻辑）
    const searchParams: Record<string, string> = {};
    params.forEach((value, key) => {
      if (key !== 'tool' && key !== 'expand') {
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

  // 使用 useMemo 缓存 getCurrentViewAndTool 的结果，避免每次渲染都创建新的对象引用
  // 使用 location.pathname 和 location.search 作为依赖项，确保只在路径或查询参数改变时重新计算
  const viewAndTool = useMemo(() => {
    const result = getCurrentViewAndTool();
    // 调试信息
    if (process.env.NODE_ENV === 'development') {
      console.log('Layout - getCurrentViewAndTool - path:', location.pathname, 'result:', result);
    }
    return result;
  }, [location.pathname, location.search]);
  
  const { view: currentView, tool: activeTool, searchParams: currentSearchParams } = viewAndTool;
  
  // 序列化 searchParams 用于依赖项比较，避免对象引用变化导致的无限循环
  const searchParamsKey = useMemo(() => {
    if (!currentSearchParams) return '';
    return JSON.stringify(Object.keys(currentSearchParams).sort().map(key => `${key}=${currentSearchParams[key]}`).join('&'));
  }, [currentSearchParams]);

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
      // 当 CURRENT_SYSTEM === SYSTEM_TYPE.BOTH 时，过滤掉 'home' view
      const filteredPrev = CURRENT_SYSTEM === SYSTEM_TYPE.BOTH 
        ? prev.filter(t => t.view !== 'home')
        : prev;
      
      const exists = filteredPrev.some(t => {
        if (t.view !== currentView) return false;
        if (t.view === 'create') {
          // For create view, check both activeTool and searchParams
          if (t.activeTool !== activeTool) return false;
          // Compare all search params dynamically
          return compareSearchParams(t.searchParams, currentSearchParams);
        }
        return true;
      });
      
      // 调试信息
      if (process.env.NODE_ENV === 'development') {
        console.log('Layout - visitedViews 更新 - currentView:', currentView, 'activeTool:', activeTool, 'currentSearchParams:', currentSearchParams, 'exists:', exists, 'filteredPrev.length:', filteredPrev.length);
      }
      
      if (exists) return filteredPrev;

      // 当 CURRENT_SYSTEM === SYSTEM_TYPE.BOTH 时，不允许添加 'home' view
      if (CURRENT_SYSTEM === SYSTEM_TYPE.BOTH && currentView === 'home') {
        return filteredPrev;
      }

      // 当 CURRENT_SYSTEM === SYSTEM_TYPE.BOTH 时，如果 view === 'create' 且没有 activeTool，不添加到 tab
      // 但是，我们需要确保内容仍然可以渲染，所以不阻止添加到 visitedViews
      // 只是不在 Header 中显示这个 tab（通过 getTabLabel 返回空字符串来实现）
      // 因此，这里不再阻止添加到 visitedViews，让内容可以正常渲染
      // if (CURRENT_SYSTEM === SYSTEM_TYPE.BOTH && currentView === 'create' && !activeTool) {
      //   return filteredPrev;
      // }

      // 当 CURRENT_SYSTEM === SYSTEM_TYPE.BOTH 时，如果 view === 'models' 且路径是 '/'，不添加到 tab（模型中心首页）
      if (CURRENT_SYSTEM === SYSTEM_TYPE.BOTH && currentView === 'models' && location.pathname === '/') {
        return filteredPrev;
      }

      return [...filteredPrev, { 
        view: currentView, 
        activeTool: currentView === 'create' ? activeTool : undefined,
        searchParams: currentView === 'create' ? currentSearchParams : undefined
      }];
    });
  }, [currentView, activeTool, searchParamsKey]); // 使用序列化的 searchParamsKey 而不是对象引用

  // 注意：缓存列表由 CachedOutlet 自动管理，这里不需要手动更新
  // 只在标签页关闭时清除对应的缓存

  // Navigation Handlers
  const handleNavClick = (href: string) => {
    if (href === '#') {
      // 当 CURRENT_SYSTEM === SYSTEM_TYPE.BOTH 时，导航到创作中心
      if (CURRENT_SYSTEM === SYSTEM_TYPE.BOTH) {
        navigate('/create');
      } else {
        navigate('/');
      }
    } else if (href.startsWith('#')) {
        const path = href.substring(1);
        navigate(path === 'home' ? '/' : `/${path}`);
    } else {
        // 当 CURRENT_SYSTEM === SYSTEM_TYPE.BOTH 时，处理一级菜单点击
        if (CURRENT_SYSTEM === SYSTEM_TYPE.BOTH) {
          // 点击"模型中心"时，导航到 /，显示模型中心首页，并使用 URL 参数来触发展开菜单
          if (href === '/models') {
            navigate('/?expand=modelCenter');
            return;
          }
          // 点击"创作中心"时，使用 URL 参数来触发展开菜单
          if (href === '/create') {
            navigate('/create?expand=creationCenter');
            return;
          }
        }
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
    const isActive = targetTab.view === currentView && (
      targetTab.view !== 'create'
        ? true
        : (targetTab.activeTool === activeTool &&
           compareSearchParams(targetTab.searchParams, currentSearchParams))
    );

    if (isActive) {
      if (newTabs.length > 0) {
        const lastTab = newTabs[newTabs.length - 1];
        handleTabClick(lastTab);
      } else {
        // 当最后一个 tab 关闭时，导航到创作中心首页
        if (CURRENT_SYSTEM === SYSTEM_TYPE.BOTH) {
          navigate('/create', { replace: true });
        } else {
          navigate('/');
        }
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
          onSignIn={() => showAuthModal(() => fetchUserInfo())}
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
          <Outlet context={{ t: safeT, handleNavClick, onSignIn: () => showAuthModal(() => fetchUserInfo()) }} />
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
            showAuthModal(() => fetchUserInfo());
          }}
          logout={() => {
             useAuthStore.getState().logout();
             setIsMobileMenuOpen(false);
          }}
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

      {/* 全局登录弹窗 - 用于 request.tsx 和其他地方通过全局方法调用 */}
      <GlobalAuthModal />
      </div>
    </AliveScope>
  );
};

export default Layout;
    