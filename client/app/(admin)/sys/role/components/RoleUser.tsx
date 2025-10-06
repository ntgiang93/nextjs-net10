import DataTable from '@/components/ui/data-table/Datatable';
import { SearchInput } from '@/components/ui/input/SearchInput';
import { ConfirmModal } from '@/components/ui/overlay/ConfirmModal';
import { RoleHook } from '@/hooks/role';
import { RoleDto, RoleMembersDto } from '@/types/sys/Role';
import { Button, Tooltip, useDisclosure, User } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { Delete02Icon, UserGroupIcon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import AssignRoleUserModal from './AssignRoleUserModal';

interface IRoleUserProps {
  role: RoleDto;
}

export default function RoleUser(props: IRoleUserProps) {
  const { role } = props;
  const msg = useTranslations('msg');
  const tu = useTranslations('user');
  const t = useTranslations('role');
  const { data: members, refetch, isFetching } = RoleHook.useGetMember(role.id);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tableData, setTableData] = useState<RoleMembersDto[]>(members || []);
  const [currentUser, setcurrentUser] = useState<RoleMembersDto | undefined>(undefined);
  const { isOpen: IsOpenAssign, onOpen: onOpenAssign, onOpenChange: OnOpenAssignChange } = useDisclosure();
  const { isOpen: IsOpenDel, onOpen: onOpenDel, onOpenChange: OnOpenDelChange } = useDisclosure();
  const { mutateAsync: del, isSuccess: delSuccess } = RoleHook.useRemoveMember(role.id, currentUser?.id || '0');

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delSuccess]);

  const columns = useMemo<ColumnDef<RoleMembersDto>[]>(
    () => [
      {
        id: 'fullName',
        accessorKey: 'fullName',
        header: () => tu('user'),
        footer: (props) => props.column.id,
        cell: ({ row }) => {
          return (
            <User
              avatarProps={{
                src: row.original.avatar || `https://ui-avatars.com/api/?name=${row.original.fullName}`,
                alt: 'Avatar',
              }}
              name={row.original.userName}
              description={row.original.fullName}
            />
          );
        },
        minSize: 150,
        meta: {
          pinned: 'left',
        },
      },
      {
        id: 'email',
        accessorKey: 'email',
        header: () => 'Email',
        footer: (props) => props.column.id,
        size: 150,
        meta: {
          align: 'start',
        },
      },
      {
        accessorKey: 'actions',
        header: msg('actions'),
        footer: (props) => props.column.id,
        size: 100,
        cell: ({ row }) => {
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip color="danger" content={msg('delete')}>
                <Button
                  isIconOnly
                  aria-label="expand-button"
                  color="danger"
                  variant="light"
                  radius="full"
                  size="sm"
                  onPress={() => {
                    setcurrentUser(row.original);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (!searchTerm || searchTerm.trim() === '') {
      setTableData([...members]);
    } else {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const filterdData = members.filter(
        (item) =>
          item.fullName?.toLowerCase().includes(lowerSearchTerm) ||
          item.userName.toLowerCase().includes(lowerSearchTerm) ||
          item.email.toLowerCase().includes(lowerSearchTerm),
      );
      setTableData([...filterdData]);
    }
  }, [searchTerm, members]);

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <DataTable
        columns={columns}
        data={tableData}
        isLoading={isFetching}
        fetch={refetch}
        removeWrapper={true}
        leftContent={
          <>
            <SearchInput className="w-64" value={searchTerm} onValueChange={(value) => setSearchTerm(value)} />
          </>
        }
        rightContent={
          <Tooltip content={t('assignMembers')} showArrow={true} radius={'sm'}>
            <Button isIconOnly variant="shadow" color={'primary'} size="sm" onPress={onOpenAssign}>
              <UserGroupIcon size={16} />
            </Button>
          </Tooltip>
        }
      />
      <ConfirmModal
        isOpen={IsOpenDel}
        title={t('removeMember')}
        objectName={currentUser?.fullName}
        confirmColor="danger"
        onOpenChange={OnOpenDelChange}
        onConfirm={() => del()}
      />
      <AssignRoleUserModal
        isOpen={IsOpenAssign}
        roleUsers={members}
        onOpenChange={OnOpenAssignChange}
        onRefresh={refetch}
        role={role}
      />
    </div>
  );
}
