import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Folder, File, Users, Globe, Lock } from 'lucide-react';
import UploadComponent from './UploadComponent';
import { assetsService, AdsAssetsForm } from '../services/assetsService';
import { useAuthStore } from '../stores/authStore';
import { UploadedFile } from '../services/avatarService';

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialIsFolder?: boolean;
  initialFolderId?: string | number; // If adding inside a folder
  initialData?: Partial<AdsAssetsForm>; // Pre-fill data like assetUrl
}

// Asset Types based on reference
const ASSET_TYPES = [
  { label: '图片', value: 6 },
  { label: '视频', value: 4 },
  { label: '音频', value: 8 },
  { label: '产品数字人', value: 2 },
  { label: '数字人', value: 3 },
  // { label: '私有数字人', value: 9 },
];

const AddMaterialModal: React.FC<AddMaterialModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialIsFolder = false,
  initialFolderId,
  initialData
}) => {
  const { user } = useAuthStore();
  const [isFolderMode, setIsFolderMode] = useState(initialIsFolder);
  const [loading, setLoading] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState<AdsAssetsForm>({
    assetName: '',
    assetType: 6, // Default to Image
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
        assetName: initialData?.assetName || '',
        assetType: initialIsFolder ? undefined : (initialData?.assetType || 6),
        assetTag: initialData?.assetTag || '',
        assetDesc: initialData?.assetDesc || '',
        isPrivateModel: initialData?.isPrivateModel || false,
        isShare: initialData?.isShare || 0,
        assetUrl: initialData?.assetUrl || '',
        assetId: initialData?.assetId || '',
        dataType: initialIsFolder ? 2 : 1,
        assetPackageId: initialFolderId,
      });
      setStorageLocation('personal');
      setSelectedTeamId('');
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
    if (!isFolderMode && !formData.assetUrl && formData.assetType !== 2 && formData.assetType !== 3) {
      // For purely digital humans, maybe no upload needed? 
      // Reference implies upload is needed for types 5 (File?) but logic says: 
      // if (!isFolderMode && formData.assetType === '5' && !assetUrl) -> error.
      // For general file types (Image/Video/Audio), we need a file.
      if ([4, 6, 8].includes(formData.assetType as number) && !formData.assetUrl) {
        alert('请上传素材文件');
        return;
      }
    }
    
    if ((storageLocation === 'shared' || storageLocation === 'both') && !selectedTeamId) {
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

      const requests: Promise<any>[] = [];

      // 1. Personal
      if (storageLocation === 'personal' || storageLocation === 'both') {
        requests.push(assetsService.addAssets({
          ...baseData,
          isShare: 0,
          teamId: undefined,
          assetPackageId: initialFolderId // Assuming context is personal if not specified otherwise? 
          // Logic refinement: If initialFolderId is set, we need to know if it's a personal or shared folder.
          // For simplicity, if initialFolderId is set, we might disable location selection and just use the current context.
          // But here we implement the 'add from root' style.
        }));
      }

      // 2. Shared
      if (storageLocation === 'shared' || storageLocation === 'both') {
         requests.push(assetsService.addAssets({
          ...baseData,
          isShare: 1,
          teamId: selectedTeamId,
          // For shared, usually we need a folder. If root is allowed, it's null/undefined.
          assetPackageId: undefined // Or selected folder if we had a folder selector
        }));
      }

      await Promise.all(requests);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to add material:', error);
      alert('添加失败');
    } finally {
      setLoading(false);
    }
  };

  // Calculate accept type for upload
  const getAcceptType = () => {
    switch (formData.assetType) {
      case 6: return 'image/*';
      case 4: return 'video/*';
      case 8: return 'audio/*';
      default: return '*/*';
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
            {isFolderMode ? '新建文件夹' : '添加素材'}
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
          {/* If we are already in a folder (initialFolderId set), we might skip this or simplify it */}
          {!initialFolderId && user?.team && user.team.length > 0 && (
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

