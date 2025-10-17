'use client';

import { ApiResponse } from '@/types/base/ApiResponse';
import { FileDto, FileUploadDto } from '@/types/sys/File';
import { defaultMenuItem, MenuItem } from '@/types/sys/Menu';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

const endpoint = 'file';

export const useGetUserMenu = () => {
  return useQuery<MenuItem[], Error>({
    queryKey: [endpoint, 'getUserMenu'],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<MenuItem[]>>(`${endpoint}/user`);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    placeholderData: keepPreviousData || [],
    refetchOnMount: true,
  });
};

export const useGetMenuTree = () => {
  const queryClient = useQueryClient();
  const cachedData = queryClient.getQueryData<MenuItem[]>(['getMenuTree']);
  return useQuery<MenuItem[], Error>({
    queryKey: [endpoint, 'getMenuTree'],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<MenuItem[]>>(`${endpoint}`);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    placeholderData: keepPreviousData || [],
    enabled: !cachedData || cachedData.length === 0,
  });
};

export const useGet = (id: number) => {
  return useQuery<MenuItem, Error>({
    queryKey: [endpoint, 'get', id],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<MenuItem>>(`${endpoint}/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      return { ...defaultMenuItem };
    },
    enabled: id > 0,
  });
};

export const useUpload = () => {
  return useMutation<FileDto, Error, FileUploadDto>({
    mutationFn: async (body: FileUploadDto) => {
      const formData = new FormData();
      formData.append('File', body.file);
      formData.append('ReferenceId', body.referenceId?.toString() || '');
      formData.append('ReferenceType', body.referenceType || '');
      formData.append('IsPublic', body.isPublic?.toString() || 'false');

      const response = await apiService.post<ApiResponse<FileDto>>(`${endpoint}/upload`, formData);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'File upload failed');
    },
  });
};

export const useDelete = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      var response = await apiService.delete<ApiResponse<boolean>>(`${endpoint}/${id}`);
      return response.success;
    },
  });
};

export const FileHook = {
  useGetUserMenu,
  useGetMenuTree,
  useGet,
  useUpload,
  useDelete,
};
