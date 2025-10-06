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

export const AuthHook = {
  useChangePassword,
  // Add the new hook to the exported object
};
