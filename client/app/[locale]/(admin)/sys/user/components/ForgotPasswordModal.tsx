'use client';

import { AuthHook } from '@/hooks/sys/auth';
import { defaultForgotPasswordDto, ForgotPasswordDto } from '@/types/sys/User';
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
import { FormEvent, useEffect, useState } from 'react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
}

export default function ForgotPasswordModal(props: ForgotPasswordModalProps) {
  const { isOpen, onOpenChange } = props;
  const userMsg = useTranslations('user');
  const msg = useTranslations('msg');
  const [form, setForm] = useState<ForgotPasswordDto>({ ...defaultForgotPasswordDto });
  const { mutateAsync: requestReset, isPending } = AuthHook.useForgotPassword();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await requestReset(form);
    if (response && response.success) {
      setForm({ ...defaultForgotPasswordDto });
      onOpenChange();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setForm({ ...defaultForgotPasswordDto });
    }
  }, [isOpen]);

  return (
    <Modal
      isDismissable={false}
      isKeyboardDismissDisabled
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
    >
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">{userMsg('forgotPassword')}</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-500">{userMsg('forgotPasswordDescription')}</p>
            <Form id="forgotPasswordForm" onSubmit={onSubmit} className="flex flex-col gap-4 mt-2">
              <Input
                autoFocus
                isRequired
                type="email"
                label={userMsg('email')}
                placeholder={userMsg('email')}
                value={form.email}
                onValueChange={(value) => setForm({ ...form, email: value })}
                variant="bordered"
                validate={(value) => {
                  if (!value || value.trim() === '') {
                    return msg('required');
                  }
                }}
              />
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenChange}>
              {msg('close')}
            </Button>
            <Button type="submit" color="primary" form="forgotPasswordForm" isLoading={isPending}>
              {msg('submit')}
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
}
