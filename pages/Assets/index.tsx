import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, FolderPlus, Upload, Move, Trash2, X, 
  Folder, FileAudio, Image as ImageIcon, Film, MoreVertical,
  ChevronRight, Loader2, Home, Edit2, Download, Eye
} from 'lucide-react';
import { assetsService, AdsAssetsVO, AdsAssetsQuery } from '../../services/assetsService';
import { useAuthStore } from '../../stores/authStore';

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

interface BreadcrumbItem {
  id: null | string;
  name: string;
  dataType?: number;
}

const AssetsPage: React.FC<AssetsPageProps> = ({ t }) => {
  const { user } = useAuthStore();
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<AdsAssetsVO[]>([]);
  const [folders, setFolders] = useState<AdsAssetsVO[]>([]);
  const [files, setFiles] = useState<AdsAssetsVO[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 15,
    total: 0,
  });

  // Tab和文件夹状态
  const [activeTab, setActiveTab] = useState<'personal' | 'shared'>('personal');
  const [currentFolderId, setCurrentFolderId] = useState<null | string>(null);
  const [currentFolderInfo, setCurrentFolderInfo] = useState<AdsAssetsVO | null>(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState<BreadcrumbItem[]>([{ id: null, name: '全部文件' }]);

  // 筛选条件
  const [filters, setFilters] = useState({
    assetName: '',
    assetDesc: '',
    assetType: undefined as number | undefined,
    assetTag: '',
    assetId: '',
  });

  const [resultSearch, setResultSearch] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(true);

  // 用户团队信息
  const userTeams = user?.team || [];
  const hasTeams = userTeams.length > 0;

  // 获取素材列表
  const fetchAssets = async () => {
    try {
      setLoading(true);

      const queryParams: AdsAssetsQuery = {
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        assetPackageId: currentFolderId || undefined,
        isShare: activeTab === 'shared' ? 1 : 0,
      };

      // 个人文件使用当前用户ID
      if (activeTab === 'personal') {
        queryParams.designerId = user?.userId;
      }

      // 共享文件处理团队ID
      if (activeTab === 'shared' && hasTeams) {
        if (currentFolderId && currentFolderInfo && (currentFolderInfo as any).teamId) {
          queryParams.teamId = String((currentFolderInfo as any).teamId);
        } else {
          const teamIds = userTeams.map((t: any) => String(t.teamId)).join(',');
          queryParams.teamIds = teamIds;
        }
      }

      // 添加筛选条件
      if (filters.assetName) queryParams.assetName = filters.assetName;
      if (filters.assetType) queryParams.assetType = filters.assetType;
      if (filters.assetTag) queryParams.assetTag = filters.assetTag;
      if (filters.assetId) queryParams.assetId = filters.assetId;
      if (filters.assetDesc) queryParams.assetDesc = filters.assetDesc;

      const res = await assetsService.getAssetsList(queryParams);
      
      if (res.code === 200) {
        const allAssets = res.rows || [];
        
        // 区分文件夹和文件
        const folderList = allAssets.filter((item) => item.dataType === 2);
        const fileList = allAssets.filter(
          (item) => item.dataType === 1 || item.dataType === undefined || item.dataType === null
        );

        setFolders(folderList);
        setFiles(fileList);
        setAssets([...folderList, ...fileList]);
        setPagination(prev => ({ ...prev, total: res.total || 0 }));
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
    }
  };

  // 搜索和筛选
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchAssets();
  };

  // 重置筛选条件
  const handleReset = () => {
    setFilters({
      assetName: '',
      assetDesc: '',
      assetType: undefined,
      assetTag: '',
      assetId: '',
    });
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchAssets();
  };

  // Tab切换处理
  const handleTabChange = (tab: 'personal' | 'shared') => {
    setActiveTab(tab);
    setCurrentFolderId(null);
    setCurrentFolderInfo(null);
    setBreadcrumbPath([{ id: null, name: '全部文件' }]);
    setPagination(prev => ({ ...prev, current: 1 }));
    setSelectedAssets(new Set());
    fetchAssets();
  };

  // 文件夹点击处理
  const handleFolderClick = (folder: AdsAssetsVO) => {
    if (folder.dataType !== 2) return;

    setCurrentFolderId(String(folder.id));
    setCurrentFolderInfo(folder);
    setBreadcrumbPath(prev => [...prev, {
      id: String(folder.id),
      name: folder.assetName || '未命名文件夹',
      dataType: folder.dataType,
    }]);
    setPagination(prev => ({ ...prev, current: 1 }));
    setSelectedAssets(new Set());
    fetchAssets();
  };

  // 面包屑导航处理
  const handleBreadcrumbClick = (item: BreadcrumbItem, index: number) => {
    setCurrentFolderId(item.id);
    if (!item.id) {
      setCurrentFolderInfo(null);
    }
    setBreadcrumbPath(breadcrumbPath.slice(0, index + 1));
    setPagination(prev => ({ ...prev, current: 1 }));
    setSelectedAssets(new Set());
    fetchAssets();
  };

  // 分页处理
  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination(prev => ({
      current: page,
      pageSize: pageSize || prev.pageSize,
    }));
    fetchAssets();
  };

  // 选择处理
  const handleSelectAsset = (assetId: string) => {
    setSelectedAssets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedAssets.size === assets.length) {
      setSelectedAssets(new Set());
    } else {
      setSelectedAssets(new Set(assets.map(a => String(a.id))));
    }
  };

  // 删除处理
  const handleDelete = async (asset: AdsAssetsVO) => {
    if (!confirm('确认删除该素材吗？')) return;
    
    try {
      await assetsService.removeAssets(asset.id);
      await fetchAssets();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('删除失败');
    }
  };

  const handleMultiDelete = async () => {
    if (selectedAssets.size === 0) return;
    if (!confirm(`确认删除选中的 ${selectedAssets.size} 个素材吗？`)) return;

    try {
      const ids: (number | string)[] = Array.from(selectedAssets).map((id: string) => {
        // 尝试转换为数字，如果失败则保持字符串
        const numId = Number(id);
        return isNaN(numId) ? id : numId;
      });
      await assetsService.removeAssets(ids);
      setSelectedAssets(new Set());
      await fetchAssets();
    } catch (error) {
      console.error('Multi delete failed:', error);
      alert('删除失败');
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchAssets();
  }, [pagination.current, pagination.pageSize, currentFolderId, activeTab]);

  // 过滤搜索结果
  const filteredAssets = assets.filter(asset => {
    if (!resultSearch) return true;
    const searchLower = resultSearch.toLowerCase();
    return (
      asset.assetName?.toLowerCase().includes(searchLower) ||
      asset.assetDesc?.toLowerCase().includes(searchLower) ||
      asset.assetTag?.toLowerCase().includes(searchLower)
    );
  });

  const folderCount = folders.length;
  const fileCount = files.length;

  return (
    <div className="flex h-full bg-background overflow-hidden w-full">
      {/* Filter Sidebar */}
      {showFilterPanel && (
        <aside className="w-80 border-r border-border bg-surface p-6 flex-shrink-0 hidden lg:block h-full overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg">{t.filterSearch}</h2>
            <button 
              onClick={() => setShowFilterPanel(false)}
              className="p-1 text-muted hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">{t.searchName}</label>
              <input 
                type="text" 
                value={filters.assetName}
                onChange={(e) => setFilters(prev => ({ ...prev, assetName: e.target.value }))}
                placeholder={t.namePlaceholder}
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">{t.searchType}</label>
              <select 
                value={filters.assetType || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, assetType: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="">{t.chooseType}</option>
                <option value="1">图片</option>
                <option value="2">视频</option>
                <option value="3">音频</option>
                <option value="4">文档</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">{t.searchTag}</label>
              <input 
                type="text" 
                value={filters.assetTag}
                onChange={(e) => setFilters(prev => ({ ...prev, assetTag: e.target.value }))}
                placeholder={t.tagPlaceholder}
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">{t.searchDesc}</label>
              <input 
                type="text" 
                value={filters.assetDesc}
                onChange={(e) => setFilters(prev => ({ ...prev, assetDesc: e.target.value }))}
                placeholder={t.descPlaceholder}
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <button 
                onClick={handleSearch}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
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
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-900 border-b border-border py-6 px-8 flex-shrink-0">
          <h1 className="text-3xl font-bold mb-2 text-foreground">{t.title}</h1>
          <p className="text-muted">{t.subtitle}</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-border bg-background flex-shrink-0">
          <div className="flex items-center gap-1 px-8">
            <button
              onClick={() => handleTabChange('personal')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'personal'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              个人文件
            </button>
            {hasTeams && (
              <button
                onClick={() => handleTabChange('shared')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'shared'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                共享文件
              </button>
            )}
          </div>
        </div>

        {/* Breadcrumb */}
        {breadcrumbPath.length > 1 && (
          <div className="border-b border-border bg-surface/50 px-8 py-3 flex items-center gap-2 flex-shrink-0">
            {breadcrumbPath.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight size={16} className="text-muted" />}
                <button
                  onClick={() => handleBreadcrumbClick(item, index)}
                  className={`text-sm ${
                    index === breadcrumbPath.length - 1
                      ? 'text-foreground font-medium'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  {item.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="border-b border-border bg-background p-4 flex flex-col md:flex-row items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted">
            {!showFilterPanel && (
              <button
                onClick={() => setShowFilterPanel(true)}
                className="p-2 hover:bg-surface rounded-lg"
              >
                <Search size={16} />
              </button>
            )}
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
        <div className="bg-surface/50 p-4 border-b border-border flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
          <div className="text-sm text-muted">
            {folderCount} {t.totalFolders}, {fileCount} {t.totalFiles}
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <ActionButton 
              icon={FolderPlus} 
              label={t.newFolder} 
              color="bg-orange-500 text-white hover:bg-orange-600"
              onClick={() => alert('创建文件夹功能待实现')}
            />
            <ActionButton 
              icon={Upload} 
              label={t.upload} 
              color="bg-indigo-500 text-white hover:bg-indigo-600"
              onClick={() => alert('上传功能待实现')}
            />
            <ActionButton 
              icon={Move} 
              label={t.move} 
              color="bg-surface border border-border text-muted hover:text-foreground"
              onClick={() => alert('移动功能待实现')}
              disabled={selectedAssets.size === 0}
            />
            <ActionButton 
              icon={Trash2} 
              label={t.delete} 
              color="bg-surface border border-border text-muted hover:text-foreground"
              onClick={handleMultiDelete}
              disabled={selectedAssets.size === 0}
            />
            <div className="w-px h-6 bg-border mx-2"></div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={selectedAssets.size === assets.length && assets.length > 0}
                onChange={handleSelectAll}
                className="rounded border-muted w-4 h-4"
              />
              <span className="text-sm text-muted">{t.selectAll}</span>
            </div>
          </div>
        </div>

        {/* Asset Grid */}
        <div className="p-6 bg-surface/20 flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 size={32} className="animate-spin text-indigo-600" />
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted">
              <Folder size={48} className="mb-4 opacity-50" />
              <p>暂无素材</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredAssets.map(asset => (
                <AssetCard 
                  key={asset.id} 
                  asset={asset}
                  isSelected={selectedAssets.has(String(asset.id))}
                  onSelect={() => handleSelectAsset(String(asset.id))}
                  onFolderClick={() => handleFolderClick(asset)}
                  onDelete={() => handleDelete(asset)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.total > pagination.pageSize && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={pagination.current === 1}
                className="px-3 py-2 border border-border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface"
              >
                上一页
              </button>
              <span className="text-sm text-muted">
                第 {pagination.current} 页，共 {Math.ceil(pagination.total / pagination.pageSize)} 页
              </span>
              <button
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                className="px-3 py-2 border border-border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface"
              >
                下一页
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, color, onClick, disabled }: any) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${color} shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    <Icon size={14} />
    {label}
  </button>
);

interface AssetCardProps {
  asset: AdsAssetsVO;
  isSelected: boolean;
  onSelect: () => void;
  onFolderClick: () => void;
  onDelete: () => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, isSelected, onSelect, onFolderClick, onDelete }) => {
  const isFolder = asset.dataType === 2;
  const thumbnailUrl = asset.thumbnailUrl || asset.coverUrl || asset.assetUrl;

  // 根据 assetType 判断文件类型
  const getFileType = () => {
    if (isFolder) return 'folder';
    switch (asset.assetType) {
      case 1: return 'image';
      case 2: return 'video';
      case 3: return 'audio';
      default: return 'file';
    }
  };

  const fileType = getFileType();

  return (
    <div 
      className={`group relative bg-background rounded-xl border-2 p-4 hover:shadow-lg transition-all cursor-pointer flex flex-col ${
        isSelected ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-border hover:border-indigo-300 dark:hover:border-indigo-700'
      }`}
      onClick={isFolder ? onFolderClick : undefined}
    >
      {/* Checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
      </div>
      
      {/* More Menu */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // TODO: 显示菜单
            }}
            className="p-1 rounded-md hover:bg-surface text-muted hover:text-foreground"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Thumbnail / Icon */}
      <div className="flex-1 flex items-center justify-center mb-4 min-h-[120px] bg-surface/30 rounded-lg overflow-hidden">
        {isFolder ? (
          <div className="relative">
            <div className="w-20 h-16 bg-orange-200 dark:bg-orange-900/30 rounded-lg shadow-sm relative z-10 flex items-center justify-center">
              <Folder size={32} className="text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        ) : thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={asset.assetName || 'Asset'} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // 图片加载失败时显示默认图标
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="text-slate-400">
                    ${fileType === 'image' ? '<svg>...</svg>' : ''}
                    ${fileType === 'video' ? '<svg>...</svg>' : ''}
                    ${fileType === 'audio' ? '<svg>...</svg>' : ''}
                  </div>
                `;
              }
            }}
          />
        ) : (
          <div className="text-slate-400">
            {fileType === 'audio' && <FileAudio size={48} />}
            {fileType === 'video' && <Film size={48} />}
            {fileType === 'image' && <ImageIcon size={48} />}
            {fileType === 'file' && <Folder size={48} />}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-center">
        <h3 className="font-semibold text-sm text-foreground truncate mb-1" title={asset.assetName || '未命名'}>
          {asset.assetName || '未命名'}
        </h3>
        <p className="text-xs text-muted mb-2">{asset.assetTag || (isFolder ? '文件夹' : '文件')}</p>
        
        {asset.assetDesc && (
          <p className="text-xs text-muted truncate mb-2" title={asset.assetDesc}>
            {asset.assetDesc}
          </p>
        )}
      </div>
      
      {/* Footer Date */}
      {asset.createTime && (
        <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
          <span className="text-[10px] text-muted">
            {new Date(asset.createTime).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default AssetsPage;
