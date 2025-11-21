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
  DepartmentMemberDto,
  DepartmentMemberFilter,
  UserDepartmentCursorFilterDto,
} from '@/types/sys/Department';
import {
  defaultJobConfiguration,
  DetailJobConfigurationDto,
  JobScheduleDto,
  UpdateJobConfigurationDto,
} from '@/types/sys/JobConfiguration';
import { UserSelectDto } from '@/types/sys/User';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const endpoint = 'job-schedules';

export const useGetAll = () => {
  return useQuery<JobScheduleDto[], Error>({
    queryKey: [endpoint, 'getAll'],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<JobScheduleDto[]>>(`${endpoint}`);
      if (response.success && response.data) {
        console.log('Fetched job schedules:', response.data);
        return response.data;
      }
      return [];
    },
    placeholderData: keepPreviousData || [],
  });
};

export const useGetType = () => {
  var queryClient = useQueryClient();
  var cachedData = queryClient.getQueryData<{ key: string; label: string }[]>([
    endpoint,
    'useGetType',
  ]);
  return useQuery<{ key: string; label: string }[], Error>({
    queryKey: [endpoint, 'useGetType'],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<string[]>>(`${endpoint}/types`);
      if (response.success && response.data) {
        return response.data.map((type) => ({ key: type, label: type }));
      }
      return [];
    },
    enabled: !cachedData || cachedData.length === 0,
  });
};

export const useGet = (id: number) => {
  return useQuery<DetailJobConfigurationDto, Error>({
    queryKey: [endpoint, 'get', id],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<DetailJobConfigurationDto>>(
        `${endpoint}/${id}`,
      );
      if (response.success && response.data) {
        return response.data;
      }
      return { ...defaultJobConfiguration };
    },
    enabled: id > 0,
  });
};

export const useSave = () => {
  return useMutation({
    mutationFn: async (payload: DetailJobConfigurationDto) => {
      let response;
      if (!payload.id || payload.id < 1) {
        response = await apiService.post<ApiResponse<boolean>>(`${endpoint}`, payload);
      } else {
        const body: UpdateJobConfigurationDto = {
          id: payload.id,
          cronExpression: payload.cronExpression,
          description: payload.description,
          jobDataJson: payload.jobDataJson,
        };
        response = await apiService.put<ApiResponse<boolean>>(`${endpoint}`, body);
      }
      return response.success;
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

export const useTrigger = () => {
  return useMutation({
    mutationFn: async (payload: string) => {
      const response = await apiService.post<ApiResponse<boolean>>(`${endpoint}/trigger`, payload);
      return response.success;
    },
  });
};

export const usePause = () => {
  return useMutation({
    mutationFn: async (payload: string) => {
      const response = await apiService.post<ApiResponse<boolean>>(`${endpoint}/pause`, payload);
      return response.success;
    },
  });
};

export const useResume = () => {
  return useMutation({
    mutationFn: async (payload: string) => {
      const response = await apiService.post<ApiResponse<boolean>>(`${endpoint}/resume`, payload);
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

export const JobScheduleHook = {
  useGetAll,
  useGet,
  useGetType,
  useSave,
  useDelete,
  useTrigger,
  usePause,
  useResume,
  useGetMembers,
  useAddMember,
  useGetUsersNotInDepartment,
  useRemoveMember,
};
