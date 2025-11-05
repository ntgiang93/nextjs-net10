'use client';

import type { ThemeProviderProps } from 'next-themes';

import { HeroUIProvider, ToastProvider } from '@heroui/react';
import { I18nProvider } from '@react-aria/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useRouter } from 'next/navigation';
import * as React from 'react';

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
  locale: string;
}

declare module '@react-types/shared' {
  interface RouterConfig {
    routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>['push']>[1]>;
  }
}

export function Providers({ children, themeProps, locale }: ProvidersProps) {
  const router = useRouter();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false, // Prevents automatic refetching when user switches back to the browser tab
        retry: 0, // Disables automatic retry attempts on failed queries to avoid unnecessary network requests
        staleTime: 1000, // Sets data as fresh for 1 second (1000ms), preventing immediate refetches
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider navigate={router.push} labelPlacement="outside">
        <NextThemesProvider {...themeProps}>
          <I18nProvider locale={locale}>{children}</I18nProvider>
        </NextThemesProvider>
        <ToastProvider placement={'top-right'} toastProps={{ timeout: 3000 }} />
      </HeroUIProvider>
    </QueryClientProvider>
  );
}
