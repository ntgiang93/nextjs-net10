'use client';

import { SwitchProps, useSwitch } from '@heroui/switch';
import { useIsSSR } from '@react-aria/ssr';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon02Icon, Sun03Icon } from 'hugeicons-react';
import { useTheme } from 'next-themes';
import { FC } from 'react';
import { ExtButton } from './ExtButton';

export interface ThemeSwitchProps {
  className?: string;
  classNames?: SwitchProps['classNames'];
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className, classNames }) => {
  const { theme, setTheme } = useTheme();
  const isSSR = useIsSSR();

  const onChange = () => {
    console.log('Current theme:', theme);
    theme === 'light' ? setTheme('dark') : setTheme('light');
  };

  const { Component, slots, isSelected, getBaseProps, getInputProps, getWrapperProps } = useSwitch({
    isSelected: theme === 'light' || isSSR,
    'aria-label': `Switch to ${theme === 'light' || isSSR ? 'dark' : 'light'} mode`,
    onChange,
  });

  return (
    <Component>
      <AnimatePresence mode={'popLayout'} initial={false}>
        {isSelected ? (
          <motion.div
            key={'light'}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <ExtButton color={'transparent'} isIconOnly variant={'light'} onPress={onChange}>
              <Moon02Icon size={22} />
            </ExtButton>
          </motion.div>
        ) : (
          <motion.div
            key={'dark'}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <ExtButton color={'transparent'} isIconOnly variant={'light'} onPress={onChange}>
              <Sun03Icon size={22} />
            </ExtButton>
          </motion.div>
        )}
      </AnimatePresence>
    </Component>
  );
};
