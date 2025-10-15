'use client';
import { ConfirmModal } from '@/components/ui//overlay/ConfirmModal';
import { ExtButton } from '@/components/ui/button/ExtButton';
import DataTable from '@/components/ui/data-table/Datatable';
import { SearchInput } from '@/components/ui/input/SearchInput';
import { PageHeader } from '@/components/ui/navigate/PageHeader';
import { RoleHook } from '@/hooks/role';
import { hasPermission } from '@/libs/AuthHelper';
import { EPermission } from '@/types/base/Permission';
import { ESysModule } from '@/types/constant/SysModule';
import { defaultRoleDto, RoleDto } from '@/types/sys/Role';
import { Button, Tooltip, useDisclosure } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Add01Icon,
  Delete02Icon,
  Edit01Icon,
  Shield01Icon,
  StructureCheckIcon,
  UserGroupIcon,
} from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import AssignRoleUserModal from './components/AssignRoleUserModal';
import RoleDetailModal from './components/RoleDetailModal';
import RolePermissonModal from './components/RolePermissonModal';

export default function Roles() {
  const t = useTranslations('role');
  const msg = useTranslations('msg');
  const { data: roles, refetch, isLoading } = RoleHook.useGetAll();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedRole, setSelectedRole] = useState<RoleDto | undefined>(undefined);
  const { isOpen: IsOpenDel, onOpen: onOpenDel, onOpenChange: OnOpenDelChange } = useDisclosure();
  const {
    isOpen: IsOpenPermission,
    onOpen: onOpenPermission,
    onOpenChange: OnOpenPermissionChange,
  } = useDisclosure();
  const {
    isOpen: IsOpenAssign,
    onOpen: onOpenAssign,
    onOpenChange: OnOpenAssignChange,
  } = useDisclosure();
  const { mutateAsync: del, isPending: delLoading } = RoleHook.useDelete(selectedRole?.id || 0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tableData, setTableData] = useState<RoleDto[]>(roles || []);
  const canCreateRole = hasPermission(ESysModule.Roles, EPermission.Create);
  const canEditRole = hasPermission(ESysModule.Roles, EPermission.Edit);
  const canDeleteRole = hasPermission(ESysModule.Roles, EPermission.Delete);

  const columns = useMemo<ColumnDef<RoleDto>[]>(
    () => [
      {
        id: 'code',
        accessorKey: 'code',
        header: () => t('roleCode'),
        footer: (props) => props.column.id,
        minSize: 150,
        meta: {
          pinned: 'left',
        },
      },
      {
        id: 'name',
        accessorKey: 'name',
        header: () => t('roleName'),
        footer: (props) => props.column.id,
        minSize: 150,
      },
      {
        id: 'description',
        accessorKey: 'description',
        header: () => msg('description'),
        footer: (props) => props.column.id,
        minSize: 150,
      },
      {
        id: 'isProtected',
        accessorKey: 'isProtected',
        header: () => t('protected'),
        footer: (props) => props.column.id,
        size: 150,
        cell: ({ cell }) => {
          if (cell.getValue() === true)
            return <Shield01Icon size={16} className={'text-primary'} />;
          else return <span></span>;
        },
        meta: {
          align: 'center',
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
              {canEditRole && (
                <Tooltip content={t('roleMembers')}>
                  <Button
                    isIconOnly
                    aria-label="expand-button"
                    color="primary"
                    variant="light"
                    radius="full"
                    size="sm"
                    onPress={() => {
                      setSelectedRole(row.original);
                      onOpenAssign();
                    }}
                  >
                    <UserGroupIcon size={16} />
                  </Button>
                </Tooltip>
              )}
              {canEditRole && (
                <Tooltip content={t('permissions')}>
                  <Button
                    isIconOnly
                    aria-label="expand-button"
                    color="primary"
                    variant="light"
                    radius="full"
                    size="sm"
                    onPress={() => {
                      setSelectedRole(row.original);
                      onOpenPermission();
                    }}
                  >
                    <StructureCheckIcon size={16} />
                  </Button>
                </Tooltip>
              )}
              {!row.original.isProtected && canEditRole && (
                <Tooltip content={msg('edit')}>
                  <Button
                    isIconOnly
                    aria-label="expand-button"
                    color="primary"
                    variant="light"
                    radius="full"
                    size="sm"
                    onPress={() => {
                      if (!canEditRole) return;
                      setSelectedRole(row.original);
                      onOpen();
                    }}
                  >
                    <Edit01Icon size={16} />
                  </Button>
                </Tooltip>
              )}
              {!row.original.isProtected && canDeleteRole && (
                <Tooltip color="danger" content={msg('delete')}>
                  <Button
                    isIconOnly
                    aria-label="expand-button"
                    color="danger"
                    variant="light"
                    radius="full"
                    size="sm"
                    onPress={() => {
                      setSelectedRole(row.original);
                      onOpenDel();
                    }}
                  >
                    <Delete02Icon size={16} />
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
    [canDeleteRole, canEditRole, msg, onOpen, onOpenAssign, onOpenDel, onOpenPermission, t],
  );

  const handleDelete = async () => {
    var success = await del();
    if (success) {
      refetch();
      OnOpenDelChange();
      setSelectedRole(undefined);
    }
  };

  useEffect(() => {
    if (searchTerm && searchTerm.length > 0) {
      const searchTermLower = searchTerm.toLocaleLowerCase();
      const dataSource =
        roles?.filter(
          (r) =>
            r.name.toLocaleLowerCase().includes(searchTermLower) ||
            r.description?.toLocaleLowerCase().includes(searchTermLower),
        ) || [];
      setTableData([...dataSource]);
    } else {
      setTableData([...(roles || [])]);
    }
  }, [searchTerm, roles]);

  return (
    <div className={'h-full w-full flex flex-col gap-2'}>
      <PageHeader
        title={t('title')}
        toolbar={
          <>
            {canCreateRole && (
              <ExtButton
                color="primary"
                startContent={<Add01Icon size={16} />}
                variant="shadowSmall"
                onPress={() => {
                  if (!canCreateRole) return;
                  setSelectedRole(undefined);
                  onOpen();
                }}
              >
                {msg('add')}
              </ExtButton>
            )}
          </>
        }
      ></PageHeader>
      <DataTable
        columns={columns}
        data={tableData}
        isLoading={isLoading}
        fetch={refetch}
        leftContent={
          <>
            <SearchInput
              className="w-64"
              value={searchTerm}
              onValueChange={(value) => setSearchTerm(value)}
            />
          </>
        }
      />
      <RoleDetailModal
        id={selectedRole?.id || 0}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onRefresh={refetch}
      />
      <RolePermissonModal
        role={selectedRole || { ...defaultRoleDto }}
        isOpen={IsOpenPermission}
        onOpenChange={OnOpenPermissionChange}
      />
      <ConfirmModal
        isOpen={IsOpenDel}
        title={msg('delete')}
        confirmColor="danger"
        message={msg('deleteWarning')}
        onOpenChange={OnOpenDelChange}
        onConfirm={handleDelete}
        objectName={[selectedRole?.name || '']}
        loading={delLoading}
      />
      <AssignRoleUserModal
        isOpen={IsOpenAssign}
        onOpenChange={OnOpenAssignChange}
        onRefresh={refetch}
        role={selectedRole || { ...defaultRoleDto }}
      />
    </div>
  );
}
