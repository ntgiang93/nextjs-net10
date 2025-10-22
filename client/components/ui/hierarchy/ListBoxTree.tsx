'use client';
import { TreeItem, TreeItemType } from '@/components/ui//hierarchy/TreeItem'; // Assuming ArrowRight01Icon is an imported icon.
import { ScrollShadow } from '@heroui/react';
import { useMemo } from 'react';

interface IListBoxTreeProps {
  items: TreeItemType[];
  selectedValues: string[] | number[];
  onSelectedChange: (value: string[] | number[]) => void;
  multiple?: boolean;
  anyLevel?: boolean;
}

export const ListBoxTree = (props: IListBoxTreeProps) => {
  const { items, selectedValues, anyLevel, onSelectedChange, multiple } = props;

  const selected = useMemo(() => new Set<string | number>(selectedValues), [selectedValues]);

  const handleSelected = (values: Set<string | number>) => {
    onSelectedChange(Array.from(values) as any[]);
  };

  return (
    <ScrollShadow hideScrollBar className={'w-full'}>
      {items.map((item, index) => (
        <TreeItem
          item={item}
          key={index}
          selectedItem={selected}
          onSelected={handleSelected}
          anyLevel={anyLevel}
          multiple={multiple}
        />
      ))}
    </ScrollShadow>
  );
};
