import api from '@/lib/axios';
import { ApiResponse, Notification } from '@/types';

export const notificationService = {
  getAll: (page = 1) =>
    api.get<ApiResponse<Notification[]>>('/notifications', { params: { page } }),

  getUnreadCount: () =>
    api.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),

  markRead: (id: string) =>
    api.patch<ApiResponse<null>>(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch<ApiResponse<null>>('/notifications/read-all'),
};
