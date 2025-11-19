
import React, { useState } from 'react';
import { 
  Search, FolderPlus, Upload, Move, Trash2, CheckSquare, X, 
  Folder, FileAudio, Image as ImageIcon, Film, MoreVertical 
} from 'lucide-react';
import { MOCK_ASSETS } from '../constants';
import { Asset } from '../types';

interface AssetsPageProps {
  t: {
    title: string;
    subtitle: string;
    filterSearch: string;
    searchName: string;
    namePlaceholder: string;
    searchType: string;
    chooseType: string;
    searchTag: string;
    tagPlaceholder: string;
    searchDesc: string;
    descPlaceholder: string;
    search: string;
    reset: string;
    newFolder: string;
    upload: string;
    move: string;
    delete: string;
    selectAll: string;
    totalFolders: string;
    totalFiles: string;
    searchInResult: string;
  }
}

const AssetsPage: React.FC<AssetsPageProps> = ({ t }) => {
  const [nameFilter, setNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [descFilter, setDescFilter] = useState('');
  const [resultSearch, setResultSearch] = useState('');

  // Filter Logic
  const filteredAssets = MOCK_ASSETS.filter(asset => {
    const matchName = asset.name.toLowerCase().includes(nameFilter.toLowerCase());
    const matchType = typeFilter ? asset.type === typeFilter : true;
    const matchTag = tagFilter ? asset.tag?.toLowerCase().includes(tagFilter.toLowerCase()) : true;
    const matchDesc = descFilter ? asset.description?.toLowerCase().includes(descFilter.toLowerCase()) : true;
    const matchResult = asset.name.toLowerCase().includes(resultSearch.toLowerCase());
    
    return matchName && matchType && matchTag && matchDesc && matchResult;
  });

  const folderCount = filteredAssets.filter(a => a.type === 'folder').length;
  const fileCount = filteredAssets.filter(a => a.type !== 'folder').length;

  const handleReset = () => {
    setNameFilter('');
    setTypeFilter('');
    setTagFilter('');
    setDescFilter('');
  };

  return (
    <div className="flex min-h-[calc(100vh-112px)] bg-background">
      {/* Sidebar Filters */}
      <aside className="w-80 border-r border-border bg-surface p-6 flex-shrink-0 hidden lg:block h-[calc(100vh-112px)] overflow-y-auto custom-scrollbar sticky top-28">
        <div className="flex items-center justify-between mb-6">
           <h2 className="font-bold text-lg">{t.filterSearch}</h2>
           <button className="p-1 text-muted hover:text-foreground">
             <X size={16} />
           </button>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">{t.searchName}</label>
            <input 
              type="text" 
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder={t.namePlaceholder}
              className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">{t.searchType}</label>
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="">{t.chooseType}</option>
              <option value="folder">Folder</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">{t.searchTag}</label>
            <input 
              type="text" 
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              placeholder={t.tagPlaceholder}
              className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

           <div className="space-y-2">
            <label className="text-sm font-medium text-muted">{t.searchDesc}</label>
            <input 
              type="text" 
              value={descFilter}
              onChange={(e) => setDescFilter(e.target.value)}
              placeholder={t.descPlaceholder}
              className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          
          <div className="flex gap-3 pt-2">
             <button className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
               {t.search}
             </button>
             <button 
               onClick={handleReset}
               className="flex-1 py-2 border border-border bg-surface text-foreground rounded-lg text-sm font-medium hover:bg-border/80 transition-colors"
             >
               {t.reset}
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
         {/* Header Section */}
         <div className="bg-indigo-500/90 dark:bg-indigo-900 text-white py-10 px-8 text-center shadow-md">
            <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
            <p className="text-indigo-100 opacity-90">{t.subtitle}</p>
         </div>

         {/* Toolbar */}
         <div className="border-b border-border bg-background p-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-10">
            <div className="flex items-center gap-2 text-sm text-muted">
               <span>{t.title}</span>
            </div>
            
            <div className="relative w-full md:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
               <input 
                 type="text" 
                 value={resultSearch}
                 onChange={(e) => setResultSearch(e.target.value)}
                 placeholder={t.searchInResult}
                 className="w-full h-9 rounded-full border border-border bg-surface pl-9 pr-4 text-sm focus:outline-none focus:border-primary"
               />
            </div>
         </div>

         {/* Action Bar */}
         <div className="bg-surface/50 p-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-muted">
               {t.totalFolders.replace('Folders', `${folderCount} Folders`)}, {t.totalFiles.replace('Files', `${fileCount} Files`)}
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
               <ActionButton icon={FolderPlus} label={t.newFolder} color="bg-orange-500 text-white" />
               <ActionButton icon={Upload} label={t.upload} color="bg-indigo-500 text-white" />
               <ActionButton icon={Move} label={t.move} color="bg-surface border border-border text-muted hover:text-foreground" />
               <ActionButton icon={Trash2} label={t.delete} color="bg-surface border border-border text-muted hover:text-foreground" />
               <div className="w-px h-6 bg-border mx-2"></div>
               <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-muted w-4 h-4" />
                  <span className="text-sm text-muted">{t.selectAll}</span>
               </div>
            </div>
         </div>

         {/* Asset Grid */}
         <div className="p-6 bg-surface/20 flex-1 overflow-y-auto min-h-[600px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
               {filteredAssets.map(asset => (
                  <AssetCard key={asset.id} asset={asset} />
               ))}
            </div>
         </div>
      </main>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, color }: any) => (
  <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${color} shadow-sm`}>
    <Icon size={14} />
    {label}
  </button>
);

const AssetCard = ({ asset }: { asset: Asset }) => {
  const isFolder = asset.type === 'folder';

  return (
    <div className="group relative bg-background rounded-xl border border-border p-4 hover:shadow-lg transition-all hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer flex flex-col">
       {/* Checkbox Overlay */}
       <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
       </div>
       
       {/* More Menu */}
       <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button className="p-1 rounded-md hover:bg-surface text-muted hover:text-foreground">
             <MoreVertical size={16} />
          </button>
       </div>

       {/* Thumbnail / Icon */}
       <div className="flex-1 flex items-center justify-center mb-4 min-h-[120px] bg-surface/30 rounded-lg overflow-hidden">
          {isFolder ? (
             <div className="relative">
                <div className="w-20 h-16 bg-orange-200 rounded-lg shadow-sm relative z-10 flex items-center justify-center">
                   <div className="w-24 h-20 bg-orange-300/50 absolute -top-1 -right-2 rounded-lg rotate-3"></div>
                   <div className="w-8 h-2 bg-orange-400/20 rounded-sm absolute top-2 left-2"></div>
                   <div className="w-4 h-2 bg-blue-500 rounded-sm absolute top-2 right-4"></div>
                   <div className="w-4 h-2 bg-red-500 rounded-sm absolute top-2 right-9"></div>
                </div>
             </div>
          ) : (
             asset.thumbnail ? (
               <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
             ) : (
               <div className="text-slate-400">
                  {asset.type === 'audio' && <FileAudio size={48} />}
                  {asset.type === 'video' && <Film size={48} />}
                  {asset.type === 'image' && <ImageIcon size={48} />}
               </div>
             )
          )}
       </div>

       {/* Info */}
       <div className="text-center">
          <h3 className="font-semibold text-sm text-foreground truncate mb-1" title={asset.name}>{asset.name}</h3>
          <p className="text-xs text-muted mb-2">{asset.tag || (isFolder ? 'Folder' : 'File')}</p>
          
          <div className="flex items-center justify-center gap-2">
             {asset.tag && !isFolder && (
               <span className="px-2 py-0.5 bg-surface border border-border rounded text-[10px] text-muted truncate max-w-[100px]">
                  {asset.tag}
               </span>
             )}
          </div>
       </div>
       
       {/* Footer Date */}
       <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
          <span className="text-[10px] text-muted">{asset.date}</span>
          <button className="text-muted hover:text-foreground">
             <MoreVertical size={14} className="rotate-90" />
          </button>
       </div>
    </div>
  );
};

export default AssetsPage;
