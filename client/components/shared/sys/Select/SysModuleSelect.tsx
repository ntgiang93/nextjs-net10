'use client';

import { SysCategoryHook } from '@/hooks/sys/sysCategories';
import { Autocomplete, AutocompleteItem } from '@heroui/react';
import { useTranslations } from 'next-intl';

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
  const msg = useTranslations('msg');

  return (
    <Autocomplete
      isLoading={isLoading}
      isVirtualized
      variant="bordered"
      defaultItems={data || []}
      label={msg('module')}
      labelPlacement={labelPlacement}
      selectedKey={value}
      isClearable
      onSelectionChange={(key) => (key === null ? onChange('') : onChange(String(key)))}
      isRequired={isRequired}
      placeholder={`${msg('select')} ${msg('module')}`}
    >
      {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
    </Autocomplete>
  );
}
