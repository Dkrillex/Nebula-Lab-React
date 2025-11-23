import { request } from '../lib/request';
import { ApiResponse, ApiTalkVO, ApiTalkQuery } from '../types';
import { useAuthStore } from '../stores/authStore';
import { API_BASE_URL, CLIENT_ID } from '../constants';

// ==================== 聊天相关 Types ====================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning_content?: string; // AI的思考过程
  timestamp: number;
  isStreaming?: boolean;
  images?: string[]; // 图片的base64编码数组
  isHtml?: boolean;
  action?: 'goFixPrice';
}

export interface ChatRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string | Array<{
      type: 'text' | 'image_url';
      text?: string;
      image_url?: {
        url: string;
      };
    }>;
  }>;
  temperature?: number;
  presence_penalty?: number;
  stream?: boolean;
  user_id?: string;
}

export interface ChatStreamChunk {
  choices?: Array<{
    delta?: {
      content?: string;
      reasoning_content?: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export interface ChatResponse {
  choices?: Array<{
    message?: {
      role: string;
      content: string;
      reasoning_content?: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export const chatService = {
  /**
   * 调用聊天完成API（流式响应）
   * Endpoint: POST /ads/playground/chat/completions
   */
  chatCompletionsStream: async (
    data: ChatRequest,
    onChunk: (chunk: ChatStreamChunk) => void,
    onError?: (error: Error) => void,
    abortSignal?: AbortSignal
  ): Promise<void> => {
    const { user } = useAuthStore.getState();
    
    const requestData = {
      ...data,
      stream: true,
      user_id: user?.nebulaApiId || '',
    };

    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`${API_BASE_URL}/ads/playground/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${token}`,
          'Clientid': CLIENT_ID,
        },
        body: JSON.stringify(requestData),
        signal: abortSignal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine === 'data: [DONE]') {
            continue;
          }

          if (trimmedLine.startsWith('data: ')) {
            const data = trimmedLine.slice(6).trim();
            try {
              const parsed = JSON.parse(data);
              onChunk(parsed);
            } catch (parseError) {
              console.warn('解析SSE数据失败:', parseError, '原始数据:', data);
            }
          } else if (trimmedLine.startsWith('{')) {
            try {
              const parsed = JSON.parse(trimmedLine);
              onChunk(parsed);
            } catch (parseError) {
              console.warn('解析JSON数据失败:', parseError);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('请求已中止');
        return;
      }
      if (onError) {
        onError(error);
      } else {
        throw error;
      }
    }
  },

  /**
   * 调用聊天完成API（非流式响应）
   * Endpoint: POST /ads/playground/chat/completions
   */
  chatCompletions: async (data: ChatRequest): Promise<ApiResponse<ChatResponse>> => {
    const { user } = useAuthStore.getState();
    
    const requestData = {
      ...data,
      stream: false,
      user_id: user?.nebulaApiId || '',
    };

    return request.post<ChatResponse>('/ads/playground/chat/completions', requestData, {
      timeout: 60000, // 60秒超时
    });
  },

  /**
   * 获取对话记录列表
   * Endpoint: GET /api/apiTalk/list
   */
  getChatRecords: async (params?: ApiTalkQuery): Promise<ApiResponse<{ rows: ApiTalkVO[]; total: number }>> => {
    return request.get<{ rows: ApiTalkVO[]; total: number }>('/api/apiTalk/list', {
      params: {
        pageNum: 1,
        pageSize: 10,
        apiType: 'chat-completions',
        ...params,
      },
    });
  },

  /**
   * 获取对话记录详情
   * Endpoint: GET /api/apiTalk/{id}
   */
  getChatRecordInfo: async (id: string | number): Promise<ApiResponse<ApiTalkVO>> => {
    return request.get<ApiTalkVO>(`/api/apiTalk/${id}`);
  },

  /**
   * 删除对话记录
   * Endpoint: DELETE /api/apiTalk/{id}
   */
  deleteChatRecord: async (id: string | number): Promise<ApiResponse<void>> => {
    return request.delete<void>(`/api/apiTalk/${id}`);
  },
};

