import api from '@/lib/axios';
import { ApiResponse, User, Astrologer, Chat, Analytics, AuditLog } from '@/types';

export const adminService = {
  getAnalytics: () =>
    api.get<ApiResponse<Analytics>>('/admin/analytics'),

  // Users
  getUsers: (page = 1) =>
    api.get<ApiResponse<User[]>>('/admin/users', { params: { page } }),
  blockUser: (id: string) =>
    api.patch<ApiResponse<User>>(`/admin/users/${id}/block`),
  unblockUser: (id: string) =>
    api.patch<ApiResponse<User>>(`/admin/users/${id}/unblock`),

  // Applications
  getApplications: (status?: string, page = 1) =>
    api.get<ApiResponse<Astrologer[]>>('/admin/applications', { params: { status, page } }),
  getApplicationDetail: (id: string) =>
    api.get<ApiResponse<Astrologer>>(`/admin/applications/${id}`),
  approveApplication: (id: string) =>
    api.patch<ApiResponse<Astrologer>>(`/admin/applications/${id}/approve`),
  rejectApplication: (id: string, reason: string) =>
    api.patch<ApiResponse<Astrologer>>(`/admin/applications/${id}/reject`, { reason }),

  // Astrologers
  getAstrologers: (page = 1) =>
    api.get<ApiResponse<Astrologer[]>>('/admin/astrologers', { params: { page } }),
  blockAstrologer: (id: string) =>
    api.patch<ApiResponse<Astrologer>>(`/admin/astrologers/${id}/block`),
  unblockAstrologer: (id: string) =>
    api.patch<ApiResponse<Astrologer>>(`/admin/astrologers/${id}/unblock`),

  // Chats
  getChats: (page = 1) =>
    api.get<ApiResponse<Chat[]>>('/admin/chats', { params: { page } }),

  // Audit
  getAuditLog: (entityId: string, page = 1) =>
    api.get<ApiResponse<AuditLog[]>>(`/admin/audit/${entityId}`, { params: { page } }),
};
