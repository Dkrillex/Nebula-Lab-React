

export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  contextLength: number;
  inputPrice: number; // Per 1M tokens
  outputPrice: number; // Per 1M tokens
  imagePrice?: number;
  isNew?: boolean;
  isFree?: boolean;
  tags: string[];
  capabilities?: string[]; // e.g., 'chat', 'code', 'reasoning'
  billingType?: 'token' | 'time'; // token or second
}

export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  status: 'active' | 'disabled';
  limit: number | 'unlimited';
  usage: number;
  expiration: string | 'never';
}

export interface ExpenseRecord {
  id: string;
  modelName: string;
  cost: number;
  type: 'consumption' | 'recharge';
  duration: string;
  inputTokens: number;
  outputTokens: number;
  timestamp: string;
  icon?: string; // URL or 'robot' placeholder
}

export interface Asset {
  id: string;
  name: string;
  type: 'folder' | 'image' | 'video' | 'audio';
  date: string;
  tag?: string; 
  description?: string;
  thumbnail?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export type Language = 'en' | 'zh';

export type View = 'home' | 'create' | 'keys' | 'chat' | 'models' | 'expenses' | 'pricing' | 'assets';

export interface TabItem {
  view: View;
  activeTool?: string; // Only for 'create' view
}

// --- Ruoyi API Response Interfaces ---

// Standard Unified Response Wrapper
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data?: T;      // For single objects
  rows?: T[];    // For list/pagination
  total?: number; // For list/pagination
  [key: string]: any; // Support for flattened response structures (e.g. token, user at root)
}

// Auth Response (Login API returns)
export interface LoginResponse {
  access_token: string;
  client_id: string;
  expire_in: number;
  /** 是否首次登录（自动注册） */
  is_first_login?: boolean;
  /** 默认密码（仅首次登录时返回） */
  default_password?: string;
}

// User Info Response from backend (/system/user/getInfo)
export interface UserInfoResp {
  permissions: string[];
  roles: string[];
  user: {
    userId: number;
    userName: string;
    nickName: string;
    email: string;
    phonenumber: string;
    avatar: string;
    inviteCode?: string;
    channelId?: number;
    channelName?: string;
    nebulaApiId?: number;
    deptId?: number;
    deptName?: string;
    tenantId?: string;
    userType?: string;
    [key: string]: any;
  };
  team?: Array<{
    teamId: number;
    teamName: string;
    teamType: string;
    [key: string]: any;
  }>;
}

// Frontend UserInfo format (simplified for store)
export interface UserInfo {
  userId: number;
  username: string;
  realName: string;
  email: string;
  avatar: string;
  roles: string[];
  permissions: string[];
  inviteCode?: string;
  channelId?: number;
  channelName?: string;
  nebulaApiId?: number;
  team?: Array<{
    teamId: number;
    teamName: string;
    teamType: string;
    [key: string]: any;
  }>;
}

// ==================== 数字人视频相关类型 ====================

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
}

// 字幕信息
export interface Caption {
  captionId: string;
  thumbnail: string;
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