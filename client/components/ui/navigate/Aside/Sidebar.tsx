'use client';
import { Brand } from '@/components/ui/navigate/Brand';
import { MenuHook } from '@/hooks/menu';
import { UserHook } from '@/hooks/user';
import { useAuthStore } from '@/store/auth-store';
import { CardBody, CardFooter, CardHeader } from '@heroui/card';
import { Button, Card, Link } from '@heroui/react';
import { User } from '@heroui/user';
import clsx from 'clsx';
import { Logout03Icon } from 'hugeicons-react';
import { useEffect } from 'react';
import { Menu } from './Menu';

interface ISidebarMenuProps {
  isCompact: boolean;
}

export const Sidebar = (props: ISidebarMenuProps) => {
  const { isCompact } = props;
  const { data } = MenuHook.useGetUserMenu();
  const { data: permission } = UserHook.useGetPermissions();
  const { setPermissions } = useAuthStore();

  useEffect(() => {
    setPermissions(permission || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission]);

  const hiddenItemClass = clsx('transition-opacity duration-300', isCompact ? 'opacity-0' : 'opacity-1');

  return (
    <Card className={'h-full bg-transparent'} shadow="none" radius="none">
      <CardHeader>
        <Brand isCompact={isCompact} brandName={'Next Admin'} />
      </CardHeader>
      <CardBody>
        <Menu data={data || []} isCompact={isCompact} />
      </CardBody>
      <CardFooter>
        <User
          avatarProps={{
            src: 'https://avatars.githubusercontent.com/u/30373425?v=4',
          }}
          description={
            <Link isExternal href="https://x.com/jrgarciadev" size="sm">
              @jrgarciadev
            </Link>
          }
          name="Junior Garcia"
          classNames={{
            name: hiddenItemClass,
            description: hiddenItemClass,
          }}
        />
        <Button isIconOnly aria-label="Logout" color="danger" variant="light" className={hiddenItemClass}>
          <Logout03Icon size={20} />
        </Button>
      </CardFooter>
    </Card>
  );
};
