'use client';
import { ReactNode } from 'react';
import { AdminLayout } from '@/components/ui//layout/AdminLayout';

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return <AdminLayout>{children}</AdminLayout>;
}
