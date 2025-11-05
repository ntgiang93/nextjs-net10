'use client';
import DataTable from '@/components/ui//data-table/Datatable';
// HugeIcons removed (not needed for categories)
import { ConfirmModal } from '@/components/ui//overlay/ConfirmModal';
import { ExtButton } from '@/components/ui/button/ExtButton';
import { SearchInput } from '@/components/ui/input/SearchInput';
import { PageHeader } from '@/components/ui/navigate/PageHeader';
import { SysCategoryHook } from '@/hooks/sysCategories';
import { CategoryDto, CategoryTreeDto } from '@/types/sys/SysCategory';
import { Button, Tooltip, useDisclosure } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { Add01Icon, Delete02Icon, Edit01Icon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import DetailModal from './components/DetailModal';

export default function Categories() {
  const { data, refetch, isFetching } = SysCategoryHook.useGetTree();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: IsOpenDel, onOpen: onOpenDel, onOpenChange: OnOpenDelChange } = useDisclosure();
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | undefined>(undefined);
  const [selectedParent, setSelectedParent] = useState<CategoryTreeDto | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const { mutateAsync: del, isPending: isDelPending } = SysCategoryHook.useDelete();
  const canCreate = true;
  const canEdit = true;
  const canDelete = true;
  const msg = useTranslations('msg');

  const columns = useMemo<ColumnDef<CategoryTreeDto>[]>(
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
        id: 'code',
        accessorKey: 'code',
        header: () => msg('code'),
        size: 120,
        meta: { autoSize: true },
      },
      {
        id: 'type',
        accessorKey: 'type',
        header: () => msg('type'),
        size: 120,
        meta: { autoSize: true },
      },
      {
        accessorKey: 'description',
        header: () => msg('description'),
        size: 200,
        meta: { autoSize: true },
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
                      setSelectedCategory(undefined);
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
                      setSelectedCategory(row.original);
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
                      setSelectedCategory(row.original);
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
      return [] as CategoryDto[];
    }

    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      return data;
    }

    const filterNodes = (nodes: CategoryTreeDto[]): CategoryTreeDto[] => {
      return nodes.reduce<CategoryTreeDto[]>((acc, node) => {
        const filteredChildren = (node as CategoryTreeDto).children
          ? filterNodes((node as CategoryTreeDto).children!)
          : [];
        const nodeMatches = [node.name, node.code, node.type, node.description].some((field) =>
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

    return filterNodes(data as CategoryTreeDto[]);
  }, [data, searchTerm]);

  const handleDelete = async () => {
    if (!selectedCategory) return;
    await del({ id: selectedCategory.id, type: selectedCategory.type });
    refetch();
    OnOpenDelChange();
    onResetSelected();
  };

  const onResetSelected = () => {
    setSelectedCategory(undefined);
    setSelectedParent(undefined);
  };

  return (
    <div className={'h-full flex flex-col gap-2'}>
      <PageHeader
        title={`${msg('management')} ${msg('category').toLocaleLowerCase()}`}
        toolbar={
          <>
            {canCreate && (
              <ExtButton
                color="primary"
                startContent={<Add01Icon size={16} />}
                variant="shadowSmall"
                onPress={() => {
                  setSelectedCategory(undefined);
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
      <DetailModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        id={selectedCategory?.id || 0}
        onRefresh={refetch}
        parent={selectedParent}
        onResetSelected={onResetSelected}
      />
      <ConfirmModal
        isOpen={IsOpenDel}
        title={msg('delete')}
        message={msg('deleteWarning')}
        confirmColor="danger"
        onOpenChange={OnOpenDelChange}
        onConfirm={handleDelete}
        objectName={[selectedCategory?.name || '']}
        loading={isDelPending}
      />
    </div>
  );
}
