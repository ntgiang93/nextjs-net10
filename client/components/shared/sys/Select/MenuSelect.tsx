'use client';

import { TreeListItem } from '@/components/ui/tree/TreeList';
import { TreeSelect } from '@/components/ui/tree/TreeSelect';
import { MenuHook } from '@/hooks/menu';
import { MenuItem } from '@/types/sys/Menu';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

interface IMenuSelectProps {
  values: number[];
  onChange: (value: number[]) => void;
  label?: string;
  multiple?: boolean;
  isRequired?: boolean;
  labelPlacement: 'outside' | 'inside' | 'outside-left';
  anyLevel?: boolean;
}

export default function MenuSelect({
  values,
  onChange,
  label = 'Parent Menu',
  multiple = false,
  isRequired,
  labelPlacement,
}: IMenuSelectProps) {
  const { data } = MenuHook.useGetMenuTree();
  const msg = useTranslations('msg');
  const t = useTranslations('menu');
  // Flatten menu tree để hiển thị trong select
  const options = useMemo<TreeListItem[]>(() => {
    if (!data || data == null) return [];

    const convertToTreeItem = (menus: MenuItem[]): TreeListItem[] => {
      return menus.map((menu) => {
        const item: TreeListItem = {
          id: menu.id,
          title: menu.name,
          description: menu.url,
          children: convertToTreeItem(menu.children || []) || [],
        };
        return item;
      });
    };
    return convertToTreeItem(data);
  }, [data]);

  return (
    <TreeSelect
      variant="bordered"
      items={options}
      label={label}
      selectedIds={values}
      placeholder={`${msg('select')} ${t('menu')}`}
      multiple={multiple}
      isRequired={isRequired}
      selectionMode="single"
      selectionStrategy="all"
      labelPlacement={labelPlacement}
      onSelectionChange={(values) => {
        onChange(values as number[]);
      }}
    />
  );
}
