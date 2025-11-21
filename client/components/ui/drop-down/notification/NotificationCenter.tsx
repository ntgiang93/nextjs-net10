import { NotificationHook } from '@/hooks/sys/notification';
import { defaultNotificationsFilterDto, NotificationsFilterDto } from '@/types/sys/Notification';
import { Badge, Popover, PopoverContent, PopoverTrigger } from '@heroui/react';
import clsx from 'clsx';
import { Notification02Icon } from 'hugeicons-react';
import { useEffect, useState } from 'react';
import { ExtButton } from '../../button/ExtButton';
import { NotificationCenterContent } from './NotificationCenterContent';

export const NotificationCenter = () => {
  const [filter, setFilter] = useState<NotificationsFilterDto>({
    ...defaultNotificationsFilterDto,
  });
  const [isOpen, setIsOpen] = useState(false);
  const { data: unreadCount } = NotificationHook.useGetUnreadCount();
  const { data, isFetching: loadingNotifications } = NotificationHook.useGetMyNotifications(
    filter,
    isOpen,
  );

  // Reset when filter changes (except cursor)
  useEffect(() => {
    if (!isOpen) {
      setFilter({ ...defaultNotificationsFilterDto });
    }
  }, [isOpen]);

  return (
    <Popover placement="bottom-end" showArrow onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <ExtButton
          color="transparent"
          variant="light"
          className={'text-default-600 p-6'}
          isIconOnly
        >
          <Badge color="primary" content={unreadCount > 0 ? unreadCount : ''}>
            <Notification02Icon size={18} />
          </Badge>
        </ExtButton>
      </PopoverTrigger>
      <PopoverContent
        aria-label="Notifications"
        className={clsx('w-[440px] h-[560px] p-4 flex flex-col gap-2 justify-start')}
      >
        {isOpen && (
          <NotificationCenterContent
            filter={filter}
            setFilter={setFilter}
            data={data}
            loadingNotifications={loadingNotifications}
          />
        )}
      </PopoverContent>
    </Popover>
  );
};
