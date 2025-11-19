
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Image, Video, Wand2, Eraser, Upload, ArrowRight, Sparkles, 
  PenTool, Star, User, Clock, ChevronDown, ChevronRight, 
  Layers, Users, PanelLeftClose, PanelLeftOpen, Home, Box, 
  Key, FileText, Scissors, Film, Repeat, Mic, Hammer, 
  Folder, CreditCard, DollarSign, UserCircle, Grid
} from 'lucide-react';
import TextToImagePage from './components/TextToImagePage';
import ViralVideoPage from './components/ViralVideoPage';
import ImageToVideoPage from './components/ImageToVideoPage';
import DigitalHumanPage from './components/DigitalHumanPage';

interface CreatePageProps {
  onNavigate: (path: string) => void;
  t: {
    greeting: string;
    greetingSuffix: string;
    inputPlaceholder: string;
    send: string;
    upload: string;
    sideMenu: {
      home: string;
      modelCenter: string;
      creationCenter: string;
      personalCenter: string;
      // Model Center items
      aiExperience: string;
      modelSquare: string;
      apiKeys: string;
      apiDocs: string;
      // Creation Center items
      viralVideo: string;
      digitalHuman: string;
      imgToVideo: string;
      textToImage: string;
      styleTransfer: string;
      voiceClone: string;
      workshop: string;
      // Personal Center items
      assets: string;
      pricing: string;
      expenses: string;
    };
    shortcuts: {
      video: string;
      videoDesc: string;
      avatar: string;
      avatarDesc: string;
      transform: string;
      transformDesc: string;
      sketch: string;
      sketchDesc: string;
      inpainting: string;
      inpaintingDesc: string;
    };
    tabs: string[];
    textToImage?: any;
    viralVideo?: any;
    imgToVideo?: any;
    digitalHuman?: any;
  };
}

const CreatePage: React.FC<CreatePageProps> = ({ t, onNavigate }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Default to home (dashboard) if no tool is specified
  const activeMenu = searchParams.get('tool') || 'home';
  
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['modelCenter', 'creationCenter', 'personalCenter']);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const onMenuChange = (id: string) => {
    setSearchParams({ tool: id });
  };

  const handleMenuClick = (item: any) => {
    if (item.path) {
      onNavigate(item.path);
    } else {
      onMenuChange(item.id);
    }
  };

  const menuStructure = [
    { id: 'home', icon: Home, label: t.sideMenu.home, path: '/create' },
    { 
      id: 'modelCenter', 
      icon: Box, 
      label: t.sideMenu.modelCenter,
      children: [
        { id: 'aiExperience', icon: Sparkles, label: t.sideMenu.aiExperience, path: '#chat' },
        { id: 'modelSquare', icon: Grid, label: t.sideMenu.modelSquare, path: '#models' },
        { id: 'apiKeys', icon: Key, label: t.sideMenu.apiKeys, path: '#keys' },
        { id: 'apiDocs', icon: FileText, label: t.sideMenu.apiDocs, path: '#' },
      ]
    },
    { 
      id: 'creationCenter', 
      icon: Layers, 
      label: t.sideMenu.creationCenter,
      children: [
        { id: 'viralVideo', icon: Scissors, label: t.sideMenu.viralVideo },
        { id: 'digitalHuman', icon: User, label: t.sideMenu.digitalHuman },
        { id: 'imgToVideo', icon: Film, label: t.sideMenu.imgToVideo },
        { id: 'textToImage', icon: Image, label: t.sideMenu.textToImage },
        { id: 'styleTransfer', icon: Repeat, label: t.sideMenu.styleTransfer },
        { id: 'voiceClone', icon: Mic, label: t.sideMenu.voiceClone },
        { id: 'workshop', icon: Hammer, label: t.sideMenu.workshop },
      ]
    },
    { 
      id: 'personalCenter', 
      icon: UserCircle, 
      label: t.sideMenu.personalCenter,
      children: [
        { id: 'assets', icon: Folder, label: t.sideMenu.assets, path: '#assets' },
        { id: 'pricing', icon: CreditCard, label: t.sideMenu.pricing, path: '#pricing' },
        { id: 'expenses', icon: DollarSign, label: t.sideMenu.expenses, path: '#expenses' },
      ]
    },
  ];

  const renderContent = () => {
    if (activeMenu === 'textToImage' && t.textToImage) {
      return <TextToImagePage t={t.textToImage} />;
    }
    if (activeMenu === 'viralVideo' && t.viralVideo) {
      return <ViralVideoPage t={t.viralVideo} />;
    }
    if (activeMenu === 'imgToVideo' && t.imgToVideo) {
      return <ImageToVideoPage t={t.imgToVideo} />;
    }
    if (activeMenu === 'digitalHuman' && t.digitalHuman) {
      return <DigitalHumanPage t={t.digitalHuman} />;
    }
    
    // Default Create Dashboard (when no tool or dashboard selected)
    // For now, defaulting to TextToImage if 'tool' param is missing, handled by init state.
    // But if activeMenu doesn't match a component, we show dashboard.
    
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
            {/* Hero Greeting */}
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-8">
                {t.greeting} <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent flex-inline items-center gap-2">{t.greetingSuffix} <Sparkles className="inline-block w-8 h-8 text-yellow-400" /></span>
              </h1>

              {/* Input Box */}
              <div className="max-w-3xl mx-auto relative">
                <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-lg transition-shadow focus-within:shadow-xl focus-within:ring-1 focus-within:ring-primary">
                  <textarea 
                    placeholder={t.inputPlaceholder}
                    className="w-full h-32 resize-none bg-transparent p-6 text-lg focus:outline-none text-foreground placeholder-muted/60"
                  />
                  <div className="flex items-center justify-between px-4 py-3 bg-background/50 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:bg-background hover:text-foreground transition-colors">
                        <Upload size={16} />
                        {t.upload}
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted hidden sm:inline">Enter {t.send} · Shift + Enter New Line</span>
                      <button className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
              <ActionCard 
                icon={<Video className="text-blue-500" size={24} />} 
                title={t.shortcuts.video} 
                desc={t.shortcuts.videoDesc} 
                color="bg-blue-500/10"
              />
              <ActionCard 
                icon={<Image className="text-purple-500" size={24} />} 
                title={t.shortcuts.avatar} 
                desc={t.shortcuts.avatarDesc} 
                color="bg-purple-500/10"
              />
              <ActionCard 
                icon={<Wand2 className="text-pink-500" size={24} />} 
                title={t.shortcuts.transform} 
                desc={t.shortcuts.transformDesc} 
                color="bg-pink-500/10"
              />
              <ActionCard 
                icon={<PenTool className="text-orange-500" size={24} />} 
                title={t.shortcuts.sketch} 
                desc={t.shortcuts.sketchDesc} 
                color="bg-orange-500/10"
              />
              <ActionCard 
                icon={<Eraser className="text-green-500" size={24} />} 
                title={t.shortcuts.inpainting} 
                desc={t.shortcuts.inpaintingDesc} 
                color="bg-green-500/10"
              />
            </div>

            {/* Gallery Section */}
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                {t.tabs.map((tab, index) => (
                  <button 
                    key={tab}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${index === 0 ? 'bg-foreground text-background' : 'bg-surface text-muted hover:text-foreground hover:bg-border'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Masonry Gallery (Simulated with Columns) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Column 1 */}
                <div className="flex flex-col gap-4">
                  <GalleryItem color="bg-red-100 dark:bg-red-900/20" height="h-64" />
                  <GalleryItem color="bg-orange-100 dark:bg-orange-900/20" height="h-48" />
                </div>
                {/* Column 2 */}
                <div className="flex flex-col gap-4">
                  <GalleryItem color="bg-blue-100 dark:bg-blue-900/20" height="h-48" />
                  <GalleryItem color="bg-indigo-100 dark:bg-indigo-900/20" height="h-72" />
                </div>
                {/* Column 3 */}
                <div className="flex flex-col gap-4">
                  <GalleryItem color="bg-green-100 dark:bg-green-900/20" height="h-56" />
                  <GalleryItem color="bg-emerald-100 dark:bg-emerald-900/20" height="h-48" />
                </div>
                {/* Column 4 */}
                <div className="flex flex-col gap-4">
                  <GalleryItem color="bg-purple-100 dark:bg-purple-900/20" height="h-48" />
                  <GalleryItem color="bg-pink-100 dark:bg-pink-900/20" height="h-64" />
                </div>
              </div>
            </div>
          </div>
    );
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-background">
      {/* Sidebar */}
      <aside 
        className={`hidden lg:flex flex-col border-r border-border bg-surface/50 backdrop-blur-sm h-[calc(100vh-64px)] sticky top-16 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="p-4 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
          {menuStructure.map((item) => {
            // Check if it's a group or leaf
            const hasChildren = 'children' in item && item.children;
            const Icon = item.icon;
            const isExpanded = expandedGroups.includes(item.id);
            const isActive = activeMenu === item.id;

            if (hasChildren) {
              return (
                <div key={item.id} className="space-y-1">
                   <button
                    onClick={() => toggleGroup(item.id)}
                    className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-border/30 transition-colors`}
                    title={isSidebarCollapsed ? item.label : undefined}
                   >
                     <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                       <Icon size={18} />
                       {!isSidebarCollapsed && <span>{item.label}</span>}
                     </div>
                     {!isSidebarCollapsed && (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                   </button>
                   
                   {isExpanded && (
                     <div className={`space-y-1 ${isSidebarCollapsed ? '' : 'pl-4'}`}>
                       {item.children?.map(child => {
                         const ChildIcon = child.icon;
                         // Active if it's the selected tool
                         const isChildActive = activeMenu === child.id;
                         
                         return (
                           <button
                             key={child.id}
                             onClick={() => handleMenuClick(child)}
                             className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                               isChildActive 
                                 ? 'bg-foreground text-background shadow-sm' 
                                 : 'text-muted hover:text-foreground hover:bg-border/50'
                             }`}
                             title={isSidebarCollapsed ? child.label : undefined}
                           >
                             <div className="relative">
                                {isChildActive && !isSidebarCollapsed && <div className="absolute -left-7 top-1/2 -translate-y-1/2 w-1 h-4 bg-foreground rounded-r"></div>}
                                <ChildIcon size={16} />
                             </div>
                             {!isSidebarCollapsed && child.label}
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
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-foreground text-background shadow-sm' 
                    : 'text-muted hover:text-foreground hover:bg-border/50'
                }`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon size={18} />
                {!isSidebarCollapsed && item.label}
              </button>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-border bg-surface/30 flex flex-col gap-4">
          {!isSidebarCollapsed ? (
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl p-4 border border-indigo-500/20">
               <div className="flex items-center gap-2 mb-2 text-indigo-500">
                 <Sparkles size={16} />
                 <span className="text-xs font-bold uppercase tracking-wider">Pro Feature</span>
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
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`flex items-center justify-center p-2 rounded-lg text-muted hover:bg-border/50 hover:text-foreground transition-colors ${isSidebarCollapsed ? 'mx-auto' : 'ml-auto'}`}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)]">
        {renderContent()}
      </main>
    </div>
  );
};

const ActionCard = ({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) => (
  <div className="group relative overflow-hidden rounded-xl border border-border bg-surface p-5 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1">
    <div className={`mb-4 inline-flex rounded-lg p-3 ${color} transition-transform group-hover:scale-110`}>
      {icon}
    </div>
    <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{title}</h3>
    <p className="text-xs text-muted line-clamp-2">{desc}</p>
  </div>
);

const GalleryItem = ({ color, height }: { color: string, height: string }) => (
  <div className={`w-full rounded-xl overflow-hidden relative group cursor-pointer`}>
    <div className={`w-full ${height} ${color} transition-transform duration-500 group-hover:scale-105`}>
        {/* Simulated Image Content */}
        <div className="w-full h-full opacity-50 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
      <span className="text-white text-sm font-medium">Generated Art</span>
    </div>
  </div>
);

export default CreatePage;
