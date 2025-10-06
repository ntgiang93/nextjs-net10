import FormSkeleton from '@/components/ui/skeleton/FormSkeleton';
import { RoleHook } from '@/hooks/role';
import { defaultRoleDto, RoleDto } from '@/types/sys/Role';
import { Button, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
interface UserCreateModalProps {
  id: string;
  isOpen: boolean;
  onOpenChange: () => void;
  onRefresh: () => void;
  resetSelected: () => void;
}

export default function RoleDetailModal(props: UserCreateModalProps) {
  const t = useTranslations('role');
  const msg = useTranslations('msg');
  const { id, isOpen, onOpenChange, onRefresh, resetSelected } = props;
  const [form, setForm] = useState<RoleDto>({ ...defaultRoleDto });
  const { data: role, isFetching } = RoleHook.useGet(id);
  const { mutateAsync: save, isPending } = RoleHook.useSave();

  const handleRoleCode = (value: string) => {
    const roleCode = value.trim().toUpperCase().replace(/\s+/g, '_');
    setForm({ ...form, code: roleCode });
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const response = await save(form);
    if (response && response.success) {
      onOpenChange();
      setForm({ ...defaultRoleDto });
      onRefresh();
    }
  };

  useEffect(() => {
    if (role) {
      setForm({ ...role });
    }
  }, [role]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      onClose={() => {
        setForm({ ...defaultRoleDto });
        resetSelected();
      }}
    >
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">
            {role?.id && role.id !== '0' ? t('editRole') : t('addRole')}
          </ModalHeader>
          <ModalBody>
            {isFetching && <FormSkeleton row={4} />}
            {!isFetching && (
              <Form id="roleForm" onSubmit={onSubmit} className={'flex flex-col gap-3'}>
                <Input
                  isRequired
                  label={t('roleCode')}
                  autoFocus
                  name="roleCode"
                  placeholder={t('roleCode')}
                  value={form.code}
                  onValueChange={(value) => handleRoleCode(value)}
                  validate={(value) => {
                    return !value || value.trim() === '' ? msg('required') : null;
                  }}
                  type="text"
                  variant={'bordered'}
                />
                <Input
                  isRequired
                  label={t('roleName')}
                  autoFocus
                  name="roleName"
                  placeholder={t('roleName')}
                  value={form.name}
                  onValueChange={(value) => setForm({ ...form, name: value })}
                  validate={(value) => {
                    return !value || value.trim() === '' ? msg('required') : null;
                  }}
                  type="text"
                  variant={'bordered'}
                />
                <Input
                  label={t('description')}
                  name="description"
                  placeholder={t('description')}
                  value={form.description}
                  onValueChange={(value) => setForm({ ...form, description: value })}
                  type="text"
                  variant={'bordered'}
                />
              </Form>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenChange}>
              {msg('close')}
            </Button>
            <Button type="submit" color="primary" form="roleForm" isLoading={isPending}>
              {msg('save')}
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
}
