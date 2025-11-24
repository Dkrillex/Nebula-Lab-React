import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Home, Box, Sparkles, Grid, Key, FileText, 
  Layers, Scissors, User, Film, Image, Repeat, Mic, Hammer, 
  UserCircle, Folder, CreditCard, DollarSign, Trophy,
  ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen, ExternalLink,
  RefreshCcw, MessageSquare, MonitorPlay, X
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { CURRENT_SYSTEM, SYSTEM_TYPE } from '../constants';

interface SidebarProps {
  t: any; // Translations for sideMenu
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  onSignIn?: () => void; // 登录弹窗回调
}

const Sidebar: React.FC<SidebarProps> = ({ t, isCollapsed, setIsCollapsed, onSignIn }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['modelCenter', 'creationCenter', 'personalCenter']);
  const [showPromo, setShowPromo] = useState(true);

  // Determine active menu item based on URL
  const getActiveId = () => {
    const path = location.pathname;
    
    // Handle /create routes
    if (path.startsWith('/create')) {
      // split path: /create/viralVideo -> ['', 'create', 'viralVideo']
      const parts = path.split('/').filter(Boolean);
      const tool = parts[1]; // undefined if just /create
      
      if (!tool || tool === 'home') return 'home';
      
      // if (tool === 'viralVideo') return 'viralVideo'; // 已隐藏
      if (tool === 'digitalHuman') return 'digitalHuman';
      if (tool === 'imgToVideo') return 'imgToVideo';
      if (tool === 'textToImage') return 'textToImage';
      if (tool === 'styleTransfer') return 'styleTransfer';
      if (tool === 'voiceClone') return 'voiceClone';
      if (tool === 'workshop') return 'workshop';
      
      // Workshop items mapping
      if (['faceSwap', 'aiFaceSwap', 'aIFacSwapping', 'ttsTool', 'tts', 'glbViewer', '3dModel', 'imageTranslation', 'videoTranslation', 'useTool', 'templateUi'].includes(tool)) {
        return 'workshop';
      }
      
      // Check search params for legacy support or deep links
      const paramTool = searchParams.get('tool');
      if (paramTool) {
         // if (paramTool === 'viralVideo') return 'viralVideo'; // 已隐藏
         // ... other checks if needed, but path takes precedence now
      }

      return 'home';
    }

    // Map other paths to IDs
    const cleanPath = path.substring(1);
    if (cleanPath === 'chat') return 'aiExperience';
    if (cleanPath === 'models') return 'modelSquare';
    if (cleanPath === 'keys') return 'apiKeys';
    if (cleanPath === 'rank') return 'rank';
    if (cleanPath === 'expenses') return 'expenses';
    if (cleanPath === 'pricing') return 'pricing';
    if (cleanPath === 'assets') return 'assets';
    if (cleanPath === 'profile') return 'profile';
    if (cleanPath === '') return 'home';
    return '';
  };

  const activeMenu = getActiveId();

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const handleMenuClick = (item: any) => {
    if (item.externalLink) {
      // 外链，在新窗口打开
      window.open(item.externalLink, '_blank', 'noopener,noreferrer');
    } else if (item.path) {
      // 检查是否需要登录的路径
      const requiresAuth = item.path === '/keys' || item.path === '/expenses';
      
      if (requiresAuth && !isAuthenticated) {
        // 未登录，弹出登录窗口
        if (onSignIn) {
          onSignIn();
        }
        return;
      }
      
      navigate(item.path);
    } else if (item.tool) {
      // Updated navigation logic for new routes
      if (item.tool === 'workshop') {
         navigate('/create/workshop');
      } else {
         navigate(`/create/${item.tool}`);
      }
    }
  };

  const allMenuStructure = [
    { id: 'home', icon: Home, label: t.home, path: '/create' },
    { 
      id: 'modelCenter', 
      icon: Box, 
      label: t.modelCenter,
      children: [
        { id: 'aiExperience', icon: Sparkles, label: t.aiExperience, path: '/chat' },
        { id: 'modelSquare', icon: Grid, label: t.modelSquare, path: '/models' },
        { id: 'apiKeys', icon: Key, label: t.apiKeys, path: '/keys' },
        { id: 'apiDocs', icon: FileText, label: t.apiDocs, externalLink: 'https://s.apifox.cn/34d9d7f6-bfe9-4f3a-a084-2d88f34b7ed1/7231166m0' },
        { id: 'rank', icon: Trophy, label: 'Leaderboard', path: '/rank' },
      ]
    },
    { 
      id: 'creationCenter', 
      icon: Layers, 
      label: t.creationCenter,
      children: [
        // { id: 'viralVideo', icon: Scissors, label: t.viralVideo, tool: 'viralVideo' }, // 已隐藏
        { id: 'digitalHuman', icon: User, label: t.digitalHuman, tool: 'digitalHuman' },
        { id: 'imgToVideo', icon: Film, label: t.imgToVideo, tool: 'imgToVideo' },
        { id: 'textToImage', icon: Image, label: t.textToImage, tool: 'textToImage' },
        { id: 'styleTransfer', icon: Repeat, label: t.styleTransfer, tool: 'styleTransfer' },
        { id: 'voiceClone', icon: Mic, label: t.voiceClone, tool: 'voiceClone' },
        { 
          id: 'workshop', 
          icon: Hammer, 
          label: t.workshop, 
          tool: 'workshop'
        },
      ]
    },
    { 
      id: 'personalCenter', 
      icon: UserCircle, 
      label: t.personalCenter,
      children: [
        { id: 'assets', icon: Folder, label: t.assets, path: '/assets' },
        { id: 'pricing', icon: CreditCard, label: t.pricing, path: '/pricing' },
        { id: 'expenses', icon: DollarSign, label: t.expenses, path: '/expenses' },
        { id: 'profile', icon: UserCircle, label: t.profile || '个人中心', path: '/profile' },
      ]
    },
  ];

  const menuStructure = allMenuStructure.filter(item => {
    if (CURRENT_SYSTEM === SYSTEM_TYPE.BOTH) return true;
    if (item.id === 'personalCenter') return true;
    
    if (CURRENT_SYSTEM === SYSTEM_TYPE.MODEL_CENTER) {
      return item.id === 'modelCenter';
    }
    
    if (CURRENT_SYSTEM === SYSTEM_TYPE.CREATION_CENTER) {
      return item.id === 'creationCenter' || item.id === 'home';
    }
    return false;
  });

  const getActiveCategory = () => {
    const path = location.pathname;
    if (path.startsWith('/chat') || path.startsWith('/models') || path.startsWith('/keys')) return 'modelCenter';
    if (path.startsWith('/create')) return 'creationCenter';
    if (path.startsWith('/assets') || path.startsWith('/pricing') || path.startsWith('/expenses') || path.startsWith('/profile')) return 'personalCenter';
    
    if (CURRENT_SYSTEM === SYSTEM_TYPE.MODEL_CENTER) return 'modelCenter';
    return 'creationCenter';
  };

  const activeCategory = getActiveCategory();

  const displayedItems = React.useMemo(() => {
     const categoryItem = menuStructure.find(item => item.id === activeCategory);
     // If found category has children, return them. Otherwise return empty or the category itself (unlikely given structure)
     return categoryItem?.children || [];
  }, [activeCategory, menuStructure]);

  return (
    <aside 
      className={`hidden lg:flex flex-col border-r border-border bg-surface/50 backdrop-blur-sm h-[calc(100vh-64px)] sticky top-16 transition-all duration-300 ease-in-out flex-shrink-0 ${
        isCollapsed ? 'w-20' : 'w-52'
      }`}
    >
      <div className="p-4 space-y-1 overflow-y-auto flex-1 custom-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {displayedItems.map((item: any) => {
          const hasChildren = 'children' in item && item.children;
          const Icon = item.icon;
          const isExpanded = expandedGroups.includes(item.id);
          const isActive = activeMenu === item.id;

          if (hasChildren) {
            return (
              <div key={item.id} className="space-y-1">
                  <button
                  onClick={() => toggleGroup(item.id)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-border/30 transition-colors`}
                  title={isCollapsed ? item.label : undefined}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                      <Icon size={18} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>
                    {!isCollapsed && (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                  </button>
                  
                  {isExpanded && (
                    <div className={`space-y-1 ${isCollapsed ? '' : 'pl-4'}`}>
                      {item.children?.map((child: any) => {
                        const hasGrandChildren = 'children' in child && child.children;
                        const ChildIcon = child.icon;
                        
                        if (hasGrandChildren) {
                          const isGrandChildExpanded = expandedGroups.includes(child.id);
                          const isChildActive = activeMenu === child.id;

                          return (
                            <div key={child.id} className="space-y-1">
                              <button
                                onClick={() => toggleGroup(child.id)}
                                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-border/30 transition-colors`}
                                title={isCollapsed ? child.label : undefined}
                              >
                                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                                  <ChildIcon size={18} />
                                  {!isCollapsed && <span>{child.label}</span>}
                                </div>
                                {!isCollapsed && (isGrandChildExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                              </button>

                              {isGrandChildExpanded && (
                                <div className={`space-y-1 ${isCollapsed ? '' : 'pl-4'}`}>
                                  {child.children?.map((grandChild: any) => {
                                    const GrandChildIcon = grandChild.icon;
                                    const isGrandChildActive = activeMenu === grandChild.id;
                                    
                                    return (
                                      <button
                                        key={grandChild.id}
                                        onClick={() => handleMenuClick(grandChild)}
                                        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                          isGrandChildActive 
                                            ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 dark:from-indigo-400/30 dark:to-purple-400/30 text-indigo-700 dark:text-indigo-100' 
                                            : 'text-muted hover:text-foreground hover:bg-border/50'
                                        }`}
                                        title={isCollapsed ? grandChild.label : undefined}
                                      >
                                        <div className="relative flex items-center gap-2">
                                            {isGrandChildActive && !isCollapsed && <div className="absolute -left-7 top-1/2 -translate-y-1/2 w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r"></div>}
                                            <GrandChildIcon size={16} />
                                        </div>
                                        {!isCollapsed && <span className="flex-1">{grandChild.label}</span>}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }

                        const isChildActive = activeMenu === child.id && !child.externalLink;
                        const isExternalLink = !!child.externalLink;
                        
                        return (
                          <button
                            key={child.id}
                            onClick={() => handleMenuClick(child)}
                            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isChildActive 
                                ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 dark:from-indigo-400/30 dark:to-purple-400/30 text-indigo-700 dark:text-indigo-100' 
                                : 'text-muted hover:text-foreground hover:bg-border/50'
                            }`}
                            title={isCollapsed ? child.label : undefined}
                          >
                            <div className="relative flex items-center gap-3">
                                {isChildActive && !isCollapsed && <div className="absolute -left-7 top-1/2 -translate-y-1/2 w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r"></div>}
                                <ChildIcon size={16} />
                                {!isCollapsed && isExternalLink && <ExternalLink size={12} className="opacity-60" />}
                            </div>
                            {!isCollapsed && <span className="flex-1">{child.label}</span>}
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
              onClick={() => handleMenuClick(item)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 dark:from-indigo-400/30 dark:to-purple-400/30 text-indigo-700 dark:text-indigo-100' 
                  : 'text-muted hover:text-foreground hover:bg-border/50'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={18} />
              {!isCollapsed && item.label}
            </button>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-border bg-surface/30 flex flex-col gap-4">
        {!isCollapsed ? (
          showPromo && (
            <div className="relative bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl p-4 border border-indigo-500/20">
                <button 
                  onClick={() => setShowPromo(false)}
                  className="absolute top-2 right-2 text-indigo-500/50 hover:text-indigo-500 transition-colors"
                >
                  <X size={14} />
                </button>
                <div className="flex items-start gap-3 mb-2 text-indigo-500">
                  <Sparkles size={16} className="mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider">NebulaLab</span>
                    <span className="text-xs font-bold uppercase tracking-wider">全新版本上线!!</span>
                  </div>
              </div>
              {/* 新增个logo */}
                <div className="flex justify-center">
                  <img src="/img/lab.png" alt="NebulaLab" className="w-20 h-20 animate-float" />
              </div>
              {/* <p className="text-xs text-muted mb-3">Unlock advanced models and faster generation speeds.</p> */}
              {/* <button className="w-full py-1.5 text-xs font-medium bg-background text-foreground border border-indigo-500/20 rounded hover:bg-gradient-to-br hover:from-indigo-500/20 hover:to-purple-500/20 hover:text-indigo-700 dark:hover:text-indigo-100 transition-colors">
                Upgrade
              </button> */}
          </div>
          )
        ) : (
          <div className="flex justify-center py-2">
            <button 
              className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-colors"
              title="Upgrade to Pro"
            >
              <Sparkles size={18} />
            </button>
          </div>
        )}

        {/* 隐私协议、备案信息和折叠按钮在同一行 */}
        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <>
              <div className="flex items-center gap-2 text-xs text-muted flex-1">
                <a 
                  href="/#/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  隐私协议
                </a>
                <span className="text-border">|</span>
                <div className="relative group cursor-pointer hover:text-foreground transition-colors">
                  <span>备案信息</span>
                  <div className="absolute bottom-full left-0 mb-2 w-max px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-border">
                    <p>粤ICP备2022093288号-4</p>
                    <p>Copyright © 2025</p>
                    <p>星雲數據(香港)有限公司</p>
                  </div>
                </div>
              </div>
            </>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex items-center justify-center p-2 rounded-lg text-muted hover:bg-border/50 hover:text-foreground transition-colors flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;