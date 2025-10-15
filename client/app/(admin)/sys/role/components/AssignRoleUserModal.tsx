import { RoleHook } from '@/hooks/role';
import { RoleDto, UserRoleDto } from '@/types/sys/Role';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import UserSelectTable from '../../user/components/UserSelectTable';
interface IAssignRoleUserModal {
  role: RoleDto;
  isOpen: boolean;
  onOpenChange: () => void;
  onRefresh: () => void;
}

export default function AssignRoleUserModal(props: IAssignRoleUserModal) {
  const t = useTranslations('role');
  const msg = useTranslations('msg');
  const { role, isOpen, onOpenChange, onRefresh } = props;
  const [form, setForm] = useState<UserRoleDto[]>([]);
  const { mutateAsync: save, isPending } = RoleHook.useAssignMember(role.id);
  const { data: members, isFetching } = RoleHook.useGetMember(role.id);

  const onSubmit = async () => {
    const success = await save(form);
    if (success) {
      onOpenChange();
      onRefresh();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      size="3xl"
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      onClose={() => setForm([])}
    >
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">
            {role?.id && role.id > 0 ? t('title') : t('title') + ' ' + t('title')}
          </ModalHeader>
          <ModalBody>
            <UserSelectTable
              loadingInitialData={isFetching}
              selectedUserIds={members ? members.map((user) => user.id) : []}
              onSeledtedChange={(usersIds) => {
                setForm(usersIds.map((id) => ({ userId: id, roleId: role?.id || 0 })));
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenChange}>
              {msg('close')}
            </Button>
            <Button color="primary" isLoading={isPending} onPress={onSubmit}>
              {msg('submit')}
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
}
