'use client';
import { TreeItem, TreeItemType } from '@/components/ui//hierarchy/TreeItem'; // Assuming ArrowRight01Icon is an imported icon.
import { ScrollShadow } from '@heroui/react';
import { useCallback, useMemo } from 'react';

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

  const handleSelected = useCallback(
    (values: Set<string | number>) => {
      onSelectedChange(Array.from(values) as any[]);
    },
    [onSelectedChange],
  );

  return (
    <ScrollShadow className={'w-fit'}>
      <ul>
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
      </ul>
    </ScrollShadow>
  );
};
