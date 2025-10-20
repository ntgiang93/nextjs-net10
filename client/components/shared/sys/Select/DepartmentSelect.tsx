'use client';

import { TreeItemType } from '@/components/ui/hierarchy/TreeItem';
import { TreeSelect } from '@/components/ui/hierarchy/TreeSelect';
import { DepartmentHook } from '@/hooks/department';
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
}

export default function DepartmentSelect({
  values,
  onChange,
  label = 'Parent Department',
  multiple = false,
  isRequired,
  labelPlacement,
  anyLevel = true,
}: DepartmentSelectProps) {
  const { data } = DepartmentHook.useGetAll();
  const msg = useTranslations('msg');
  const t = useTranslations('organization');

  const options = useMemo<TreeItemType[]>(() => {
    if (!data) return [];

    const convertToTreeItem = (list: DepartmentDto[]): TreeItemType[] =>
      list.map((item) => ({
        value: item.id,
        label: item.name,
        children: convertToTreeItem(item.children || []),
      }));

    return convertToTreeItem(data);
  }, [data]);

  return (
    <TreeSelect
      variant="bordered"
      options={options}
      label={label}
      selectedValues={values}
      placeholder={`${msg('select')} ${t('department').toLowerCase()}`}
      multiple={multiple}
      isRequired={isRequired}
      labelPlacement={labelPlacement}
      anyLevel={anyLevel}
      onSelectedChange={(selected) => {
        onChange(selected as number[]);
      }}
    />
  );
}
