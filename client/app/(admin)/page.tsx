'use client';
import { ExtDropzone } from '@/components/ui/input/ExtDropZone';
import clsx from 'clsx';

export default function Home() {
  return (
    <div className={clsx(`text-foreground bg-background`, 'min-h-screen flex flex-row')}>
      <ExtDropzone maxFiles={3} maxSize={10} accept={{ 'image/*': [], 'application/pdf': [] }} />
    </div>
  );
}
