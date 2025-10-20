'use client';

import { apiService } from '@/services/api';
import { ApiResponse } from '@/types/base/ApiResponse';
import {
  defaultDetailDepartmentDto,
  DepartmentDto,
  DetailDepartmentDto,
} from '@/types/sys/Department';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

const endpoint = 'organization/departments';

export const useGetAll = () => {
  return useQuery<DepartmentDto[], Error>({
    queryKey: [endpoint, 'getAll'],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<DepartmentDto[]>>(`${endpoint}`);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    placeholderData: keepPreviousData || [],
  });
};

export const useGet = (id: number) => {
  return useQuery<DetailDepartmentDto, Error>({
    queryKey: [endpoint, 'get', id],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<DetailDepartmentDto>>(`${endpoint}/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      return { ...defaultDetailDepartmentDto };
    },
    enabled: id > 0,
  });
};

export const useSave = () => {
  return useMutation({
    mutationFn: async (payload: DetailDepartmentDto) => {
      if (!payload.id || payload.id < 1) {
        return apiService.post<ApiResponse<DepartmentDto>>(`${endpoint}`, payload);
      }
      return apiService.put<ApiResponse<DepartmentDto>>(`${endpoint}`, payload);
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

export const DepartmentHook = {
  useGetAll,
  useGet,
  useSave,
  useDelete,
};
