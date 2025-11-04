'use client';

import { ApiResponse } from '@/types/base/ApiResponse';
import { SelectOption } from '@/types/base/SelectOption';
import { CategoryDto, defaultCategory } from '@/types/sys/SysCategory';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

const endpoint = 'categories';

export const useGetSysModule = () => {
  const queryClient = useQueryClient();
  const cachedData = queryClient.getQueryData<SelectOption<string>[]>(['getSysModules']);

  return useQuery<SelectOption<string>[], Error>({
    queryKey: ['getSysModules'],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<SelectOption<string>[]>>(
        `${endpoint}/system-modules`,
      );
      if (response.success && response.data) {
        return response.data;
      }
      return cachedData || [];
    },
    placeholderData: keepPreviousData || [],
    enabled: !cachedData || cachedData.length === 0,
    retry: 1,
  });
};

export const useGetPermission = () => {
  const queryClient = useQueryClient();
  const cachedData = queryClient.getQueryData<SelectOption<number>[]>(['getPermission']);

  return useQuery<SelectOption<number>[], Error>({
    queryKey: ['getPermission'],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<SelectOption<number>[]>>(
        `${endpoint}/system-permissions`,
      );
      if (response.success && response.data) {
        return response.data;
      }
      return cachedData || [];
    },
    placeholderData: keepPreviousData || [],
    enabled: !cachedData || cachedData.length === 0,
    retry: 1,
  });
};

export const useGet = (id: number, enabled: boolean) => {
  return useQuery<CategoryDto, Error>({
    queryKey: [endpoint + '/get', id],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<CategoryDto>>(`${endpoint}/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      return { ...defaultCategory };
    },
    enabled: id > 0 && enabled,
  });
};

export const useGetByType = (type: string) => {
  var queryClient = useQueryClient();
  const cachedData = queryClient.getQueryData<CategoryDto[]>([endpoint + '/type', type]);
  return useQuery<CategoryDto[], Error>({
    queryKey: [endpoint + '/type', type],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<CategoryDto[]>>(`${endpoint}/type/${type}`);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    placeholderData: cachedData || [],
    enabled: cachedData === undefined || cachedData.length === 0,
  });
};

export const useGetTree = () => {
  return useQuery<CategoryDto[], Error>({
    queryKey: [endpoint + '/tree'],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<CategoryDto[]>>(`${endpoint}/tree`);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
  });
};

export const useSave = () => {
  var queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CategoryDto) => {
      let response;
      if (body.id < 1) {
        response = await apiService.post<ApiResponse<CategoryDto>>(`${endpoint}`, body);
      } else {
        response = await apiService.put<ApiResponse<CategoryDto>>(`${endpoint}`, body);
      }
      if (response.success) {
        // Cache invalidation by key is disabled per request.
        queryClient.invalidateQueries({ queryKey: [endpoint + '/type', body.type] });
      }
    },
  });
};

export const useDelete = () => {
  var queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, type }: { id: number; type: string }) => {
      if (!id || id < 1) return;
      const response = await apiService.delete<ApiResponse<boolean>>(`${endpoint}/${id}`);
      if (response.success) {
        // Cache invalidation by key is disabled per request.
        queryClient.invalidateQueries({ queryKey: [endpoint + '/type', type] });
      }
      return response;
    },
  });
};

export const SysCategoryHook = {
  useGetSysModule,
  useGetPermission,
  useGetByType,
  useGetTree,
  useGet,
  useSave,
  useDelete,
};
