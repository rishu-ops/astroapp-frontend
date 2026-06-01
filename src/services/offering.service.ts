import api from '@/lib/axios';
import { ApiResponse, Offering } from '@/types';

export const offeringService = {
  getPublic: (params?: Record<string, string>) =>
    api.get<ApiResponse<Offering[]>>('/offerings', { params }),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<Offering>>(`/offerings/${slug}`),

  getMine: (params?: Record<string, string>) =>
    api.get<ApiResponse<Offering[]>>('/offerings/me', { params }),

  create: (formData: FormData) =>
    api.post<ApiResponse<Offering>>('/offerings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, formData: FormData) =>
    api.put<ApiResponse<Offering>>(`/offerings/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  submitForReview: (id: string) =>
    api.post<ApiResponse<Offering>>(`/offerings/${id}/submit`),

  remove: (id: string) =>
    api.delete<ApiResponse<null>>(`/offerings/${id}`),

  // Admin
  adminList: (params?: Record<string, string>) =>
    api.get<ApiResponse<Offering[]>>('/admin/offerings', { params }),

  adminApprove: (id: string) =>
    api.patch<ApiResponse<Offering>>(`/admin/offerings/${id}/approve`),

  adminReject: (id: string, reason: string, adminNotes?: string) =>
    api.patch<ApiResponse<Offering>>(`/admin/offerings/${id}/reject`, { reason, adminNotes }),

  adminArchive: (id: string) =>
    api.patch<ApiResponse<Offering>>(`/admin/offerings/${id}/archive`),
};
