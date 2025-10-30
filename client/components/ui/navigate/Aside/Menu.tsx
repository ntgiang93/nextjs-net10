'use client';
import { useNavivationStore } from '@/store/navigation-store';
import { MenuItem } from '@/types/sys/Menu';
import { ScrollShadow } from '@heroui/react';
import SidebarBody, { SidebarNodeType } from './SidebarBody';

interface ISidebarMenuProps {
  data: MenuItem[];
  isCompact: boolean;
}

export const Menu = (props: ISidebarMenuProps) => {
  const { data, isCompact } = props;
  const { setNavigating } = useNavivationStore();

  return (
    <ScrollShadow hideScrollBar className="h-[calc(100vh-11rem)] max-w-[calc(256-24px)] w-full">
      <SidebarBody items={data as SidebarNodeType[]} />
    </ScrollShadow>
  );
};
