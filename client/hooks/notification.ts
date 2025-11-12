'use client';

import { StringHelper } from '@/libs/StringHelper';
import { ApiResponse } from '@/types/base/ApiResponse';
import {
  CursorPaginatedResultDto,
  defaultCursorPaginatedResult,
} from '@/types/base/CursorPaginatedResultDto';
import {
  defaultNotificationDto,
  NotificationDto,
  NotificationsFilterDto,
} from '@/types/sys/Notification';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { apiService } from '../services/api';

const endpoint = 'notifications';

export const useGetMyNotifications = (filter: NotificationsFilterDto, enabled: boolean) => {
  return useQuery<CursorPaginatedResultDto<NotificationDto, Date>, Error>({
    queryKey: [endpoint, 'getMyNotifications', filter],
    queryFn: async () => {
      const query = StringHelper.objectToUrlParams(filter as Record<string, unknown>);
      const url = query ? `${endpoint}/my-notifications?${query}` : `${endpoint}/my-notifications`;
      const response = await apiService.get<
        ApiResponse<CursorPaginatedResultDto<NotificationDto, Date>>
      >(url, undefined, true);
      if (response.success && response.data) {
        return response.data;
      }
      return { ...defaultCursorPaginatedResult };
    },
    enabled: enabled,
    placeholderData: keepPreviousData,
  });
};

export const useGetUnreadCount = () => {
  return useQuery<number, Error>({
    queryKey: [endpoint, 'getUnreadCount'],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<number>>(
        `${endpoint}/unread-count`,
        undefined,
        true,
      );
      if (response.success && response.data !== undefined && response.data !== null) {
        return response.data;
      }
      return 0;
    },
    initialData: 0,
    initialDataUpdatedAt: dayjs().subtract(1, 'minute').toDate().getTime(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useGetNotification = (id: number) => {
  return useQuery<NotificationDto, Error>({
    queryKey: [endpoint, 'get', id],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<NotificationDto>>(
        `${endpoint}/${id}`,
        undefined,
        true,
      );
      if (response.success && response.data) {
        return response.data;
      }
      return { ...defaultNotificationDto };
    },
    placeholderData: keepPreviousData || { ...defaultNotificationDto },
    enabled: id > 0,
  });
};

export const useGetFilteredNotifications = () => {
  return useMutation({
    mutationFn: async (filter: NotificationsFilterDto) => {
      const response = await apiService.post<
        ApiResponse<CursorPaginatedResultDto<NotificationDto, Date>>
      >(`${endpoint}/filter`, filter, undefined, true);
      if (response.success && response.data) {
        return response.data;
      }
      return { ...defaultCursorPaginatedResult };
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiService.patch<ApiResponse<boolean>>(
        `${endpoint}/${id}/mark-as-read`,
      );
      return response.success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint, 'getMyNotifications'] });
      queryClient.invalidateQueries({ queryKey: [endpoint, 'getUnreadCount'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiService.patch<ApiResponse<boolean>>(`${endpoint}/mark-all-as-read`);
      return response.success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint, 'getMyNotifications'] });
      queryClient.invalidateQueries({ queryKey: [endpoint, 'getUnreadCount'] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiService.delete<ApiResponse<boolean>>(`${endpoint}/${id}`);
      return response.success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint, 'getMyNotifications'] });
      queryClient.invalidateQueries({ queryKey: [endpoint, 'getUnreadCount'] });
    },
  });
};

export const NotificationHook = {
  useGetMyNotifications,
  useGetUnreadCount,
  useGetNotification,
  useGetFilteredNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
};
