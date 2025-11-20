import { request } from '../lib/request';

export interface NotificationItem {
  id: string | number;
  title: string;
  content: string;
  type: string;
  status: 'read' | 'unread';
  createTime: string;
  sender?: string;
  avatar?: string;
}

export interface NotificationListParams {
  pageNum?: number;
  pageSize?: number;
  title?: string;
  type?: string;
  status?: string;
}

export const notificationService = {
  // Get notification list
  getList: (params: NotificationListParams) => {
    return request.get('/system/notice/list', { params });
  },

  // Get notification details
  getById: (noticeId: string | number) => {
    return request.get(`/system/notice/${noticeId}`);
  },

  // Mark as read (mock implementation if backend doesn't support it yet)
  markAsRead: (noticeIds: (string | number)[]) => {
    // Assuming there's an endpoint for this, or we might need to implement it
    // return request.put('/system/notice/read', { noticeIds });
    return Promise.resolve(); 
  },

  // Delete notification
  delete: (noticeIds: (string | number)[]) => {
    return request.delete(`/system/notice/${noticeIds.join(',')}`);
  }
};

