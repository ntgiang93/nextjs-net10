'use client';

import { StringHelper } from '@/libs/StringHelper';
import { ApiResponse } from '@/types/base/ApiResponse';
import {
  defaultFileDto,
  FileDto,
  FileUpdateReferenceDto,
  FileUploadDto,
  GetByReferenceDto,
} from '@/types/sys/File';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

const endpoint = 'file';

export const useGetByReference = (params: GetByReferenceDto) => {
  return useQuery<FileDto[], Error>({
    queryKey: [endpoint, 'getByReference', params],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<FileDto[]>>(
        `${endpoint}/reference?${StringHelper.objectToUrlParams(params)}`,
      );
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    placeholderData: keepPreviousData || [],
    enabled: params.referenceId !== '' && params.referenceType !== '',
    refetchOnMount: true,
  });
};

export const useGet = (id: number) => {
  return useQuery<FileDto, Error>({
    queryKey: [endpoint, 'get', id],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<FileDto>>(`${endpoint}/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      return { ...defaultFileDto };
    },
    enabled: id > 0,
  });
};

export const useUpload = () => {
  return useMutation<FileDto, Error, FileUploadDto>({
    mutationFn: async (body: FileUploadDto) => {
      const formData = new FormData();
      formData.append('File', body.file);
      formData.append('ReferenceId', body.referenceId?.toString() || '');
      formData.append('ReferenceType', body.referenceType || '');
      formData.append('IsPublic', body.isPublic?.toString() || 'false');

      const response = await apiService.post<ApiResponse<FileDto>>(`${endpoint}/upload`, formData);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'File upload failed');
    },
  });
};

export const useUpdateReference = () => {
  return useMutation<boolean, Error, FileUpdateReferenceDto>({
    mutationFn: async (body: FileUpdateReferenceDto) => {
      const response = await apiService.put<ApiResponse<boolean>>(
        `${endpoint}/update-reference`,
        body,
      );
      return response.success;
    },
  });
};

export const useDelete = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      var response = await apiService.delete<ApiResponse<boolean>>(`${endpoint}/${id}`);
      return response.success;
    },
  });
};

export const FileHook = {
  useUpdateReference,
  useGetByReference,
  useGet,
  useUpload,
  useDelete,
};
