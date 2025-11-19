
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Image, Video, Wand2, Eraser, Upload, ArrowRight, Sparkles, 
  PenTool, Star, User, Clock, ChevronDown, ChevronRight, 
  Layers, Users, PanelLeftClose, PanelLeftOpen, Home, Box, 
  Key, FileText, Scissors, Film, Repeat, Mic, Hammer, 
  Folder, CreditCard, DollarSign, UserCircle, Grid, Loader2, Heart
} from 'lucide-react';
import TextToImagePage from './components/TextToImagePage';
import ViralVideoPage from './components/ViralVideoPage';
import ImageToVideoPage from './components/ImageToVideoPage';
import DigitalHumanPage from './components/DigitalHumanPage';
import StyleTransferPage from './components/StyleTransferPage';
import { templateService, LabTemplate, LabTemplateQuery } from '../../services/templateService';

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
    styleTransfer?: any;
  };
}

const CreatePage: React.FC<CreatePageProps> = ({ t, onNavigate }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Default to home (dashboard) if no tool is specified
  const activeMenu = searchParams.get('tool') || 'home';
  
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['modelCenter', 'creationCenter', 'personalCenter']);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [labTemplateData, setLabTemplateData] = useState<LabTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [templateName, setTemplateName] = useState('');
  const [params, setParams] = useState<LabTemplateQuery>({
    pageNum: 1,
    pageSize: 20
  });

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

  // Creative Types Data
  const creativeTypes = [
    {
      id: 1,
      title: 'AI Viral Video', 
      icon: 'https://nebula-ads.oss-cn-guangzhou.aliyuncs.com/cdn/picture/k-pop.png',
      description: 'AI mixed cut video',
      toolId: 'viralVideo',
      type: 'image',
    },
    {
      id: 3,
      title: 'Talking Photo',
      icon: 'https://nebula-ads.oss-cn-guangzhou.aliyuncs.com/cdn/picture/talking-pictures.png',
      description: 'Make photos talk',
      toolId: 'digitalHuman',
      type: 'image',
    },
    {
      id: 4,
      title: 'Digital Human',
      icon: 'https://nebula-ads.oss-cn-guangzhou.aliyuncs.com/cdn/picture/product-digital-person.png',
      description: 'Product digital human video',
      toolId: 'digitalHuman',
      type: 'image',
    },
    {
      id: 5,
      title: 'Style Transfer',
      icon: 'https://nebula-ads.oss-cn-guangzhou.aliyuncs.com/cdn/picture/all-things-migrate-img.png',
      description: 'Transform object styles',
      toolId: 'styleTransfer', 
      type: 'image',
    },
    {
      id: 6,
      title: 'Text to Image',
      icon: 'https://nebula-ads.oss-cn-guangzhou.aliyuncs.com/cdn/picture/text2image.png',
      description: 'Generate images from text',
      toolId: 'textToImage',
      type: 'image',
    },
    {
      id: 7,
      title: 'Image Editing',
      icon: 'https://nebula-ads.oss-cn-guangzhou.aliyuncs.com/cdn/picture/productAnyEdit.png',
      description: 'AI intelligent image editing',
      toolId: 'textToImage', // Fallback or new tool
      type: 'image',
    },
  ];

  // Categories
  const categories = [
    { id: '', name: t.tabs[0] || 'All' },
    { id: '人物', name: t.tabs[1] || 'Characters' },
    { id: '宠物', name: t.tabs[2] || 'Animals' },
    { id: '动漫', name: t.tabs[3] || 'Anime' },
    { id: '创意', name: t.tabs[4] || 'Creative' },
    { id: '食物', name: t.tabs[5] || 'Food' },
    { id: '风景', name: t.tabs[6] || 'Scenery' },
    { id: '产品', name: t.tabs[7] || 'Product' },
  ];

  useEffect(() => {
    if (activeMenu === 'home') {
      loadTemplates();
    }
  }, [activeMenu, params.pageNum, templateName]);

  const loadTemplates = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Call API - response is ApiResponse<LabTemplate> which means { rows: LabTemplate[], total: number, ... }
      // Note: The request wrapper will return the JSON object.
      // The user provided JSON: { total: 45, rows: [...], code: 200, msg: "..." }
      // Our ApiResponse type has rows?: T[] and total?: number
      const res = await templateService.getLabTemplateList({
        ...params,
        templateName: templateName || undefined
      });
      
      if (res.code === 200) {
        const newRows = res.rows || [];
        if (params.pageNum === 1) {
          setLabTemplateData(newRows);
        } else {
          setLabTemplateData(prev => [...prev, ...newRows]);
        }
        
        if (newRows.length < (params.pageSize || 20)) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeClick = (toolId: string) => {
    onMenuChange(toolId);
  };

  const switchCategory = (id: string) => {
    setTemplateName(id);
    setParams(prev => ({ ...prev, pageNum: 1 }));
    setHasMore(true);
  };

  const clickTemplateLike = async (e: React.MouseEvent, item: LabTemplate) => {
    e.stopPropagation();
    // Implement like logic here if API supports updating single item or just optimistic UI
    // For now just a visual toggle
    // await templateService.updateLabTemplate(...)
    console.log('Like clicked for:', item.id);
  };

  const renderDict = (type: number) => {
    const map: Record<number, string> = {
      1: 'Text2Image',
      2: 'Img2Img',
      3: 'Text2Video',
      4: 'Img2Video'
    };
    return map[type] || 'Unknown';
  };

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
    if (activeMenu === 'styleTransfer' && t.styleTransfer) {
      return <StyleTransferPage t={t.styleTransfer} />;
    }
    
    // Default Create Dashboard
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
            {/* Hero Greeting */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {t.greeting} <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent inline-flex items-center gap-2">{t.greetingSuffix} <Sparkles className="inline-block w-6 h-6 text-yellow-400" /></span>
              </h1>

              {/* Input Box */}
              <div className="max-w-3xl mx-auto relative mb-12">
                <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-lg transition-shadow focus-within:shadow-xl focus-within:ring-1 focus-within:ring-primary">
                  <textarea 
                    placeholder={t.inputPlaceholder}
                    className="w-full h-28 resize-none bg-transparent p-5 text-base focus:outline-none text-foreground placeholder-muted/60"
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
                      <button className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Creative Types (Horizontal Scroll) */}
            <div className="mb-8 overflow-x-auto pb-4 custom-scrollbar">
              <div className="flex gap-4 min-w-max px-1">
                {creativeTypes.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => handleTypeClick(item.toolId)}
                    className="group min-w-[160px] w-[180px] cursor-pointer rounded-2xl border border-border bg-surface p-3 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
                  >
                    <div className="mb-3 flex justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 h-[100px] items-center">
                       <img src={item.icon} alt={item.title} className="w-full h-full object-contain p-2" />
                    </div>
                    <h3 className="text-center text-sm font-medium text-foreground truncate px-1">{item.title}</h3>
                    <p className="mt-1 text-center text-xs text-muted truncate px-1">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => switchCategory(cat.id)}
                  className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                    templateName === cat.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-surface text-muted hover:text-foreground hover:bg-border/50 border border-transparent hover:border-border'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Templates Masonry Grid */}
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4 pb-8">
               {labTemplateData.map((item) => (
                 <div key={item.id} className="break-inside-avoid rounded-xl bg-surface border border-border overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                    <div className="relative">
                       {/* Media Content */}
                       {item.templateType === 3 || item.templateType === 4 ? (
                          <video 
                            src={item.templateUrl?.replace(/`/g, '')}
                            className="w-full h-auto object-cover"
                            loop
                            muted
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => e.currentTarget.pause()}
                          />
                       ) : (
                          <img 
                            src={item.templateUrl?.replace(/`/g, '')}
                            alt={item.templateName}
                            className="w-full h-auto object-cover"
                            loading="lazy"
                          />
                       )}
                       
                       {/* Overlay Info */}
                       <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end min-h-[80px]">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="text-sm font-bold truncate pr-2">{item.templateName}</h3>
                            <span className="text-[10px] bg-indigo-600 px-1.5 py-0.5 rounded text-white">{renderDict(item.templateType)}</span>
                          </div>
                          <p className="text-[10px] text-white/80 line-clamp-2 mb-2">{item.templateDesc}</p>
                          <div className="flex justify-between items-center text-xs">
                             <button className="bg-white/20 hover:bg-white/40 px-2 py-1 rounded text-[10px] backdrop-blur-sm">Use Template</button>
                             <div className="flex items-center gap-1 cursor-pointer" onClick={(e) => clickTemplateLike(e, item)}>
                                <Heart size={12} className={item.isLike ? "fill-red-500 text-red-500" : "text-white"} />
                                <span>{item.likeCount}</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
            
            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
              </div>
            )}
            
            {!loading && labTemplateData.length === 0 && (
               <div className="text-center py-12 text-muted">
                  No templates found.
               </div>
            )}
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
