'use client';

import { ApiResponse } from '@/types/base/ApiResponse';
import { ChangePasswordDto } from '@/types/sys/User';
import { useMutation } from '@tanstack/react-query';
import { apiService } from '../services/api';

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

export const AuthHook = {
  useChangePassword,
  useResetPassword,
  // Add the new hook to the exported object
};
