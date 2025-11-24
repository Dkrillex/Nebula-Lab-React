
// 图片生成尺寸定义
export const IMAGE_SIZES: Record<string, { id: string; name: string }[]> = {
  doubao_seedream_3_0: [
    { id: '1024x1024', name: '1:1 (1024x1024)' },
    { id: '1152x864', name: '4:3 (1152x864)' },
    { id: '864x1152', name: '3:4 (864x1152)' },
    { id: '1280x720', name: '16:9 (1280x720)' },
    { id: '720x1280', name: '9:16 (720x1280)' },
    { id: '1248x832', name: '3:2 (1248x832)' },
    { id: '832x1248', name: '2:3 (832x1248)' },
    { id: '1512x648', name: '21:9 (1512x648)' },
  ],
  doubao_seedream_4_0: [
    { id: '2048x2048', name: '1:1 (2048x2048)' },
    { id: '2304x1728', name: '4:3 (2304x1728)' },
    { id: '1728x2304', name: '3:4 (1728x2304)' },
    { id: '2560x1440', name: '16:9 (2560x1440)' },
    { id: '1440x2560', name: '9:16 (1440x2560)' },
    { id: '2496x1664', name: '3:2 (2496x1664)' },
    { id: '1664x2496', name: '2:3 (1664x2496)' },
    { id: '3024x1296', name: '21:9 (3024x1296)' },
  ],
  doubao_default: [
    { id: '2048x2048', name: '1:1 (2048x2048)' },
    { id: '2304x1728', name: '4:3 (2304x1728)' },
    { id: '1728x2304', name: '3:4 (1728x2304)' },
    { id: '2560x1440', name: '16:9 (2560x1440)' },
    { id: '1440x2560', name: '9:16 (1440x2560)' },
    { id: '2496x1664', name: '3:2 (2496x1664)' },
    { id: '1664x2496', name: '2:3 (1664x2496)' },
    { id: '3024x1296', name: '21:9 (3024x1296)' },
  ],
  gpt_image: [
    { id: '1024x1024', name: '1:1 (1024x1024)' },
    { id: '1024x1536', name: '2:3 (1024x1536)' },
    { id: '1536x1024', name: '3:2 (1536x1024)' },
  ],
  gemini: [
    { id: '1:1', name: '1:1 (1024x1024)' },
    { id: '3:2', name: '3:2 (1536x1024)' },
    { id: '2:3', name: '2:3 (1024x1536)' },
    { id: '3:4', name: '3:4 (1080x1440)' },
    { id: '4:3', name: '4:3 (1440x1080)' },
    { id: '4:5', name: '4:5 (1024x1280)' },
    { id: '5:4', name: '5:4 (1280x1024)' },
    { id: '9:16', name: '9:16 (1080x1920)' },
    { id: '16:9', name: '16:9 (1920x1080)' },
    { id: '21:9', name: '21:9 (2520x1080)' },
  ],
  qwen_image_plus: [
    { id: '1328*1328', name: '1:1 (1328*1328)' },
    { id: '1664*928', name: '16:9 (1664*928)' },
    { id: '928*1664', name: '9:16 (928*1664)' },
    { id: '1472*1140', name: '4:3 (1472*1140)' },
    { id: '1140*1472', name: '3:4 (1140*1472)' },
  ],
  doubao_seededit: [
     { id: 'adaptive', name: 'Adaptive (Original Image Size)' },
  ]
};

// 视频生成比例
export const VIDEO_RATIOS = [
  { id: '16:9', name: '16:9 (横屏)', description: '适合电脑观看' },
  { id: '4:3', name: '4:3 (传统)', description: '传统比例' },
  { id: '1:1', name: '1:1 (正方形)', description: '社交媒体' },
  { id: '3:4', name: '3:4 (竖屏)', description: '移动端竖屏' },
  { id: '9:16', name: '9:16 (竖屏)', description: '适合手机观看' },
  { id: '21:9', name: '21:9 (宽屏)', description: '电影宽屏' },
  { id: 'adaptive', name: '自适应', description: '根据图片自动调整' },
] as const;

// 视频分辨率
export const VIDEO_RESOLUTIONS = [
  { id: '480p', name: '480P', description: '标清画质' },
  { id: '720p', name: '720P', description: '高清画质' },
  { id: '1080p', name: '1080P', description: '全高清画质' },
];

// 图生视频模式
export const IMAGE_TO_VIDEO_MODES = [
  { id: 'first_frame', name: '首帧生成', description: '基于首帧图片生成视频' },
  { id: 'first_last_frame', name: '首尾帧生成', description: '基于首尾帧图片生成视频' },
  { id: 'reference', name: '参考图生成', description: '基于参考图片生成视频' },
];

// 获取图片尺寸选项
export const getImageSizes = (model: string) => {
  if (model.includes('doubao-seededit')) return IMAGE_SIZES.doubao_seededit;
  if (model.includes('doubao-seedream-3-0')) return IMAGE_SIZES.doubao_seedream_3_0;
  if (model.includes('doubao-seedream-4-0')) return IMAGE_SIZES.doubao_seedream_4_0;
  if (model.includes('doubao')) return IMAGE_SIZES.doubao_default;
  if (model.startsWith('gpt-image')) return IMAGE_SIZES.gpt_image;
  if (model.includes('gemini')) return IMAGE_SIZES.gemini;
  if (model.includes('qwen-image-plus')) return IMAGE_SIZES.qwen_image_plus;
  return IMAGE_SIZES.doubao_default;
};

// 获取视频比例选项
export const getVideoRatios = (model: string, mode?: string, imageGenerationMode?: string) => {
  const isVeo = model.toLowerCase().includes('veo');
  const isSora = model === 'sora-2';
  
  if (isVeo || isSora) {
    return VIDEO_RATIOS.filter(r => r.id === '16:9' || r.id === '9:16');
  }
  
  // doubao-seedance-1-0-lite-t2v-250428 不支持 adaptive
  if (model === 'doubao-seedance-1-0-lite-t2v-250428') {
    return VIDEO_RATIOS.filter(r => r.id !== 'adaptive');
  }
  
  // 参考图模式不支持 adaptive
  if (imageGenerationMode === 'reference') {
    return VIDEO_RATIOS.filter(r => r.id !== 'adaptive');
  }
  
  // Wan2.5 models have fixed ratios usually or handled differently, but for now return all or restricted
  if (model.includes('wan2.5')) {
      // wan2.5 t2v supports more, i2v follows image
      return VIDEO_RATIOS.filter(r => r.id !== 'adaptive'); // Usually specific ratios
  }

  return VIDEO_RATIOS;
};

// 获取视频分辨率选项
export const getVideoResolutions = (model: string, imageGenerationMode?: string) => {
  const isVeo = model.toLowerCase().includes('veo');
  if (isVeo) {
    return VIDEO_RESOLUTIONS.filter(r => r.id === '720p' || r.id === '1080p');
  }
  if (model.includes('wan2.5')) {
    return VIDEO_RESOLUTIONS;
  }
  // doubao-seedance 系列支持所有分辨率
  if (model.includes('doubao-seedance') || model.includes('seedance')) {
    // 参考图模式不支持1080p
    if (imageGenerationMode === 'reference') {
      return VIDEO_RESOLUTIONS.filter(r => r.id !== '1080p');
    }
    return VIDEO_RESOLUTIONS;
  }
  // Default
  return VIDEO_RESOLUTIONS.filter(r => r.id === '720p' || r.id === '1080p');
};

// 模型能力检测
export const ModelCapabilities = {
  supportsImageUpload: (model: string, mode: 'image' | 'video') => {
    if (mode === 'image') {
      const noUpload = ['doubao-seedream-3-0-t2i-250415', 'qwen-image-plus'];
      return !noUpload.includes(model);
    }
    if (mode === 'video') {
      if (model === 'doubao-seedance-1-0-lite-t2v-250428') return false;
      if (model === 'wan2.5-t2v-preview') return false;
      return true;
    }
    return true;
  },
  
  supportsWatermark: (model: string) => {
    return model.includes('doubao') || model.includes('seedance');
  },
  
  supportsCameraFixed: (model: string) => {
    return model.includes('doubao') || model.includes('seedance');
  },
  
  supportsNegativePrompt: (model: string) => {
    return model.includes('qwen-image');
  },
  
  supportsSeed: (model: string) => {
    return !model.includes('sora-2') && !model.includes('veo') && !model.includes('wan2.5');
  },

  supportsAudioUpload: (model: string) => {
    return model.includes('wan2.5');
  },

  supportsSmartRewrite: (model: string) => {
    return model.includes('wan2.5');
  },

  // 支持引导系数（Guidance Scale）
  supportsGuidanceScale: (model: string) => {
    return model === 'doubao-seedream-3-0-t2i-250415' || 
           model === 'doubao-seededit-3-0-i2i-250628';
  },

  // 支持组图功能（Sequential Image Generation）
  supportsSequentialImageGeneration: (model: string) => {
    return model === 'doubao-seedream-4-0-250828';
  },

  // 支持提示词优化模式
  supportsOptimizePromptOptions: (model: string) => {
    return model === 'doubao-seedream-4-0-250828';
  },

  // 支持GPT图片质量选择
  supportsGptImageQuality: (model: string) => {
    return model.startsWith('gpt-image');
  },

  // 支持GPT图片输入保真度
  supportsGptImageInputFidelity: (model: string) => {
    return model.startsWith('gpt-image');
  },

  // 支持Qwen图片提示词扩展
  supportsQwenPromptExtend: (model: string) => {
    return model === 'qwen-image-plus';
  },

  // 支持Qwen编辑模型的多图生成
  supportsQwenImageEditN: (model: string) => {
    return model === 'qwen-image-edit-plus' || model === 'qwen-image-edit-plus-2025-10-30';
  },

  // 获取视频时长选项（根据模型）
  getVideoDurationOptions: (model: string) => {
    // sora-2 只支持 4/8/12 秒
    if (model === 'sora-2') {
      return [4, 8, 12];
    }
    // Veo 模型支持 4/6/8 秒
    if (model.toLowerCase().includes('veo')) {
      return [4, 6, 8];
    }
    // Wan2.5 模型支持 5/10 秒
    if (model.includes('wan2.5')) {
      return [5, 10];
    }
    // 默认支持 3-12 秒
    return [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  },

  // 检查模型是否支持特定视频时长
  supportsVideoDuration: (model: string, duration: number) => {
    const options = ModelCapabilities.getVideoDurationOptions(model);
    return options.includes(duration);
  },

  // 获取格式显示文本
  getFormatDisplayText: (model: string, mode?: 'image' | 'video') => {
    return getFormatDisplayText(model, mode || 'image');
  },

  // 获取最大文件大小
  getMaxFileSize: (model: string, mode?: 'image' | 'video') => {
    return getMaxFileSizeText(model, mode || 'image');
  },

  // 获取当前模型允许的图片格式
  getAllowedImageFormats: (model: string): string[] => {
    // doubao 模型限制为 JPEG 和 PNG
    if (model === 'doubao-seedream-4-0-250828' || model === 'doubao-seededit-3-0-i2i-250628') {
      return ['jpeg', 'jpg', 'png'];
    }
    // gemini 模型支持 PNG、JPEG、WEBP
    if (model === 'gemini-2.5-flash-image-preview' || 
        model === 'gemini-2.5-flash-image' || 
        model === 'gemini-3-pro-image-preview') {
      return ['png', 'jpeg', 'jpg', 'webp'];
    }
    // qwen-image-plus 是纯文生图，不需要图片格式限制
    if (model === 'qwen-image-plus') {
      return [];
    }
    // qwen-image-edit 系列支持：JPG、JPEG、PNG、BMP、TIFF、WEBP
    if (model === 'qwen-image-edit-plus' || model === 'qwen-image-edit-plus-2025-10-30') {
      return ['jpeg', 'jpg', 'png', 'bmp', 'tiff', 'webp'];
    }
    // 其他模型支持更多格式
    return ['jpeg', 'jpg', 'png', 'gif', 'webp'];
  },


  // 获取 wan2.5 t2v 模型的 size 参数（根据分辨率和宽高比）
  getWan25T2VSize: (resolution: string, aspectRatio: string): string => {
    // 分辨率到宽高比的映射表
    const sizeMap: Record<string, Record<string, string>> = {
      '480p': {
        '16:9': '832*480',
        '9:16': '480*832',
        '1:1': '624*624',
      },
      '720p': {
        '16:9': '1280*720',
        '9:16': '720*1280',
        '1:1': '960*960',
        '4:3': '1088*832',
        '3:4': '832*1088',
      },
      '1080p': {
        '16:9': '1920*1080',
        '9:16': '1080*1920',
        '1:1': '1440*1440',
        '4:3': '1632*1248',
        '3:4': '1248*1632',
      },
    };

    const resolutionLower = resolution.toLowerCase();
    const aspectRatioLower = aspectRatio.toLowerCase();

    if (sizeMap[resolutionLower] && sizeMap[resolutionLower][aspectRatioLower]) {
      return sizeMap[resolutionLower][aspectRatioLower];
    }

    // 默认值：720p 16:9
    console.warn(`无法找到对应的 size，使用默认值 1280*720 (分辨率: ${resolution}, 宽高比: ${aspectRatio})`);
    return '1280*720';
  },

  // 获取 wan2.5 t2v 模型可用的宽高比选项（根据分辨率）
  getWan25T2VAspectRatios: (resolution: string): string[] => {
    const aspectRatioMap: Record<string, string[]> = {
      '480p': ['16:9', '9:16', '1:1'],
      '720p': ['16:9', '9:16', '1:1', '4:3', '3:4'],
      '1080p': ['16:9', '9:16', '1:1', '4:3', '3:4'],
    };

    return aspectRatioMap[resolution.toLowerCase()] || ['16:9', '9:16', '1:1'];
  },

  // 获取可用的图生视频模式（根据模型）
  getAvailableImageToVideoModes: (model: string) => {
    // veo-3.1-fast-generate-preview 支持首帧和首尾帧
    if (model.toLowerCase().includes('veo-3.1') || model.toLowerCase().includes('veo_3.1')) {
      return IMAGE_TO_VIDEO_MODES.filter(m => m.id === 'first_frame' || m.id === 'first_last_frame');
    }
    
    // doubao-seedance-1-0-lite-i2v-250428 支持所有三种模式
    if (model === 'doubao-seedance-1-0-lite-i2v-250428') {
      return IMAGE_TO_VIDEO_MODES;
    }
    
    // doubao-seedance-1-0-pro-250528 只支持首帧模式
    if (model === 'doubao-seedance-1-0-pro-250528') {
      return IMAGE_TO_VIDEO_MODES.filter(m => m.id === 'first_frame');
    }
    
    // Veo 3.0 只支持首帧模式
    if (model.toLowerCase().includes('veo')) {
      return IMAGE_TO_VIDEO_MODES.filter(m => m.id === 'first_frame');
    }
    
    // 其他模型默认支持首帧模式
    return IMAGE_TO_VIDEO_MODES.filter(m => m.id === 'first_frame');
  },

  // 获取图生视频模式的最大图片数量
  getMaxImagesForImageMode: (imageMode: string): number => {
    const mode = IMAGE_TO_VIDEO_MODES.find(m => m.id === imageMode);
    if (imageMode === 'first_last_frame') {
      return 2;
    }
    return 1;
  },

  // 获取图片生成模式的最大图片数量（根据模型）
  getMaxImagesForImageModel: (model: string): number => {
    // doubao-seededit-3-0-i2i-250628 图生图模型只支持单张图片
    if (model === 'doubao-seededit-3-0-i2i-250628') {
      return 1;
    }
    // gpt-image-* 支持最多10张图片
    if (model.startsWith('gpt-image-')) {
      return 10;
    }
    // 其他支持图片的模型默认支持5张图片
    return 5;
  },
};

// 图片上传限制规则
export interface ImageUploadRestrictions {
  allowedFormats: string[]; // 允许的MIME类型，如 ['image/jpeg', 'image/png']
  maxFileSize: number; // 最大文件大小（MB）
  maxImageSize?: number; // 最大图片尺寸（像素），如 6000
  minImageSize?: number; // 最小图片尺寸（像素），如 360
  requiredDimensions?: Array<{ width: number; height: number }>; // 必须匹配的尺寸，如 sora-2 的 720x1280 或 1280x720
}

// 获取图片上传限制
export const getImageUploadRestrictions = (
  model: string,
  mode: 'image' | 'video',
  videoRatio?: string,
  videoResolution?: string
): ImageUploadRestrictions => {
  // 视频模式限制
  if (mode === 'video') {
    // sora-2 严格限制
    if (model === 'sora-2') {
      // 根据选择的宽高比确定必须匹配的尺寸
      let requiredDimensions: Array<{ width: number; height: number }> = [];
      if (videoRatio === '9:16') {
        requiredDimensions = [{ width: 720, height: 1280 }];
      } else if (videoRatio === '16:9') {
        requiredDimensions = [{ width: 1280, height: 720 }];
      } else {
        // 默认支持两种尺寸
        requiredDimensions = [
          { width: 720, height: 1280 }, // 9:16 竖屏
          { width: 1280, height: 720 }, // 16:9 横屏
        ];
      }
      
      return {
        allowedFormats: ['image/jpeg', 'image/png', 'image/webp'],
        maxFileSize: 10,
        requiredDimensions,
      };
    }
    
    // wan2.5-i2v-preview
    if (model === 'wan2.5-i2v-preview') {
      return {
        allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/webp'],
        maxFileSize: 10,
        minImageSize: 360,
        maxImageSize: 2000,
      };
    }
    
    // 其他视频模型默认限制
    return {
      allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      maxFileSize: 10,
    };
  }
  
  // 图片模式限制
  // doubao 模型限制为 JPEG 和 PNG
  if (
    model === 'doubao-seedream-4-0-250828' ||
    model === 'doubao-seededit-3-0-i2i-250628'
  ) {
    return {
      allowedFormats: ['image/jpeg', 'image/jpg', 'image/png'],
      maxFileSize: 10,
      maxImageSize: 6000,
    };
  }
  
  // gemini 模型支持 PNG、JPEG、WEBP
  if (
    model === 'gemini-2.5-flash-image-preview' ||
    model === 'gemini-2.5-flash-image' ||
    model === 'gemini-3-pro-image-preview'
  ) {
    return {
      allowedFormats: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
      maxFileSize: 7,
    };
  }
  
  // qwen-image-edit 系列支持：JPG、JPEG、PNG、BMP、TIFF、WEBP
  if (model === 'qwen-image-edit-plus' || model === 'qwen-image-edit-plus-2025-10-30') {
    return {
      allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff', 'image/webp'],
      maxFileSize: 10,
      minImageSize: 384,
      maxImageSize: 3072,
    };
  }
  
  // gpt-image 系列
  if (model.startsWith('gpt-image-')) {
    return {
      allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      maxFileSize: 10,
    };
  }
  
  // 其他模型默认限制
  return {
    allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    maxFileSize: 10,
  };
};

// 获取格式显示文本
export const getFormatDisplayText = (model: string, mode: 'image' | 'video' = 'image'): string => {
  const restrictions = getImageUploadRestrictions(model, mode);
  if (restrictions.allowedFormats.length === 0) {
    return '不支持图片上传';
  }
  return restrictions.allowedFormats
    .map(f => f.replace('image/', '').toUpperCase())
    .join('/');
};

// 获取最大文件大小显示文本
export const getMaxFileSizeText = (model: string, mode: 'image' | 'video' = 'image'): number => {
  const restrictions = getImageUploadRestrictions(model, mode);
  return restrictions.maxFileSize;
};

