'use client';

import ForgotPasswordModal from '@/app/(admin)/sys/user/components/ForgotPasswordModal';
import { useAuth } from '@/components/ui//layout/AuthProvider';
import { ExtButton } from '@/components/ui/button/ExtButton';
import { defaultLogin, LoginDto } from '@/types/sys/Auth';
import { CardBody, CardHeader } from '@heroui/card';
import { Input } from '@heroui/input';
import { Button, Card, Form, Link, Tooltip, useDisclosure } from '@heroui/react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft02Icon } from 'hugeicons-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'use-intl';

const LoginPage = () => {
  const [form, setForm] = useState<LoginDto>({ ...defaultLogin });
  const { login, isAuthenticated } = useAuth();
  const [isLoginMedworking, setIsLoginMedworking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const router = useRouter();
  const msg = useTranslations('msg');
  const userMsg = useTranslations('user');
  const {
    isOpen: isForgotPasswordOpen,
    onOpen: onOpenForgotPassword,
    onOpenChange: onForgotPasswordOpenChange,
  } = useDisclosure();

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
    setIsLoading(true);
    e.preventDefault();
    await login(form, isLoginMedworking ? 'login-proxy' : 'login');
    setIsLoading(false);
  };

  return (
    <div className="flex justify-center gap-40 h-screen md:p-32 max-sm:p-8 bg-cover bg-center bg-no-repeat bg-[url('/loginbg2.jpg')]">
      <div className={'flex items-center justify-center h-full w-full'}>
        <Card
          className={clsx(
            'p-8 bg-background/5 backdrop-blur-md border-background/40 border-1 w-[500px]',
            'transition-all duration-300 ease-in-out',
            direction === 1 ? 'h-[520px]' : 'h-[350px]',
          )}
        >
          <CardHeader className="flex flex-col gap-3">
            <h3 className="font-bold text-2xl">{msg('welcome')}</h3>
          </CardHeader>
          <CardBody className={'flex flex-col gap-4 overflow-hidden'}>
            <AnimatePresence custom={direction} initial={false} mode="popLayout">
              <motion.div
                key={direction}
                initial={{ opacity: 0, x: direction * 500 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  transition: {
                    delay: 0.2,
                    type: 'spring',
                    visualDuration: 0.3,
                    bounce: 0.4,
                  },
                }}
                exit={{ opacity: 0, x: direction * -500 }}
              >
                {direction === 1 && (
                  <div className="flex flex-col gap-2">
                    <p className="w-full text-center">{msg('welcomeMessage')}</p>
                    <div className="flex justify-end w-full">
                      <Link
                        type="button"
                        className="hover:cursor-pointer hover:text-primary text-default-700"
                        onPress={() => setDirection(-1)}
                        size="sm"
                      >
                        <ArrowLeft02Icon />
                        {msg('back')}
                      </Link>
                    </div>
                    <Form id="loginForm" onSubmit={onSubmit} className={'flex flex-col gap-6'}>
                      <Input
                        isRequired
                        label={userMsg('username')}
                        name="username"
                        value={form.username}
                        onValueChange={(value) => setForm((prev) => ({ ...prev, username: value }))}
                        placeholder={`${msg('enter')} ${userMsg('username').toLowerCase()}`}
                        validate={(value) => {
                          return value === '' || !value ? msg('required') : null;
                        }}
                        type="text"
                        variant={'bordered'}
                        description={isLoginMedworking ? msg('userMedworking') : undefined}
                      />
                      <Input
                        isRequired
                        label={userMsg('password')}
                        placeholder={`${msg('enter')} ${userMsg('password').toLowerCase()}`}
                        value={form.password}
                        onValueChange={(value) => setForm((prev) => ({ ...prev, password: value }))}
                        variant="bordered"
                        validate={(value) => {
                          const error = validatePassword(value);
                          if (error && error.length > 0) return error;
                        }}
                        type={'password'}
                      />
                      {!isLoginMedworking && (
                        <div className={'flex justify-end w-full'}>
                          <Link className="hover:cursor-pointer" onPress={onOpenForgotPassword}>
                            {userMsg('forgotPassword')}
                          </Link>
                        </div>
                      )}
                      <Button
                        form="loginForm"
                        type="submit"
                        color="primary"
                        className={'w-full'}
                        isLoading={isLoading}
                      >
                        {msg('login')}
                      </Button>
                      <p className={'text-default-700 text-sm w-full text-center'}>
                        {msg('haventAccount', { admin: 'Admin' })}
                      </p>
                    </Form>
                  </div>
                )}
                {direction === -1 && (
                  <>
                    <p className="w-full text-center mb-4">{msg('selectLoginMethod')}</p>

                    <div className="flex items-center justify-center gap-6">
                      <Tooltip content={msg('loginMedworking')}>
                        <ExtButton
                          color="transparent"
                          size="sm"
                          className="w-32 h-32"
                          onPress={() => {
                            setDirection(1);
                            setIsLoginMedworking(true);
                          }}
                        >
                          <Image
                            src="/mwklogo.png"
                            className="rounded-md"
                            width={128}
                            height={128}
                            alt="medwk logo"
                          />
                        </ExtButton>
                      </Tooltip>
                      <Tooltip content={msg('loginSystem')}>
                        <ExtButton
                          color="transparent"
                          size="sm"
                          className="w-32 h-32"
                          onPress={() => {
                            setDirection(1);
                            setIsLoginMedworking(false);
                          }}
                        >
                          <Image
                            src="/logo.png"
                            className="rounded-md"
                            width={128}
                            height={128}
                            alt="logo"
                          />{' '}
                        </ExtButton>
                      </Tooltip>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
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
