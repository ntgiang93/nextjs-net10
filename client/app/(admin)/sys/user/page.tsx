'use client';
import RoleSelect from '@/components/shared/sys/Select/RoleSelect';
import { HugeIcons } from '@/components/ui//icon/HugeIcons';
import { ConfirmModal } from '@/components/ui//overlay/ConfirmModal';
import { ExtButton } from '@/components/ui/button/ExtButton';
import AsyncDataTable from '@/components/ui/data-table/AsyncDataTable';
import { SearchInput } from '@/components/ui/input/SearchInput';
import { useAuth } from '@/components/ui/layout/AuthProvider';
import { PageHeader } from '@/components/ui/navigate/PageHeader';
import { UserHook } from '@/hooks/user';
import { defaultUserTableRequest, UserTableDto, UserTableRequestDto } from '@/types/sys/User';
import { Button, Chip, Select, SelectItem, Tooltip, useDisclosure, User } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { Add01Icon, Delete02Icon, Edit01Icon, UserAccountIcon } from 'hugeicons-react';
import { useEffect, useMemo, useState } from 'react';
import UserDetailModal from './components/UserDetailModal';
import { useTranslations } from 'next-intl';

export default function Menu() {
  const t = useTranslations('user');
  const tr = useTranslations('role');
  const msg = useTranslations('msg');
  const [filter, setFilter] = useState<UserTableRequestDto>({
    ...defaultUserTableRequest,
  });
  const { data, refetch, isFetching } = UserHook.useGetPagination(filter);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: IsOpenDel, onOpen: onOpenDel, onOpenChange: OnOpenDelChange } = useDisclosure();
  const [selectUserId, setSelectUserId] = useState<string>('0');
  const { mutateAsync: del, isSuccess: delSuccess } = UserHook.useDelete(selectUserId);
  const { navigate } = useAuth();

  const columns = useMemo<ColumnDef<UserTableDto>[]>(
    () => [
      {
        id: 'fullName',
        accessorKey: 'fullName',
        header: () => <span>{t('fullName')}</span>,
        footer: (props) => props.column.id,
        cell: ({ row }) => {
          return (
            <User
              avatarProps={{
                src: row.original.avatar || `https://ui-avatars.com/api/?name=${row.original.fullName}`,
                alt: 'Avatar',
              }}
              name={row.original.fullName}
            />
          );
        },
        minSize: 200,
        meta: {
          pinned: 'left',
        },
      },
      {
        id: 'username',
        accessorKey: 'username',
        header: () => t('account'),
        footer: (props) => props.column.id,
        minSize: 150,
      },
      {
        id: 'email',
        accessorKey: 'email',
        header: () => t('email'),
        footer: (props) => props.column.id,
        size: 150,
        cell: ({ cell }) => {
          return <HugeIcons name={(cell.getValue() as string) || ''} />;
        },
        meta: {
          align: 'center',
        },
      },
      {
        id: 'roles',
        accessorKey: 'roles',
        header: () => tr('role'),
        footer: (props) => props.column.id,
        size: 200,
        cell: ({ row }) => {
          return <span>{row.original.roles.join(' - ')}</span>;
        },
        meta: {
          align: 'center',
        },
      },
      {
        id: 'isActive',
        accessorKey: 'isActive',
        header: msg('status'),
        footer: (props) => props.column.id,
        cell: ({ row }) => {
          return row.original.isLocked ? (
            <Chip color="danger" variant="dot">
              Locked
            </Chip>
          ) : row.original.isActive ? (
            <Chip color="success" variant="dot">
              Active
            </Chip>
          ) : (
            <Chip color="danger" variant="dot">
              Inactive
            </Chip>
          );
        },
        size: 100,
      },
      {
        accessorKey: 'actions',
        header: msg('actions'),
        footer: (props) => props.column.id,
        size: 100,
        cell: ({ row }) => {
          return (
            <div className="relative flex items-center gap-2">
              {' '}
              <Tooltip content={t('userDetails')}>
                <Button
                  isIconOnly
                  aria-label="expand-button"
                  color="primary"
                  variant="light"
                  radius="full"
                  size="sm"
                  onPress={() => {
                    navigate(`/sys/user/${row.original.id}`);
                  }}
                >
                  <UserAccountIcon size={16} />
                </Button>
              </Tooltip>
              <Tooltip content={t('editUser')}>
                <Button
                  isIconOnly
                  aria-label="expand-button"
                  color="primary"
                  variant="light"
                  radius="full"
                  size="sm"
                  onPress={() => {
                    setSelectUserId(row.original.id);
                    onOpen();
                  }}
                >
                  <Edit01Icon size={16} />
                </Button>
              </Tooltip>
              <Tooltip color="danger" content={msg('delete')}>
                <Button
                  isIconOnly
                  aria-label="expand-button"
                  color="danger"
                  variant="light"
                  radius="full"
                  size="sm"
                  onPress={() => {
                    setSelectUserId(row.original.id);
                    onOpenDel();
                  }}
                >
                  <Delete02Icon size={16} />
                </Button>
              </Tooltip>
            </div>
          );
        },
        meta: {
          align: 'center',
        },
      },
    ],
    [navigate, onOpenDel],
  );

  useEffect(() => {
    refetch();
    setSelectUserId('0');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delSuccess]);

  return (
    <div className={'h-full flex flex-col gap-2'}>
      <PageHeader
        title={'Danh sách người dùng'}
        toolbar={
          <>
            <ExtButton
              color="primary"
              startContent={<Add01Icon size={16} />}
              variant="shadowSmall"
              onPress={() => {
                setSelectUserId('0');
                onOpen();
              }}
            >
              {msg('add')}
            </ExtButton>
          </>
        }
      ></PageHeader>
      <AsyncDataTable
        columns={columns}
        data={data.items}
        isLoading={isFetching}
        fetch={refetch}
        pagination={{
          page: filter.page,
          pageSize: filter.pageSize,
          totalCount: data.totalCount,
          totalPages: data.totalPages,
          onPageChange: (page) => {
            setFilter((prev) => ({ ...prev, page }));
          },
          onPageSizeChange: (pageSize) => {
            setFilter((prev) => ({ ...prev, pageSize, page: 1 }));
          },
        }}
        leftContent={
          <>
            <SearchInput
              className="w-64"
              value={filter.searchTerm}
              onValueChange={(value) => {
                setFilter((prev) => ({
                  ...prev,
                  searchTerm: value,
                  page: 1,
                }));
              }}
            />
            <Select
              placeholder={msg('status')}
              selectionMode="single"
              className="w-44"
              aria-label="Select status"
              defaultSelectedKeys={['']}
              onChange={(e) => {
                if (e.target.value === '') {
                  setFilter((prev) => ({
                    ...prev,
                    isActive: undefined,
                  }));
                } else
                  setFilter((prev) => ({
                    ...prev,
                    isActive: e.target.value === '1',
                  }));
              }}
            >
              <SelectItem key={'1'}>{msg('active')}</SelectItem>
              <SelectItem key={'0'}>{msg('inactive')}</SelectItem>
            </Select>
            <RoleSelect
              value={filter.roles}
              onChange={(values) => {
                setFilter((prev) => ({
                  ...prev,
                  roles: values,
                }));
              }}
              selectionMode="multiple"
              className="w-52"
              labelPlacement={'outside'}
            />
          </>
        }
      />
      <UserDetailModal isOpen={isOpen} onOpenChange={onOpenChange} onRefresh={refetch} id={selectUserId} />
      <ConfirmModal
        isOpen={IsOpenDel}
        title="Delete Menu"
        message="Do you want to delete this menu.This action cannot be undone."
        confirmColor="danger"
        onOpenChange={OnOpenDelChange}
        onConfirm={() => del()}
      />
    </div>
  );
}
