'use client';
import DataTable from '@/components/ui//data-table/Datatable';
import { HugeIcons } from '@/components/ui//icon/HugeIcons';
import { ConfirmModal } from '@/components/ui//overlay/ConfirmModal';
import { ExtButton } from '@/components/ui/button/ExtButton';
import { SearchInput } from '@/components/ui/input/SearchInput';
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
  const { data, refetch, isFetching } = MenuHook.useGetMenuTree();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: IsOpenDel, onOpen: onOpenDel, onOpenChange: OnOpenDelChange } = useDisclosure();
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | undefined>(undefined);
  const [selectedParent, setSelectedParent] = useState<MenuItem | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
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
        size: 300,
        meta: {
          autoSize: true,
        },
      },
      {
        id: 'url',
        accessorKey: 'url',
        header: () => msg('path'),
        size: 200,
        meta: {
          autoSize: true,
        },
      },
      {
        accessorKey: 'icon',
        header: () => 'Icon',
        size: 80,
        cell: ({ cell }) => {
          return <HugeIcons name={(cell.getValue() as string) || ''} />;
        },
        meta: {
          align: 'center',
        },
      },
      {
        id: 'actions',
        accessorKey: 'actions',
        header: () => msg('actions'),
        size: 150,
        cell: ({ row }) => {
          return (
            <div className="relative flex items-center gap-2">
              {canCreate && (
                <Tooltip content={msg('add')}>
                  <Button
                    isIconOnly
                    aria-label="add-button"
                    color="primary"
                    variant="light"
                    radius="full"
                    size="sm"
                    onPress={() => {
                      setSelectedParent(row.original);
                      onOpen();
                    }}
                  >
                    <Add01Icon size={16} />
                  </Button>
                </Tooltip>
              )}
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
                    aria-label="delete-button"
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
    [canCreate, canEdit, canDelete, msg],
  );

  const filteredData = useMemo(() => {
    if (!data) {
      return [] as MenuItem[];
    }

    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      return data;
    }

    const filterNodes = (nodes: MenuItem[]): MenuItem[] => {
      return nodes.reduce<MenuItem[]>((acc, node) => {
        const filteredChildren = node.children ? filterNodes(node.children) : [];
        const nodeMatches = [node.name, node.url, node.sysmodule].some((field) =>
          field ? field.toLowerCase().includes(keyword) : false,
        );

        if (nodeMatches) {
          acc.push({
            ...node,
            ...(node.children
              ? {
                  children: filteredChildren.length > 0 ? filteredChildren : node.children,
                }
              : {}),
          });
          return acc;
        }

        if (filteredChildren.length > 0) {
          acc.push({
            ...node,
            children: filteredChildren,
          });
        }

        return acc;
      }, []);
    };

    return filterNodes(data);
  }, [data, searchTerm]);

  const handleDelete = async () => {
    var success = await del();
    if (success) {
      refetch();
      OnOpenDelChange();
      onResetSelected();
    }
  };

  const onResetSelected = () => {
    setSelectedMenu(undefined);
    setSelectedParent(undefined);
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
        data={filteredData}
        childrenProperty="children"
        isLoading={isFetching}
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
      <MenuDetail
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        id={selectedMenu?.id || 0}
        onRefresh={refetch}
        parent={selectedParent}
        onResetSelected={onResetSelected}
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
