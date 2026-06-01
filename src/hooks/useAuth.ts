'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { LoginCredentials, RegisterUserData } from '@/types';

export const useAuth = () => {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const loginUser = useMutation({
    mutationFn: (data: LoginCredentials) => authService.loginUser(data),
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      router.push('/dashboard');
    },
  });

  const loginAstrologer = useMutation({
    mutationFn: (data: LoginCredentials) => authService.loginAstrologer(data),
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      router.push('/astrologer');
    },
  });

  const loginAdmin = useMutation({
    mutationFn: (data: LoginCredentials) => authService.loginAdmin(data),
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      router.push('/admin');
    },
  });

  const registerUser = useMutation({
    mutationFn: (data: RegisterUserData) => authService.registerUser(data),
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      router.push('/dashboard');
    },
  });

  // Astrologer registration uses FormData (multipart with file uploads)
  const registerAstrologer = useMutation({
    mutationFn: (data: FormData) => authService.registerAstrologer(data),
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      router.push('/astrologer/application');
    },
  });

  const logout = useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      router.push('/login');
    },
  });

  return { user, isAuthenticated, loginUser, loginAstrologer, loginAdmin, registerUser, registerAstrologer, logout };
};
