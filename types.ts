
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
}

// Auth Response (Ruoyi /login returns token directly in the object)
export interface LoginResponse {
  token: string;
}

// User Info Response (Ruoyi /getInfo)
export interface UserInfo {
  user: {
    userId: number;
    userName: string;
    nickName: string;
    email: string;
    phonenumber: string;
    avatar: string;
  };
  roles: string[];
  permissions: string[];
}
