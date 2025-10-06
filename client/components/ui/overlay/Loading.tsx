import { Spinner } from '@heroui/react';
import { useTranslations } from 'next-intl';

export default function Loading() {
  const msg = useTranslations('msg');
  return (
    <div className="flex items-center justify-center h-full w-full opacity-80 bg-background">
      <Spinner classNames={{ label: 'text-foreground mt-4' }} label={msg('loading')} variant="gradient" />
    </div>
  );
}
