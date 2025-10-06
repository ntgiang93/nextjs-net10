'use client';

import { RoleHook } from '@/hooks/role';
import { Select, SelectItem } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

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
  const [selected, setSelected] = useState<string[]>();

  useEffect(() => {
    const debouncedOnChange = setTimeout(() => {
      if (selected) onChange(selected);
    }, 400);
    return () => {
      clearTimeout(debouncedOnChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <Select
      aria-label="Role Select"
      isLoading={isLoading}
      isVirtualized
      variant={variant}
      items={data.map((item) => {
        return { key: item.id, label: item.name };
      })}
      label={label}
      selectionMode={selectionMode}
      labelPlacement={labelPlacement}
      defaultSelectedKeys={[...value]}
      maxListboxHeight={200}
      onChange={(e) => {
        const values = e.target.value.split(',') as string[];
        setSelected(values);
      }}
      isRequired={isRequired}
      placeholder={t('selectRole')}
      className={className}
    >
      {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
    </Select>
  );
}
