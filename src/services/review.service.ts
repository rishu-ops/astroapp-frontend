import api from '@/lib/axios';
import { ApiResponse, Review, RatingDistribution } from '@/types';

export const reviewService = {
  getByAstrologer: (astrologerId: string, page = 1) =>
    api.get<ApiResponse<Review[]>>(`/reviews/astrologer/${astrologerId}`, { params: { page } }),

  getDistribution: (astrologerId: string) =>
    api.get<ApiResponse<RatingDistribution>>(`/reviews/distribution/${astrologerId}`),

  canReview: (consultationId: string) =>
    api.get<ApiResponse<{ canReview: boolean }>>(`/reviews/can-review/${consultationId}`),

  create: (data: { astrologerId: string; consultationId: string; rating: number; review?: string }) =>
    api.post<ApiResponse<Review>>('/reviews', data),

  getMyReviews: () =>
    api.get<ApiResponse<Review[]>>('/reviews/me'),
};
