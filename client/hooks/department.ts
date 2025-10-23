'use client';

import { StringHelper } from '@/libs/StringHelper';
import { apiService } from '@/services/api';
import { ApiResponse } from '@/types/base/ApiResponse';
import {
  CursorPaginatedResultDto,
  defaultCursorPaginatedResult,
} from '@/types/base/CursorPaginatedResultDto';
import { defualtPaginatedResult, PaginatedResultDto } from '@/types/base/PaginatedResultDto';
import {
  AddDepartmentMemberDto,
  defaultDetailDepartmentDto,
  DepartmentDto,
  DepartmentMemberDto,
  DepartmentMemberFilter,
  DetailDepartmentDto,
  UserDepartmentCursorFilterDto,
} from '@/types/sys/Department';
import { UserSelectDto } from '@/types/sys/User';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const endpoint = 'organization/departments';

export const useGetAll = () => {
  var queryClient = useQueryClient();
  var cachedData = queryClient.getQueryData<DepartmentDto[]>([endpoint, 'getAll']);
  return useQuery<DepartmentDto[], Error>({
    queryKey: [endpoint, 'getAll'],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<DepartmentDto[]>>(`${endpoint}`);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    enabled: !cachedData || cachedData.length === 0,
    placeholderData: keepPreviousData || [],
  });
};

export const useGetSingleTree = (id: number) => {
  var queryClient = useQueryClient();
  var cachedData = queryClient.getQueryData<DepartmentDto>([endpoint, 'getSingleTree']);
  return useQuery<DepartmentDto, Error>({
    queryKey: [endpoint, 'getSingleTree', id],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<DepartmentDto>>(`${endpoint}/${id}/tree`);
      if (response.success && response.data) {
        return response.data;
      }
      return {} as DepartmentDto;
    },
    enabled: !cachedData,
    placeholderData: keepPreviousData,
  });
};

export const useGet = (id: number) => {
  return useQuery<DetailDepartmentDto, Error>({
    queryKey: [endpoint, 'get', id],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<DetailDepartmentDto>>(`${endpoint}/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      return { ...defaultDetailDepartmentDto };
    },
    enabled: id > 0,
  });
};

export const useSave = () => {
  return useMutation({
    mutationFn: async (payload: DetailDepartmentDto) => {
      if (!payload.id || payload.id < 1) {
        return apiService.post<ApiResponse<DepartmentDto>>(`${endpoint}`, payload);
      }
      return apiService.put<ApiResponse<DepartmentDto>>(`${endpoint}`, payload);
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

export const useGetMembers = (filter: DepartmentMemberFilter) => {
  return useQuery<PaginatedResultDto<DepartmentMemberDto>, Error>({
    queryKey: [endpoint, 'getMembers', filter],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<PaginatedResultDto<DepartmentMemberDto>>>(
        `${endpoint}/get-members?${StringHelper.objectToUrlParams(filter)}`,
      );
      if (response.success && response.data) {
        return response.data;
      }
      return { ...defualtPaginatedResult };
    },
    enabled: filter.departmentId > 0,
    placeholderData: keepPreviousData,
  });
};

export const useAddMember = () => {
  return useMutation({
    mutationFn: async (payload: AddDepartmentMemberDto) => {
      const response = await apiService.post<ApiResponse<boolean>>(
        `${endpoint}/add-members`,
        payload,
      );
      return response.success;
    },
  });
};

export const useGetUsersNotInDepartment = (filter: UserDepartmentCursorFilterDto) => {
  return useQuery<CursorPaginatedResultDto<UserSelectDto, string>, Error>({
    queryKey: [endpoint, 'usersNotInDepartment', filter],
    queryFn: async () => {
      const query = StringHelper.objectToUrlParams({ ...filter });
      const url = query
        ? `${endpoint}/users-not-in-department?${query}`
        : `${endpoint}/users-not-in-department`;
      const response =
        await apiService.get<ApiResponse<CursorPaginatedResultDto<UserSelectDto, string>>>(url);
      if (response.success && response.data) {
        return response.data;
      }
      return { ...defaultCursorPaginatedResult };
    },
    enabled: filter.departmentId > 0,
    placeholderData: keepPreviousData,
  });
};

export const useRemoveMember = () => {
  return useMutation({
    mutationFn: async (payload: number[]) => {
      const response = await apiService.delete<ApiResponse<boolean>>(
        `${endpoint}/remove-member`,
        payload,
      );
      return response.success;
    },
  });
};

export const DepartmentHook = {
  useGetAll,
  useGet,
  useSave,
  useDelete,
  useGetMembers,
  useAddMember,
  useGetUsersNotInDepartment,
  useRemoveMember,
};
