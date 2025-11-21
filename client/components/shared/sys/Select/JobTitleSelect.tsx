'use client';

import { JobTitleHook } from '@/hooks/orgazination/jobTitle';
import { Select, SelectItem, Selection } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

interface JobTitleSelectProps {
  value?: number | null;
  onChange: (value?: number) => void;
  selectionMode?: 'none' | 'single';
  isRequired?: boolean;
  labelPlacement?: 'outside' | 'inside' | 'outside-left';
  label?: string;
  className?: string;
  variant?: 'bordered' | 'flat' | 'faded' | 'underlined';
}

export default function JobTitleSelect({
  value,
  onChange,
  selectionMode = 'single',
  labelPlacement = 'outside',
  isRequired,
  label,
  className,
  variant = 'bordered',
}: JobTitleSelectProps) {
  const { data, isLoading } = JobTitleHook.useGetAll();
  const t = useTranslations('organization');
  const msg = useTranslations('msg');

  const items = useMemo(
    () =>
      (data ?? []).map((item) => ({
        key: item.id.toString(),
        value: item.id,
        label: item.name,
      })),
    [data],
  );

  const selectedKeys = useMemo(() => {
    if (value && value > 0) {
      return new Set<string>([value.toString()]);
    }
    return new Set<string>();
  }, [value]);

  const handleSelectionChange = (keys: Selection) => {
    if (keys === 'all') return;
    const selected = Array.from(keys as Set<string>);
    const first = selected[0];
    onChange(first ? Number(first) : undefined);
  };

  return (
    <Select
      aria-label="job-title-select"
      isLoading={isLoading}
      items={items}
      variant={variant}
      selectionMode={selectionMode}
      labelPlacement={labelPlacement}
      selectedKeys={selectedKeys}
      onSelectionChange={handleSelectionChange}
      isRequired={isRequired}
      label={label ?? t('jobTitle')}
      placeholder={`${msg('select')} ${t('jobTitle').toLowerCase()}`}
      className={className}
    >
      {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
    </Select>
  );
}
