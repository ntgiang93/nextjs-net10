'use client';

import { Listbox, ListboxItem, Selection, User } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

export type UserListboxData = {
  id: string;
  fullName: string;
  userName: string;
  avatar: string;
};

interface IUserListboxProps {
  data: UserListboxData[];
  value: string[];
  onChange: (values: number[]) => void;
  selectionMode?: 'none' | 'single' | 'multiple';
  isRequired?: boolean;
  labelPlacement: 'outside' | 'inside' | 'outside-left';
  label?: string;
  className?: string;
  variant?: 'bordered' | 'flat' | 'faded' | 'underlined' | undefined;
}

export default function UserListbox({
  data,
  value,
  onChange,
  selectionMode = 'single',
  labelPlacement = 'outside',
  isRequired,
  label,
  className,
  variant = 'flat',
}: IUserListboxProps) {
  const t = useTranslations('role');

  //   const items = useMemo(
  //     () =>
  //       (data ?? []).map((item) => (item)),
  //     [data],
  //   );

  const selectedKeys = useMemo(() => new Set<string>(value ?? []), [value]);

  const handleSelectionChange = (keys: Selection) => {
    if (keys === 'all') return;
    onChange(Array.from(keys as Set<number>));
  };

  return (
    <Listbox
      isVirtualized
      className="max-w-xs"
      label={'Select from 1000 items'}
      items={data}
      virtualization={{
        maxListboxHeight: 400,
        itemHeight: 40,
      }}
    >
      {(item) => (
        <ListboxItem key={item.id}>
          <User
            className="justify-start"
            avatarProps={{
              src: item.avatar || `https://ui-avatars.com/api/?name=${item.fullName}`,
              alt: 'Avatar',
              size: 'lg',
              isBordered: true,
              color: 'primary',
            }}
            description={`ID: ${item.userName}`}
            name={<span className="text-lg font-semibold">{item.fullName || 'Unknow User'}</span>}
          />
        </ListboxItem>
      )}
    </Listbox>
  );
}
