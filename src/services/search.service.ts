import api from '@/lib/axios';
import { ApiResponse, Astrologer, Offering } from '@/types';

export const searchService = {
  searchAstrologers: (params: Record<string, string>) =>
    api.get<ApiResponse<Astrologer[]>>('/search/astrologers', { params }),

  searchOfferings: (params: Record<string, string>) =>
    api.get<ApiResponse<Offering[]>>('/search/offerings', { params }),
};
