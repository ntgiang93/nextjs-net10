'use client';
import { ConfirmModal } from '@/components/ui//overlay/ConfirmModal';
import { ExtButton } from '@/components/ui/button/ExtButton';
import DataTable from '@/components/ui/data-table/Datatable';
import { SearchInput } from '@/components/ui/input/SearchInput';
import { PageHeader } from '@/components/ui/navigate/PageHeader';
import { RoleHook } from '@/hooks/role';
import { defaultRoleDto, RoleDto } from '@/types/sys/Role';
import { Button, Tooltip, useDisclosure } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { Add01Icon, Delete02Icon, Edit01Icon, Shield01Icon, StructureCheckIcon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import RoleDetailModal from './components/RoleDetailModal';
import RolePermissonModal from './components/RolePermissonModal';

export default function Roles() {
  const t = useTranslations('role');
  const msg = useTranslations('msg');
  const { data: roles, refetch, isLoading } = RoleHook.useGetAll();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedRole, setSelectedRole] = useState<RoleDto | undefined>(undefined);
  const { isOpen: IsOpenDel, onOpen: onOpenDel, onOpenChange: OnOpenDelChange } = useDisclosure();
  const { isOpen: IsOpenPermission, onOpen: onOpenPermission, onOpenChange: OnOpenPermissionChange } = useDisclosure();
  const { mutateAsync: del, isSuccess: delSuccess } = RoleHook.useDelete(selectedRole?.id || '0');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tableData, setTableData] = useState<RoleDto[]>(roles || []);

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
          if (cell.getValue() === true) return <Shield01Icon size={16} className={'text-primary'} />;
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
              <Tooltip content={msg('edit')}>
                <Button
                  isIconOnly
                  aria-label="expand-button"
                  color="primary"
                  variant="light"
                  radius="full"
                  size="sm"
                  onPress={() => {
                    setSelectedRole(row.original);
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
                    setSelectedRole(row.original);
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
    [],
  );

  useEffect(() => {
    if (searchTerm && searchTerm.length > 0) {
      const searchTermLower = searchTerm.toLocaleLowerCase();
      const dataSource =
        roles.filter(
          (r) =>
            r.name.toLocaleLowerCase().includes(searchTermLower) ||
            r.description?.toLocaleLowerCase().includes(searchTermLower),
        ) || [];
      setTableData([...dataSource]);
    } else {
      setTableData([...roles]);
    }
  }, [searchTerm, roles]);
  useEffect(() => {
    refetch();
    setSelectedRole(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delSuccess]);

  return (
    <div className={'h-full flex flex-col gap-2'}>
      <PageHeader
        title={t('title')}
        toolbar={
          <>
            <ExtButton color="primary" startContent={<Add01Icon size={16} />} variant="shadowSmall" onPress={onOpen}>
              {msg('add')}
            </ExtButton>
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
                <SearchInput className="w-64" value={searchTerm} onValueChange={(value) => setSearchTerm(value)} />
              </>
            }
          />
      <RoleDetailModal
        id={selectedRole?.id || '0'}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onRefresh={refetch}
        resetSelected={() => setSelectedRole(undefined)}
      />
      <RolePermissonModal
        role={selectedRole || {...defaultRoleDto}}
        isOpen={IsOpenPermission}
        onOpenChange={OnOpenPermissionChange}
      />
      <ConfirmModal
        isOpen={IsOpenDel}
        title={msg('delete')}
        confirmColor="danger"
        onOpenChange={OnOpenDelChange}
        onConfirm={() => del()}
        objectName={[selectedRole?.name || ""]}
      />
    </div>
  );
}
