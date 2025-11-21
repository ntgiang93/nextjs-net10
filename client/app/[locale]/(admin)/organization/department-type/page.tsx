'use client';
import DataTable from '@/components/ui//data-table/Datatable';
import { ConfirmModal } from '@/components/ui//overlay/ConfirmModal';
import { ExtButton } from '@/components/ui/button/ExtButton';
import { SearchInput } from '@/components/ui/input/SearchInput';
import { PageHeader } from '@/components/ui/navigate/PageHeader';
import { DepartmentTypeHook } from '@/hooks/orgazination/departmentType';
import { hasPermission } from '@/libs/AuthHelper';
import { EPermission } from '@/types/base/Permission';
import { ESysModule } from '@/types/constant/SysModule';
import { DepartmentTypeDto } from '@/types/sys/DepartmentType';
import { Button, Tooltip, useDisclosure } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { Add01Icon, Delete02Icon, Edit01Icon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import DetailModal from './components/DetailModal';

export default function Menu() {
  const { data, refetch, isLoading } = DepartmentTypeHook.useGetAll();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: IsOpenDel, onOpen: onOpenDel, onOpenChange: OnOpenDelChange } = useDisclosure();
  const [selected, setSelected] = useState<DepartmentTypeDto | undefined>(undefined);
  const { mutateAsync: del, isPending: isDelPending } = DepartmentTypeHook.useDelete();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tableData, setTableData] = useState<DepartmentTypeDto[]>(data || []);
  const canCreate = hasPermission(ESysModule.DepartmentType, EPermission.Create);
  const canEdit = hasPermission(ESysModule.DepartmentType, EPermission.Edit);
  const canDelete = hasPermission(ESysModule.DepartmentType, EPermission.Delete);
  const msg = useTranslations('msg');
  const t = useTranslations('organization');

  const columns = useMemo<ColumnDef<DepartmentTypeDto>[]>(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: () => msg('name'),
        footer: (props) => props.column.id,
        size: 300,
        meta: {
          autoSize: true,
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
          align: 'start',
          autoSize: true,
        },
      },
      {
        id: 'level',
        accessorKey: 'level',
        header: () => msg('level'),
        footer: (props) => props.column.id,
        size: 80,
        meta: {
          align: 'end',
        },
      },
      {
        id: 'actions',
        accessorKey: 'actions',
        header: () => msg('actions'),
        footer: (props) => props.column.id,
        size: 120,
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
    [canEdit, canDelete, msg],
  );

  const handleDelete = async () => {
    var success = await del(selected?.id || 0);
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
            r.description?.toLocaleLowerCase().includes(searchTermLower),
        ) || [];
      setTableData([...dataSource]);
    } else {
      setTableData([...(data || [])]);
    }
  }, [searchTerm, data]);

  return (
    <div className={'h-full flex flex-col gap-2'}>
      <PageHeader
        title={`${msg('management')} ${t('departmentType').toLowerCase()}`}
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
