'use client';
import { ConfirmModal } from '@/components/ui//overlay/ConfirmModal';
import { ExtButton } from '@/components/ui/button/ExtButton';
import AsyncDataTable from '@/components/ui/data-table/AsyncDataTable';
import { SearchInput } from '@/components/ui/input/SearchInput';
import { useAuth } from '@/components/ui/layout/AuthProvider';
import { PageHeader } from '@/components/ui/navigate/PageHeader';
import { UserHook } from '@/hooks/sys/user';
import { hasPermission } from '@/libs/AuthHelper';
import { EPermission } from '@/types/base/Permission';
import { ESysModule } from '@/types/constant/SysModule';
import { defaultUserTableRequest, UserTableDto, UserTableRequestDto } from '@/types/sys/User';
import { Button, Chip, Select, SelectItem, Tooltip, useDisclosure, User } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Add01Icon,
  Edit01Icon,
  UserAccountIcon,
  UserCheck01Icon,
  UserRemove01Icon,
} from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import UserDetailModal from './components/UserDetailModal';

export default function Menu() {
  const t = useTranslations('user');
  const tr = useTranslations('role');
  const msg = useTranslations('msg');
  const [filter, setFilter] = useState<UserTableRequestDto>({
    ...defaultUserTableRequest,
  });
  const { data, refetch, isFetching } = UserHook.useGetPagination(filter);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: IsOpenActive,
    onOpen: onOpenActive,
    onOpenChange: OnOpenActiveChange,
  } = useDisclosure();
  const [selectUser, setSelectUser] = useState<UserTableDto | undefined>(undefined);
  const { mutateAsync: changeActive } = UserHook.useChangeActive(selectUser?.id || '');
  const { navigate } = useAuth();
  const canCreateUser = hasPermission(ESysModule.Users, EPermission.Create);
  const canEditUser = hasPermission(ESysModule.Users, EPermission.Edit);
  const canDeleteUser = hasPermission(ESysModule.Users, EPermission.Delete);
  const canViewUser = hasPermission(ESysModule.Users, EPermission.View);

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
                src:
                  row.original.avatar ||
                  `https://ui-avatars.com/api/?name=${row.original.fullName}`,
                alt: 'Avatar',
              }}
              name={row.original.fullName}
            />
          );
        },
        size: 250,
        meta: {
          pinned: 'left',
        },
      },
      {
        id: 'userName',
        accessorKey: 'userName',
        header: () => t('account'),
        footer: (props) => props.column.id,
        minSize: 150,
        meta: {
          pinned: 'left',
        },
      },
      {
        id: 'email',
        accessorKey: 'email',
        header: () => t('email'),
        footer: (props) => props.column.id,
        size: 150,
        meta: {
          align: 'start',
          autoSize: true,
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
          autoSize: true,
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
        size: 120,
      },
      {
        id: 'actions',
        accessorKey: 'actions',
        header: msg('actions'),
        footer: (props) => props.column.id,
        size: 150,
        cell: ({ row }) => {
          return (
            <div className="relative flex items-center gap-2">
              {canViewUser && (
                <Tooltip content={t('userDetails')}>
                  <Button
                    isIconOnly
                    aria-label="user-details-button"
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
              )}
              {canEditUser && (
                <Tooltip content={t('editUser')}>
                  <Button
                    isIconOnly
                    aria-label="edit-button"
                    color="primary"
                    variant="light"
                    radius="full"
                    size="sm"
                    onPress={() => {
                      setSelectUser(row.original);
                      onOpen();
                    }}
                  >
                    <Edit01Icon size={16} />
                  </Button>
                </Tooltip>
              )}
              {canEditUser && row.original.isActive && (
                <Tooltip color="danger" content={t('inactiveUser')}>
                  <Button
                    isIconOnly
                    aria-label="deactive-button"
                    color="danger"
                    variant="light"
                    radius="full"
                    size="sm"
                    onPress={() => {
                      setSelectUser(row.original);
                      onOpenActive();
                    }}
                  >
                    <UserRemove01Icon size={16} />
                  </Button>
                </Tooltip>
              )}
              {canEditUser && !row.original.isActive && (
                <Tooltip color="success" content={t('activeUser')}>
                  <Button
                    isIconOnly
                    aria-label="active-button"
                    color="success"
                    variant="light"
                    radius="full"
                    size="sm"
                    onPress={() => {
                      setSelectUser(row.original);
                      onOpenActive();
                    }}
                  >
                    <UserCheck01Icon size={16} />
                  </Button>
                </Tooltip>
              )}
            </div>
          );
        },
        meta: {
          align: 'center',
        },
      },
    ],
    [canEditUser, canViewUser, msg, navigate, onOpen, onOpenActive, t],
  );

  const handleChangeActive = () => {
    changeActive(undefined, {
      onSuccess: () => {
        // ✅ Callback được gọi sau khi mutation thành công
        refetch();
        setSelectUser(undefined);
      },
    });
  };

  return (
    <div className={'h-full flex flex-col gap-2'}>
      <PageHeader
        title={'Danh sách người dùng'}
        toolbar={
          <>
            {canCreateUser && (
              <ExtButton
                color="primary"
                startContent={<Add01Icon size={16} />}
                variant="shadowSmall"
                onPress={() => {
                  if (!canCreateUser) return;
                  setSelectUser(undefined);
                  onOpen();
                }}
              >
                {msg('add')}
              </ExtButton>
            )}
          </>
        }
      ></PageHeader>
      <AsyncDataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isFetching}
        fetch={refetch}
        pagination={{
          page: filter.page,
          pageSize: filter.pageSize,
          totalCount: data?.totalCount || 0,
          totalPages: data?.totalPages || 1,
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
          </>
        }
      />
      <UserDetailModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onRefresh={refetch}
        id={selectUser?.id || ''}
      />
      <ConfirmModal
        isOpen={IsOpenActive}
        title={selectUser?.isActive ? t('inactiveUser') : t('activeUser')}
        confirmColor={selectUser?.isActive ? 'danger' : 'success'}
        onOpenChange={OnOpenActiveChange}
        onConfirm={() => handleChangeActive()}
        objectName={[`${selectUser?.fullName} - ${selectUser?.userName}`]}
      />
    </div>
  );
}
