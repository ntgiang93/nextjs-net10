'use client';

import { StringHelper } from '@/libs/StringHelper';
import { ApiResponse } from '@/types/base/ApiResponse';
import { defualtPaginatedResult, PaginatedResultDto } from '@/types/base/PaginatedResultDto';
import { MenuItem } from '@/types/sys/Menu';
import {
  SaveUserDto,
  defaultUserDto,
  UserDto,
  UserSelectDto,
  UserTableDto,
  UserTableRequestDto,
} from '@/types/sys/User';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { PaginationFilter } from '@/types/base/PaginationFilter';

const endpoint = 'user';

export const useGetPagination = (params: UserTableRequestDto) => {
  const paramKey = JSON.stringify(params);
  return useQuery<PaginatedResultDto<UserTableDto>, Error>({
    queryKey: [endpoint, 'useGetPagination', paramKey],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<PaginatedResultDto<UserTableDto>>>(
        `${endpoint}/pagination?${StringHelper.objectToUrlParams(params)}`,
      );
      if (response.success && response.data) {
        return response.data;
      }
      return defualtPaginatedResult;
    },
    initialData: defualtPaginatedResult,
  });
};

export const useGetPaginationToSelect = (params: PaginationFilter) => {
  return useQuery<PaginatedResultDto<UserSelectDto>, Error>({
    queryKey: [endpoint, 'useGetPaginationToSelect', params],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<PaginatedResultDto<UserSelectDto>>>(
        `${endpoint}/pagination-to-select?${StringHelper.objectToUrlParams(params)}`,
      );
      if (response.success && response.data) {
        return response.data;
      }
      return defualtPaginatedResult;
    },
    initialData: defualtPaginatedResult,
  });
};

export const useGet = (id: string) => {
  return useQuery<UserDto, Error>({
    queryKey: [endpoint, 'get', id],
    queryFn: async () => {
      if (id != undefined && id !== '' && id !== '0') {
        const response = await apiService.get<ApiResponse<UserDto>>(`${endpoint}/${id}`);
        if (response.success && response.data) {
          return response.data;
        }
      }
      return { ...defaultUserDto };
    },
    initialData: { ...defaultUserDto },
  });
};

export const useGetPermissions = () => {
  return useQuery<string[], Error>({
    queryKey: [endpoint, 'get'],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<string[]>>(`${endpoint}/current/permissions`);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    initialData: [],
  });
};

export const useSaveUser = () => {
  return useMutation({
    mutationFn: async (user: SaveUserDto) => {
      if (user.id && user.id !== '0' && user.id !== '') {
        return await apiService.put<ApiResponse<MenuItem>>(`${endpoint}`, user);
      } else {
        return await apiService.post<ApiResponse<MenuItem>>(`${endpoint}`, user);
      }
    },
  });
};

export const useDelete = (id: string) => {
  return useMutation({
    mutationFn: async () => {
      await apiService.delete<ApiResponse<MenuItem>>(`${endpoint}/${id}`);
    },
  });
};

export const useUpdateAvatar = () => {
  return useMutation({
    mutationFn: async ({ userId, file }: { userId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      return await apiService.put<ApiResponse<string>>(`${endpoint}/${userId}/avatar`, formData);
    },
  });
};

export const UserHook = {
  useGetPagination,
  useGetPaginationToSelect,
  useGet,
  useSaveUser,
  useDelete,
  useGetPermissions,
  useUpdateAvatar, // Add the new hook to the exported object
};
