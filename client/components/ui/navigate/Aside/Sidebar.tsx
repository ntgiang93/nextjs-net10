'use client';
import { Brand } from '@/components/ui/navigate/Brand';
import { MenuHook } from '@/hooks/menu';
import { UserHook } from '@/hooks/user';
import { useAuthStore } from '@/store/auth-store';
import { CardBody, CardFooter, CardHeader } from '@heroui/card';
import { Button, Card, Tooltip, User } from '@heroui/react';
import clsx from 'clsx';
import { Logout03Icon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import SidebarBody from './SidebarBody';

interface ISidebarMenuProps {
  isCompact: boolean;
}

export const Sidebar = (props: ISidebarMenuProps) => {
  const { isCompact } = props;
  const { data } = MenuHook.useGetUserMenu();
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
        <SidebarBody items={data || []} isCompact={isCompact} />
      </CardBody>
      <CardFooter className="flex justify-between">
        <User
          avatarProps={{
            src: user?.avatar || `https://ui-avatars.com/api/?name=${user?.fullName}`,
          }}
          name={user?.fullName}
        />
        <Tooltip content={msg('logout')} color="danger">
          <Button
            isIconOnly
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
