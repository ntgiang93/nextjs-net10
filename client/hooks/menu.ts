'use client';

import { ApiResponse } from '@/types/base/ApiResponse';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { defaultMenuItem, MenuItem, SaveMenuDto } from '@/types/sys/Menu';
import dayjs from 'dayjs';

const endpoint = 'menu';

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
    initialData: [],
    initialDataUpdatedAt: dayjs().add(-5, 'second').valueOf(), // Set initial data to be stale
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
    initialData: [],
    enabled: !cachedData || cachedData.length === 0,
    retry: 1,
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
    initialData: { ...defaultMenuItem },
    enabled: id > 0,
    retry: 1,
  });
};

export const useSave = () => {
  return useMutation({
    mutationFn: async (menuItem: SaveMenuDto) => {
      if (menuItem.id < 1) {
        return await apiService.post<ApiResponse<MenuItem>>(`${endpoint}`, menuItem);
      } else {
        return await apiService.put<ApiResponse<MenuItem>>(`${endpoint}`, menuItem);
      }
    },
  });
};

export const useDelete = (id: number) => {
  return useMutation({
    mutationFn: async () => {
      await apiService.delete<ApiResponse<MenuItem>>(`${endpoint}/${id}`);
    },
  });
};

export const MenuHook = {
  useGetUserMenu,
  useGetMenuTree,
  useGet,
  useSave,
  useDelete,
};
