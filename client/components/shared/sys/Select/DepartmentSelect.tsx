'use client';

import { TreeListItem } from '@/components/ui/tree/TreeList';
import { TreeSelect } from '@/components/ui/tree/TreeSelect';
import { DepartmentHook } from '@/hooks/orgazination/department';
import { DepartmentDto } from '@/types/sys/Department';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

interface DepartmentSelectProps {
  values: number[];
  onChange: (value: number[]) => void;
  label?: string;
  multiple?: boolean;
  isRequired?: boolean;
  labelPlacement: 'outside' | 'inside' | 'outside-left';
  anyLevel?: boolean;
  isDisabled?: boolean;
}

export default function DepartmentSelect({
  values,
  onChange,
  label = 'Parent Department',
  multiple = false,
  isRequired,
  labelPlacement,
  anyLevel = true,
  isDisabled = false,
}: DepartmentSelectProps) {
  const { data } = DepartmentHook.useGetAll();
  const msg = useTranslations('msg');
  const t = useTranslations('organization');

  const options = useMemo<TreeListItem[]>(() => {
    if (!data) return [];
    const convertToTreeItem = (list: DepartmentDto[]): TreeListItem[] =>
      list.map((item) => ({
        id: item.id,
        title: item.name,
        description: '',
        children: convertToTreeItem(item.children || []),
      }));
    return convertToTreeItem(data);
  }, [data]);

  return (
    <TreeSelect
      variant="bordered"
      items={options}
      label={label}
      selectedIds={values}
      placeholder={`${msg('select')} ${t('department').toLowerCase()}`}
      multiple={multiple}
      isRequired={isRequired}
      selectionMode={multiple ? 'multiple' : 'single'}
      selectionStrategy={anyLevel ? 'all' : 'leaf'}
      labelPlacement={labelPlacement}
      isDisabled={isDisabled}
      onSelectionChange={(selected) => {
        onChange(selected as number[]);
      }}
    />
  );
}
