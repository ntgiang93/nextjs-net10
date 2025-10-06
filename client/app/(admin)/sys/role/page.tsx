'use client';
import RolePermisson from '@/app/(admin)/sys/role/components/RolePermisson';
import { ConfirmModal } from '@/components/ui//overlay/ConfirmModal';
import { ExtButton } from '@/components/ui/button/ExtButton';
import { PageHeader } from '@/components/ui/navigate/PageHeader';
import { RoleHook } from '@/hooks/role';
import { defaultRoleDto, RoleDto } from '@/types/sys/Role';
import { Card, CardBody, CardHeader, Tab, Tabs, useDisclosure } from '@heroui/react';
import { Add01Icon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import RoleDetailModal from './components/RoleDetailModal';
import RoleUser from './components/RoleUser';
import TableRole from './components/TableRole';

export default function Roles() {
  const t = useTranslations('role');
  const msg = useTranslations('msg');
  const { data: roles, refetch, isLoading } = RoleHook.useGetAll();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedRole, setSelectedRole] = useState<RoleDto | undefined>(undefined);
  const [selected, setSelected] = useState('user');
  const { isOpen: IsOpenDel, onOpen: onOpenDel, onOpenChange: OnOpenDelChange } = useDisclosure();
  const { mutateAsync: del, isSuccess: delSuccess } = RoleHook.useDelete(selectedRole?.id || '0');

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
      <div className={'h-full grid grid-cols-5 gap-4'}>
        <div className="col-span-2">
          <TableRole
            setSelectedRole={(role) => setSelectedRole(role)}
            roles={roles}
            isLoading={isLoading}
            refetch={refetch}
            onOpenDel={onOpenDel}
            onOpenEditModal={onOpen}
          />
        </div>

        <Card className="col-span-3 flex w-full flex-col">
          <CardHeader>
            <h4 className="text-lg font-semibold">{`${msg('details')} ${selectedRole?.name || ''}`}</h4>
          </CardHeader>
          <CardBody>
            {!selectedRole && <div className="text-center">{t('selectRoleRequired')}</div>}
            {selectedRole && (
              <Tabs aria-label="Options" selectedKey={selected} onSelectionChange={(key) => setSelected(String(key))}>
                <Tab key="user" title={t('roleMembers')} className={'h-full'}>
                  <RoleUser role={selectedRole || { ...defaultRoleDto }} />
                </Tab>
                <Tab key="permisson" title={t('permissions')} className={'h-full'}>
                  <RolePermisson
                    role={
                      selectedRole || {
                        id: '0',
                        name: '',
                        description: '',
                      }
                    }
                  />
                </Tab>
              </Tabs>
            )}
          </CardBody>
        </Card>
      </div>
      <RoleDetailModal
        id={selectedRole?.id || '0'}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onRefresh={refetch}
        resetSelected={() => setSelectedRole(undefined)}
      />
      <ConfirmModal
        isOpen={IsOpenDel}
        title="Delete Menu"
        message="Do you want to delete this role.This action cannot be undone."
        confirmColor="danger"
        onOpenChange={OnOpenDelChange}
        onConfirm={() => del()}
      />
    </div>
  );
}
