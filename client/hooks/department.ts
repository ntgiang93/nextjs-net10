'use client';

import { StringHelper } from '@/libs/StringHelper';
import { apiService } from '@/services/api';
import { ApiResponse } from '@/types/base/ApiResponse';
import { defualtPaginatedResult, PaginatedResultDto } from '@/types/base/PaginatedResultDto';
import {
  AssignDepartmentMemberDto,
  defaultDetailDepartmentDto,
  DepartmentDto,
  DepartmentMemberDto,
  DepartmentMemberFilter,
  DetailDepartmentDto,
} from '@/types/sys/Department';
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

export const useAssignMember = (departmentId: number) => {
  return useMutation({
    mutationFn: async (payload: AssignDepartmentMemberDto[]) => {
      const response = await apiService.post<ApiResponse<boolean>>(
        `${endpoint}/${departmentId}/assign-members`,
        payload,
      );
      return response.success;
    },
  });
};

export const useGetUsersNotInDepartment = (
  departmentId: number,
  searchTerm: string,
  enabled: boolean = true,
) => {
  return useQuery<DepartmentMemberDto[], Error>({
    queryKey: [endpoint, 'usersNotInDepartment', departmentId, searchTerm],
    queryFn: async () => {
      const query = StringHelper.objectToUrlParams({ searchTerm });
      const url = query
        ? `${endpoint}/${departmentId}/users-not-in-department?${query}`
        : `${endpoint}/${departmentId}/users-not-in-department`;
      const response = await apiService.get<ApiResponse<DepartmentMemberDto[]>>(url);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    enabled: enabled && departmentId > 0,
    placeholderData: [],
  });
};

export const DepartmentHook = {
  useGetAll,
  useGet,
  useSave,
  useDelete,
  useGetMembers,
  useAssignMember,
  useGetUsersNotInDepartment,
};
