'use client';

import { useAuth } from '@/components/ui//layout/AuthProvider';
import { defaultLogin, LoginDto } from '@/types/sys/Auth';
import { CardBody, CardFooter, CardHeader } from '@heroui/card';
import { Input } from '@heroui/input';
import { Button, Card, Form, Link, Spacer } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const LoginPage = () => {
  const [form, setForm] = useState<LoginDto>({ ...defaultLogin });
  const { isLoading, login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Chuyển hướng nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

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

  const onSubmit = async (e: any) => {
    e.preventDefault();
    await login(form);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-40 h-screen md:p-32 max-sm:p-8 bg-gradient-to-tr from-transparent via-primary-100 to-primary-500">
      <div className="flex items-center max-lg:hidden">
        <div className={'flex flex-col'}>
          <h3 className="font-bold text-2xl">Your website name</h3>
          <p>
            It is a long established fact that a reader will be distracted by
            the readable content of a page when looking at its layout.
          </p>
        </div>
      </div>
      <div className={'flex items-center justify-center h-full'}>
        <Card className="p-8 w-full max-w-[500]">
          <CardHeader className="flex flex-col gap-3">
            <h3 className="font-bold text-2xl">Welcome back</h3>
            <p>Log in to your account to continue.</p>
          </CardHeader>
          <CardBody className={'flex flex-col gap-4'}>
            <Form onSubmit={onSubmit} className={'flex flex-col gap-6'}>
              <Input
                isRequired
                label="Username"
                name="username"
                value={form.username}
                onValueChange={(value) => setForm({ ...form, username: value })}
                placeholder="Enter your username"
                validate={(value) => {
                  return value === '' || !value
                    ? 'This field is required'
                    : null;
                }}
                type="text"
                variant={'bordered'}
              />
              <Input
                isRequired
                label="Password"
                placeholder="Enter your password"
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
                <Link className={'text-sm'}>forgot password</Link>
              </div>
              <Button
                type="submit"
                color={'primary'}
                className={'w-full'}
                isLoading={isLoading}
              >
                Submit
              </Button>
            </Form>
            <CardFooter className="flex justify-center">
              <p className={'text-default-700 text-sm'}>
                {"Don't have account? Please contact"}
              </p>{' '}
              <Spacer x={1} />
              <Link className={'font-semibold text-sm'}>Admin</Link>
            </CardFooter>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
