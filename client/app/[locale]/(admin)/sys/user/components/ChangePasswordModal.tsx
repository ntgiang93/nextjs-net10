import { AuthHook } from '@/hooks/sys/auth';
import { ChangePasswordDto, defaultChangePasswordDto } from '@/types/sys/User';
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
import { useState } from 'react';

interface IChangePasswordModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onRefresh: () => void;
}

export default function ChangePasswordModal(props: IChangePasswordModalProps) {
  const t = useTranslations('user');
  const msg = useTranslations('msg');
  const { isOpen, onOpenChange, onRefresh } = props;
  const [form, setForm] = useState<ChangePasswordDto>({ ...defaultChangePasswordDto });
  const { mutateAsync: submit, isPending } = AuthHook.useChangePassword();

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const response = await submit(form);
    if (response && response.success) {
      onOpenChange();
      setForm({ ...defaultChangePasswordDto });
      onRefresh();
    }
  };

  const validatePassword = (password: string): string => {
    if (password.length === 0) return 'This field is required';
    else if (password.length < 4) {
      return 'Password must be 4 characters or more.';
    } else if ((password.match(/[A-Z]/g) || []).length < 1) {
      return 'Password must include at least 1 upper case letter';
    } else if ((password.match(/[^a-z]/gi) || []).length < 1) {
      return 'Password must include at least 1 symbol.';
    } else return '';
  };

  return (
    <Modal
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
    >
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">{t('changePassword')}</ModalHeader>
          <ModalBody>
            <Form id="userForm" onSubmit={onSubmit} className={'flex flex-col gap-3'}>
              <Input
                isRequired
                label={t('oldPassword')}
                placeholder={t('oldPassword')}
                value={form.oldPassword}
                onValueChange={(value) => setForm({ ...form, oldPassword: value })}
                variant="bordered"
                validate={(value) => {
                  if (!value || value.trim() === '') {
                    return msg('required');
                  }
                }}
                type={'password'}
              />
              <Input
                isRequired
                label={t('password')}
                placeholder={t('password')}
                value={form.newPassword}
                onValueChange={(value) => setForm({ ...form, newPassword: value })}
                variant="bordered"
                validate={(value) => {
                  const error = validatePassword(value);
                  if (error && error.length > 0) return error;
                }}
                type={'password'}
              />
              <Input
                isRequired
                label={t('confirmPassword')}
                placeholder={t('confirmPassword')}
                value={form.confirmPassword}
                onValueChange={(value) => setForm({ ...form, confirmPassword: value })}
                variant="bordered"
                validate={(value) => {
                  if (!value || value.trim() === '') {
                    return msg('required');
                  } else if (value !== form.newPassword) {
                    return t('passwordMismatch');
                  }
                }}
                type={'password'}
              />
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenChange}>
              {msg('close')}
            </Button>
            <Button type="submit" color="primary" form="userForm" isLoading={isPending}>
              {msg('submit')}
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
}
