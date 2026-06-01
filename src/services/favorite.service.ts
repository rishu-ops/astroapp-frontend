import api from '@/lib/axios';
import { ApiResponse, Favorite } from '@/types';

export const favoriteService = {
  getAll: (type?: string) =>
    api.get<ApiResponse<Favorite[]>>('/favorites', { params: type ? { type } : undefined }),

  add: (type: string, targetId: string) =>
    api.post<ApiResponse<null>>('/favorites', { type, targetId }),

  remove: (type: string, targetId: string) =>
    api.delete<ApiResponse<null>>('/favorites', { data: { type, targetId } }),

  check: (type: string, targetId: string) =>
    api.get<ApiResponse<{ isFavorited: boolean }>>('/favorites/check', { params: { type, targetId } }),
};
