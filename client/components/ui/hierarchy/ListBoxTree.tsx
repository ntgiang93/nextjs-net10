'use client';
import React, { useState } from 'react';
import { SIDEBAR_MOCK_DATA } from '@/model/data/menuData';
import { ScrollShadow, Select, SelectItem, SelectSection } from '@heroui/react';
import { ArrowRight01Icon } from 'hugeicons-react';
import { TreeItem, TreeItem } from '@/components/ui//hierarchy/TreeItem'; // Assuming ArrowRight01Icon is an imported icon.

interface IListBoxTreeProps {
  items: TreeItem[];
  color?:
    | 'primary'
    | 'default'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger';
  variant?: 'solid' | 'bordered' | 'flat' | 'shadow';
}

export const ListBoxTree = (props: IListBoxTreeProps) => {
  const { items, color, variant } = props;
  const [selectedItem, setSelectedItem] = useState<Set<string>>(new Set());

  return (
    <ScrollShadow hideScrollBar className={'w-full text-sm'} as={'ul'}>
      {items.map((item, index) => (
        <TreeItem
          item={item}
          key={index}
          color={color}
          selectedItem={selectedItem}
          variant={variant}
          onSelected={(values) => {
            setSelectedItem(new Set(values));
          }}
          anyLevel={true}
        />
      ))}
    </ScrollShadow>
  );
};
