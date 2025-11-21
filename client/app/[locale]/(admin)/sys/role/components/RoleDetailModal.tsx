import FormSkeleton from '@/components/ui/skeleton/FormSkeleton';
import { RoleHook } from '@/hooks/sys/role';
import { defaultRoleDto, RoleDto } from '@/types/sys/Role';
import {
  Button,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
interface UserCreateModalProps {
  id: number;
  isOpen: boolean;
  onOpenChange: () => void;
  onRefresh: () => void;
}

export default function RoleDetailModal(props: UserCreateModalProps) {
  const t = useTranslations('role');
  const msg = useTranslations('msg');
  const { id, isOpen, onOpenChange, onRefresh } = props;
  const [form, setForm] = useState<RoleDto>({ ...defaultRoleDto });
  const { data: role, isFetching } = RoleHook.useGet(isOpen ? id : 0);
  const { mutateAsync: save, isPending } = RoleHook.useSave();

  const handleRoleCode = (value: string) => {
    const roleCode = value.trim().toUpperCase().replace(/\s+/g, '_');
    setForm((prev) => ({ ...prev, code: roleCode }));
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const response = await save(form);
    if (response && response.success) {
      onOpenChange();
      onRefresh();
    }
  };

  useEffect(() => {
    if (role) {
      setForm({ ...role });
    }
  }, [role]);

  useEffect(() => {
    if (!isOpen) {
      setForm((prev) => ({ ...prev, ...defaultRoleDto }));
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside">
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">
            {role?.id && role.id > 0 ? t('editRole') : t('addRole')}
          </ModalHeader>
          <ModalBody>
            {isFetching && <FormSkeleton row={3} />}
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
                  onValueChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
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
                  onValueChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
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
