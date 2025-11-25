import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { CURRENT_SYSTEM, SYSTEM_TYPE } from '../constants';
import { 
  Home, Box, Sparkles, Grid, Key, FileText, 
  Layers, Scissors, User, Film, Image, Repeat, Mic, Hammer, 
  UserCircle, Folder, CreditCard, DollarSign, Trophy,
  ChevronDown, ChevronRight, LogOut, ExternalLink, X
} from 'lucide-react';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sideMenuMap: any;
  t: {
    signIn: string;
    [key: string]: any;
  };
  isAuthenticated: boolean;
  user: any;
  onSignIn: () => void;
  logout: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  sideMenuMap,
  t,
  isAuthenticated,
  user,
  onSignIn,
  logout
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['modelCenter', 'creationCenter', 'personalCenter']);

  // Determine active menu item based on URL
  const getActiveId = () => {
    const path = location.pathname.substring(1);
    if (path === 'create') {
      const tool = searchParams.get('tool');
      // if (tool === 'viralVideo') return 'viralVideo'; // 已隐藏
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
    if (path === 'rank') return 'rank';
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

  const handleMenuClick = (item: any) => {
    if (item.externalLink) {
      window.open(item.externalLink, '_blank', 'noopener,noreferrer');
      onClose();
    } else if (item.path) {
      const requiresAuth = item.path === '/keys' || item.path === '/expenses';
      
      if (requiresAuth && !isAuthenticated) {
        onSignIn();
        onClose();
        return;
      }
      
      navigate(item.path);
      onClose();
    } else if (item.tool) {
      navigate(`/create?tool=${item.tool}`);
      onClose();
    }
  };

  const menuStructure = useMemo(() => {
    if (!sideMenuMap || typeof sideMenuMap !== 'object') {
      return [];
    }
    if (!sideMenuMap.home) {
      return [];
    }
    
    const allItems = [
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
          { id: 'rank', icon: Trophy, label: sideMenuMap.rank, path: '/rank' },
        ]
      },
      { 
        id: 'creationCenter', 
        icon: Layers, 
        label: sideMenuMap.creationCenter,
        children: [
          // { id: 'viralVideo', icon: Scissors, label: sideMenuMap.viralVideo, tool: 'viralVideo' }, // 已隐藏
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

    return allItems.filter(item => {
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
  }, [sideMenuMap]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed top-16 left-0 right-0 bottom-0 z-[90] overflow-y-auto lg:hidden shadow-lg bg-surface text-foreground border-t border-border"
        style={{ 
          maxHeight: 'calc(100vh - 64px)',
          WebkitOverflowScrolling: 'touch',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 space-y-1 min-h-full bg-background">
          {menuStructure && menuStructure.length > 0 ? menuStructure.map((item) => {
            const hasChildren = 'children' in item && item.children;
            const Icon = item.icon;
            const isExpanded = expandedGroups.includes(item.id);
            const isActive = activeMenu === item.id;

            if (hasChildren) {
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => toggleGroup(item.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-muted hover:text-foreground hover:bg-surface/50"
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
                            onClick={() => handleMenuClick(child)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isChildActive 
                                ? 'bg-foreground text-background shadow-sm' 
                                : 'text-muted hover:text-foreground hover:bg-surface/50'
                            }`}
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
                onClick={() => handleMenuClick(item)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-foreground text-background shadow-sm' 
                    : 'text-muted hover:text-foreground hover:bg-surface/50'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          }) : (
            <div className="text-center py-8 text-muted">
              <p className="mb-2">菜单加载中...</p>
            </div>
          )}
          
          <div className="h-px my-4 bg-border"></div>
          
          {isAuthenticated && user ? (
            <div className="space-y-1">
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={18} />
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onSignIn();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-90 bg-foreground text-background"
            >
              {t.signIn}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;

