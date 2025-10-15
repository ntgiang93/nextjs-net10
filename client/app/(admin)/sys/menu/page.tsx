'use client';
import DataTable from '@/components/ui//data-table/Datatable';
import { HugeIcons } from '@/components/ui//icon/HugeIcons';
import { ConfirmModal } from '@/components/ui//overlay/ConfirmModal';
import { ExtButton } from '@/components/ui/button/ExtButton';
import { PageHeader } from '@/components/ui/navigate/PageHeader';
import { MenuHook } from '@/hooks/menu';
import { hasPermission } from '@/libs/AuthHelper';
import { EPermission } from '@/types/base/Permission';
import { ESysModule } from '@/types/constant/SysModule';
import { MenuItem } from '@/types/sys/Menu';
import { Button, Tooltip, useDisclosure } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { Add01Icon, Delete02Icon, Edit01Icon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import MenuDetail from './components/MenuDetailModal';

export default function Menu() {
  const { data, refetch, isLoading } = MenuHook.useGetMenuTree();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: IsOpenDel, onOpen: onOpenDel, onOpenChange: OnOpenDelChange } = useDisclosure();
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | undefined>(undefined);
  const { mutateAsync: del, isPending: isDelPending } = MenuHook.useDelete(selectedMenu?.id || 0);
  const canCreate = hasPermission(ESysModule.Menu, EPermission.Create);
  const canEdit = hasPermission(ESysModule.Menu, EPermission.Edit);
  const canDelete = hasPermission(ESysModule.Menu, EPermission.Delete);
  const t = useTranslations('menu');
  const msg = useTranslations('msg');

  const columns = useMemo<ColumnDef<MenuItem>[]>(
    () => [
      {
        accessorFn: (row) => row.name,
        id: 'name',
        header: () => msg('name'),
        footer: (props) => props.column.id,
        size: 300,
        meta: {
          pinned: 'left',
        },
      },
      {
        id: 'url',
        accessorKey: 'url',
        header: () => msg('path'),
        footer: (props) => props.column.id,
        minSize: 200,
      },
      {
        accessorKey: 'icon',
        header: () => 'Icon',
        footer: (props) => props.column.id,
        size: 80,
        cell: ({ cell }) => {
          return <HugeIcons name={(cell.getValue() as string) || ''} />;
        },
        meta: {
          align: 'center',
        },
      },
      {
        accessorKey: 'status',
        header: () => msg('status'),
        footer: (props) => props.column.id,
        size: 100,
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
                    aria-label="expand-button"
                    color="primary"
                    variant="light"
                    radius="full"
                    size="sm"
                    onPress={() => {
                      setSelectedMenu(row.original);
                      onOpen();
                    }}
                  >
                    <Edit01Icon size={16} />
                  </Button>
                </Tooltip>
              )}
              {(!row.original.children || row.original.children?.length === 0) && canDelete && (
                <Tooltip color="danger" content={msg('delete')}>
                  <Button
                    isIconOnly
                    aria-label="expand-button"
                    color="danger"
                    variant="light"
                    radius="full"
                    size="sm"
                    onPress={() => {
                      setSelectedMenu(row.original);
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
    [canEdit, canDelete],
  );

  const handleDelete = async () => {
    var success = await del();
    if (success) {
      refetch();
      OnOpenDelChange();
      setSelectedMenu(undefined);
    }
  };

  return (
    <div className={'h-full flex flex-col gap-2'}>
      <PageHeader
        title={t('title')}
        toolbar={
          <>
            {canCreate && (
              <ExtButton
                color="primary"
                startContent={<Add01Icon size={16} />}
                variant="shadowSmall"
                onPress={() => {
                  setSelectedMenu(undefined);
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
        data={data || []}
        childrenProperty="children"
        isLoading={isLoading}
        fetch={refetch}
      />
      <MenuDetail
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        id={selectedMenu?.id || 0}
        onRefresh={refetch}
      />
      <ConfirmModal
        isOpen={IsOpenDel}
        title={msg('delete')}
        message={t('deleteMenuWarning')}
        confirmColor="danger"
        onOpenChange={OnOpenDelChange}
        onConfirm={handleDelete}
        objectName={[selectedMenu?.name || '']}
        loading={isDelPending}
      />
    </div>
  );
}
