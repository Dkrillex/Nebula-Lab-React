import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Folder, File, Users, Globe, Lock, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import UploadComponent from './UploadComponent';
import { assetsService, AdsAssetsForm, AdsAssetsVO } from '../services/assetsService';
import { uploadService } from '../services/uploadService';
import { useAuthStore } from '../stores/authStore';
import { useDictStore } from '../stores/dictStore';
import { dictService } from '../services/dictService';
import { UploadedFile } from '../services/avatarService';
import FolderSelectModal from './FolderSelectModal';


interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialIsFolder?: boolean;
  initialFolderId?: string | number; // If adding inside a folder
  initialData?: Partial<AdsAssetsVO>; // Pre-fill data for editing
  isEdit?: boolean; // Whether this is an edit operation
  disableAssetTypeSelection?: boolean; // If true, only show the selected asset type and disable selection (for generated materials)
}

const AddMaterialModal: React.FC<AddMaterialModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialIsFolder = false,
  initialFolderId,
  initialData,
  isEdit = false,
  disableAssetTypeSelection = false
}) => {
  const { user } = useAuthStore();
  const { dictCache, setDict, getDict } = useDictStore();
  const [isFolderMode, setIsFolderMode] = useState(initialIsFolder);
  const [loading, setLoading] = useState(false);
  
  // Asset Types
  const [assetTypes, setAssetTypes] = useState<{label: string, value: number}[]>([]);
  const [assetTypesLoading, setAssetTypesLoading] = useState(true);

  // Fetch Asset Types
  useEffect(() => {
    const fetchDicts = async () => {
      setAssetTypesLoading(true);
      const cached = getDict('nebula_assets_type');
      if (cached && cached.length > 0) {
        // 如果缓存的数据格式是 { label, value }，直接使用
        // 如果是原始 API 格式，需要转换
        const formatted = cached.map((d: any) => {
          if (d.dictLabel && d.dictValue) {
            return { label: d.dictLabel, value: Number(d.dictValue) };
          }
          return { label: d.label, value: Number(d.value) };
        });
        setAssetTypes(formatted);
        setAssetTypesLoading(false);
      } else {
        try {
          // request.get 已经自动解包，返回的是 data 字段的内容（DictData[]）
          const data = await dictService.getDicts('nebula_assets_type');
          console.log('Dict API response data:', data);
          if (data && Array.isArray(data) && data.length > 0) {
            // 转换数据格式并存储到缓存
            const formatted = data.map(d => ({ 
              label: d.dictLabel, 
              value: Number(d.dictValue),
              dictCode: d.dictCode,
              dictSort: d.dictSort,
              dictType: d.dictType,
              remark: d.remark
            }));
            setDict('nebula_assets_type', formatted);
            setAssetTypes(formatted.map(d => ({ label: d.label, value: d.value })));
          } else {
            console.warn('No data returned from dict API or data is empty', data);
            setAssetTypes([]);
          }
        } catch (error) {
          console.error('Failed to fetch asset types:', error);
          setAssetTypes([]);
        } finally {
          setAssetTypesLoading(false);
        }
      }
    };
    
    if (isOpen) {
      fetchDicts();
    }
  }, [isOpen, getDict, setDict]);
  
  // Form Data
  const [formData, setFormData] = useState<AdsAssetsForm>({
    id: undefined,
    assetName: '',
    assetType: 7, // Default to AI生图
    assetTag: '',
    assetDesc: '',
    isPrivateModel: false,
    isShare: 0, // 0: Personal, 1: Shared
    assetUrl: '',
    assetId: '',
    dataType: initialIsFolder ? 2 : 1, // 1: File, 2: Folder
  });

  // Storage Location State
  const [storageLocation, setStorageLocation] = useState<'personal' | 'shared' | 'both'>('personal');
  const [selectedTeamId, setSelectedTeamId] = useState<string | number>('');
  
  // Folder Selection State
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedFolderName, setSelectedFolderName] = useState<string>('');
  
  const [selectedPersonalFolderId, setSelectedPersonalFolderId] = useState<string | null>(null);
  const [selectedPersonalFolderName, setSelectedPersonalFolderName] = useState<string>('根目录');
  
  const [showFolderSelector, setShowFolderSelector] = useState(false);
  const [folderSelectorType, setFolderSelectorType] = useState<'personal' | 'shared'>('personal');
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsFolderMode(initialIsFolder);
      setFormData({
        id: initialData?.id,
        assetName: initialData?.assetName || '',
        assetType: initialIsFolder ? undefined : (initialData?.assetType || 7),
        assetTag: initialData?.assetTag || '',
        assetDesc: initialData?.assetDesc || '',
        isPrivateModel: initialData?.isPrivateModel || false,
        isShare: initialData?.isShare || 0,
        assetUrl: initialData?.assetUrl || '',
        assetId: initialData?.assetId || (initialData as any)?.assetId || '',
        dataType: initialIsFolder ? 2 : 1,
        assetPackageId: initialFolderId,
        teamId: (initialData as any)?.teamId,
      });
      
      // Initialize storage location based on initial data or default
      if (initialData?.isShare === 1) {
        setStorageLocation('shared');
        setSelectedTeamId((initialData as any)?.teamId || '');
        // If we have folder info in initialData (e.g. edit mode), set it
        if(initialData.assetPackageId) {
            setSelectedFolderId(String(initialData.assetPackageId));
            // Note: We might not have folder name here without fetching it, 
            // but typically edit happens in context where we might know it or just show ID/Placeholder
            // For now leaving name empty or generic if unknown
             setSelectedFolderName('已选文件夹'); 
        }
      } else {
      setStorageLocation('personal');
        setSelectedTeamId('');
        if(initialData?.assetPackageId) {
             setSelectedPersonalFolderId(String(initialData.assetPackageId));
             setSelectedPersonalFolderName('已选文件夹');
        } else {
             setSelectedPersonalFolderId(null);
             setSelectedPersonalFolderName('根目录');
        }
      }
      
      // If adding inside a folder (initialFolderId is set)
      if (initialFolderId) {
         // Assume we are in that folder context, so no need to select location
         // logic handled in render to hide selector
      }
    }
  }, [isOpen, initialIsFolder, initialFolderId, initialData]);

  const handleUploadComplete = (file: UploadedFile) => {
    setFormData(prev => ({
      ...prev,
      assetUrl: file.fileUrl,
      assetId: file.fileId,
      // If assetName is empty, use fileName (without extension)
      assetName: prev.assetName || file.fileName.split('.').slice(0, -1).join('.'),
    }));
  };

  const handleSelectFolder = (type: 'personal' | 'shared') => {
    if (type === 'shared' && !selectedTeamId) {
      toast.error('请先选择团队');
      return;
    }
    setFolderSelectorType(type);
    setShowFolderSelector(true);
  };

  const handleFolderConfirm = (folderId: string | null, folderName: string) => {
    if (folderSelectorType === 'personal') {
      setSelectedPersonalFolderId(folderId);
      setSelectedPersonalFolderName(folderName || '根目录');
    } else {
      if (!folderId) {
         toast.error('共享文件必须选择文件夹，不能保存到根目录');
         return;
      }
      setSelectedFolderId(folderId);
      setSelectedFolderName(folderName);
    }
    setShowFolderSelector(false);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.assetName) {
      toast.error('请输入名称');
      return;
    }
    // Validate file upload for types that require files (only for new files, not editing)
    if (!isEdit && !isFolderMode && !formData.assetUrl) {
      toast.error('请上传素材文件或确保素材链接存在');
        return;
    }
    
    // Storage location validation
    if (!isEdit && !initialFolderId) {
        if ((storageLocation === 'shared' || storageLocation === 'both')) {
             if (!selectedTeamId) {
      toast.error('请选择团队');
      return;
             }
             if (!selectedFolderId) {
                 toast.error('请选择共享文件夹（不能保存到根目录）');
                 return;
             }
        }
    }

    setLoading(true);
    try {
      // Step 1: Upload to OSS if the URL is not already an OSS URL
      let finalAssetUrl = formData.assetUrl;
      let finalAssetId = formData.assetId;
      
      // Check if the URL is from an external source or temp storage (not from OSS)
      // OSS URLs typically contain specific domains or patterns
      const needsOSSUpload = finalAssetUrl && !isEdit && (
        finalAssetUrl.startsWith('http') && 
        !finalAssetUrl.includes('aliyuncs.com') && // Typical OSS domain pattern
        !finalAssetUrl.includes('oss-')
      );
      
      if (needsOSSUpload) {
        try {
          toast.loading('正在上传素材到云端...', { id: 'upload-oss' });
          
          // Determine file type from URL
          const urlExt = finalAssetUrl.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
          const isVideo = ['mp4', 'mov', 'avi', 'webm'].includes(urlExt);
          
          // Upload based on type
          let uploadResult;
          if (isVideo) {
            uploadResult = await uploadService.uploadByVideoUrl(finalAssetUrl, urlExt);
          } else {
            uploadResult = await uploadService.uploadByImageUrl(finalAssetUrl, urlExt);
          }
          
          if (uploadResult.data) {
            finalAssetUrl = uploadResult.data.url;
            finalAssetId = uploadResult.data.ossId;
            toast.success('素材上传成功', { id: 'upload-oss' });
          }
        } catch (uploadError) {
          console.error('OSS upload error:', uploadError);
          toast.error('素材上传失败，但将继续保存', { id: 'upload-oss' });
          // Continue with original URL if upload fails
        }
      }
      
      // Step 2: Save to assets library
      // Prepare data with updated URL and ID
      const baseData: AdsAssetsForm = {
        ...formData,
        assetUrl: finalAssetUrl,
        assetId: finalAssetId,
        dataType: isFolderMode ? 2 : 1,
        assetType: isFolderMode ? undefined : formData.assetType,
      };

      if (isEdit) {
        // Edit mode: update existing asset
        // When editing, we generally don't change location (personal/shared/folder) via this modal easily 
        // (usually that's move operation), but we might update name/desc/tag/url.
        await assetsService.updateAssets(baseData);
        toast.success('更新成功');
      } else {
        // Add mode
        const requests: Promise<any>[] = [];

        // 1. Personal
        if (storageLocation === 'personal' || storageLocation === 'both') {
          // If initialFolderId is set, use it. Otherwise use selectedPersonalFolderId
          const folderId = initialFolderId || selectedPersonalFolderId || undefined;
          
          requests.push(assetsService.addAssets({
            ...baseData,
            id: undefined,
            isShare: 0,
            teamId: undefined,
            assetPackageId: folderId
          }));
        }

        // 2. Shared
        if (storageLocation === 'shared' || storageLocation === 'both') {
           // If initialFolderId is set AND we are in shared context (how to know? passed in props?), use it.
           // But usually AddMaterialModal is context-aware. 
           // If initialFolderId is provided, the user is "inside" a folder. 
           // We should probably respect that context.
           // However, if the user explicitly chose "Shared" via radio buttons (only if !initialFolderId), use selectedFolderId.
           
           const folderId = initialFolderId || selectedFolderId;
           
           requests.push(assetsService.addAssets({
            ...baseData,
            id: undefined,
            isShare: 1,
            teamId: selectedTeamId,
            assetPackageId: folderId
          }));
        }

        await Promise.all(requests);
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save material:', error);
      toast.error(isEdit ? '更新失败' : '添加失败');
    } finally {
      setLoading(false);
    }
  };

  // Calculate accept type for upload
  const getAcceptType = () => {
    // Vue logic:
    // 4 (Picture to Video): video
    // 6 (Migration): picture
    // 7 (Text to Image): picture
    // 8 (Voice Clone): audio
    // Default: video
    // But here we have dynamic types.
    // We can map based on value.
    
    switch (formData.assetType) {
      case 6: // 万物迁移
      case 7: // AI生图
      case 13: // AI图片生成
         return '.png,.jpg,.jpeg,.webp';
      case 8: // 声音克隆
         return '.mp3,.wav';
      case 4: // 图生视频
      case 5: // 原创视频
      case 14: // AI视频生成
         return '.mp4,.mov,.bmp';
      default: 
         return '.mp4,.mov,.bmp'; // Default to video as per Vue
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? (isFolderMode ? '编辑文件夹' : '编辑素材') : (isFolderMode ? '新建文件夹' : '添加素材')}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Asset Type (Only for files) */}
          {!isFolderMode && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                素材类型
              </label>
              {disableAssetTypeSelection ? (
                // 只读模式：只显示当前选中的素材类型
                <div className="flex items-center gap-2">
                  {assetTypesLoading ? (
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Loader className="animate-spin" size={16} />
                      加载中...
                    </div>
                  ) : (() => {
                    const selectedType = assetTypes.find(t => t.value === formData.assetType);
                    return selectedType ? (
                      <div className="px-3 py-2 text-sm rounded-lg border border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-400 opacity-75 cursor-not-allowed">
                        {selectedType.label}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">未选择素材类型</div>
                    );
                  })()}
                </div>
              ) : (
                // 可编辑模式：显示所有素材类型供选择
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {assetTypesLoading ? (
                    <div className="text-sm text-gray-500 col-span-5 flex items-center gap-2">
                      <Loader className="animate-spin" size={16} />
                      加载中...
                    </div>
                  ) : assetTypes.length > 0 ? (
                    assetTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, assetType: type.value })}
                      className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                        formData.assetType === type.value
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {type.label}
                    </button>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 col-span-5">暂无素材类型</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Upload (Only for files) */}
          {!isFolderMode && (
            <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                上传文件
              </label>
              <UploadComponent 
                onUploadComplete={handleUploadComplete}
                accept={getAcceptType()}
                uploadType="oss" 
                initialUrl={formData.assetUrl}
                className="h-36"
              />
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isFolderMode ? '文件夹名称' : '素材名称'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.assetName}
              onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
              placeholder={isFolderMode ? "请输入文件夹名称" : "请输入素材名称"}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Tag */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isFolderMode ? '文件夹标签' : '素材标签'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.assetTag}
              onChange={(e) => setFormData({ ...formData, assetTag: e.target.value })}
              placeholder={isFolderMode ? "文件夹标签" : "素材标签，多个标签用逗号分隔"}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
             <div className="text-xs text-red-500">
                 素材标签格式：标签1,标签2，标签之间用英文逗号隔开！
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
               {isFolderMode ? '文件夹描述' : '素材描述'}
            </label>
            <textarea
              value={formData.assetDesc}
              onChange={(e) => setFormData({ ...formData, assetDesc: e.target.value })}
              placeholder={isFolderMode ? "请输入文件夹描述" : "请输入素材描述"}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          {/* Private Model Checkbox */}
          {!isFolderMode && [2, 3, 8, 9, 10].includes(formData.assetType as number) && (
            <div className="flex items-center gap-2">
               <input
                  type="checkbox"
                  id="isPrivateModel"
                  checked={formData.isPrivateModel}
                  onChange={(e) => setFormData({ ...formData, isPrivateModel: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
               />
               <label htmlFor="isPrivateModel" className="text-sm text-gray-700 dark:text-gray-300 select-none cursor-pointer">
                  私有模型 (仅自己可见)
               </label>
            </div>
          )}

          {/* Storage Location (Conditional) */}
          {/* Only show if not editing AND not inside a folder already */}
          {!isEdit && !initialFolderId && user?.team && user.team.length > 0 && (
             <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  存储位置
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="location" 
                      value="personal" 
                      checked={storageLocation === 'personal'}
                      onChange={() => setStorageLocation('personal')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">个人文件</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="location" 
                      value="shared" 
                      checked={storageLocation === 'shared'}
                      onChange={() => setStorageLocation('shared')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">共享文件</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="location" 
                      value="both" 
                      checked={storageLocation === 'both'}
                      onChange={() => setStorageLocation('both')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">两者都放</span>
                  </label>
                </div>
             </div>
          )}

          {/* Personal Folder Selection */}
           {!isEdit && !initialFolderId && (storageLocation === 'personal' || storageLocation === 'both') && (
             <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                 {storageLocation === 'both' ? '个人文件夹' : '存储文件夹'}
               </label>
               <div className="flex gap-2">
                 <input
                   type="text"
                   value={selectedPersonalFolderName}
                   readOnly
                   placeholder="请选择文件夹"
                   onClick={() => handleSelectFolder('personal')}
                   className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-pointer outline-none"
                 />
                 <button
                   type="button"
                   onClick={() => handleSelectFolder('personal')}
                   className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors flex items-center gap-2 flex-shrink-0"
                 >
                   <Folder size={16} />
                   选择
                 </button>
                </div>
             </div>
          )}

          {/* Team Selection */}
          {!isEdit && !initialFolderId && (storageLocation === 'shared' || storageLocation === 'both') && user?.team && (
             <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                 选择团队 <span className="text-red-500">*</span>
               </label>
               <select
                  value={selectedTeamId}
                  onChange={(e) => {
                      setSelectedTeamId(e.target.value);
                      setSelectedFolderId(null);
                      setSelectedFolderName('');
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
               >
                  <option value="">请选择团队</option>
                  {user.team.map((t: any) => (
                    <option key={t.teamId} value={t.teamId}>{t.teamName}</option>
                  ))}
               </select>
             </div>
          )}

          {/* Shared Folder Selection */}
          {!isEdit && !initialFolderId && (storageLocation === 'shared' || storageLocation === 'both') && selectedTeamId && (
             <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                 {storageLocation === 'both' ? '共享文件夹' : '存储文件夹'} <span className="text-red-500">*</span>
               </label>
               <div className="flex gap-2">
                 <input
                   type="text"
                   value={selectedFolderName || '请选择文件夹'}
                   readOnly
                   placeholder="请选择文件夹"
                   onClick={() => handleSelectFolder('shared')}
                   className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-pointer outline-none"
                 />
                 <button
                   type="button"
                   onClick={() => handleSelectFolder('shared')}
                   className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors flex items-center gap-2 flex-shrink-0"
                 >
                   <Folder size={16} />
                   选择
                 </button>
               </div>
               <p className="text-xs text-orange-500">
                 共享文件必须选择文件夹，不允许保存到根目录
               </p>
             </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading && <span className="animate-spin">⏳</span>}
            确定
          </button>
        </div>

      </div>

      {/* Folder Selection Modal */}
      <FolderSelectModal 
        isOpen={showFolderSelector}
        onClose={() => setShowFolderSelector(false)}
        onConfirm={handleFolderConfirm}
        teamId={folderSelectorType === 'shared' ? selectedTeamId : undefined}
        title={folderSelectorType === 'shared' ? '选择共享文件夹' : '选择个人文件夹'}
      />

    </div>
  );
};

export default AddMaterialModal;

