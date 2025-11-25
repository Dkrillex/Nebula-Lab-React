import { request } from '../lib/request';
import { ApiResponse } from '../types';

// Import RequestOptions type (it's not exported, so we'll define it inline or use any)
type RequestOptions = {
  signal?: AbortSignal;
  [key: string]: any;
};

// ==================== 数字人营销视频 API ====================

// TopView API 专用响应格式 (不同于通用的 ApiResponse)
export interface TopViewResult<T = any> {
  code: string;  // TopView 使用字符串类型的 code
  message: string;
  result: T;
}

// 数字人信息
export interface AiAvatar {
  aiavatarId: string;
  aiavatarName: string;
  coverUrl: string;
  gender: string;
  previewVideoUrl: string;
  thumbnailUrl: string;
}

// 语音信息
export interface Voice {
  voiceId: string;
  voiceName: string;
  gender?: string;
  age?: string;
  accent?: string;
  style?: string;
  bestSupportLanguage?: string;
  demoAudioUrl?: string;
  durations?: string;
}

// 字幕信息
export interface Caption {
  captionId: string;
  thumbnail: string;
}

// 提交任务参数
export interface SubmitMarketingTaskParams {
  aiavatarId?: string; // 数字人ID
  aspectRatio?: string; // 分辨率：9:16, 3:4, 1:1, 4:3, 16:9
  captionId?: string; // 字幕ID
  endcardAspectRatio?: string; // 片尾分辨率
  endcardBackgroundColor?: string; // 片尾背景颜色：black, white
  endcardFileId?: string; // 片尾文件ID
  fileIds?: string[]; // 自定义素材文件ID列表
  language?: string; // 语言：en, zh-CN等
  logoFileId?: string; // logo文件ID
  preview?: boolean; // 是否预览模式
  productDescription?: string; // 产品描述
  productLink?: string; // 产品链接
  productName?: string; // 产品名称
  videoLengthType?: number; // 视频长度类型：1:30-50s; 2:15-30s; 3:30-45s; 4:45-60s
  voiceId?: string; // 音色ID
  isDiyScript?: boolean; // 是否使用自定义脚本
  diyScriptDescription?: string; // 自定义脚本内容
}

// 提交任务结果
export interface SubmitTaskResult {
  taskId: string;
  status: string;
  errorMsg?: string;
}

// 查询任务结果
export interface QueryTaskResult {
  taskId: string;
  status: string; // init/running/success/fail
  errorMsg?: string;
  previewVideos?: PreviewVideo[];
  exportVideos?: ExportVideo[];
  productName?: string;
  productDescription?: string;
}

// 预览视频
export interface PreviewVideo {
  videoUrl?: string;
  coverUrl?: string;
  title?: string;
  description?: string;
  videoDuration?: number;
  scriptId?: number;
  status?: string;
}

// 导出视频
export interface ExportVideo {
  videoUrl?: string;
  coverUrl?: string;
  title?: string;
  description?: string;
  videoDuration?: number;
  scriptId?: number;
  status?: string;
  mediaId?: string;
  taskId?: string;
}

// 上传凭证
export interface UploadCredential {
  fileId: string;
  fileName: string;
  format: string;
  uploadUrl: string;
}

// 产品抓取结果
export interface ScraperTaskResult {
  taskId: string;
  status: string;
  errorMsg?: string;
  productName?: string;
  productDescription?: string;
  productLink?: string;
  productImages?: ProductImage[];
  productVideos?: ProductVideo[];
}

export interface ProductImage {
  fileId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  format: string;
}

export interface ProductVideo {
  fileId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  format: string;
}

// ==================== 数字人视频创作 API ====================

// 提交视频创作任务参数
export interface SubmitVideoCreationTaskParams {
  avatarSourceFrom: number | string; // 数字人来源：0-用户上传的视频；1-公模列表；2-私模；3-图片
  videoFileId?: number | string; // 用户上传的视频文件ID（avatarSourceFrom=0时必传）
  aiAvatarId?: number | string; // 公模数字人ID（avatarSourceFrom=1时必传）
  audioSourceFrom: number | string; // 音频来源：0-用户上传音频；1-文本转语音
  audioFileId?: number | string; // 用户上传的音频文件ID（audioSourceFrom=0时必传）
  ttsText?: string; // 文本转语音内容（audioSourceFrom=1时必传）
  voiceoverId?: number | string; // 音色ID（audioSourceFrom=1时必传）
  noticeUrl?: string; // 通知URL
  score: string; // 积分
  modeType?: number; // 模式类型：0-avatar1, 1-avatar2
  captionId?: string; // 字幕样式ID
  imageFileId?: number | string; // 图片文件ID（avatarSourceFrom=3时必传）
  isSave2CustomAiAvatar?: boolean; // 是否保存为私模
  audioDuration?: number; // 音频时长
  deductPoints?: number; // 扣除积分
}

// 查询视频创作任务结果
export interface QueryVideoCreationTaskResult {
  taskId: string;
  status: string; // init/running/success/fail
  taskStatus?: string;
  errorMsg?: string;
  inputVideoFileId?: string;
  inputAudioFileId?: string;
  outputVideoUrl?: string;
  productReplaceResult?: Array<{
    key: string;
    url: string;
  }>;
}

// 上传的文件信息
export interface UploadedFile {
  fileId: string;
  fileName: string;
  fileUrl?: string;
  format: string;
  duration?: number; // 音频/视频时长（秒）
  thumbnail?: string; // 缩略图URL
}

export interface AdsAssetsQuery {
  pageNo?: number;
  pageSize?: number;
  assetType?: number; // 8 for voice
  isPrivateModel?: string; // '1' for private
  [key: string]: any;
}

export interface AdsAssetsVO {
  assetId: string;
  assetName: string;
  assetUrl: string;
  rows?: any[];
  total?: number;
  [key: string]: any;
}

// ==================== 产品数字人 (Image Synthesis) API ====================

export interface ProductAvatarCategory {
  categoryId: number;
  categoryName: string;
}

export interface ProductAvatar {
  avatarId: string;
  avatarName: string;
  avatarImagePath: string;
  categoryId: number;
  // Add other fields as needed
}

export interface ImageReplaceSubmitParams {
  avatarId?: string; // ID from list
  templateImageFileId?: string; // User uploaded avatar file ID
  productImageFileId?: string; // Product image file ID
  userFaceImageFileId?: string; // User face image file ID
  imageEditPrompt: string; // Prompt
  productSize?: string; // "1" to "6"
}

export interface ImageReplaceQueryResult {
  taskId: string;
  status: string;
  taskStatus?: string;
  resultImageUrl?: string;
  bgRemovedImagePath?: string;
  bgRemovedImageFileId?: string;
  productReplaceResult?: Array<{
    key: string;
    url: string;
  }>;
  errorMsg?: string;
}

// V2版本图片替换参数
export interface V2ImageReplaceSubmitParams {
  generateImageMode: 'manual' | 'auto';
  avatarId?: string;
  templateImageFileId?: string;
  productImageWithoutBackgroundFileId: string;
  userFaceImageFileId?: string;
  location?: [[number | string, number | string], [number | string, number | string], [number | string, number | string], [number | string, number | string]];
}

// V2版本图片替换查询结果
export interface V2ImageReplaceQueryResult {
  taskId: string;
  status: string;
  taskStatus?: string;
  replaceProductResult?: Array<{
    imageId: string;
    url: string;
    faceExistence?: boolean;
  }>;
  errorMsg?: string;
}

// 背景去除提交参数
export interface RemoveBackgroundSubmitParams {
  productImageFileId: string;
}

// 背景去除查询结果
export interface RemoveBackgroundQueryResult {
  taskId: string;
  status: string;
  bgRemovedImagePath?: string;
  bgRemovedImageFileId?: string;
  errorMsg?: string;
}

// 图片转视频提交参数(V1)
export interface Image2VideoSubmitParams {
  image2VideoPrompt: string;
  mode: string; // 'lite' | 'pro' | 'avatar2'
  productReplaceResultKey: string;
  score: number;
  ttsText: string;
  voiceoverId: string;
}

// 图片转视频查询结果(V1)
export interface Image2VideoQueryResult {
  taskId: string;
  status: string;
  taskStatus?: string;
  videoUrl?: string;
  errorMsg?: string;
}

// 图片转视频提交参数(V2)
export interface V2Image2VideoSubmitParams {
  replaceProductTaskImageId: string;
  mode: string; // 'lite' | 'pro' | 'avatar2'
  scriptMode: 'text' | 'audio';
  ttsText?: string;
  voiceId?: string;
  audioFileId?: string;
  captionId?: string;
  score: string;
}

// 图片转视频查询结果(V2)
export interface V2Image2VideoQueryResult {
  taskId: string;
  status: string;
  taskStatus?: string;
  videoUrl?: string;
  errorMsg?: string;
}

// ==================== 唱歌数字人 API ====================

export interface Image2MusicVideoSubmitParams {
  image_url: string;
  audio_url: string;
  score: number; // e.g. 7
}

export interface Image2MusicVideoQueryResult {
  task_id: string;
  status: string; // 'done', 'processing', 'failed'
  video_url?: string;
  error_msg?: string;
}

// ==================== 音色克隆 API ====================

export interface VoiceCloneSubmitParams {
  name: string;
  originVoiceFileId: string;
  voiceSpeed: number;
  voiceText: string;
  score?: number;
}

export interface Text2VoiceSubmitParams {
  name: string;
  voiceText: string;
  voiceId?: string;
  voiceSpeed: number;
  voiceName?: string;
  score?: number;
}

export interface VoiceCloneResult {
  taskId: string;
  status: string;
  errorMsg?: string;
  voice?: {
    voiceId: string;
    voiceName: string;
    demoAudioUrl: string;
  };
}

export interface CustomVoice {
  assetId: string;
  assetName: string;
  assetUrl: string;
  assetType: number;
}

// ==================== API Service ====================

export const avatarService = {
  // --- Product Avatar (Image Synthesis) ---

  getProductAvatarCategories: () => {
    return request.get<ApiResponse<ProductAvatarCategory[]>>('/tp/v1/ProductAvatarCategoryQuery');
  },

  getProductAvatarList: (params: { pageNo: number; pageSize: number; categoryIds?: string }) => {
    return request.get<ApiResponse<{ data: ProductAvatar[]; total: number }>>('/tp/v1/ProductAvatarQuery', {
      params,
    });
  },

  submitImageReplaceTask: (data: ImageReplaceSubmitParams) => {
    return request.post<ApiResponse<{ taskId: string }>>('/tp/v1/ImageReplaceSubmit', data);
  },

  queryImageReplaceTask: (taskId: string) => {
    return request.get<ApiResponse<ImageReplaceQueryResult>>('/tp/v1/ImageReplaceQuery', {
      params: { taskId, needCloudFrontUrl: true },
    });
  },

  // V2版本图片替换
  submitV2ImageReplaceTask: (data: V2ImageReplaceSubmitParams) => {
    return request.post<ApiResponse<{ taskId: string }>>('/tp/v2/image/replace/submit', data);
  },

  queryV2ImageReplaceTask: (taskId: string) => {
    return request.get<ApiResponse<V2ImageReplaceQueryResult>>('/tp/v2/image/replace/query', {
      params: { taskId },
    });
  },

  // 背景去除
  submitRemoveBackground: (data: RemoveBackgroundSubmitParams) => {
    return request.post<ApiResponse<{ taskId: string }>>('/tp/v2/remove/background/submit', data);
  },

  queryRemoveBackground: (taskId: string) => {
    return request.get<ApiResponse<RemoveBackgroundQueryResult>>('/tp/v2/remove/background/query', {
      params: { taskId },
    });
  },

  // 图片转视频(V1)
  submitImage2Video: (data: Image2VideoSubmitParams) => {
    return request.post<ApiResponse<{ taskId: string }>>('/tp/v1/Image2VideoSubmit', data);
  },

  queryImage2Video: (taskId: string) => {
    return request.get<ApiResponse<Image2VideoQueryResult>>('/tp/v1/Image2VideoQuery', {
      params: { taskId },
    });
  },

  // 图片转视频(V2)
  submitV2Image2Video: (data: V2Image2VideoSubmitParams) => {
    return request.post<ApiResponse<{ taskId: string }>>('/tp/v2/image2video/submit', data);
  },

  queryV2Image2Video: (taskId: string) => {
    return request.get<ApiResponse<V2Image2VideoQueryResult>>('/tp/v2/image2video/query', {
      params: { taskId },
    });
  },

  // --- Singing Avatar ---

  submitSingingAvatarTask: (data: Image2MusicVideoSubmitParams) => {
    return request.post<ApiResponse<{ task_id: string }>>('/tp/v1/image2musicVideoSubmit', data);
  },

  querySingingAvatarTask: (taskId: string) => {
    return request.get<ApiResponse<Image2MusicVideoQueryResult>>('/tp/v1/image2musicVideoQuery', {
      params: { taskId },
    });
  },

  // --- Voice Clone ---

  submitVoiceCloneTask: (data: VoiceCloneSubmitParams) => {
    return request.post<ApiResponse<VoiceCloneResult>>('/tp/v1/VoiceClone/submitTask', data);
  },

  queryVoiceCloneTask: (taskId: string) => {
    return request.get<ApiResponse<VoiceCloneResult>>('/tp/v1/VoiceClone/queryTask', {
      params: { taskId, needCloudFrontUrl: true },
    });
  },

  submitText2VoiceTask: (data: Text2VoiceSubmitParams) => {
    return request.post<ApiResponse<VoiceCloneResult>>('/tp/v1/Text2Voice/submitTask', data);
  },

  queryText2VoiceTask: (taskId: string) => {
    return request.get<ApiResponse<VoiceCloneResult>>('/tp/v1/Text2Voice/queryTask', {
      params: { taskId, needCloudFrontUrl: true },
    });
  },

  /**
   * 获取数字人列表（营销视频）
   * Endpoint: GET /tp/v1/AiAvatarQuery
   */
  getAiAvatarList: (params?: { pageNo?: number; pageSize?: number; gender?: string; isCustom?: boolean }, options?: RequestOptions) => {
    return request.get<ApiResponse<{ data: AiAvatar[]; pageNo: number; pageSize: number; total: number }>>(
      '/tp/v1/AiAvatarQuery',
      { params, ...options }
    );
  },

  /**
   * 获取语音列表（营销视频）
   * Endpoint: GET /tp/v1/VoiceQuery
   */
  getVoiceList: (params?: { pageNo?: number; pageSize?: number; voiceName?: string; gender?: string; style?: string; language?: string }) => {
    return request.get<{ result: { data: Voice[]; total: number } }>(
      '/tp/v1/VoiceQuery',
      { params }
    );
  },

  /**
   * 获取字幕列表（营销视频）
   * Endpoint: GET /tp/v1/CaptionList
   */
  getCaptionList: () => {
    return request.get<ApiResponse<Caption[]>>('/tp/v1/CaptionList');
  },

  /**
   * 提交营销视频任务
   * Endpoint: POST /tp/v1/SubmitTask
   */
  submitMarketingTask: (data: SubmitMarketingTaskParams) => {
    return request.post<ApiResponse<SubmitTaskResult>>('/tp/v1/SubmitTask', data);
  },

  /**
   * 查询营销视频任务
   * Endpoint: GET /tp/v1/queryTask
   */
  queryMarketingTask: (taskId: string) => {
    return request.get<ApiResponse<QueryTaskResult>>('/tp/v1/queryTask', {
      params: {
        taskId,
        needCloudFrontUrl: true,
      },
    });
  },

  /**
   * 获取上传凭证
   * Endpoint: GET /tp/v1/GetUploadCredential
   */
  getUploadCredential: (format: string) => {
    return request.get<TopViewResult<UploadCredential>>('/tp/v1/GetUploadCredential', {
      params: {
        format,
        needAccelerateUrl: true,
      },
    });
  },

  /**
   * 提交产品链接抓取任务
   * Endpoint: POST /tp/v1/submitScraperTask
   */
  submitScraperTask: (productLink: string) => {
    return request.post<ApiResponse<ScraperTaskResult>>(
      `/tp/v1/submitScraperTask?productLink=${encodeURIComponent(productLink)}`,
      {}
    );
  },

  /**
   * 查询产品链接抓取任务
   * Endpoint: GET /tp/v1/queryScraperTask
   */
  queryScraperTask: (taskId: string) => {
    return request.get<ApiResponse<ScraperTaskResult>>('/tp/v1/queryScraperTask', {
      params: {
        taskId,
        needCloudFrontUrl: false,
      },
    });
  },

  /**
   * 导出视频
   * Endpoint: POST /tp/v1/export
   */
  exportVideo: (params: { scriptId: number; taskId: string; score: string }) => {
    return request.post<ApiResponse<{ taskId: string; status: string; errorMsg?: string }>>(
      `/tp/v1/export?scriptId=${params.scriptId}&taskId=${params.taskId}&score=${params.score}`,
      {}
    );
  },

  /**
   * 提交视频创作任务
   * Endpoint: POST /tp/v1/VideoAvatar/submitTask
   */
  submitVideoCreationTask: (data: SubmitVideoCreationTaskParams) => {
    return request.post<ApiResponse<{ taskId: string; status: string; errorMsg?: string }>>(
      '/tp/v1/VideoAvatar/submitTask',
      data
    );
  },

  /**
   * 查询视频创作任务
   * Endpoint: GET /tp/v1/VideoAvatar/queryTask
   */
  queryVideoCreationTask: (taskId: string) => {
    return request.get<ApiResponse<QueryVideoCreationTaskResult>>('/tp/v1/VideoAvatar/queryTask', {
      params: {
        taskId,
        needCloudFrontUrl: true,
      },
    });
  },

  /**
   * 查询素材列表
   */
  adsAssetsList: (params?: AdsAssetsQuery, options?: RequestOptions) => {
    return request.get<ApiResponse<AdsAssetsVO>>('/ads/adsAssets/list', {
      params,
      ...options,
    });
  },
};
