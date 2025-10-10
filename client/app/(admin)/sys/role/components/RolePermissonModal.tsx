import DataTable from '@/components/ui/data-table/Datatable';
import { SearchInput } from '@/components/ui/input/SearchInput';
import { RoleHook } from '@/hooks/role';
import { SysCategoryHook } from '@/hooks/sysCategories';
import { EPermission } from '@/types/base/Permission';
import { RoleDto, RolePermissionDto } from '@/types/sys/Role';
import { Button, Checkbox, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface IRoleUserProps {
  role: RoleDto;
  isOpen: boolean;
  onOpenChange: () => void;
}

interface PermissionTable {
  id: string;
  moduleName: string;
}

export default function RolePermissonModal(props: IRoleUserProps) {
  const msg = useTranslations('msg');
  const { role, isOpen, onOpenChange } = props;
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tableData, setTableData] = useState<PermissionTable[]>([]);
  const [form, setForm] = useState<RolePermissionDto[]>([]);
  const { data: rolePermissions, refetch, isLoading } = RoleHook.useGetPermission(role.id);
  const { data: sysmodules, isLoading: loadingModule } = SysCategoryHook.useGetSysModule();
  const { mutateAsync: save, isPending, isSuccess } = RoleHook.useAssignPermission(role.id);
  const { data: permissons, isLoading: loadingPermssion } = SysCategoryHook.useGetPermission();

  const checkedPermisson = useCallback(
    (sysmodule: string, permission: EPermission) => {
      return form.some((rp) => rp.sysModule === sysmodule && (rp.permission & permission) === permission);
    },
    [form],
  );

  const handleCheckedChange = useCallback(
    (sysmodule: string, permission: EPermission, checked: boolean) => {
      if (!role) return;
      if (!checked) {
        const newForm = form.filter((rp) => rp.sysModule !== sysmodule || ( (rp.permission & permission) !== permission));
        setForm([...newForm]);
      } else {
        if(permission === EPermission.All) {
          const newForm = form.filter((rp) => rp.sysModule !== sysmodule);
          setForm([...newForm, { sysModule: sysmodule, permission: permission, roleId: role.id }]);
        }
        else {
          const newForm = [...form, { sysModule: sysmodule, permission: permission, roleId: role.id }];
          setForm([...newForm]);
        }
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
        id: p.value.toString(),
        accessorKey: p.label,
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

  useEffect(() => {
    if (isSuccess) {
      onOpenChange();
    } 
  }, [isSuccess])
  

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      size='5xl'
    >
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">
            <p>{role.name}</p>
          </ModalHeader>
          <ModalBody>
            <DataTable
                    removeWrapper={true}
                    columns={columns}
                    data={tableData}
                    isLoading={loadingModule || loadingPermssion || isLoading}
                    fetch={refetch}
                    leftContent={
                      <>
                        <SearchInput className="w-64" value={searchTerm} onValueChange={(value) => setSearchTerm(value)} />
                      </>
                    }
                  />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenChange}>
              {msg('close')}
            </Button>
            <Button onPress={onSubmit} color="primary" form="roleForm" isLoading={isPending}>
              {msg('save')}
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
}
