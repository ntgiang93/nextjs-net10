'use client';
import PageContentSkeleton from '@/components/ui/skeleton/PageContentSkeleton';
import { Skeleton } from '@heroui/react';
import clsx from 'clsx';

export default function AdminLayoutSkeleton() {
  return (
    <div className={clsx(`text-foreground bg-background`, 'min-h-screen flex flex-row')}>
      {/* SidebarMenu */}
      <aside className={'h-screen w-64'}>
        <div className="flex p-3 items-center h-16">
          <Skeleton className="flex w-full h-10 rounded-lg" />
        </div>
        <div className="flex flex-col justify-center p-3 gap-3">
          {Array(10)
            .fill(0)
            .map((_, index) => (
              <Skeleton key={index} className="h-8 w-full rounded-lg" />
            ))}
        </div>
      </aside>
      {/* Drawer side bar */}

      {/* SidebarMenu và Main content */}
      <div className="flex-1 flex flex-col">
        <div className="h-16 flex items-center justify-between px-4">
          <Skeleton className="flex w-6 h-6 rounded-lg" />
          <div className="flex items-center justify-end gap-3">
            <Skeleton className="flex w-6 h-6 rounded-lg" />
            <Skeleton className="flex w-6 h-6 rounded-lg" />
            <Skeleton className="flex w-6 h-6 rounded-lg" />
            <Skeleton className="flex w-10 h-10 rounded-full" />
          </div>
        </div>
        <div className="bg-primary-50 flex-1 p-4 rounded-xl shadow-inner overflow-auto">
          <PageContentSkeleton />
        </div>
      </div>
    </div>
  );
}
