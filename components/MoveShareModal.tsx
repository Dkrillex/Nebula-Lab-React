import React, { useState, useEffect } from 'react';
import { X, Folder, Loader2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { assetsService, AdsAssetsVO } from '../services/assetsService';
import { useAuthStore } from '../stores/authStore';

interface MoveShareModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (result: { 
    targetFolderId: string | null, 
    targetTab: 'personal' | 'shared', 
    teamId?: string 
  }) => void;
  sourceTab: 'personal' | 'shared';
  hasTeams: boolean;
  teamIds: string; // 逗号分隔的团队ID列表
  excludeIds: number[]; // 排除的文件夹ID（避免循环引用）
  currentFolderId?: string | null; // 当前文件所在的文件夹ID
}

interface PathItem {
  id: string | null;
  name: string;
  teamId?: string | number;
}

const MoveShareModal: React.FC<MoveShareModalProps> = ({
  visible,
  onClose,
  onConfirm,
  sourceTab,
  hasTeams,
  teamIds,
  excludeIds,
  currentFolderId
}) => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'personal' | 'shared'>(sourceTab);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<AdsAssetsVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState<PathItem[]>([{ id: null, name: '全部文件' }]);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creating, setCreating] = useState(false);

  // 判断是否显示 Tab 切换（只有来源是个人文件且用户有团队时才显示）
  const showTabSwitch = sourceTab === 'personal' && hasTeams;

  // 判断是否在根目录（共享文件模式下）
  const isInRootOfShared = activeTab === 'shared' && currentPath.length === 1 && currentPath[0].id === null;

  // 判断是否可以保存到当前位置
  const canSaveToCurrentLocation = activeTab === 'personal' || !isInRootOfShared;

  // 获取文件夹列表
  const fetchFolders = async (parentId: string | number | null = null, tab?: 'personal' | 'shared') => {
    try {
      setLoading(true);
      
      // 使用传入的 tab 参数，如果没有则使用当前的 activeTab
      const currentTab = tab || activeTab;
      
      if (currentTab === 'shared') {
        // 共享文件模式
        const res = await assetsService.getFolders(excludeIds, teamIds);
        const folderList = Array.isArray(res) ? res : (res?.data || []);
        
        // 根目录时，需要找到 assetPackageId 为 null 或 undefined 的文件夹
        const filtered = (folderList || []).filter(folder => {
          // 如果是根目录（parentId 为 null），匹配 assetPackageId 为 null、undefined 或 0
          if (parentId === null) {
            return folder.assetPackageId === null || 
                   folder.assetPackageId === undefined || 
                   folder.assetPackageId === 0 ||
                   String(folder.assetPackageId) === '0';
          }
          // 否则匹配指定的 parentId（使用字符串比较，避免大整数精度丢失）
          return String(folder.assetPackageId) === String(parentId);
        });
        setFolders(filtered);
      } else {
        // 个人文件模式
        const res = await assetsService.getFolders(excludeIds);
        const folderList = Array.isArray(res) ? res : (res?.data || []);
        const filtered = (folderList || []).filter(folder => {
          if (parentId === null) {
            return folder.assetPackageId === null || 
                   folder.assetPackageId === undefined || 
                   folder.assetPackageId === 0;
          }
          return String(folder.assetPackageId) === String(parentId);
        });
        setFolders(filtered);
      }
    } catch (error) {
      console.error('获取文件夹列表失败:', error);
      toast.error('获取文件夹列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 进入文件夹
  const handleEnterFolder = (folder: AdsAssetsVO) => {
    setCurrentPath(prev => [...prev, {
      id: String(folder.id),
      name: folder.assetName || '未命名文件夹',
      teamId: (folder as any).teamId
    }]);
    fetchFolders(folder.id);
    // 进入文件夹时选择该文件夹作为目标
    setSelectedFolderId(String(folder.id));
  };

  // 面包屑导航
  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      // 回到根目录
      setCurrentPath([{ id: null, name: '全部文件' }]);
      fetchFolders(null);
      setSelectedFolderId(null);
    } else {
      // 回到指定层级
      const targetPath = currentPath.slice(0, index + 1);
      setCurrentPath(targetPath);
      const targetFolder = targetPath[targetPath.length - 1];
      if (targetFolder && targetFolder.id) {
        fetchFolders(targetFolder.id);
        setSelectedFolderId(targetFolder.id);
      } else {
        fetchFolders(null);
        setSelectedFolderId(null);
      }
    }
  };

  // 确认移动/分享
  const handleConfirm = () => {
    // 共享文件模式：检查是否在根目录
    if (activeTab === 'shared' && isInRootOfShared) {
      toast.error('请进入团队文件夹后再保存');
      return;
    }
    
    // 检查是否选择了当前文件夹（只有在移动模式下才检查）
    if (selectedFolderId === currentFolderId && activeTab === sourceTab) {
      toast.error('文件已在当前文件夹中，请选择其他文件夹');
      return;
    }
    
    // 获取 teamId（如果是共享文件夹）
    let teamId: string | undefined;
    if (activeTab === 'shared') {
      // 从当前路径中获取 teamId
      for (let i = currentPath.length - 1; i >= 0; i--) {
        const pathItem = currentPath[i];
        if (pathItem?.teamId) {
          teamId = String(pathItem.teamId);
          break;
        }
      }
    }
    
    onConfirm({
      targetFolderId: selectedFolderId,
      targetTab: activeTab,
      teamId
    });
  };

  // 取消选择
  const handleCancel = () => {
    setSelectedFolderId(null);
    setCurrentPath([{ id: null, name: '全部文件' }]);
    onClose();
  };

  // 新建文件夹
  const handleCreateFolder = () => {
    setShowCreateInput(true);
    setNewFolderName('');
    // 等待 DOM 更新后聚焦输入框
    setTimeout(() => {
      const input = document.querySelector('.folder-name-input') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 0);
  };

  // 确认创建文件夹
  const handleConfirmCreate = async () => {
    if (!newFolderName.trim()) {
      toast.error('请输入文件夹名称');
      return;
    }
    
    try {
      setCreating(true);
      
      // 获取当前路径的最后一个文件夹ID作为父文件夹
      const currentFolder = currentPath[currentPath.length - 1];
      const parentId = currentFolder?.id ? currentFolder.id : null;
      
      // 创建文件夹数据
      const folderData: Partial<AdsAssetsVO> = {
        assetName: newFolderName.trim(),
        dataType: 2, // 2表示文件夹
        assetPackageId: parentId || undefined,
        designerId: user?.userId,
      };
      
      // 如果是共享文件模式，需要添加团队ID和共享标识
      if (activeTab === 'shared' && teamIds) {
        // 优先从当前路径中获取 teamId（用户已经进入某个团队文件夹）
        let teamId: string | number | undefined;
        
        // 从路径中查找最近的包含 teamId 的文件夹
        for (let i = currentPath.length - 1; i >= 0; i--) {
          const pathItem = currentPath[i];
          if (pathItem?.teamId) {
            teamId = pathItem.teamId;
            break;
          }
        }
        
        // 如果路径中没有找到，则从 teamIds 中获取第一个
        if (!teamId) {
          const teamIdList = teamIds.split(',').filter(id => id.trim());
          if (teamIdList.length > 0) {
            teamId = teamIdList[0];
          }
        }
        
        if (teamId) {
          // 注意：不要用 Number() 转换，会导致大整数精度丢失！
          folderData.teamId = String(teamId);
          folderData.isShare = 1; // 共享文件
        }
      } else {
        // 个人文件模式
        folderData.isShare = 0;
      }
      
      await assetsService.addAssets(folderData as AdsAssetsVO);
      toast.success('文件夹创建成功');
      
      // 等待一小段时间确保数据已写入
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 刷新文件夹列表
      await fetchFolders(parentId);
      
      // 重置状态
      setShowCreateInput(false);
      setNewFolderName('');
    } catch (error) {
      console.error('创建文件夹失败:', error);
      toast.error('创建文件夹失败');
    } finally {
      setCreating(false);
    }
  };

  // 取消创建文件夹
  const handleCancelCreate = () => {
    setShowCreateInput(false);
    setNewFolderName('');
  };

  // Tab 切换处理
  const handleTabChange = (tab: 'personal' | 'shared') => {
    setActiveTab(tab);
    setSelectedFolderId(null);
    setCurrentPath([{ id: null, name: '全部文件' }]);
    setShowCreateInput(false);
    setNewFolderName('');
    // 传递 tab 参数，确保使用正确的 tab 值
    fetchFolders(null, tab);
  };

  // 监听弹窗显示状态
  useEffect(() => {
    if (visible) {
      // 根据来源初始化 activeTab
      let initialTab: 'personal' | 'shared';
      if (sourceTab === 'personal' && hasTeams) {
        initialTab = 'personal'; // 个人文件来源，默认显示个人文件夹
      } else {
        initialTab = sourceTab; // 使用来源Tab
      }
      
      setActiveTab(initialTab);
      setSelectedFolderId(null);
      setCurrentPath([{ id: null, name: '全部文件' }]);
      setShowCreateInput(false);
      setNewFolderName('');
      // 传递 initialTab 参数，确保使用正确的 tab 值
      fetchFolders(null, initialTab);
    }
  }, [visible, sourceTab, hasTeams]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      />
      
      <div className="relative w-full max-w-[500px] bg-white dark:bg-gray-900 rounded-lg shadow-2xl flex flex-col" style={{ height: '500px' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            移动到
          </h3>
          <button 
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        {showTabSwitch && (
          <div className="px-6 pt-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
            <div className="flex gap-1">
              <button
                onClick={() => handleTabChange('personal')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'personal'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                个人文件夹
              </button>
              <button
                onClick={() => handleTabChange('shared')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'shared'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                共享文件夹
              </button>
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm">
            {currentPath.map((item, index) => (
              <React.Fragment key={item.id || 'root'}>
                {index > 0 && <ChevronRight size={14} className="text-gray-400" />}
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className={`${
                    index < currentPath.length - 1
                      ? 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer'
                      : 'text-gray-700 dark:text-gray-300 cursor-default'
                  }`}
                >
                  {item.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Folder List */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ minHeight: '200px' }}>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-gray-500 text-sm">加载中...</div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {/* 新建文件夹输入框 */}
              {showCreateInput && (
                <div className="flex items-center px-4 py-3 rounded-md border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 mb-2">
                  <div className="text-xl mr-3">📁</div>
                  <div className="flex-1 mr-3">
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleConfirmCreate();
                        } else if (e.key === 'Escape') {
                          handleCancelCreate();
                        }
                      }}
                      placeholder="新建文件夹"
                      className="folder-name-input w-full border-none outline-none bg-transparent text-sm text-gray-900 dark:text-white"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleConfirmCreate}
                      disabled={creating}
                      className="w-6 h-6 rounded border-none bg-green-500 text-white text-xs flex items-center justify-center hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ✓
                    </button>
                    <button
                      onClick={handleCancelCreate}
                      disabled={creating}
                      className="w-6 h-6 rounded border-none bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
              
              {/* 文件夹列表 */}
              {folders.length > 0 ? (
                folders.map(folder => {
                  const folderId = String(folder.id);
                  const isSelected = folderId === selectedFolderId;
                  return (
                    <div
                      key={folder.id}
                      className={`flex items-center px-4 py-3 rounded-md cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                          : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                      }`}
                      onClick={() => handleEnterFolder(folder)}
                    >
                      <div className="text-xl mr-3">📁</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {folder.assetName || '未命名文件夹'}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                !showCreateInput && (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                    <div className="text-5xl mb-4 opacity-50">📁</div>
                    <div className="text-sm">该目录下没有文件夹</div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center flex-shrink-0">
          <div className="flex-1">
            {canSaveToCurrentLocation ? (
              <button
                onClick={handleCreateFolder}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                新建文件夹
              </button>
            ) : (
              <div className="text-sm text-yellow-600 dark:text-yellow-400">
                请进入团队文件夹后再进行操作
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canSaveToCurrentLocation}
              className="px-4 py-2 rounded text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:border-gray-300 dark:disabled:border-gray-600 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              移动到此处
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoveShareModal;
