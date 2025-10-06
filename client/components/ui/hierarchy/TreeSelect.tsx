import { TreeItem, TreeItemType } from '@/components/ui//hierarchy/TreeItem';
import {
  Button,
  Input,
  InputProps,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollShadow,
} from '@heroui/react';
import { motion } from 'framer-motion';
import { ArrowDown01Icon, Cancel01Icon } from 'hugeicons-react';
import React, { useEffect, useState } from 'react';

interface ITreeSelectProps extends InputProps {
  options: TreeItemType[];
  selectedValues: string[] | number[];
  onSelectedChange: (value: string[] | number[]) => void;
  mutilple?: boolean;
  anyLevel?: boolean;
}

export const TreeSelect = (props: ITreeSelectProps) => {
  const {
    options,
    label,
    labelPlacement,
    placeholder,
    color,
    variant,
    size,
    multiple,
    selectedValues,
    anyLevel,
    onSelectedChange,
  } = props;
  const [isOpen, setIsOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [inputWidth, setInputWidth] = useState<number>(0);
  const [flatOptions, setFlatOptions] = useState<TreeItemType[]>([]);

  const handleSelected = (values: Set<string | number>) => {
    setSelected(new Set(values));
    if (!multiple) {
      setIsOpen(false);
    }
    onSelectedChange(Array.from(values) as any[]);
  };

  const handleClear = () => {
    setSelected(new Set());
    setSelectedLabel('');
    onSelectedChange([]);
  };

  const flattenOptions = (options: TreeItemType[]): TreeItemType[] => {
    return options.reduce<TreeItemType[]>((acc, item) => {
      acc.push(item);
      if (item.children) {
        acc.push(...flattenOptions(item.children));
      }
      return acc;
    }, []);
  };

  useEffect(() => {
    setInputWidth(inputRef.current?.getBoundingClientRect().width || 0);
  }, [inputRef]);

  useEffect(() => {
    const flatten = flattenOptions(options);
    setFlatOptions(flatten);
  }, [options]);

  useEffect(() => {
    setSelected(
      new Set(selectedValues ? selectedValues.map((item) => item) : []),
    );
  }, [selectedValues]);

  useEffect(() => {
    const selectItems = flatOptions.filter((item) => selected.has(item.value));
    setSelectedLabel(selectItems.map((item) => item.label).join(', '));
  }, [selected]);

  useEffect(() => {
    setSelected(new Set());
  }, []);

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
          startContent={
            selected.size > 0 && (
              <Button
                isIconOnly
                variant="light"
                color="default"
                radius={'full'}
                size={'sm'}
                className="absolute right-8 top-1/2 -translate-y-1/2"
                onPress={handleClear}
              >
                <Cancel01Icon size={14} />
              </Button>
            )
          }
          endContent={
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
          }
        />
      </PopoverTrigger>
      <PopoverContent className={`py-2 max-h-60`}>
        <div style={{ minWidth: inputWidth + 8 }}>
          <ScrollShadow hideScrollBar className={'w-full'}>
            {options.map((item, index) => (
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
        </div>
      </PopoverContent>
    </Popover>
  );
};
