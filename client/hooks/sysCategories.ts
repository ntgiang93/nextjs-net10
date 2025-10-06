'use client';

import { ApiResponse } from '@/types/base/ApiResponse';
import { defaultMenuItem, MenuItem, SaveMenuDto } from '@/types/sys/Menu';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useMutation } from '@tanstack/react-query';
import { SelectOption } from '@/types/base/SelectOption';

const endpoint = 'categories';

export const useGetSysModule = () => {
  const queryClient = useQueryClient();
  const cachedData = queryClient.getQueryData<SelectOption<string>[]>([
    'getSysModules',
  ]);

  return useQuery<SelectOption<string>[], Error>({
    queryKey: ['getSysModules'],
    queryFn: async () => {
      const response = await apiService.get<
        ApiResponse<SelectOption<string>[]>
      >(`${endpoint}/system-modules`);
      if (response.success && response.data) {
        return response.data;
      }
      return cachedData || [];
    },
    initialData: [],
    enabled: !cachedData || cachedData.length === 0,
    retry: 1,
  });
};

export const useGetPermission = () => {
  const queryClient = useQueryClient();
  const cachedData = queryClient.getQueryData<SelectOption<string>[]>([
    'getPermission',
  ]);

  return useQuery<SelectOption<string>[], Error>({
    queryKey: ['getPermission'],
    queryFn: async () => {
      const response = await apiService.get<
          ApiResponse<SelectOption<string>[]>
      >(`${endpoint}/system-permissions`);
      if (response.success && response.data) {
        return response.data;
      }
      return cachedData || [];
    },
    initialData: [],
    enabled: !cachedData || cachedData.length === 0,
    retry: 1,
  });
};

export const useGet = (id: number) => {
  return useQuery<MenuItem, Error>({
    queryKey: ['get', id],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<MenuItem>>(
        `${endpoint}/${id}`,
      );
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
        await apiService.post<ApiResponse<MenuItem>>(`${endpoint}`, menuItem);
      } else {
        await apiService.put<ApiResponse<MenuItem>>(`${endpoint}`, menuItem);
      }
    },
  });
};

export const SysCategoryHook = {
  useGetSysModule,
  useGetPermission,
  useGet,
  useSave,
};
