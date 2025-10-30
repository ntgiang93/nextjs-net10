import { Button, Input, InputProps, Popover, PopoverContent, PopoverTrigger } from '@heroui/react';
import { motion } from 'framer-motion';
import { ArrowDown01Icon, Cancel01Icon } from 'hugeicons-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import TreeList, { TreeListItem, TreeListProps } from './TreeList';

interface ITreeSelectProps extends InputProps, TreeListProps {}

export const TreeSelect = (props: ITreeSelectProps) => {
  const {
    items,
    label,
    labelPlacement,
    placeholder,
    color,
    variant,
    size,
    selectedIds,
    selectionMode,
    selectionStrategy,
    onSelectionChange,
    searchable,
    defaultExpandedIds,
  } = props;
  const [isOpen, setIsOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [inputWidth, setInputWidth] = useState<number>(0);

  const getSelectedLabel = useCallback((items: TreeListItem[]) => {
    return items.reduce<string[]>((acc, item) => {
      const matchChildren = getSelectedLabel(item.children || []);
      if (selectedIds?.includes(item.id)) {
        acc.push(item.title);
      }
      if (matchChildren.length > 0) {
        acc.push(...matchChildren);
      }
      return acc;
    }, []);
  }, []);

  const selectedLabel = useMemo(() => {
    console.log('selectedIds', selectedIds);
    const getSelectedLabel = (items: TreeListItem[]) => {
      return items.reduce<string[]>((acc, item) => {
        const matchChildren = getSelectedLabel(item.children || []);
        if (selectedIds?.includes(item.id)) {
          acc.push(item.title);
        }
        if (matchChildren.length > 0) {
          acc.push(...matchChildren);
        }
        return acc;
      }, []);
    };
    const result = getSelectedLabel(items).join(', ');
    return result;
  }, [selectedIds, items]);

  useEffect(() => {
    setInputWidth(inputRef.current?.getBoundingClientRect().width || 0);
  }, [inputRef]);

  return (
    <Popover
      placement={'bottom'}
      onOpenChange={(open) => setIsOpen(open)}
      triggerType={'listbox'}
      offset={10}
      crossOffset={8}
      isOpen={isOpen}
    >
      <PopoverTrigger>
        <Input
          ref={inputRef}
          classNames={{
            base: 'w-full group',
            innerWrapper: 'group-hover:cursor-pointer',
            input: 'h-full text-left group-hover:cursor-pointer',
          }}
          labelPlacement={labelPlacement}
          label={label}
          color={color}
          variant={variant}
          value={selectedLabel}
          placeholder={placeholder}
          size={size}
          endContent={
            <>
              {selectedLabel && selectedLabel.length > 0 && (
                <Button
                  isIconOnly
                  variant="light"
                  color="default"
                  radius="full"
                  size="sm"
                  className="absolute right-8 top-1/2 -translate-y-1/2"
                  onPress={() => onSelectionChange?.([])}
                >
                  <Cancel01Icon size={14} />
                </Button>
              )}
              <motion.div
                initial={{ rotate: 0 }}
                animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
                transition={{
                  duration: 0.4,
                  ease: [0, 0.71, 0.2, 1.01],
                }}
              >
                <ArrowDown01Icon size={16} />
              </motion.div>
            </>
          }
        />
      </PopoverTrigger>
      <PopoverContent className={`py-2`}>
        <div style={{ minWidth: inputWidth + 8 }}>
          <TreeList
            items={items}
            selectionMode={selectionMode}
            selectionStrategy={selectionStrategy}
            selectedIds={selectedIds}
            onSelectionChange={onSelectionChange}
            searchable={searchable}
            defaultExpandedIds={defaultExpandedIds}
            contentHeight={240}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
