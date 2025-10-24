'use client';

import { StringHelper } from '@/libs/StringHelper';
import { ApiResponse } from '@/types/base/ApiResponse';
import {
  CursorPaginatedResultDto,
  defaultCursorPaginatedResult,
} from '@/types/base/CursorPaginatedResultDto';
import { defualtPaginatedResult, PaginatedResultDto } from '@/types/base/PaginatedResultDto';
import { MenuItem } from '@/types/sys/Menu';
import {
  AddRoleMemberDto,
  defaultRoleDto,
  RoleDto,
  RoleMemberFilter,
  RoleMembersDto,
  RolePermissionDto,
  UserRoleCursorFilterDto
} from '@/types/sys/Role';
import { UserSelectDto } from '@/types/sys/User';
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

export const useGetMembers = (filter: RoleMemberFilter, enabled: boolean) => {
  return useQuery<PaginatedResultDto<RoleMembersDto>, Error>({
    queryKey: [endpoint, 'getMembers', filter],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<PaginatedResultDto<RoleMembersDto>>>(
        `${endpoint}/get-members?${StringHelper.objectToUrlParams(filter)}`,
      );
      if (response.success && response.data) {
        return response.data;
      }
      return { ...defualtPaginatedResult };
    },
    enabled: filter.roleId > 0 && enabled,
    placeholderData: keepPreviousData,
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
        return await apiService.put<ApiResponse<any>>(`${endpoint}`, role);
      } else {
        return await apiService.post<ApiResponse<RoleDto>>(`${endpoint}`, role);
      }
    },
  });
};

export const useAssignPermission = (roleId: number) => {
  return useMutation({
    mutationFn: async (permission: RolePermissionDto[]) => {
      var response = await apiService.post<ApiResponse<any>>(
        `${endpoint}/${roleId}/permissions`,
        permission,
      );
      return response.success;
    },
  });
};

export const useAddMember = () => {
  return useMutation({
    mutationFn: async (payload: AddRoleMemberDto) => {
      const response = await apiService.post<ApiResponse<boolean>>(
        `${endpoint}/add-members`,
        payload,
      );
      return response.success;
    },
  });
};

export const useDelete = (id: number) => {
  return useMutation({
    mutationFn: async () => {
      var response = await apiService.delete<ApiResponse<MenuItem>>(`${endpoint}/${id}`);
      return response.success;
    },
  });
};

export const useRemoveMember = (roleId: number) => {
  return useMutation({
    mutationFn: async (userIds: string[]) => {
      const response = await apiService.delete<ApiResponse<boolean>>(
        `${endpoint}/${roleId}/remove-members`,
        userIds,
      );
      return response.success;
    },
  });
};

export const useGetUsersNotInRole = (filter: UserRoleCursorFilterDto) => {
  return useQuery<CursorPaginatedResultDto<UserSelectDto, string>, Error>({
    queryKey: [endpoint, 'usersNotInRole', filter],
    queryFn: async () => {
      const query = StringHelper.objectToUrlParams(filter as Record<string, unknown>);
      const url = query
        ? `${endpoint}/users-not-in-role?${query}`
        : `${endpoint}/users-not-in-role`;
      const response =
        await apiService.get<ApiResponse<CursorPaginatedResultDto<UserSelectDto, string>>>(url);
      if (response.success && response.data) {
        return response.data;
      }
      return { ...defaultCursorPaginatedResult };
    },
    enabled: filter.roleId > 0,
    placeholderData: keepPreviousData,
  });
};

export const RoleHook = {
  useGetAll,
  useGet,
  useGetMembers,
  useSave,
  useDelete,
  useGetPermission,
  useAssignPermission,
  useAddMember,
  useRemoveMember,
  useGetUsersNotInRole,
};
