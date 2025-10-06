import { RoleHook } from '@/hooks/role';
import { Button, Checkbox, Tooltip } from '@heroui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SysCategoryHook } from '@/hooks/sysCategories';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '@/components/ui/data-table/Datatable';
import { SearchInput } from '@/components/ui/input/SearchInput';
import { FloppyDiskIcon } from 'hugeicons-react';
import { RoleDto, RolePermissionDto } from '@/types/sys/Role';
import { useTranslations } from 'next-intl';

interface IRoleUserProps {
  role: RoleDto;
}

interface PermissionTable {
  id: string;
  moduleName: string;
}

export default function RolePermisson(props: IRoleUserProps) {
  const msg = useTranslations('msg');
  const { role } = props;
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tableData, setTableData] = useState<PermissionTable[]>([]);
  const [form, setForm] = useState<RolePermissionDto[]>([]);
  const { data: rolePermissions, refetch } = RoleHook.useGetPermission(role.id);
  const { data: sysmodules, isLoading: loadingModule } = SysCategoryHook.useGetSysModule();
  const { mutateAsync: save, isPending } = RoleHook.useAssignPermission(role.id);
  const { data: permissons, isLoading: loadingPermssion } = SysCategoryHook.useGetPermission();

  const checkedPermisson = useCallback(
    (sysmodule: string, permission: string) => {
      return form.some((rp) => rp.sysModule === sysmodule && rp.permission == permission);
    },
    [form],
  );

  const handleCheckedChange = useCallback(
    (sysmodule: string, permission: string, checked: boolean) => {
      if (!role) return;
      if (!checked) {
        const newForm = form.filter((rp) => rp.sysModule !== sysmodule || rp.permission !== permission);
        setForm([...newForm]);
      } else {
        const newForm = [...form, { sysModule: sysmodule, permission: permission, role: role.code }];
        setForm([...newForm]);
      }
    },
    [form, role],
  );

  const onSubmit = async () => {
    await save(form);
  };

  const columns = useMemo<ColumnDef<PermissionTable>[]>(() => {
    const cols: ColumnDef<PermissionTable>[] = [
      {
        id: 'moduleName',
        accessorKey: 'moduleName',
        header: () => msg('module'),
        footer: (props: any) => props.column.id,
        minSize: 200,
        meta: {
          pinned: 'left',
        },
      },
    ];
    permissons.forEach((p) => {
      const permissonsCol: ColumnDef<PermissionTable> = {
        id: p.value,
        accessorKey: p.value,
        header: () => p.label,
        footer: (props) => props.column.id,
        size: 100,
        cell: ({ row }) => {
          return (
            <Checkbox
              defaultSelected={checkedPermisson(row.original.id, p.value)}
              onValueChange={(value) => handleCheckedChange(row.original.id, p.value, value)}
            ></Checkbox>
          );
        },
        meta: {
          align: 'center',
        },
      };
      cols.push(permissonsCol);
    });
    return cols;
  }, [permissons, checkedPermisson]);

  useEffect(() => {
    let rawData: any[] = [];
    if (!searchTerm || searchTerm.trim() === '') {
      rawData = [...sysmodules];
    } else rawData = sysmodules.filter((m) => m.label.toLowerCase().includes(searchTerm.toLowerCase()));
    setTableData(
      rawData.map((m) => {
        return { id: m.value, moduleName: m.label };
      }),
    );
  }, [sysmodules, searchTerm]);

  useEffect(() => {
    if (rolePermissions) setForm([...rolePermissions]);
  }, [rolePermissions]);

  return (
    <div className={'h-full'}>
      <DataTable
        removeWrapper={true}
        columns={columns}
        data={tableData}
        isLoading={loadingModule || loadingPermssion}
        fetch={refetch}
        leftContent={
          <>
            <SearchInput className="w-64" value={searchTerm} onValueChange={(value) => setSearchTerm(value)} />
          </>
        }
        rightContent={
          <Tooltip content={msg('save')} showArrow={true} radius={'sm'}>
            <Button isIconOnly isLoading={isPending} variant="shadow" color={'primary'} size="sm" onPress={onSubmit}>
              <FloppyDiskIcon size={16} />
            </Button>
          </Tooltip>
        }
      />
    </div>
  );
}
