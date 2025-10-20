'use client';
import DataTable from '@/components/ui//data-table/Datatable';
import { ConfirmModal } from '@/components/ui//overlay/ConfirmModal';
import { ExtButton } from '@/components/ui/button/ExtButton';
import { SearchInput } from '@/components/ui/input/SearchInput';
import { PageHeader } from '@/components/ui/navigate/PageHeader';
import { DepartmentHook } from '@/hooks/department';
import { hasPermission } from '@/libs/AuthHelper';
import { EPermission } from '@/types/base/Permission';
import { ESysModule } from '@/types/constant/SysModule';
import { DepartmentDto } from '@/types/sys/Department';
import { Button, Tooltip, useDisclosure } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { Add01Icon, Delete02Icon, Edit01Icon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import DetailModal from './components/DetailModal';

export default function Departments() {
  const { data, refetch, isLoading } = DepartmentHook.useGetAll();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: IsOpenDel, onOpen: onOpenDel, onOpenChange: OnOpenDelChange } = useDisclosure();
  const [selected, setSelected] = useState<DepartmentDto | undefined>(undefined);
  const { mutateAsync: del, isPending: isDelPending } = DepartmentHook.useDelete();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tableData, setTableData] = useState<DepartmentDto[]>(data || []);
  const canCreate = hasPermission(ESysModule.Department, EPermission.Create);
  const canEdit = hasPermission(ESysModule.Department, EPermission.Edit);
  const canDelete = hasPermission(ESysModule.Department, EPermission.Delete);
  const msg = useTranslations('msg');
  const t = useTranslations('organization');

  const columns = useMemo<ColumnDef<DepartmentDto>[]>(
    () => [
      {
        accessorFn: (row) => row.name,
        id: 'name',
        header: () => msg('name'),
        footer: (props) => props.column.id,
        minSize: 300,
        meta: {
          pinned: 'left',
        },
      },
      {
        id: 'code',
        accessorKey: 'code',
        header: () => msg('code'),
        footer: (props) => props.column.id,
        size: 80,
      },
      {
        accessorKey: 'description',
        header: () => msg('description'),
        footer: (props) => props.column.id,
        minSize: 300,
        meta: {
          align: 'center',
        },
      },
      {
        id: 'departmentTypeName',
        accessorKey: 'departmentTypeName',
        header: () => t('departmentType'),
        footer: (props) => props.column.id,
        minSize: 220,
      },
      {
        id: 'departmentTypeLevel',
        accessorKey: 'departmentTypeLevel',
        header: () => msg('level'),
        footer: (props) => props.column.id,
        size: 80,
        meta: {
          align: 'center',
        },
      },
      {
        id: 'address',
        accessorKey: 'address',
        header: () => msg('address'),
        footer: (props) => props.column.id,
        minSize: 220,
      },
      {
        accessorKey: 'actions',
        header: () => msg('actions'),
        footer: (props) => props.column.id,
        size: 100,
        cell: ({ row }) => {
          return (
            <div className="relative flex items-center gap-2">
              {canEdit && (
                <Tooltip content={msg('edit')}>
                  <Button
                    isIconOnly
                    aria-label="edit-button"
                    color="primary"
                    variant="light"
                    radius="full"
                    size="sm"
                    onPress={() => {
                      setSelected(row.original);
                      onOpen();
                    }}
                  >
                    <Edit01Icon size={16} />
                  </Button>
                </Tooltip>
              )}
              {canDelete && (
                <Tooltip color="danger" content={msg('delete')}>
                  <Button
                    isIconOnly
                    aria-label="delete-button"
                    color="danger"
                    variant="light"
                    radius="full"
                    size="sm"
                    onPress={() => {
                      setSelected(row.original);
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
    [canEdit, canDelete, msg, t],
  );

  const handleDelete = async () => {
    const success = await del(selected?.id || 0);
    if (success) {
      refetch();
      OnOpenDelChange();
      onResetSelected();
    }
  };

  const onResetSelected = () => {
    setSelected(undefined);
  };

  useEffect(() => {
    if (searchTerm && searchTerm.length > 0) {
      const searchTermLower = searchTerm.toLocaleLowerCase();
      const dataSource =
        data?.filter(
          (r) =>
            r.name.toLocaleLowerCase().includes(searchTermLower) ||
            r.description?.toLocaleLowerCase().includes(searchTermLower) ||
            r.departmentTypeName?.toLocaleLowerCase().includes(searchTermLower) ||
            r.address?.toLocaleLowerCase().includes(searchTermLower),
        ) || [];
      setTableData([...dataSource]);
    } else {
      setTableData([...(data || [])]);
    }
  }, [searchTerm, data]);

  return (
    <div className={'h-full flex flex-col gap-2'}>
      <PageHeader
        title={`${msg('management')} ${t('department').toLowerCase()}`}
        toolbar={
          <>
            {canCreate && (
              <ExtButton
                color="primary"
                startContent={<Add01Icon size={16} />}
                variant="shadowSmall"
                onPress={() => {
                  setSelected(undefined);
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
        data={tableData || []}
        childrenProperty="children"
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
      <DetailModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        id={selected?.id || 0}
        onRefresh={refetch}
        onResetSelected={onResetSelected}
      />
      <ConfirmModal
        isOpen={IsOpenDel}
        title={msg('delete')}
        message={msg('deleteWarning')}
        confirmColor="danger"
        onOpenChange={OnOpenDelChange}
        onConfirm={handleDelete}
        objectName={[selected?.name || '']}
        loading={isDelPending}
      />
    </div>
  );
}
