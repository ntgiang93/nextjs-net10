'use client';

import { StringHelper } from '@/libs/StringHelper';
import { ApiResponse } from '@/types/base/ApiResponse';
import { defualtPaginatedResult, PaginatedResultDto } from '@/types/base/PaginatedResultDto';
import { PaginationFilter } from '@/types/base/PaginationFilter';
import { MenuItem } from '@/types/sys/Menu';
import { defaultUserDto, UserDto, UserSelectDto } from '@/types/sys/User';
import { defaultUserProfileDto, UserProfileDto } from '@/types/sys/UserProfile';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

const endpoint = 'user-profile';

export const useGetUserProfile = (id: string) => {
  return useQuery<UserProfileDto, Error>({
    queryKey: [endpoint, 'useGetUserProfile', id],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<UserProfileDto>>(`${endpoint}/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      return { ...defaultUserProfileDto };
    },
    initialData: { ...defaultUserProfileDto },
    enabled: id != undefined && id !== '',
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
      const response = await apiService.get<ApiResponse<UserDto>>(`${endpoint}/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      return { ...defaultUserDto };
    },
    initialData: { ...defaultUserDto },
    enabled: id != undefined && id !== '' && id !== '0',
  });
};

export const useGetPermissions = () => {
  return useQuery<string[], Error>({
    queryKey: [endpoint, 'get'],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<string[]>>(
        `${endpoint}/current/permissions"`,
      );
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    initialData: [],
  });
};

export const useSave = () => {
  return useMutation({
    mutationFn: async (user: UserProfileDto) => {
      return await apiService.post<ApiResponse<MenuItem>>(`${endpoint}`, user);
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

export const UserProfileHook = {
  useGetUserProfile,
  useGetPaginationToSelect,
  useGet,
  useSave,
  useDelete,
  useGetPermissions,
};
