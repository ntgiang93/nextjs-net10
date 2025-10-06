import {
  Button,
  Input,
  InputProps,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@heroui/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import { ArrowDown01Icon, Cancel01Icon, icons } from 'hugeicons-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HugeIcons } from './HugeIcons';

interface IconSelectProps extends Omit<InputProps, 'onChange'> {
  value?: string;
  onChange?: (iconName: string) => void;
}

export const IconSelect = (props: IconSelectProps) => {
  // Your existing props and state
  const {
    label,
    labelPlacement,
    placeholder = 'Select an icon',
    color,
    variant,
    size,
    value,
    onChange,
    ...restProps
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string>(value || '');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [inputWidth, setInputWidth] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Container ref for virtualization
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract all icons from the hugeicons-react library
  const iconList = useMemo(() => {
    return Object.keys(icons)
      .filter((name) => name.endsWith('Icon'))
      .map((name) => name);
  }, []);

  // Filtered icons based on search term
  const filteredIcons = useMemo(() => {
    if (!searchTerm || searchTerm === '') return iconList;
    return iconList.filter((name) =>
      name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [iconList, searchTerm]);

  // Grid configuration
  const COLS = 6;
  const ITEM_SIZE = 40; // Height of each button (10px) + gap (2px)
  //const ITEM_WIDTH = 42; // Width of each button (10px) + gap (2px)

  // Calculate rows based on filtered icons length
  const rowCount = Math.ceil(filteredIcons.length / COLS);

  // Virtual row renderer
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ITEM_SIZE,
    overscan: 10,
  });

  const handleSelectIcon = (iconName: string) => {
    setSelectedIcon(iconName);
    onChange?.(iconName);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedIcon('');
    onChange?.('');
  };

  useEffect(() => {
    setInputWidth(inputRef.current?.getBoundingClientRect().width || 0);
  }, [inputRef]);

  // Reset search when closing popover
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIcon(value || '');
  }, [value]);

  return (
    <Popover
      placement="bottom"
      onOpenChange={setIsOpen}
      triggerType="listbox"
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
          value={selectedIcon || ''}
          placeholder={placeholder}
          size={size}
          startContent={
            selectedIcon && (
              <div className="flex items-center">
                <HugeIcons name={selectedIcon} size={18} />
              </div>
            )
          }
          endContent={
            <>
              {selectedIcon && (
                <Button
                  isIconOnly
                  variant="light"
                  color="default"
                  radius="full"
                  size="sm"
                  className="absolute right-8 top-1/2 -translate-y-1/2"
                  onPress={handleClear}
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
          readOnly
          {...restProps}
        />
      </PopoverTrigger>
      <PopoverContent className="py-2">
        <div style={{ minWidth: inputWidth + 8 }}>
          <div className="px-2 pb-2">
            <Input
              placeholder="Search icons..."
              size="sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="bordered"
            />
          </div>
          <div
            ref={containerRef}
            className="w-full overflow-auto px-2"
            style={{ height: '300px' }}
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const rowStartIndex = virtualRow.index * COLS;

                // Get icons for this row
                return (
                  <div
                    key={virtualRow.index}
                    className="grid grid-cols-6 gap-2"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${ITEM_SIZE}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {Array.from({ length: COLS }).map((_, colIndex) => {
                      const iconIndex = rowStartIndex + colIndex;
                      if (iconIndex >= filteredIcons.length) return null;

                      const iconName = filteredIcons[iconIndex];
                      const Icon = icons[iconName as keyof typeof icons];
                      if (!Icon) return null;

                      return (
                        <Button
                          key={colIndex}
                          isIconOnly
                          variant={
                            selectedIcon === iconName ? 'solid' : 'light'
                          }
                          color={
                            selectedIcon === iconName ? 'primary' : 'default'
                          }
                          className="flex items-center justify-center h-10 w-10"
                          onPress={() => handleSelectIcon(iconName)}
                          title={iconName}
                        >
                          <Icon size={18} />
                        </Button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {filteredIcons.length === 0 && (
            <div className="py-4 text-center text-gray-500">No icons found</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
