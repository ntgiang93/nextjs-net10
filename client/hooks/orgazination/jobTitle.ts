'use client';

import { apiService } from '@/services/api';
import { ApiResponse } from '@/types/base/ApiResponse';
import { defaultJobTitleDto, JobTitleDto } from '@/types/sys/JobTitle';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

const endpoint = 'organization/job-titles';

export const useGetAll = () => {
  return useQuery<JobTitleDto[], Error>({
    queryKey: [endpoint, 'getAll'],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<JobTitleDto[]>>(`${endpoint}`);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    placeholderData: keepPreviousData || [],
  });
};

export const useGet = (id: number) => {
  return useQuery<JobTitleDto, Error>({
    queryKey: [endpoint, 'get', id],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<JobTitleDto>>(`${endpoint}/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      return { ...defaultJobTitleDto };
    },
    enabled: id > 0,
  });
};

export const useSave = () => {
  return useMutation({
    mutationFn: async (payload: JobTitleDto) => {
      if (!payload.id || payload.id < 1) {
        return apiService.post<ApiResponse<JobTitleDto>>(`${endpoint}`, payload);
      }
      return apiService.put<ApiResponse<JobTitleDto>>(`${endpoint}`, payload);
    },
  });
};

export const useDelete = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiService.delete<ApiResponse<boolean>>(`${endpoint}/${id}`);
      return response.success;
    },
  });
};

export const JobTitleHook = {
  useGetAll,
  useGet,
  useSave,
  useDelete,
};
