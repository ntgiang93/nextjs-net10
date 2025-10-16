import RoleSelect from '@/components/shared/sys/Select/RoleSelect';
import FormSkeleton from '@/components/ui/skeleton/FormSkeleton';
import { UserHook } from '@/hooks/user';
import { defaultUserDto, SaveUserDto, UserDto } from '@/types/sys/User';
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
  const [form, setForm] = useState<UserDto>({ ...defaultUserDto });
  const { mutateAsync: save, isPending } = UserHook.useSaveUser();
  const { data: user, isFetching, isLoading } = UserHook.useGet(isOpen ? id : '');

  const isEdit = useMemo(() => id != undefined && id != '', [id]);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const body: SaveUserDto = {
      id: form.id,
      fullName: form.fullName,
      userName: form.userName,
      email: form.email,
      phoneNumber: form.phone,
      roles: form.roles,
    };
    const response = await save(body);
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
    if (user && user.id === id) {
      setForm({ ...user });
    }
  }, [user]);

  return (
    <Modal
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={() => setForm((prev) => ({ ...prev, ...defaultUserDto }))}
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {isEdit ? t('editUser') : t('addUser')}
            </ModalHeader>
            <ModalBody>
              {(isFetching || isLoading) && <FormSkeleton row={5} />}
              {!isFetching && !isLoading && (
                <Form id="userForm" onSubmit={onSubmit} className={'flex flex-col gap-3'}>
                  <Input
                    isRequired
                    label={t('fullName')}
                    autoFocus
                    name="fullName"
                    placeholder={t('fullName')}
                    value={form.fullName || ''}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, fullName: value }))}
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
                    value={form.userName || ''}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, userName: value }))}
                    type="text"
                    variant={'bordered'}
                  />
                  <Input
                    label={t('email')}
                    name="email"
                    placeholder={t('email')}
                    value={form.email || ''}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
                    validate={(value) => {
                      const valid = validateEmail(value);
                      return valid;
                    }}
                    type="text"
                    variant={'bordered'}
                  />
                  <RoleSelect
                    value={form.roles.map(String) || []}
                    onChange={(values) => {
                      setForm((prev) => ({ ...prev, roles: [...values] }));
                    }}
                    selectionMode="multiple"
                    label={tr('role')}
                    labelPlacement={'outside'}
                    variant="bordered"
                  />
                  <Input
                    label={t('phone')}
                    name="phone"
                    placeholder={t('phone')}
                    value={form.phone || ''}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
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
        )}
      </ModalContent>
    </Modal>
  );
}
