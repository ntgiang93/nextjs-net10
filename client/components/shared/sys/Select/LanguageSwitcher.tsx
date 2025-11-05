'use client';

import { locales } from '@/i18n/locale-support';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Select, SelectItem } from '@heroui/react';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleSelectionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value || 'vi';
    if (locale !== value) {
      router.replace(pathname, { locale: value });
      router.refresh();
    }
  };

  return (
    <Select
      className="max-w-xs"
      aria-label="Select language"
      classNames={{ base: 'w-16', popoverContent: 'w-20' }}
      size="sm"
      selectedKeys={new Set([locale || 'vi'])}
      onChange={handleSelectionChange}
    >
      {locales.map((lang) => (
        <SelectItem key={lang.key}>{lang.label}</SelectItem>
      ))}
    </Select>
  );
}
