export type NotificationDto = {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  link?: string;
  metadata?: string;
};

export enum NotificationType {
  Info = 0,
  Success = 1,
  Warning = 2,
  Error = 3,
}

export const defaultNotificationDto: NotificationDto = {
  id: 0,
  userId: '',
  title: '',
  message: '',
  type: NotificationType.Info,
  isRead: false,
  createdAt: new Date(),
};

export type NotificationsFilterDto = {
  userId?: string;
  isRead?: boolean;
  cursor?: Date  | string;
  limit?: number;
};

export const defaultNotificationsFilterDto: NotificationsFilterDto = {
  userId: undefined,
  isRead: false,
  cursor: undefined,
  limit: 20,
};
