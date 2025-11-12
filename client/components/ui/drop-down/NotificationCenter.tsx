import { NotificationHook } from '@/hooks/notification';
import { TimeHelper } from '@/libs/TimeHelper';
import {
  defaultNotificationsFilterDto,
  NotificationDto,
  NotificationsFilterDto,
} from '@/types/sys/Notification';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Listbox,
  ListboxItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
} from '@heroui/react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft02Icon, MoreVerticalCircle01Icon, Notification02Icon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ExtButton } from '../button/ExtButton';

export const NotificationCenter = () => {
  const [filter, setFilter] = useState<NotificationsFilterDto>({
    ...defaultNotificationsFilterDto,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationDto | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [checkedNotifications, setCheckedNotifications] = useState<Set<number>>(new Set());
  const { data: unreadCount } = NotificationHook.useGetUnreadCount();
  const { data, isFetching: loadingNotifications } = NotificationHook.useGetMyNotifications(
    filter,
    isOpen,
  );
  const { mutateAsync: markAsRead } = NotificationHook.useMarkAsRead();
  const { mutateAsync: markAllAsRead, isPending: isMarkingAllAsRead } =
    NotificationHook.useMarkAllAsRead();
  const { mutateAsync: deleteNotification, isPending: isDeleting } =
    NotificationHook.useDeleteNotification();
  const msg = useTranslations('msg');
  const listboxRef = useRef<HTMLDivElement>(null);

  const notificationItems = useMemo(() => {
    return notifications;
  }, [notifications]);

  const handleNotificationClick = async (notification: NotificationDto) => {
    // Mark as read first
    if (!notification.isRead) {
      await markAsRead(notification.id);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
      );
    }

    if (notification.link && notification.link.trim() !== '') {
      // If has link, open URL
      window.open(notification.link, '_blank');
    } else {
      // If no link, show detail view
      setSelectedNotification({ ...notification, isRead: true });
      setDirection(1);
    }
  };

  const handleSelect = (selected: boolean, id: number) => {
    if (selected) {
      setCheckedNotifications((prev) => new Set(prev).add(id));
    } else {
      setCheckedNotifications((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await markAllAsRead();
    if (success) {
      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const handleDeleteSelected = async () => {
    const idsToDelete = Array.from(checkedNotifications);

    for (const id of idsToDelete) {
      await deleteNotification(id);
    }

    // Remove deleted notifications from local state
    setNotifications((prev) => prev.filter((n) => !checkedNotifications.has(n.id)));
    // Clear selection
    setCheckedNotifications(new Set());
  };

  const handleBack = () => {
    setDirection(-1);
    setTimeout(() => {
      setSelectedNotification(null);
    }, 300);
  };

  // Handle scroll to load more
  useEffect(() => {
    const root = listboxRef.current;
    const scroller = root?.querySelector<HTMLDivElement>('div[data-orientation="vertical"]');
    if (!scroller || !isOpen) return;
    if (!data?.hasMore) return;

    const handleScroll = (event: Event) => {
      const target = event.currentTarget as HTMLDivElement;
      if (target.scrollTop + target.clientHeight >= target.scrollHeight - 10) {
        setFilter((prev) => ({
          ...prev,
          cursor: data?.nextCursor || null,
        }));
      }
    };

    scroller.addEventListener('scroll', handleScroll);
    return () => scroller.removeEventListener('scroll', handleScroll);
  }, [data, isOpen]);

  // Update notifications list when data changes
  useEffect(() => {
    if (data) {
      if (!filter.cursor || filter.cursor == null) {
        setNotifications([...data.items]);
      } else {
        setNotifications((prev) => [...prev, ...data.items]);
      }
    }
  }, [data?.items, filter.cursor]);

  // Reset when filter changes (except cursor)
  useEffect(() => {
    if (!isOpen) {
      setFilter({ ...defaultNotificationsFilterDto });
      setSelectedNotification(null);
      setDirection(1);
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
        className={clsx(
          'w-[440px] p-4 flex flex-col gap-2 justify-start transition-all duration-300',
          selectedNotification ? 'h-[600px]' : 'h-[560px]',
        )}
      >
        <Card className="w-full h-full" shadow="none">
          <CardHeader className="flex justify-between">
            <p className="font-bold text-xl">{msg('notification')}</p>
            <AnimatePresence mode="popLayout" initial={false}>
              {!selectedNotification ? (
                <motion.div
                  key="dropdown"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <Button isIconOnly variant="light" size="sm" radius="full">
                        <MoreVerticalCircle01Icon stroke="3" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Static Actions">
                      <DropdownItem
                        key="markAll"
                        className="text-primary"
                        color="primary"
                        onPress={handleMarkAllAsRead}
                        isDisabled={isMarkingAllAsRead}
                      >
                        {msg('markSeeAll')}
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        onPress={handleDeleteSelected}
                        isDisabled={checkedNotifications.size === 0 || isDeleting}
                      >
                        {msg('delete')} ({checkedNotifications.size})
                      </DropdownItem>
                      <DropdownItem
                        className={clsx(filter.isRead && 'hidden')}
                        key="showRead"
                        onPress={() => {
                          setNotifications([]);
                          setFilter({
                            ...defaultNotificationsFilterDto,
                            isRead: true,
                          });
                        }}
                      >
                        {msg('showRead')}
                      </DropdownItem>
                      <DropdownItem
                        className={clsx(!filter.isRead && 'hidden')}
                        key="showUnread"
                        onPress={() => {
                          setNotifications([]);
                          setFilter({
                            ...defaultNotificationsFilterDto,
                            isRead: false,
                          });
                        }}
                      >
                        {msg('showUnread')}
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </motion.div>
              ) : (
                <motion.div
                  key="back-button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button isIconOnly variant="light" size="sm" radius="full" onPress={handleBack}>
                    <ArrowLeft02Icon stroke="3" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardHeader>
          <Divider />
          <CardBody className="overflow-hidden">
            <AnimatePresence custom={direction} initial={false} mode="popLayout">
              {!selectedNotification ? (
                <motion.div
                  key="list"
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 500 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    transition: {
                      delay: 0.2,
                      type: 'spring',
                      visualDuration: 0.3,
                      bounce: 0.4,
                    },
                  }}
                  exit={{ opacity: 0, x: direction * -500 }}
                  className="h-full"
                >
                  <Listbox
                    ref={listboxRef}
                    isVirtualized
                    virtualization={{
                      maxListboxHeight: 440,
                      itemHeight: 52,
                    }}
                    items={notificationItems}
                    aria-label="notification-items"
                    onAction={(key) => {
                      const notification = notifications.find((n) => n.id === Number(key));
                      if (notification) handleNotificationClick(notification);
                    }}
                    bottomContent={loadingNotifications ? <Spinner size="sm" /> : null}
                    emptyContent={<div>{msg('noData')}</div>}
                  >
                    {(item) => (
                      <ListboxItem
                        classNames={{
                          description: clsx('text-sm truncate'),
                          title: clsx('font-semibold'),
                          base: clsx(item.isRead && 'opacity-70'),
                        }}
                        key={item.id}
                        description={item.message}
                        startContent={
                          <Checkbox
                            onValueChange={(val) => {
                              handleSelect(val, item.id);
                            }}
                          />
                        }
                        endContent={
                          <div className="flex flex-col items-end gap-2">
                            {!item.isRead && (
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                            )}
                            <span
                              className={clsx(
                                'w-14 text-end text-sm',
                                item.isRead && 'text-default-600',
                              )}
                            >
                              {TimeHelper.DateDiffToString(
                                new Date(item.createdAt),
                                new Date(),
                                'round',
                              )}
                            </span>
                          </div>
                        }
                        title={item.title}
                      />
                    )}
                  </Listbox>
                </motion.div>
              ) : (
                <motion.div
                  key="detail"
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 500 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    transition: {
                      delay: 0.2,
                      type: 'spring',
                      visualDuration: 0.3,
                      bounce: 0.4,
                    },
                  }}
                  exit={{ opacity: 0, x: direction * -500 }}
                  className="h-full flex flex-col gap-2 overflow-y-auto"
                >
                  <div className="flex items-start gap-2">
                    <h3 className="font-bold text-lg">{selectedNotification.title}</h3>
                  </div>
                  <span className="text-sm text-default">
                    {dayjs(selectedNotification.createdAt).format('HH:mm:ss DD/MM/YYYY')}
                  </span>
                  <div className="flex-1 my-2 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">{selectedNotification.message}</p>
                  </div>
                  {selectedNotification.link && (
                    <>
                      <Divider />
                      <Button
                        color="primary"
                        variant="flat"
                        size="sm"
                        onPress={() => window.open(selectedNotification.link, '_blank')}
                      >
                        {msg('openLink')}
                      </Button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardBody>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
