import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, FolderPlus, Upload, Move, Trash2, X, 
  Folder, FileAudio, Image as ImageIcon, Film, MoreVertical,
  ChevronRight, Loader2, Home, Edit2, Download, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { assetsService, AdsAssetsVO, AdsAssetsQuery } from '../../services/assetsService';
import { useAuthStore } from '../../stores/authStore';
import { useAppOutletContext } from '../../router';
import AddMaterialModal from '../../components/AddMaterialModal';
import ConfirmDialog from '../../components/ConfirmDialog';

interface BreadcrumbItem {
  id: null | string;
  name: string;
  dataType?: number;
}

const AssetsPage: React.FC = () => {
  const { t: rawT } = useAppOutletContext();
  const t = rawT.assetsPage;

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

  // Modal状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalConfig, setAddModalConfig] = useState<{
    isFolder: boolean;
    folderId?: string | number;
    editData?: Partial<AdsAssetsVO>;
  }>({ isFolder: false });
  
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<AdsAssetsVO | null>(null);
  
  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // 拖拽状态
  const [draggedAsset, setDraggedAsset] = useState<AdsAssetsVO | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 用户团队信息
  const userTeams = user?.team || [];
  const hasTeams = userTeams.length > 0;

  // 权限检查
  const isTeamLeaderOrChannelAdmin = (teamId?: number | string) => {
    if (!teamId) return false;
    const team = userTeams.find((t: any) => t.teamId === teamId);
    if (!team) return false;
    return team.userAuthType === 2 || team.channel?.channelUserId === user?.userId;
  };

  const isRootTeamFolder = (asset: AdsAssetsVO) => {
    return (
      activeTab === 'shared' &&
      !currentFolderId &&
      asset.dataType === 2 &&
      !asset.assetPackageId
    );
  };

  const canEditAsset = (asset: AdsAssetsVO) => {
    if (activeTab === 'personal') return true;
    if (activeTab === 'shared') {
      if (isRootTeamFolder(asset)) return false;
      if ((asset as any).createBy === String(user?.userId)) return true;
      if ((asset as any).teamId && isTeamLeaderOrChannelAdmin((asset as any).teamId)) return true;
      return false;
    }
    return false;
  };

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

      if (activeTab === 'personal') {
        queryParams.designerId = user?.userId;
      }

      if (activeTab === 'shared' && hasTeams) {
        if (currentFolderId && currentFolderInfo && (currentFolderInfo as any).teamId) {
          queryParams.teamId = String((currentFolderInfo as any).teamId);
        } else {
          const teamIds = userTeams.map((t: any) => String(t.teamId)).join(',');
          queryParams.teamIds = teamIds;
        }
      }

      if (filters.assetName) queryParams.assetName = filters.assetName;
      if (filters.assetType) queryParams.assetType = filters.assetType;
      if (filters.assetTag) queryParams.assetTag = filters.assetTag;
      if (filters.assetId) queryParams.assetId = filters.assetId;
      if (filters.assetDesc) queryParams.assetDesc = filters.assetDesc;

      const res = await assetsService.getAssetsList(queryParams);
      
      if (res.rows) {
        const allAssets = res.rows || [];
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
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize,
    }));
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

  // 新建文件夹
  const handleCreateFolder = () => {
    const folderData: any = {
      dataType: 2,
      assetPackageId: currentFolderId,
      isShare: activeTab === 'shared' ? 1 : 0,
    };

    if (activeTab === 'shared' && (currentFolderInfo as any)?.teamId) {
      folderData.teamId = (currentFolderInfo as any).teamId;
    }

    setAddModalConfig({ isFolder: true, folderId: currentFolderId || undefined });
    setShowAddModal(true);
  };

  // 上传文件
  const handleUpload = () => {
    const fileData: any = {
      dataType: 1,
      assetPackageId: currentFolderId,
      isShare: activeTab === 'shared' ? 1 : 0,
    };

    if (activeTab === 'shared' && (currentFolderInfo as any)?.teamId) {
      fileData.teamId = (currentFolderInfo as any).teamId;
    }

    setAddModalConfig({ isFolder: false, folderId: currentFolderId || undefined });
    setShowAddModal(true);
  };

  // 编辑
  const handleEdit = (asset: AdsAssetsVO) => {
    setAddModalConfig({
      isFolder: asset.dataType === 2,
      folderId: currentFolderId || undefined,
      editData: asset,
    });
    setShowAddModal(true);
  };

  // 删除处理
  const handleDelete = async (asset: AdsAssetsVO) => {
    setConfirmDialog({
      isOpen: true,
      title: '确认删除',
      message: `确认删除该${asset.dataType === 2 ? '文件夹' : '素材'}吗？`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await assetsService.removeAssets(asset.id);
          await fetchAssets();
          toast.success('删除成功');
        } catch (error) {
          console.error('Delete failed:', error);
          toast.error('删除失败');
        }
      },
    });
  };

  const handleMultiDelete = async () => {
    if (selectedAssets.size === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: '确认删除',
      message: `确认删除选中的 ${selectedAssets.size} 个素材吗？`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          const ids: (number | string)[] = Array.from(selectedAssets);
          await assetsService.removeAssets(ids);
          setSelectedAssets(new Set());
          await fetchAssets();
          toast.success('删除成功');
        } catch (error) {
          console.error('Multi delete failed:', error);
          toast.error('删除失败');
        }
      },
    });
  };

  // 移动功能
  const handleMove = () => {
    if (selectedAssets.size === 0) return;
    setShowMoveModal(true);
  };

  const handleMoveConfirm = async (targetFolderId: string | null, targetTab: 'personal' | 'shared', teamId?: string) => {
    try {
      const ids = Array.from(selectedAssets);
      const isShare = activeTab === 'personal' && targetTab === 'shared';
      
      if (isShare && teamId) {
        // 分享到共享文件（复制）
        for (const id of ids) {
          const asset = assets.find(a => String(a.id) === id);
          if (!asset) continue;
          
          await assetsService.addAssets({
            ...asset,
            id: undefined,
            assetPackageId: targetFolderId || undefined,
            teamId: teamId,
            isShare: 1,
            createTime: undefined,
            updateTime: undefined,
          });
        }
        toast.success('分享成功');
      } else {
        // 移动文件
        await assetsService.moveAssets(ids, targetFolderId || undefined);
        toast.success('移动成功');
      }

      setSelectedAssets(new Set());
      setShowMoveModal(false);
      await fetchAssets();
    } catch (error) {
      console.error('操作失败:', error);
      toast.error('操作失败');
    }
  };

  // 拖拽功能
  const handleDragStart = (asset: AdsAssetsVO, e: React.DragEvent) => {
    if (isRootTeamFolder(asset)) {
      e.preventDefault();
      return;
    }
    setDraggedAsset(asset);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setDraggedAsset(null);
    setDragOverFolder(null);
    setIsDragging(false);
  };

  const handleDragEnter = (folderId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedAsset && String(draggedAsset.id) !== folderId) {
      setDragOverFolder(folderId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (folderId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedAsset || String(draggedAsset.id) === folderId) return;

    try {
      await assetsService.moveAssets([String(draggedAsset.id)], folderId);
      await fetchAssets();
      toast.success('移动成功');
    } catch (error) {
      console.error('拖拽移动失败:', error);
      toast.error('移动失败');
    } finally {
      handleDragEnd();
    }
  };

  const handleDropToRoot = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedAsset) return;

    if (activeTab === 'shared') {
      toast.error('共享文件不支持拖拽到根目录');
      handleDragEnd();
      return;
    }

    try {
      await assetsService.moveAssets([String(draggedAsset.id)], undefined);
      await fetchAssets();
      toast.success('移动成功');
    } catch (error) {
      console.error('拖拽移动失败:', error);
      toast.error('移动失败');
    } finally {
      handleDragEnd();
    }
  };

  // 预览功能
  const handlePreview = (asset: AdsAssetsVO) => {
    setPreviewAsset(asset);
    setShowPreviewModal(true);
  };

  // 下载功能
  const handleDownload = async (asset: AdsAssetsVO) => {
    if (!asset.assetUrl || !asset.assetName) {
      toast.error('素材URL或名称不存在');
      return;
    }
    const a = document.createElement('a');
    a.href = asset.assetUrl;
    a.download = asset.assetName;
    a.click();
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
          <div 
            className="border-b border-border bg-surface/50 px-8 py-3 flex items-center gap-2 flex-shrink-0"
            onDrop={handleDropToRoot}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setDragOverFolder(null)}
          >
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
            {/* 共享文件tab中，根目录不显示新建文件夹和上传按钮 */}
            {!(activeTab === 'shared' && !currentFolderId) && (
              <>
                <ActionButton 
                  icon={FolderPlus} 
                  label={t.newFolder} 
                  color="bg-orange-500 text-white hover:bg-orange-600"
                  onClick={handleCreateFolder}
                />
                <ActionButton 
                  icon={Upload} 
                  label={t.upload} 
                  color="bg-indigo-500 text-white hover:bg-indigo-600"
                  onClick={handleUpload}
                />
              </>
            )}
            {!(activeTab === 'shared' && !currentFolderId) && (
              <ActionButton 
                icon={Move} 
                label={t.move} 
                color="bg-surface border border-border text-muted hover:text-foreground"
                onClick={handleMove}
                disabled={selectedAssets.size === 0}
              />
            )}
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
                  onEdit={() => handleEdit(asset)}
                  onDelete={() => handleDelete(asset)}
                  onPreview={() => handlePreview(asset)}
                  onDownload={() => handleDownload(asset)}
                  canEdit={canEditAsset(asset)}
                  isRootTeamFolder={isRootTeamFolder(asset)}
                  onDragStart={(e) => handleDragStart(asset, e)}
                  onDragEnd={handleDragEnd}
                  onDragEnter={(e) => handleDragEnter(String(asset.id), e)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(String(asset.id), e)}
                  isDragOver={dragOverFolder === String(asset.id)}
                  isDragging={isDragging && draggedAsset?.id === asset.id}
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

      {/* Add/Edit Modal */}
      {showAddModal && (
        <AddMaterialModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchAssets();
          }}
          initialIsFolder={addModalConfig.isFolder}
          initialFolderId={addModalConfig.folderId}
          initialData={addModalConfig.editData}
        />
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewAsset && (
        <PreviewModal
          asset={previewAsset}
          onClose={() => setShowPreviewModal(false)}
          onDownload={() => handleDownload(previewAsset)}
        />
      )}

      {/* Move/Share Modal - Placeholder */}
      {showMoveModal && (
        <MoveModal
          visible={showMoveModal}
          onClose={() => setShowMoveModal(false)}
          onConfirm={handleMoveConfirm}
          sourceTab={activeTab}
          hasTeams={hasTeams}
          teamIds={userTeams.map((t: any) => t.teamId).join(',')}
          excludeIds={Array.from(selectedAssets)
            .map(id => assets.find(a => String(a.id) === id))
            .filter(a => a && a.dataType === 2)
            .map(a => Number(a!.id))}
        />
      )}
      
      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        type="danger"
      />
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
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
  onDownload: () => void;
  canEdit: boolean;
  isRootTeamFolder: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragOver: boolean;
  isDragging: boolean;
}

const AssetCard: React.FC<AssetCardProps> = ({ 
  asset, isSelected, onSelect, onFolderClick, onEdit, onDelete, onPreview, onDownload,
  canEdit, isRootTeamFolder, onDragStart, onDragEnd, onDragEnter, onDragLeave, onDrop,
  isDragOver, isDragging
}) => {
  const isFolder = asset.dataType === 2;
  const thumbnailUrl = asset.thumbnailUrl || asset.coverUrl || asset.assetUrl;
  const [showMenu, setShowMenu] = useState(false);

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
      } ${isDragOver ? 'border-green-500 bg-green-50 scale-105' : ''} ${isDragging ? 'opacity-30' : ''}`}
      onClick={isFolder ? onFolderClick : undefined}
      draggable={!isRootTeamFolder}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragEnter={isFolder ? onDragEnter : undefined}
      onDragLeave={onDragLeave}
      onDrop={isFolder ? onDrop : undefined}
      onDragOver={(e) => isFolder && e.preventDefault()}
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
       {(canEdit || !isRootTeamFolder) && (
       <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded-md hover:bg-surface text-muted hover:text-foreground"
          >
             <MoreVertical size={16} />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-border py-1 z-20">
              {!isFolder && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-surface flex items-center gap-2"
                  >
                    <Eye size={14} />
                    预览
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-surface flex items-center gap-2"
                  >
                    <Download size={14} />
                    下载
                  </button>
                </>
              )}
              {canEdit && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-surface flex items-center gap-2"
                  >
                    <Edit2 size={14} />
                    {isFolder ? '重命名' : '编辑'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    删除
                  </button>
                </>
              )}
            </div>
          )}
        </div>
       </div>
       )}

       {isRootTeamFolder && (
         <div className="absolute top-3 right-3 z-10">
           <span className="px-2 py-1 text-xs bg-purple-500 text-white rounded">团队文件夹</span>
         </div>
       )}

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
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
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

// Preview Modal Component
interface PreviewModalProps {
  asset: AdsAssetsVO;
  onClose: () => void;
  onDownload: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ asset, onClose, onDownload }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  const isVideo = ![6, 7].includes(asset.assetType || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold">素材预览</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {isVideo ? (
            <video ref={videoRef} src={asset.assetUrl} controls autoPlay className="w-full rounded-lg" />
          ) : (
            <img src={asset.assetUrl} alt={asset.assetName || ''} className="w-full rounded-lg" />
          )}
          <div className="mt-4">
            <h3 className="font-semibold text-lg mb-2">{asset.assetName}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted">类型：</span>
                <span>{asset.assetType}</span>
              </div>
              <div>
                <span className="text-muted">创建时间：</span>
                <span>{asset.createTime}</span>
              </div>
            </div>
            <button
              onClick={onDownload}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Download size={16} />
              下载
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Move Modal Component (Simplified version - you can enhance this)
interface MoveModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (targetFolderId: string | null, targetTab: 'personal' | 'shared', teamId?: string) => void;
  sourceTab: 'personal' | 'shared';
  hasTeams: boolean;
  teamIds: string;
  excludeIds: number[];
}

const MoveModal: React.FC<MoveModalProps> = ({ visible, onClose, onConfirm, sourceTab, hasTeams, teamIds }) => {
  const [targetTab, setTargetTab] = useState<'personal' | 'shared'>(sourceTab);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const { user } = useAuthStore();

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">移动/分享到</h2>
        
        {sourceTab === 'personal' && hasTeams && (
          <div className="space-y-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="personal"
                checked={targetTab === 'personal'}
                onChange={() => setTargetTab('personal')}
              />
              个人文件夹
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="shared"
                checked={targetTab === 'shared'}
                onChange={() => setTargetTab('shared')}
              />
              共享文件夹
            </label>
          </div>
        )}

        {targetTab === 'shared' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">选择团队</label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background"
            >
              <option value="">请选择团队</option>
              {user?.team?.map((t: any) => (
                <option key={t.teamId} value={t.teamId}>{t.teamName}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-border rounded-lg">
            取消
          </button>
          <button
            onClick={() => onConfirm(null, targetTab, selectedTeamId)}
            disabled={targetTab === 'shared' && !selectedTeamId}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetsPage;
