import RoleSelect from '@/components/shared/sys/Select/RoleSelect';
import FormSkeleton from '@/components/ui/skeleton/FormSkeleton';
import { UserHook } from '@/hooks/user';
import { defaultCreateUserDto, SaveUserDto } from '@/types/sys/User';
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
import { useEffect, useMemo, useState } from 'react';

interface UserCreateModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onRefresh: () => void;
  id: string;
}

export default function UserDetailModal(props: UserCreateModalProps) {
  const t = useTranslations('user');
  const tr = useTranslations('role');
  const msg = useTranslations('msg');
  const { isOpen, onOpenChange, onRefresh, id } = props;
  const [form, setForm] = useState<SaveUserDto>({ ...defaultCreateUserDto });
  const { mutateAsync: save, isPending } = UserHook.useSaveUser();
  const { data: user, isFetching } = UserHook.useGet(id);

  const isEdit = useMemo(() => id != undefined && id != '', [id]);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    console.log('Submitting form:', form);
    const response = await save(form);
    if (response && response.success) {
      onOpenChange();
      onRefresh();
    }
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validateEmail = (value: string) => {
    if (value && value.length > 0 && !emailRegex.test(value)) {
      return 'Invalid email format';
    }
    return null;
  };

  const validatePhoneNumber = (value: string) => {
    if (value || value.trim() !== '') {
      const phoneRegex = /^0\d{8,14}$/;
      if (!phoneRegex.test(value)) {
        return 'Invalid phone number format';
      }
    }
    return null;
  };

  useEffect(() => {
    if (user) setForm({ ...user });
  }, [user]);

  return (
    <Modal
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={() => {
        setForm({ ...defaultCreateUserDto });
      }}
      scrollBehavior="inside"
    >
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">
            {isEdit ? t('editUser') : t('addUser')}
          </ModalHeader>
          <ModalBody>
            {isFetching && <FormSkeleton row={4} />}
            {!isFetching && (
              <Form id="userForm" onSubmit={onSubmit} className={'flex flex-col gap-3'}>
                <Input
                  isRequired
                  label={t('fullName')}
                  autoFocus
                  name="fullName"
                  placeholder={t('fullName')}
                  value={form.fullName}
                  onValueChange={(value) => setForm({ ...form, fullName: value })}
                  validate={(value) => {
                    return value === '' || !value ? msg('required') : null;
                  }}
                  type="text"
                  variant={'bordered'}
                />
                <Input
                  disabled={isEdit}
                  label={t('username')}
                  description={t('userNameDesc')}
                  name="username"
                  placeholder={t('username')}
                  value={form.userName}
                  onValueChange={(value) => setForm({ ...form, userName: value })}
                  type="text"
                  variant={'bordered'}
                />
                <Input
                  label={t('email')}
                  name="email"
                  placeholder={t('email')}
                  value={form.email}
                  onValueChange={(value) => setForm({ ...form, email: value })}
                  validate={(value) => {
                    const valid = validateEmail(value);
                    return valid;
                  }}
                  type="text"
                  variant={'bordered'}
                />
                <RoleSelect
                  value={form.roles || []}
                  onChange={(values) => {
                    setForm({ ...form, roles: [...values] });
                  }}
                  selectionMode="multiple"
                  label={tr('role')}
                  labelPlacement={'outside'}
                  variant="bordered"
                />
                <Input
                  label={t('phone')}
                  name="phoneNumber"
                  placeholder={t('phone')}
                  value={form.phoneNumber}
                  onValueChange={(value) => setForm({ ...form, phoneNumber: value })}
                  variant="bordered"
                  validate={(value) => {
                    return validatePhoneNumber(value);
                  }}
                />
              </Form>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenChange}>
              {msg('close')}
            </Button>
            <Button type="submit" color="primary" form="userForm" isLoading={isPending}>
              {msg('save')}
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
}
