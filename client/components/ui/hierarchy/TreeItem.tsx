import { Button } from '@heroui/react';
import { motion } from 'framer-motion';
import { ArrowRight01Icon } from 'hugeicons-react';
import React, { useMemo, useState, useCallback } from 'react';
import clsx from 'clsx';
import { SelectedIcon } from '@/components/ui//icon/SelectedIcon';

export interface TreeItemType {
  value: string | number;
  label: string;
  children: TreeItemType[];
}

interface ITreeItemProps {
  item: TreeItemType;
  heightUpdate?: (childrenHeight: number) => void;
  itemRenderer?: (item: TreeItemType) => React.ReactNode;
  selectedItem: Set<string | number>;
  onSelected: (values: Set<string | number>) => void;
  multiple?: boolean;
  anyLevel?: boolean;
}

export const TreeItem: React.FC<ITreeItemProps> = (props) => {
  const {
    item,
    heightUpdate,
    itemRenderer,
    selectedItem,
    onSelected,
    anyLevel,
    multiple,
  } = props;
  const [isExpanded, setIsExpanded] = useState(false);
  const childrenCount = item.children.length;
  const [height, setHeight] = useState(36 * childrenCount);

  const handleExpand = useCallback(() => {
    if (heightUpdate) {
      if (!isExpanded) {
        heightUpdate(height);
      } else {
        heightUpdate(-height);
      }
    }
    setHeight(36 * childrenCount);
    setIsExpanded(!isExpanded);
  }, [childrenCount, height, heightUpdate, isExpanded]);

  const isSelected = useMemo(
    () => selectedItem.has(item.value),
    [selectedItem, item.value],
  );
  const canSelect = useMemo(
    () => anyLevel || item.children.length === 0,
    [anyLevel, item.children.length],
  );

  const handleSelected = useCallback(
    (value: string | number) => {
      if (!canSelect) return;

      const newSelected = new Set(selectedItem);
      if (multiple) {
        if (newSelected.has(value)) {
          newSelected.delete(value);
        } else {
          newSelected.add(value);
        }
      } else {
        newSelected.clear();
        newSelected.add(value);
      }
      onSelected(newSelected);
    },
    [canSelect, multiple, onSelected, selectedItem],
  );

  return (
    <li className={'flex flex-col justify-start min-w-full w-fit my-0.5'}>
      <div
        className={
          'bg-content1 flex flex-row gap-1 justify-start min-w-full items-center'
        }
        key={item.value}
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={isExpanded ? { rotate: 90 } : { rotate: 0 }}
          transition={{ duration: 0.4, ease: [0, 0.71, 0.2, 1.01] }}
        >
          <Button
            isIconOnly
            radius={'full'}
            size={'sm'}
            color={'default'}
            variant="light"
            className={clsx(childrenCount > 0 ? 'opacity-100' : 'opacity-0')}
            onPress={handleExpand}
            disabled={childrenCount === 0}
          >
            <ArrowRight01Icon size={16} />
          </Button>
        </motion.div>
        <div
          onClick={() => handleSelected(item.value)}
          className={clsx(
            'hover:cursor-pointer rounded-md w-full px-2 py-1.5 text-nowrap flex flex-row justify-between items-center',
            canSelect ? 'hover:bg-default hover:text-foreground' : '',
            isSelected ? 'bg-default text-foreground' : '',
          )}
        >
          <span>{itemRenderer ? itemRenderer(item) : item.label}</span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={isSelected ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4, ease: [0, 0.71, 0.2, 1.01] }}
          >
            <SelectedIcon isSelected={isSelected} size={14} />
          </motion.span>
        </div>
      </div>
      <motion.ul
        className={'ml-4 relative overflow-hidden border-l pl-1'}
        initial={{ height: 0, opacity: 0 }}
        animate={
          isExpanded
            ? { height: height, opacity: 1 }
            : { height: 0, opacity: 0 }
        }
        transition={{ duration: 0.4, ease: [0, 0.71, 0.2, 1.01] }}
      >
        {isExpanded &&
          item.children.map((child) => (
            <TreeItem
              key={child.value}
              item={child}
              heightUpdate={(value) => {
                setHeight(height + value);
                heightUpdate?.(value);
              }}
              selectedItem={selectedItem}
              onSelected={(values) => onSelected(values)}
              multiple={multiple}
              anyLevel={anyLevel}
            />
          ))}
      </motion.ul>
    </li>
  );
};
