'use client';
import { Sidebar } from '@/components/ui//navigate/Aside/Sidebar';
import { Brand } from '@/components/ui//navigate/Brand';
import { Topbar } from '@/components/ui/navigate/Top/Topbar';
import { Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, useDisclosure } from '@heroui/react';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import AdminLayoutSkeleton from '../skeleton/LayoutSkeleton';
import { useNavivationStore } from '@/store/navigation-store';
import PageContentSkeleton from '../skeleton/PageContentSkeleton';

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const [isCompact, setIsCompact] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pathName = usePathname();
  const { isLoading } = useAuth();
  const { navigating } = useNavivationStore();

  useEffect(() => {
    onClose();
  }, [onClose, pathName]);

  if (isLoading) {
    return <AdminLayoutSkeleton />;
  }

  return (
    <div className={clsx(`text-foreground bg-background`, 'min-h-screen flex flex-row')}>
      {/* SidebarMenu */}
      <aside
        className={clsx(
          'transition-all duration-400 ease-in-out flex flex-col hover:w-64 h-screen',
          'max-md:hidden',
          `${isCompact ? 'w-16' : 'w-64'}`,
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
        className={'md:hidden'}
        placement={'left'}
        backdrop={'blur'}
        radius={'sm'}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1 h-16">
                <Brand isCompact={isCompact} brandName={'Next Admin'} />
              </DrawerHeader>
              <DrawerBody>
                <Sidebar isCompact={isCompact && !showSidebar} />
              </DrawerBody>
              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* SidebarMenu và Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Topbar toggleSidebar={onOpen} setCompactMode={() => setIsCompact(!isCompact)} isCompact={isCompact} />
        {/* Main content */}
        <main className="bg-primary-50 flex-1 p-4 rounded-xl shadow-inner overflow-auto">
          {navigating && <PageContentSkeleton />}
          {!navigating && children}
        </main>
      </div>
    </div>
  );
};
