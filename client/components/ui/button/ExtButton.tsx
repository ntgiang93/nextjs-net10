// MyButton.tsx
import { extendVariants, Button } from '@heroui/react';

export const ExtButton = extendVariants(Button, {
  variants: {
    // <- modify/add variants
    color: {
      transparent: 'bg-transparent text-foreground',
    },
    isDisabled: {
      true: 'bg-[#eaeaea] text-[#000] opacity-50 cursor-not-allowed',
    },
    size: {
      xs: 'px-2 min-w-6 h-6 text-tiny gap-1 rounded-small',
    },
    variant: {
      shadowSmall:
        'transition-transform-colors-opacity motion-reduce:transition-none shadow-md shadow-primary/40 bg-primary text-primary-foreground data-[hover=true]:opacity-hover',
    },
  },
  defaultVariants: {
    // <- modify/add default variants
  },
  compoundVariants: [
    // <- modify/add compound variants
    {},
  ],
});
