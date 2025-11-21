/**
 * 素材类型常量定义
 * 与后端字典 nebula_assets_type 对应
 */

export interface AssetTypeOption {
  label: string;
  value: number;
  icon?: string;
  accept?: string; // 上传文件类型限制
}

// 素材类型枚举
export const ASSET_TYPES: AssetTypeOption[] = [
  { 
    label: '脚本', 
    value: 1,
    icon: '📄',
  },
  { 
    label: '产品数字人', 
    value: 2,
    icon: '👤',
  },
  { 
    label: '数字人', 
    value: 3,
    icon: '🧑',
  },
  { 
    label: '视频', 
    value: 4,
    icon: '🎬',
    accept: '.mp4,.mov,.avi,.mkv',
  },
  { 
    label: '文件', 
    value: 5,
    icon: '📁',
  },
  { 
    label: '图片', 
    value: 6,
    icon: '🖼️',
    accept: '.png,.jpg,.jpeg,.webp,.gif',
  },
  { 
    label: '背景图', 
    value: 7,
    icon: '🎨',
    accept: '.png,.jpg,.jpeg,.webp',
  },
  { 
    label: '音频', 
    value: 8,
    icon: '🎵',
    accept: '.mp3,.wav,.m4a',
  },
  { 
    label: '私有数字人', 
    value: 9,
    icon: '🔒',
  },
  { 
    label: '其他数字人', 
    value: 10,
    icon: '👥',
  },
];

// 根据类型值获取标签
export const getAssetTypeLabel = (type?: number): string => {
  if (!type) return '未知类型';
  const assetType = ASSET_TYPES.find(t => t.value === type);
  return assetType ? assetType.label : '未知类型';
};

// 根据类型值获取接受的文件类型
export const getAssetTypeAccept = (type?: number): string => {
  if (!type) return '*/*';
  const assetType = ASSET_TYPES.find(t => t.value === type);
  return assetType?.accept || '*/*';
};

// 根据类型值获取图标
export const getAssetTypeIcon = (type?: number): string => {
  if (!type) return '📄';
  const assetType = ASSET_TYPES.find(t => t.value === type);
  return assetType?.icon || '📄';
};

// 需要显示私有模型选项的类型
export const PRIVATE_MODEL_TYPES = [2, 3, 8, 9, 10];

// 需要上传文件的类型
export const UPLOAD_REQUIRED_TYPES = [4, 5, 6, 7, 8];

