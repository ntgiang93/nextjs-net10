'use client';

import { TreeItemType } from '@/components/ui//hierarchy/TreeItem';
import { TreeSelect } from '@/components/ui//hierarchy/TreeSelect';
import { MenuHook } from '@/hooks/menu';
import { MenuItem } from '@/types/sys/Menu';
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
  anyLevel = true,
}: IMenuSelectProps) {
  const { data } = MenuHook.useGetMenuTree();

  // Flatten menu tree để hiển thị trong select
  const options = useMemo<TreeItemType[]>(() => {
    if (!data || data == null) return [];

    const convertToTreeItem = (menus: MenuItem[]): TreeItemType[] => {
      return menus.map((menu) => {
        const item: TreeItemType = {
          value: menu.id,
          label: menu.name,
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
      options={options}
      label={label}
      selectedValues={values}
      placeholder="Select a menu"
      multiple={multiple}
      isRequired={isRequired}
      labelPlacement={labelPlacement}
      anyLevel={anyLevel}
      onSelectedChange={(values) => {
        onChange(values as number[]);
      }}
    />
  );
}
