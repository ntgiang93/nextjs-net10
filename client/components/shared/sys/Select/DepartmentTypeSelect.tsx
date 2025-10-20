'use client';

import { DepartmentTypeHook } from '@/hooks/departmentType';
import { Select, SelectItem, Selection } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

interface DepartmentTypeSelectProps {
  value: string[];
  onChange: (values: string[]) => void;
  selectionMode?: 'none' | 'single' | 'multiple';
  isRequired?: boolean;
  labelPlacement?: 'outside' | 'inside' | 'outside-left';
  label?: string;
  className?: string;
  variant?: 'bordered' | 'flat' | 'faded' | 'underlined';
}

export default function DepartmentTypeSelect({
  value,
  onChange,
  selectionMode = 'single',
  labelPlacement = 'outside',
  isRequired,
  label,
  className,
  variant = 'flat',
}: DepartmentTypeSelectProps) {
  const { data, isLoading } = DepartmentTypeHook.useGetAll();
  const t = useTranslations('organization');

  const items = useMemo(
    () =>
      (data ?? []).map((item) => ({
        key: item.code,
        label: item.name,
      })),
    [data],
  );

  const selectedKeys = useMemo(() => new Set<string>(value ?? []), [value]);

  const handleSelectionChange = (keys: Selection) => {
    if (keys === 'all') return;
    const next = Array.from(keys as Set<string>);
    onChange(next);
  };

  return (
    <Select
      aria-label="Department Type Select"
      isLoading={isLoading}
      isVirtualized
      variant={variant}
      items={items}
      label={label ?? t('departmentType')}
      selectionMode={selectionMode}
      labelPlacement={labelPlacement}
      selectedKeys={selectedKeys}
      onSelectionChange={handleSelectionChange}
      maxListboxHeight={220}
      isRequired={isRequired}
      placeholder={t('departmentType')}
      className={className}
    >
      {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
    </Select>
  );
}
