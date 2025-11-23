import React, { useState, useEffect } from 'react';
import { X, Folder, ChevronRight } from 'lucide-react';
import { assetsService, AdsAssetsVO } from '../services/assetsService';

interface FolderSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (folderId: string | null, folderName: string) => void;
  teamId?: string | number; // If provided, fetch shared folders for this team. If not, fetch personal folders.
  title?: string;
}

interface FolderNode extends AdsAssetsVO {
  children?: FolderNode[];
  level?: number;
}

interface PathItem {
  id: string | null;
  name: string;
  teamId?: string | number;
}

const FolderSelectModal: React.FC<FolderSelectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  teamId,
  title = '选择文件夹'
}) => {
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string>('根目录');
  const [currentPath, setCurrentPath] = useState<PathItem[]>([{ id: null, name: '全部文件' }]);

  useEffect(() => {
    if (isOpen) {
      fetchFolders(null); // 初始加载根目录
      setSelectedId(null);
      setSelectedName('根目录');
      setCurrentPath([{ id: null, name: '全部文件' }]);
    }
  }, [isOpen, teamId]);

  // 获取文件夹列表（分层加载，参考 Vue 版本）
  const fetchFolders = async (parentId: string | number | null = null) => {
    try {
      setLoading(true);
      
      // 调用 API：个人文件夹不传 teamIds，共享文件夹传 teamIds
      // request.get 会自动解包，返回 data 字段的内容（AdsAssetsVO[]）
      const res = await assetsService.getFolders(undefined, teamId ? String(teamId) : undefined);
      
      // res 应该是 AdsAssetsVO[] 数组
      const folderList = Array.isArray(res) ? res : (res?.data || []);
      
      if (folderList && folderList.length > 0) {
        let filteredFolders: AdsAssetsVO[] = [];
        
        if (teamId) {
          // 共享文件夹模式
          if (parentId === null) {
            // 根目录：找到 assetPackageId 为 null、undefined 或 0 的文件夹
            filteredFolders = folderList.filter(folder => 
              folder.assetPackageId === null || 
              folder.assetPackageId === undefined || 
              folder.assetPackageId === 0 ||
              folder.assetPackageId === '0'
            );
          } else {
            // 子目录：匹配指定的 parentId
            filteredFolders = folderList.filter(folder => 
              String(folder.assetPackageId) === String(parentId)
            );
          }
        } else {
          // 个人文件夹模式：直接匹配 parentId
          filteredFolders = folderList.filter(folder => {
            if (parentId === null) {
              return folder.assetPackageId === null || 
                     folder.assetPackageId === undefined || 
                     folder.assetPackageId === 0;
            }
            return String(folder.assetPackageId) === String(parentId);
          });
        }
        
        // 转换为 FolderNode 格式
        const folderNodes: FolderNode[] = filteredFolders.map(folder => ({
          ...folder,
          children: []
        }));
        
        // 直接设置当前层级的文件夹
        setFolders(folderNodes);
      }
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    } finally {
      setLoading(false);
    }
  };

  // 进入文件夹
  const handleEnterFolder = (folder: FolderNode) => {
    const folderId = String(folder.id);
    setCurrentPath(prev => [...prev, {
      id: folderId,
      name: folder.assetName || '未命名文件夹',
      teamId: (folder as any).teamId
    }]);
    fetchFolders(folder.id);
    // 进入文件夹时选择该文件夹作为目标
    setSelectedId(folderId);
    setSelectedName(folder.assetName || '未命名文件夹');
  };

  // 面包屑导航
  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      // 回到根目录
      setCurrentPath([{ id: null, name: '全部文件' }]);
      fetchFolders(null);
      setSelectedId(null);
      setSelectedName('根目录');
    } else {
      // 回到指定层级
      const targetPath = currentPath.slice(0, index + 1);
      setCurrentPath(targetPath);
      const targetFolder = targetPath[targetPath.length - 1];
      if (targetFolder && targetFolder.id) {
        fetchFolders(targetFolder.id);
        setSelectedId(targetFolder.id);
        setSelectedName(targetFolder.name);
      }
    }
  };

  // 选择根目录
  const handleSelectRoot = () => {
    setSelectedId(null);
    setSelectedName('根目录');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Breadcrumb */}
        {currentPath.length > 1 && (
          <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 flex-shrink-0">
            {currentPath.map((item, index) => (
              <React.Fragment key={item.id || 'root'}>
                {index > 0 && <ChevronRight size={14} className="text-gray-400" />}
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className={`text-sm ${
                    index === currentPath.length - 1
                      ? 'text-gray-900 dark:text-white font-medium'
                      : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer'
                  }`}
                >
                  {item.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {/* Root Option (only show when in root) */}
            {currentPath.length === 1 && (
              <div 
                className={`flex items-center py-2 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md mb-2 ${selectedId === null ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : ''}`}
                onClick={handleSelectRoot}
              >
                <Folder size={16} className={`mr-2 ${selectedId === null ? 'fill-current' : 'text-gray-500'}`} />
                <span className="text-sm">根目录</span>
              </div>
            )}

            {loading ? (
                <div className="flex justify-center py-4">
                    <span className="animate-spin">⏳</span>
                </div>
            ) : (
                <div className="space-y-1">
                  {folders.map(folder => {
                    const folderId = String(folder.id);
                    const isSelected = folderId === selectedId;
                    return (
                      <div
                        key={folder.id}
                        className={`flex items-center py-2 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : ''}`}
                        onClick={() => handleEnterFolder(folder)}
                      >
                        <ChevronRight size={14} className="mr-1 text-gray-400" />
                        <Folder size={16} className={`mr-2 ${isSelected ? 'fill-current' : 'text-gray-500'}`} />
                        <span className="text-sm truncate">{folder.assetName || '未命名文件夹'}</span>
                      </div>
                    );
                  })}
                </div>
            )}
            
            {!loading && folders.length === 0 && (
                 <div className="text-center text-gray-500 py-4 text-sm">
                    该目录下没有文件夹
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => onConfirm(selectedId, selectedName)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderSelectModal;

