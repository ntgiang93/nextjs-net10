'use client';
import { Sidebar } from '@/components/ui//navigate/Aside/Sidebar';
import { Topbar } from '@/components/ui/navigate/Top/Topbar';
import { UserHook } from '@/hooks/user';
import { useNavivationStore } from '@/store/navigation-store';
import { Drawer, DrawerBody, DrawerContent, useDisclosure } from '@heroui/react';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import AdminLayoutSkeleton from '../skeleton/LayoutSkeleton';
import PageContentSkeleton from '../skeleton/PageContentSkeleton';
import { useAuth } from './AuthProvider';

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const [isCompact, setIsCompact] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pathName = usePathname();
  const { isLoading } = useAuth();
  const { navigating } = useNavivationStore();
  const {} = UserHook.useGetMe(!isLoading);

  useEffect(() => {
    onClose();
  }, [onClose, pathName]);

  if (isLoading) {
    return <AdminLayoutSkeleton />;
  }

  return (
    <div
      className={clsx(
        `text-foreground bg-background overflow-hidden`,
        'min-h-screen flex flex-row',
      )}
    >
      {/* SidebarMenu */}
      <aside
        className={clsx(
          'transition-all duration-400 ease-in-out flex flex-col hover:w-64 h-screen flex-shrink-0',
          'max-md:hidden',
          `${isCompact ? 'w-20' : 'w-64'}`,
        )}
        onMouseEnter={() => setShowSidebar(isCompact)}
        onMouseLeave={() => {
          if (isCompact) setShowSidebar(false);
        }}
      >
        <Sidebar isCompact={isCompact && !showSidebar} />
      </aside>
      {/* Drawer side bar */}
      <Drawer
        isOpen={isOpen}
        size={'sm'}
        onClose={onClose}
        className={'md:hidden w-fit'}
        placement={'left'}
        backdrop={'blur'}
        radius={'sm'}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerBody>
                <Sidebar isCompact={isCompact && !showSidebar} />
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* SidebarMenu và Main content */}
      <div className="w-full flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Topbar
          toggleSidebar={onOpen}
          setCompactMode={() => setIsCompact(!isCompact)}
          isCompact={isCompact}
        />
        {/* Main content */}
        <main className="bg-primary-50 h-[calc(100vh-4rem)] p-4 rounded-xl shadow-inner overflow-auto">
          {navigating && <PageContentSkeleton />}
          {!navigating && children}
        </main>
      </div>
    </div>
  );
};
