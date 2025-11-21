import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Folder, File, Users, Globe, Lock } from 'lucide-react';
import UploadComponent from './UploadComponent';
import { assetsService, AdsAssetsForm, AdsAssetsVO } from '../services/assetsService';
import { useAuthStore } from '../stores/authStore';
import { UploadedFile } from '../services/avatarService';
import toast from 'react-hot-toast';

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialIsFolder?: boolean;
  initialFolderId?: string | number; // If adding inside a folder
  initialData?: Partial<AdsAssetsVO>; // Pre-fill data for editing
  isEdit?: boolean; // Whether this is an edit operation
}

// Asset Types based on reference from points.vue
// Type mapping:
// 1: AI混剪视频, 2: 产品数字人, 3: 数字人视频, 4: 图生视频, 5: 原创视频
// 6: 万物迁移, 7: AI生图, 8: 声音克隆, 9: 自定义数字人, 10: 唱歌数字人
// 11: AI换脸视频, 13: AI图片生成, 14: AI视频生成, 15: AI创作实验室
const ASSET_TYPES = [
  { label: 'AI生图', value: 7 },
  { label: 'AI图片生成', value: 13 },
  { label: '图生视频', value: 4 },
  { label: 'AI视频生成', value: 14 },
  { label: '原创视频', value: 5 },
  { label: '声音克隆', value: 8 },
  { label: '产品数字人', value: 2 },
  { label: '数字人视频', value: 3 },
  { label: '自定义数字人', value: 9 },
  { label: '唱歌数字人', value: 10 },
];

const AddMaterialModal: React.FC<AddMaterialModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialIsFolder = false,
  initialFolderId,
  initialData,
  isEdit = false
}) => {
  const { user } = useAuthStore();
  const [isFolderMode, setIsFolderMode] = useState(initialIsFolder);
  const [loading, setLoading] = useState(false);
  
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
      setStorageLocation('personal');
      setSelectedTeamId((initialData as any)?.teamId || '');
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

  const handleSubmit = async () => {
    // Validation
    if (!formData.assetName) {
      alert('请输入名称');
      return;
    }
    // Validate file upload for types that require files (only for new files, not editing)
    if (!isEdit && !isFolderMode && !formData.assetUrl) {
      const typesRequiringUpload = [4, 5, 7, 8, 13, 14]; // Video, audio, image types
      if (typesRequiringUpload.includes(formData.assetType as number)) {
        alert('请上传素材文件');
        return;
      }
    }
    
    if (!isEdit && (storageLocation === 'shared' || storageLocation === 'both') && !selectedTeamId) {
      alert('请选择团队');
      return;
    }

    setLoading(true);
    try {
      // Prepare data
      const baseData: AdsAssetsForm = {
        ...formData,
        dataType: isFolderMode ? 2 : 1,
        assetType: isFolderMode ? undefined : formData.assetType,
      };

      if (isEdit) {
        // Edit mode: update existing asset
        await assetsService.updateAssets(baseData);
        alert('更新成功');
      } else {
        // Add mode
        const requests: Promise<any>[] = [];

        // 1. Personal
        if (storageLocation === 'personal' || storageLocation === 'both') {
          requests.push(assetsService.addAssets({
            ...baseData,
            id: undefined,
            isShare: 0,
            teamId: undefined,
            assetPackageId: initialFolderId
          }));
        }

        // 2. Shared
        if (storageLocation === 'shared' || storageLocation === 'both') {
           requests.push(assetsService.addAssets({
            ...baseData,
            id: undefined,
            isShare: 1,
            teamId: selectedTeamId,
            assetPackageId: undefined
          }));
        }

        await Promise.all(requests);
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save material:', error);
      alert(isEdit ? '更新失败' : '添加失败');
    } finally {
      setLoading(false);
    }
  };

  // Calculate accept type for upload
  const getAcceptType = () => {
    switch (formData.assetType) {
      case 7:  // AI生图
      case 13: // AI图片生成
        return 'image/*';
      case 4:  // 图生视频
      case 5:  // 原创视频
      case 14: // AI视频生成
        return 'video/*';
      case 8:  // 声音克隆
        return 'audio/*';
      default: 
        return '*/*';
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
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Asset Type (Only for files) */}
          {!isFolderMode && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                素材类型
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {ASSET_TYPES.map(type => (
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
                ))}
              </div>
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
                uploadType="oss" // Use generic OSS upload for materials usually, or 'tv' if needed
                initialUrl={formData.assetUrl}
                className="h-40"
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
              标签
            </label>
            <input
              type="text"
              value={formData.assetTag}
              onChange={(e) => setFormData({ ...formData, assetTag: e.target.value })}
              placeholder="素材标签，多个标签用逗号分隔"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              描述
            </label>
            <textarea
              value={formData.assetDesc}
              onChange={(e) => setFormData({ ...formData, assetDesc: e.target.value })}
              placeholder="请输入描述信息"
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
          {/* If we are already in a folder (initialFolderId set), or editing, we skip this */}
          {!isEdit && !initialFolderId && user?.team && user.team.length > 0 && (
             <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  存储位置
                </label>
                <div className="flex gap-4">
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

          {/* Team Selection */}
          {(storageLocation === 'shared' || storageLocation === 'both') && user?.team && (
             <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                 选择团队 <span className="text-red-500">*</span>
               </label>
               <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
               >
                  <option value="">请选择团队</option>
                  {user.team.map((t: any) => (
                    <option key={t.teamId} value={t.teamId}>{t.teamName}</option>
                  ))}
               </select>
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
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading && <span className="animate-spin">⏳</span>}
            确定
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddMaterialModal;

