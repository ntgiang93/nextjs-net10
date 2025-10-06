'use client';

import { SysCategoryHook } from '@/hooks/sysCategories';
import { Autocomplete, AutocompleteItem } from '@heroui/react';

interface ISysModuleSelectProps {
  value: string;
  onChange: (value: string) => void;
  multiple?: boolean;
  isRequired?: boolean;
  labelPlacement: 'outside' | 'inside' | 'outside-left';
}

export default function SysModuleSelect({
  value,
  onChange,
  labelPlacement = 'outside',
  isRequired,
}: ISysModuleSelectProps) {
  const { data, isLoading } = SysCategoryHook.useGetSysModule();

  return (
    <Autocomplete
      isLoading={isLoading}
      isVirtualized
      variant="bordered"
      defaultItems={data}
      label="System Module"
      labelPlacement={labelPlacement}
      selectedKey={value}
      isClearable
      onSelectionChange={(key) => (key === null ? onChange('') : onChange(String(key)))}
      isRequired={isRequired}
      placeholder="Select system module"
    >
      {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
    </Autocomplete>
  );
}
