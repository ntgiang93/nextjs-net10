'use client';
import { ConfirmModal } from '@/components/ui//overlay/ConfirmModal';
import { ExtButton } from '@/components/ui/button/ExtButton';
import { PageHeader } from '@/components/ui/navigate/PageHeader';
import { RoleHook } from '@/hooks/role';
import { RoleDto } from '@/types/sys/Role';
import { useDisclosure } from '@heroui/react';
import { Add01Icon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import RoleDetailModal from './components/RoleDetailModal';
import TableRole from './components/TableRole';

export default function Roles() {
  const t = useTranslations('role');
  const msg = useTranslations('msg');
  const { data: roles, refetch, isLoading } = RoleHook.useGetAll();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedRole, setSelectedRole] = useState<RoleDto | undefined>(undefined);
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
          <TableRole
            setSelectedRole={(role) => setSelectedRole(role)}
            roles={roles}
            isLoading={isLoading}
            refetch={refetch}
            onOpenDel={onOpenDel}
            onOpenEditModal={onOpen}
          />
      <RoleDetailModal
        id={selectedRole?.id || '0'}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onRefresh={refetch}
        resetSelected={() => setSelectedRole(undefined)}
      />
      <ConfirmModal
        isOpen={IsOpenDel}
        title={msg('delete')}
        confirmColor="danger"
        onOpenChange={OnOpenDelChange}
        onConfirm={() => del()}
        objectName={[selectedRole?.name || ""]}
      />
    </div>
  );
}
