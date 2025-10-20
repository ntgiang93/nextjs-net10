'use client';

import { apiService } from '@/services/api';
import { ApiResponse } from '@/types/base/ApiResponse';
import {
  defaultDepartmentTypeDto,
  DepartmentTypeDto,
  SaveDepartmentTypeDto,
} from '@/types/sys/DepartmentType';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

const endpoint = 'organization/department-types';

export const useGetAll = () => {
  return useQuery<DepartmentTypeDto[], Error>({
    queryKey: [endpoint, 'getAll'],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<DepartmentTypeDto[]>>(`${endpoint}`);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    placeholderData: keepPreviousData || [],
  });
};

export const useGet = (id: number) => {
  return useQuery<DepartmentTypeDto, Error>({
    queryKey: [endpoint, 'get', id],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<DepartmentTypeDto>>(`${endpoint}/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      return { ...defaultDepartmentTypeDto };
    },
    enabled: id > 0,
  });
};

export const useSave = () => {
  return useMutation({
    mutationFn: async (payload: SaveDepartmentTypeDto) => {
      if (!payload.id || payload.id < 1) {
        return apiService.post<ApiResponse<DepartmentTypeDto>>(`${endpoint}`, payload);
      }
      return apiService.put<ApiResponse<DepartmentTypeDto>>(`${endpoint}`, payload);
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

export const DepartmentTypeHook = {
  useGetAll,
  useGet,
  useSave,
  useDelete,
};
