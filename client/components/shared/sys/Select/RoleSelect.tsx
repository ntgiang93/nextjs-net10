'use client';

import { RoleHook } from '@/hooks/role';
import { Select, SelectItem, Selection } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

interface IRoleSelectProps {
  value: string[];
  onChange: (values: string[]) => void;
  selectionMode?: 'none' | 'single' | 'multiple';
  isRequired?: boolean;
  labelPlacement: 'outside' | 'inside' | 'outside-left';
  label?: string;
  className?: string;
  variant?: 'bordered' | 'flat' | 'faded' | 'underlined' | undefined;
}

export default function RoleSelect({
  value,
  onChange,
  selectionMode = 'single',
  labelPlacement = 'outside',
  isRequired,
  label,
  className,
  variant = 'flat',
}: IRoleSelectProps) {
  const { data, isLoading } = RoleHook.useGetAll();
  const t = useTranslations('role');

  const items = useMemo(
    () =>
      (data ?? []).map((item) => ({
        key: item.id,
        label: item.name,
      })),
    [data],
  );

  const selectedKeys = useMemo(() => new Set<string>(value ?? []), [value]);

  const handleSelectionChange = (keys: Selection) => {
    if (keys === 'all') return;
    onChange(Array.from(keys as Set<string>));
  };

  return (
    <Select
      aria-label="Role Select"
      isLoading={isLoading}
      isVirtualized
      variant={variant}
      items={items}
      label={label}
      selectionMode={selectionMode}
      labelPlacement={labelPlacement}
      selectedKeys={selectedKeys}
      onSelectionChange={handleSelectionChange}
      maxListboxHeight={200}
      isRequired={isRequired}
      placeholder={t('selectRole')}
      className={className}
    >
      {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
    </Select>
  );
}
