'use client';
import DotFillIcon from '@/components/ui//icon/DotFillIcon';
import { HugeIcons } from '@/components/ui//icon/HugeIcons';
import { useNavivationStore } from '@/store/navigation-store';
import { MenuItem } from '@/types/sys/Menu';
import { Accordion, AccordionItem, ScrollShadow } from '@heroui/react';
import clsx from 'clsx';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

interface ISidebarMenuProps {
  data: MenuItem[];
  isCompact: boolean;
}

export const Menu = (props: ISidebarMenuProps) => {
  const { data, isCompact } = props;
  const { setNavigating } = useNavivationStore();
  const router = useRouter();
  const pathName = usePathname();

  const handleNavigation = (url: string) => {
    setNavigating(true);
    router.push(url);
  };

  const GenerateMenu = useCallback(
    (menuData: MenuItem[], parentKey: string = '', level: number = 0) => {
      const getExpandIndex = (data: MenuItem[]): number => {
        const item = data.find((item) => pathName.includes(`${item.url}/`) && item.url !== '/');
        if (item) {
          return item.id;
        } else return 0;
      };

      const expandIndex = getExpandIndex(menuData);

      const isItemActive = (item: MenuItem, index: number): boolean =>
        pathName === item.url || (index === expandIndex && isCompact);

      const getClassNames = (isActive: boolean, hasChildren: boolean) => {
        return {
          item: clsx(
            'px-2.5 py-1.5 my-1 text-nowrap rounded-md group',
            !isActive && 'has-[:hover]:bg-default/30',
            isActive && 'bg-primary',
          ),
          title: clsx(
            'transition-opacity duration-300',
            !isActive && 'group-hover:cursor-pointer',
            isActive ? 'text-white' : '',
            isCompact ? 'opacity-0' : 'opacity-100',
          ),
          startContent: clsx('py-1 group-hover:cursor-pointer', isActive ? 'text-white' : ''),
          content: clsx(
            `${hasChildren && !isCompact ? '' : 'hidden'}`,
            hasChildren && 'ms-2 ps-2 py-1 border-l border-default',
          ),
        };
      };

      console.log('exphand', expandIndex);

      return (
        <Accordion
          showDivider={false}
          defaultExpandedKeys={isCompact ? undefined : ['1']}
          className="px-0"
        >
          {menuData.map((item, index) => {
            const hasChildren = !!item.children?.length;
            const key = `${parentKey}${index}`;
            const isActive = isItemActive(item, index);
            const classNames = getClassNames(isActive, hasChildren);

            return (
              <AccordionItem
                key={item.id}
                aria-label={item.name}
                title={item.name}
                hideIndicator={!hasChildren || isCompact}
                className={classNames.item}
                classNames={{
                  content: classNames.content,
                  trigger: 'py-0',
                  title: classNames.title,
                  startContent: classNames.startContent,
                  indicator: 'text-secondary group-hover:cursor-pointer',
                }}
                startContent={
                  parentKey && !item.icon ? (
                    <span className={'w-4 flex justify-center'}>
                      <DotFillIcon width={6} height={6} />
                    </span>
                  ) : (
                    <HugeIcons name={item.icon || 'command'} size={18} />
                  )
                }
                onPress={() => {
                  if (!hasChildren) handleNavigation(item.url);
                }}
              >
                {hasChildren && !isCompact && GenerateMenu(item.children || [], key, level + 1)}
              </AccordionItem>
            );
          })}
        </Accordion>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, pathName, isCompact],
  );

  const menu = useMemo(() => GenerateMenu(data), [data, GenerateMenu]);

  return (
    <ScrollShadow hideScrollBar className="h-[calc(100vh-11rem)] max-w-[calc(256-24px)] w-full">
      {menu}
    </ScrollShadow>
  );
};
