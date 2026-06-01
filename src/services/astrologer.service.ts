import api from '@/lib/axios';
import { ApiResponse, Astrologer, ProfileProgress } from '@/types';

export const astrologerService = {
  // Public
  getAll: (params?: Record<string, string>) =>
    api.get<ApiResponse<Astrologer[]>>('/astrologers', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Astrologer>>(`/astrologers/${id}`),

  // My application (Phase 1)
  getMyApplication: () =>
    api.get<ApiResponse<{ astrologer: Astrologer; progress: ProfileProgress }>>('/astrologers/me/application'),

  submitForReview: () =>
    api.post<ApiResponse<Astrologer>>('/astrologers/me/submit'),

  // My profile (Phase 2)
  getProgress: () =>
    api.get<ApiResponse<ProfileProgress>>('/astrologers/me/progress'),

  updateSection: (data: Record<string, unknown>) =>
    api.post<ApiResponse<{ astrologer: Astrologer; progress: ProfileProgress }>>('/astrologers/me/section', data),

  uploadPhotos: (formData: FormData) =>
    api.post<ApiResponse<Astrologer>>('/astrologers/me/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  uploadKycDocs: (formData: FormData) =>
    api.post<ApiResponse<Astrologer>>('/astrologers/me/kyc-docs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  goLive: () =>
    api.post<ApiResponse<Astrologer>>('/astrologers/me/go-live'),

  toggleStatus: (isOnline: boolean) =>
    api.patch<ApiResponse<Astrologer>>('/astrologers/me/status', { isOnline }),
};
