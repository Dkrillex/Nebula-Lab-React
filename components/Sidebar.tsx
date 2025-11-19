import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Home, Box, Sparkles, Grid, Key, FileText, 
  Layers, Scissors, User, Film, Image, Repeat, Mic, Hammer, 
  UserCircle, Folder, CreditCard, DollarSign, 
  ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen 
} from 'lucide-react';

interface SidebarProps {
  t: any; // Translations for sideMenu
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ t, isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['modelCenter', 'creationCenter', 'personalCenter']);

  // Determine active menu item based on URL
  const getActiveId = () => {
    const path = location.pathname.substring(1);
    if (path === 'create') {
      return searchParams.get('tool') || 'textToImage';
    }
    // Map paths to IDs
    if (path === 'chat') return 'aiExperience';
    if (path === 'models') return 'modelSquare';
    if (path === 'keys') return 'apiKeys';
    if (path === 'expenses') return 'expenses';
    if (path === 'pricing') return 'pricing';
    if (path === 'assets') return 'assets';
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
    if (item.path) {
      navigate(item.path);
    } else if (item.tool) {
      navigate(`/create?tool=${item.tool}`);
    }
  };

  const menuStructure = [
    { id: 'home', icon: Home, label: t.home, path: '/' },
    { 
      id: 'modelCenter', 
      icon: Box, 
      label: t.modelCenter,
      children: [
        { id: 'aiExperience', icon: Sparkles, label: t.aiExperience, path: '/chat' },
        { id: 'modelSquare', icon: Grid, label: t.modelSquare, path: '/models' },
        { id: 'apiKeys', icon: Key, label: t.apiKeys, path: '/keys' },
        { id: 'apiDocs', icon: FileText, label: t.apiDocs, path: '#' },
      ]
    },
    { 
      id: 'creationCenter', 
      icon: Layers, 
      label: t.creationCenter,
      children: [
        { id: 'viralVideo', icon: Scissors, label: t.viralVideo, tool: 'viralVideo' },
        { id: 'digitalHuman', icon: User, label: t.digitalHuman, tool: 'digitalHuman' },
        { id: 'imgToVideo', icon: Film, label: t.imgToVideo, tool: 'imgToVideo' },
        { id: 'textToImage', icon: Image, label: t.textToImage, tool: 'textToImage' },
        { id: 'styleTransfer', icon: Repeat, label: t.styleTransfer, tool: 'styleTransfer' },
        { id: 'voiceClone', icon: Mic, label: t.voiceClone, tool: 'voiceClone' },
        { id: 'workshop', icon: Hammer, label: t.workshop, tool: 'workshop' },
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
      ]
    },
  ];

  return (
    <aside 
      className={`hidden lg:flex flex-col border-r border-border bg-surface/50 backdrop-blur-sm h-[calc(100vh-64px)] sticky top-16 transition-all duration-300 ease-in-out flex-shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-4 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
        {menuStructure.map((item) => {
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
                        const ChildIcon = child.icon;
                        const isChildActive = activeMenu === child.id;
                        
                        return (
                          <button
                            key={child.id}
                            onClick={() => handleMenuClick(child)}
                            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isChildActive 
                                ? 'bg-foreground text-background shadow-sm' 
                                : 'text-muted hover:text-foreground hover:bg-border/50'
                            }`}
                            title={isCollapsed ? child.label : undefined}
                          >
                            <div className="relative">
                                {isChildActive && !isCollapsed && <div className="absolute -left-7 top-1/2 -translate-y-1/2 w-1 h-4 bg-foreground rounded-r"></div>}
                                <ChildIcon size={16} />
                            </div>
                            {!isCollapsed && child.label}
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
                  ? 'bg-foreground text-background shadow-sm' 
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
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl p-4 border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-2 text-indigo-500">
                <Sparkles size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Pro Feature111</span>
              </div>
              <p className="text-xs text-muted mb-3">Unlock advanced models and faster generation speeds.</p>
              <button className="w-full py-1.5 text-xs font-medium bg-background text-foreground border border-border rounded hover:bg-foreground hover:text-background transition-colors">
                Upgrade
              </button>
          </div>
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

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex items-center justify-center p-2 rounded-lg text-muted hover:bg-border/50 hover:text-foreground transition-colors ${isCollapsed ? 'mx-auto' : 'ml-auto'}`}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;