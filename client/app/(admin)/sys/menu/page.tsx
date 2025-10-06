'use client';
import DataTable from '@/components/ui//data-table/Datatable';
import { HugeIcons } from '@/components/ui//icon/HugeIcons';
import { ConfirmModal } from '@/components/ui//overlay/ConfirmModal';
import { ExtButton } from '@/components/ui/button/ExtButton';
import { PageHeader } from '@/components/ui/navigate/PageHeader';
import { MenuHook } from '@/hooks/menu';
import { MenuItem } from '@/types/sys/Menu';
import { Button, Tooltip, useDisclosure } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { Add01Icon, Delete02Icon, Edit01Icon } from 'hugeicons-react';
import { useEffect, useMemo, useState } from 'react';
import MenuDetail from './components/detail';

export default function Menu() {
  const { data, refetch, isLoading } = MenuHook.useGetMenuTree();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: IsOpenDel, onOpen: onOpenDel, onOpenChange: OnOpenDelChange } = useDisclosure();
  const [currentId, setCurrentId] = useState<number>(0);
  const { mutateAsync: del, isSuccess: delSuccess } = MenuHook.useDelete(currentId);

  const columns = useMemo<ColumnDef<MenuItem>[]>(
    () => [
      {
        accessorFn: (row) => row.name,
        id: 'name',
        header: () => <span>Name</span>,
        footer: (props) => props.column.id,
        size: 300,
        meta: {
          pinned: 'left',
        },
      },
      {
        id: 'url',
        accessorKey: 'url',
        header: () => 'Path',
        footer: (props) => props.column.id,
        minSize: 200,
      },
      {
        accessorKey: 'icon',
        header: () => <span>Icon</span>,
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
        header: 'Status',
        footer: (props) => props.column.id,
        size: 100,
      },
      {
        accessorKey: 'actions',
        header: 'Actions',
        footer: (props) => props.column.id,
        size: 100,
        cell: ({ row }) => {
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip content="Edit menu">
                <Button
                  isIconOnly
                  aria-label="expand-button"
                  color="primary"
                  variant="light"
                  radius="full"
                  size="sm"
                  onPress={() => {
                    setCurrentId(row.original.id);
                    onOpen();
                  }}
                >
                  <Edit01Icon size={16} />
                </Button>
              </Tooltip>
              <Tooltip color="danger" content="Delete menu">
                <Button
                  isIconOnly
                  aria-label="expand-button"
                  color="danger"
                  variant="light"
                  radius="full"
                  size="sm"
                  onPress={() => {
                    setCurrentId(row.original.id);
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
    if (!isOpen) setCurrentId(0);
  }, [isOpen]);

  useEffect(() => {
    refetch();
    setCurrentId(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delSuccess]);

  return (
    <div className={'h-full flex flex-col gap-2'}>
      <PageHeader
        title={'Danh sách menu'}
        toolbar={
          <>
            <ExtButton color="primary" startContent={<Add01Icon size={16} />} variant="shadowSmall" onPress={onOpen}>
              Add
            </ExtButton>
          </>
        }
      ></PageHeader>
      <DataTable columns={columns} data={data} childrenProperty="children" isLoading={isLoading} fetch={refetch} />
      <MenuDetail isOpen={isOpen} onOpenChange={onOpenChange} id={currentId} onRefresh={refetch} />
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
