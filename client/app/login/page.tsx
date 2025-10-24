'use client';

import ForgotPasswordModal from '@/app/(admin)/sys/user/components/ForgotPasswordModal';
import { useAuth } from '@/components/ui//layout/AuthProvider';
import { defaultLogin, LoginDto } from '@/types/sys/Auth';
import { CardBody, CardFooter, CardHeader } from '@heroui/card';
import { Input } from '@heroui/input';
import { Button, Card, Form, Link, useDisclosure } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'use-intl';

const LoginPage = () => {
  const [form, setForm] = useState<LoginDto>({ ...defaultLogin });
  const { isLoading, login, isAuthenticated } = useAuth();
  const router = useRouter();
  const msg = useTranslations('msg');
  const userMsg = useTranslations('user');
  const {
    isOpen: isForgotPasswordOpen,
    onOpen: onOpenForgotPassword,
    onOpenChange: onForgotPasswordOpenChange,
  } = useDisclosure();

  // Chuyển hướng nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const validatePassword = (password: string): string => {
    if (password.length === 0) return msg('required');
    // else if (password.length < 4) {
    //   return 'Password must be 4 characters or more.';
    // } else if ((password.match(/[A-Z]/g) || []).length < 1) {
    //   return 'Password must include at least 1 upper case letter';
    // } else if ((password.match(/[^a-z]/gi) || []).length < 1) {
    //   return 'Password must include at least 1 symbol.';
    // }
    else return '';
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();
    await login(form);
  };

  return (
    <div className="flex justify-center gap-40 h-screen md:p-32 max-sm:p-8 bg-cover bg-center bg-no-repeat bg-[url('/loginbg2.jpg')]">
      <div className={'flex items-center justify-center h-full w-full'}>
        <Card className="p-8 bg-background/5 backdrop-blur-md border-background/40 border-1 w-full max-w-[500px]">
          <CardHeader className="flex flex-col gap-3">
            <h3 className="font-bold text-2xl">{msg('welcome')}</h3>
            <p>{msg('welcomeMessage')}</p>
          </CardHeader>
          <CardBody className={'flex flex-col gap-4'}>
            <Form id="loginForm" onSubmit={onSubmit} className={'flex flex-col gap-6'}>
              <Input
                isRequired
                label={userMsg('username')}
                name="username"
                value={form.username}
                onValueChange={(value) => setForm({ ...form, username: value })}
                placeholder={`${msg('enter')} ${userMsg('username').toLowerCase()}`}
                validate={(value) => {
                  return value === '' || !value ? msg('required') : null;
                }}
                type="text"
                variant={'bordered'}
              />
              <Input
                isRequired
                label={userMsg('password')}
                placeholder={`${msg('enter')} ${userMsg('password').toLowerCase()}`}
                value={form.password}
                onValueChange={(value) => setForm({ ...form, password: value })}
                variant="bordered"
                validate={(value) => {
                  const error = validatePassword(value);
                  if (error && error.length > 0) return error;
                }}
                type={'password'}
              />
              <div className={'flex justify-end w-full'}>
                <Link className="hover:cursor-pointer" onPress={onOpenForgotPassword}>
                  {userMsg('forgotPassword')}
                </Link>
              </div>
              <Button
                form="loginForm"
                type="submit"
                color={'primary'}
                className={'w-full'}
                isLoading={isLoading}
              >
                {msg('login')}
              </Button>
            </Form>
            <CardFooter className="flex justify-center">
              <p className={'text-default-700 text-sm'}>
                {msg('haventAccount', { admin: 'Admin' })}
              </p>{' '}
            </CardFooter>
          </CardBody>
        </Card>
      </div>
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onOpenChange={onForgotPasswordOpenChange}
      />
    </div>
  );
};

export default LoginPage;
