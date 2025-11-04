'use client';
import { Brand } from '@/components/ui/navigate/Brand';
import { MenuHook } from '@/hooks/menu';
import { UserHook } from '@/hooks/user';
import { useAuthStore } from '@/store/auth-store';
import { CardBody, CardFooter, CardHeader } from '@heroui/card';
import { Avatar, Button, Card, Skeleton, Tooltip } from '@heroui/react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Logout03Icon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import SidebarBody from './SidebarBody';

interface ISidebarMenuProps {
  isCompact: boolean;
}

export const Sidebar = (props: ISidebarMenuProps) => {
  const { isCompact } = props;
  const { data, isFetching } = MenuHook.useGetUserMenu();
  const { data: permission } = UserHook.useGetPermissions();
  const { setPermissions, user } = useAuthStore();
  const msg = useTranslations('msg');

  useEffect(() => {
    setPermissions(permission || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission]);

  const hiddenItemClass = clsx(
    'transition-opacity duration-300',
    isCompact ? 'opacity-0' : 'opacity-100',
  );

  return (
    <Card
      shadow="none"
      radius="none"
      classNames={{
        body: 'w-full',
        base: 'h-full bg-transparent',
      }}
    >
      <CardHeader>
        <Brand isCompact={isCompact} brandName={'Next Admin'} />
      </CardHeader>
      <CardBody>
        {isFetching ? (
          Array.from({ length: 6 }).map((_, rowIndex) => (
            <Skeleton key={rowIndex} className="h-8 w-full rounded-md my-2"></Skeleton>
          ))
        ) : (
          <SidebarBody items={data || []} isCompact={isCompact} />
        )}
      </CardBody>
      <CardFooter className="flex justify-between">
        <div className={clsx('w-full flex items-center gap-2')}>
          <div>
            <Avatar src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.fullName}`} />
          </div>
          {!isCompact && (
            <motion.span
              initial={{ opacity: 1, width: 'auto' }}
              animate={{
                opacity: 1,
                width: 'auto',
              }}
              exit={{
                opacity: 0,
                width: 0,
              }}
              transition={{
                duration: 0.5,
                ease: [0.4, 0.0, 0.2, 1],
                opacity: { duration: 0.2 },
              }}
              className={clsx('truncate text-sm')}
            >
              {user?.fullName}
            </motion.span>
          )}
        </div>
        <Tooltip content={msg('logout')} color="danger">
          <Button
            isIconOnly
            radius="full"
            size="sm"
            aria-label="Logout"
            color="danger"
            variant="light"
            className={hiddenItemClass}
          >
            <Logout03Icon size={20} />
          </Button>
        </Tooltip>
      </CardFooter>
    </Card>
  );
};
