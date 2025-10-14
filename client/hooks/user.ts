'use client';

import { StringHelper } from '@/libs/StringHelper';
import { ApiResponse } from '@/types/base/ApiResponse';
import { defualtPaginatedResult, PaginatedResultDto } from '@/types/base/PaginatedResultDto';
import { PaginationFilter } from '@/types/base/PaginationFilter';
import { MenuItem } from '@/types/sys/Menu';
import {
  defaultUserDto,
  SaveUserDto,
  UserDto,
  UserSelectDto,
  UserTableDto,
  UserTableRequestDto,
} from '@/types/sys/User';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

const endpoint = 'user';

export const useGetPagination = (params: UserTableRequestDto) => {
  return useQuery<PaginatedResultDto<UserTableDto>, Error>({
    queryKey: [endpoint, 'useGetPagination', params],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<PaginatedResultDto<UserTableDto>>>(
        `${endpoint}/pagination?${StringHelper.objectToUrlParams(params)}`,
      );
      if (response.success && response.data) {
        return response.data;
      }
      return defualtPaginatedResult;
    },
    placeholderData: keepPreviousData || defualtPaginatedResult,
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
    placeholderData: keepPreviousData || defualtPaginatedResult,
  });
};

export const useGet = (id: string) => {
  return useQuery<UserDto, Error>({
    queryKey: [endpoint, 'get', id],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<UserDto>>(`${endpoint}/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      return { ...defaultUserDto };
    },
    enabled: id != undefined && id !== '',
  });
};

export const useGetPermissions = () => {
  return useQuery<string[], Error>({
    queryKey: [endpoint, 'get'],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<string[]>>(
        `${endpoint}/current/permissions`,
      );
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    placeholderData: keepPreviousData || [],
  });
};

export const useSaveUser = () => {
  return useMutation({
    mutationFn: async (user: SaveUserDto) => {
      if (user.id && user.id.length > 0) {
        return await apiService.put<ApiResponse<MenuItem>>(`${endpoint}`, user);
      } else {
        return await apiService.post<ApiResponse<MenuItem>>(`${endpoint}`, user);
      }
    },
  });
};

export const useChangeActive = (id: string) => {
  return useMutation({
    mutationFn: async () => {
      await apiService.put<ApiResponse<boolean>>(`${endpoint}/${id}/change-active-status`);
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
  useChangeActive,
  useGetPermissions,
  useUpdateAvatar, // Add the new hook to the exported object
};
