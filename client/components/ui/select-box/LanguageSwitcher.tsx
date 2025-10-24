'use client';

import { locales } from '@/i18n/locale-support';
import { useAuthStore } from '@/store/auth-store';
import { Select, SelectItem } from '@heroui/react';

export default function LanguageSwitcher() {
  const { user, setUser } = useAuthStore();
  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (user) {
      setUser({
        ...user,
        language: e.target.value || 'vi',
      });
    }
  };

  return (
    <Select
      className="max-w-xs"
      aria-label="Select language"
      classNames={{ base: 'w-16', popoverContent: 'w-20' }}
      size="sm"
      selectedKeys={user ? new Set([user.language]) : new Set(['vi'])}
      onChange={handleSelectionChange}
    >
      {locales.map((lang) => (
        <SelectItem key={lang.key}>{lang.label}</SelectItem>
      ))}
    </Select>
  );
}
