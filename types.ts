
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

export type Language = 'en' | 'zh';

export type View = 'home' | 'create' | 'keys';

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
