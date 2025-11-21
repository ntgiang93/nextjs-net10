'use client';

import { ApiResponse } from '@/types/base/ApiResponse';
import { ChangePasswordDto, ForgotPasswordDto } from '@/types/sys/User';
import { useMutation } from '@tanstack/react-query';
import { apiService } from '../../services/api';

const endpoint = 'auth';

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (body: ChangePasswordDto) => {
      return await apiService.post<ApiResponse<boolean>>(`${endpoint}/change-password`, body);
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (userId: string) => {
      return await apiService.post<ApiResponse<boolean>>(`${endpoint}/reset-password`, userId);
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (payload: ForgotPasswordDto) => {
      return await apiService.post<ApiResponse<boolean>>(`${endpoint}/forgot-password`, payload);
    },
  });
};

export const AuthHook = {
  useChangePassword,
  useResetPassword,
  useForgotPassword,
  // Add the new hook to the exported object
};
