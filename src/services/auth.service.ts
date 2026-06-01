import api from '@/lib/axios';
import { ApiResponse, AuthUser, LoginCredentials, RegisterAstrologerData, RegisterUserData } from '@/types';

interface AuthResponseData {
  user: AuthUser;
  accessToken: string;
}

export const authService = {
  registerUser: (data: RegisterUserData) =>
    api.post<ApiResponse<AuthResponseData>>('/auth/register', data),

  // Accepts FormData (with files) for multipart upload
  registerAstrologer: (data: FormData) =>
    api.post<ApiResponse<AuthResponseData>>('/auth/register/astrologer', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  loginUser: (data: LoginCredentials) =>
    api.post<ApiResponse<AuthResponseData>>('/auth/login', data),

  loginAstrologer: (data: LoginCredentials) =>
    api.post<ApiResponse<AuthResponseData>>('/auth/login/astrologer', data),

  loginAdmin: (data: LoginCredentials) =>
    api.post<ApiResponse<AuthResponseData>>('/auth/login/admin', data),

  logout: () => api.post<ApiResponse<null>>('/auth/logout'),

  getMe: () => api.get<ApiResponse<{ user: AuthUser }>>('/auth/me'),

  refresh: () => api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh'),
};
