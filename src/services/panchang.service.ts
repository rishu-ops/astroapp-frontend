import api from '@/lib/axios';
import { ApiResponse } from '@/types';
import { PanchangResponse, PanchangPreference, PanchangAdminAnalytics } from '@/types/panchang';

export const panchangService = {
  /**
   * Fetches the formatted daily Panchang details based on parameters.
   */
  getPanchang: (params: { date: string; latitude: number; longitude: number; timezone: number }) =>
    api.get<ApiResponse<PanchangResponse>>('/panchang', { params }),

  /**
   * Fetches saved favorite coordinates configuration for the logged-in user.
   */
  getPreferences: () =>
    api.get<ApiResponse<PanchangPreference | null>>('/panchang/preferences'),

  /**
   * Saves or updates default coordinates, timezone, and city name defaults.
   */
  savePreferences: (data: { latitude: number; longitude: number; timezone: number; cityName: string }) =>
    api.post<ApiResponse<PanchangPreference>>('/panchang/preferences', data),

  /**
   * Fetches aggregate usage and city inquiry tracking summaries. Limited to administrators.
   */
  getAnalytics: () =>
    api.get<ApiResponse<PanchangAdminAnalytics>>('/panchang/admin/analytics'),
};
export default panchangService;
