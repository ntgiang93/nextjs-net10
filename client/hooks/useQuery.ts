'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { apiService, ApiError } from '../services/api';

// Hook để lấy dữ liệu (GET)
export function useFetchData<TData = unknown, TError = ApiError>(
  queryKey: string[],
  endpoint: string,
  options?: Omit<UseQueryOptions<TData, TError, TData>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<TData, TError>({
    queryKey,
    queryFn: () => apiService.get<TData>(endpoint),
    ...options,
  });
}

// Hook để tạo dữ liệu mới (POST)
export function useCreateData<TData = unknown, TVariables = unknown, TError = ApiError>(
  queryKey: string[],
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();

  return useMutation<TData, TError, TVariables>({
    mutationFn: (variables) => apiService.post<TData>(endpoint, variables),
    onSuccess: (data, variables, context) => {
      // Cập nhật cache khi tạo thành công
      queryClient.invalidateQueries({ queryKey });

      // Gọi hàm onSuccess tùy chỉnh nếu có
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
}

// Hook để cập nhật dữ liệu (PUT)
export function useUpdateData<TData = unknown, TVariables = unknown, TError = ApiError>(
  queryKey: string[],
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();

  return useMutation<TData, TError, TVariables>({
    mutationFn: (variables) => apiService.put<TData>(endpoint, variables),
    onSuccess: (data, variables, context) => {
      // Cập nhật cache khi cập nhật thành công
      queryClient.invalidateQueries({ queryKey });

      // Gọi hàm onSuccess tùy chỉnh nếu có
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
}

// Hook để cập nhật một phần dữ liệu (PATCH)
export function usePatchData<TData = unknown, TVariables = unknown, TError = ApiError>(
  queryKey: string[],
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();

  return useMutation<TData, TError, TVariables>({
    mutationFn: (variables) => apiService.patch<TData>(endpoint, variables),
    onSuccess: (data, variables, context) => {
      // Cập nhật cache khi patch thành công
      queryClient.invalidateQueries({ queryKey });

      // Gọi hàm onSuccess tùy chỉnh nếu có
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
}

// Hook để xóa dữ liệu (DELETE)
export function useDeleteData<TData = unknown, TVariables = unknown, TError = ApiError>(
  queryKey: string[],
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();

  return useMutation<TData, TError, TVariables>({
    mutationFn: (id) => {
      // Nếu id là một primitive value, ghép nó vào endpoint
      const finalEndpoint =
        typeof id === 'string' || typeof id === 'number' ? `${endpoint}/${id}` : endpoint;

      return apiService.delete<TData>(finalEndpoint);
    },
    onSuccess: (data, variables, context) => {
      // Cập nhật cache khi xóa thành công
      queryClient.invalidateQueries({ queryKey });

      // Gọi hàm onSuccess tùy chỉnh nếu có
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
}
