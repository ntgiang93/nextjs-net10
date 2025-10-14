'use client';

import { ApiResponse } from '@/types/base/ApiResponse';
import { MenuItem } from '@/types/sys/Menu';
import {
  defaultRoleDto,
  RoleDto,
  RoleMembersDto,
  RolePermissionDto,
  UserRoleDto,
} from '@/types/sys/Role';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

const endpoint = 'role';

export const useGetAll = () => {
  const queryClient = useQueryClient();
  const cachedData = queryClient.getQueryData<RoleDto[]>([endpoint, 'getAll']);
  return useQuery<RoleDto[], Error>({
    queryKey: [endpoint, 'getAll'],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<RoleDto[]>>(`${endpoint}/`);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    placeholderData: [],
    enabled: !cachedData || cachedData.length === 0,
  });
};

export const useGet = (id: number) => {
  return useQuery<RoleDto, Error>({
    queryKey: [endpoint, 'get', id],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<RoleDto>>(`${endpoint}/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      return { ...defaultRoleDto };
    },
    placeholderData: keepPreviousData || { ...defaultRoleDto },
    enabled: id > 0,
  });
};

export const useGetMember = (roleId: number) => {
  return useQuery<RoleMembersDto[], Error>({
    queryKey: [endpoint, 'useGetMember', roleId],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<RoleMembersDto[]>>(
        `${endpoint}/${roleId}/get-members`,
      );
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    placeholderData: keepPreviousData || [],
    enabled: roleId > 0,
  });
};

export const useGetPermission = (roleId: number) => {
  return useQuery<RolePermissionDto[], Error>({
    queryKey: [endpoint, 'useGetPermission', roleId],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<RolePermissionDto[]>>(
        `${endpoint}/${roleId}/permissions`,
      );
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    placeholderData: keepPreviousData || [],
    enabled: roleId > 0,
  });
};

export const useSave = () => {
  return useMutation({
    mutationFn: async (role: RoleDto) => {
      if (role.id > 0) {
        return await apiService.post<ApiResponse<RoleDto>>(`${endpoint}`, role);
      } else {
        return await apiService.put<ApiResponse<any>>(`${endpoint}`, role);
      }
    },
  });
};

export const useAssignPermission = (roleId: number) => {
  return useMutation({
    mutationFn: async (permission: RolePermissionDto[]) => {
      return await apiService.post<ApiResponse<any>>(
        `${endpoint}/${roleId}/permissions`,
        permission,
      );
    },
  });
};

export const useAssignMember = (roleId: number) => {
  return useMutation({
    mutationFn: async (userRole: UserRoleDto[]) => {
      return await apiService.post<ApiResponse<any>>(
        `${endpoint}/${roleId}/assign-members`,
        userRole,
      );
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

export const useRemoveMember = (roleId: number, userId: string) => {
  return useMutation({
    mutationFn: async () => {
      await apiService.delete<ApiResponse<MenuItem>>(
        `${endpoint}/${roleId}/remove-member/${userId}`,
      );
    },
  });
};

export const RoleHook = {
  useGetAll,
  useGet,
  useSave,
  useDelete,
  useGetMember,
  useGetPermission,
  useAssignPermission,
  useRemoveMember,
  useAssignMember,
};
