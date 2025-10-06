'use client';
import DataTable from '@/components/ui/data-table/Datatable';
import { SearchInput } from '@/components/ui/input/SearchInput';
import { RoleDto } from '@/types/sys/Role';
import { Button, Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { Delete02Icon, Edit01Icon, FolderDetailsIcon, Shield01Icon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

interface ITableRoleProps {
  setSelectedRole: (role: RoleDto) => void;
  roles: RoleDto[];
  isLoading: boolean;
  refetch: () => void;
  onOpenEditModal: () => void;
  onOpenDel: () => void;
}

export default function TableRole(props: ITableRoleProps) {
  const t = useTranslations('role');
  const msg = useTranslations('msg');

  const { setSelectedRole, roles, isLoading, refetch, onOpenDel, onOpenEditModal } = props;
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tableData, setTableData] = useState<RoleDto[]>(roles || []);

  const columns = useMemo<ColumnDef<RoleDto>[]>(
    () => [
      {
        id: 'code',
        accessorKey: 'code',
        header: () => t('roleCode'),
        footer: (props) => props.column.id,
        minSize: 200,
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
              <Tooltip content={msg('details')}>
                <Button
                  isIconOnly
                  aria-label="expand-button"
                  color="primary"
                  variant="light"
                  radius="full"
                  size="sm"
                  onPress={() => {
                    setSelectedRole(row.original);
                  }}
                >
                  <FolderDetailsIcon size={16} />
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
                    onOpenEditModal();
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

  return (
    <>
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
    </>
  );
}
