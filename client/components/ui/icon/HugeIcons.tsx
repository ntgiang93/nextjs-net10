import { icons } from 'hugeicons-react';
import React, { useMemo } from 'react';

interface IHugeIconsProps {
  name: string;
  size?: number;
  color?: string;
  stroke?: string;
}

export const HugeIcons: React.FC<IHugeIconsProps> = ({
  name,
  size = 14,
  color,
  stroke,
}) => {
  // Tạo tên icon dưới dạng PascalCase
  const jsxName = useMemo(() => {
    if (name.includes('Icon')) return name;
    return (
      name
        .split('-')
        .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
        .join('') + 'Icon'
    );
  }, [name]);

  const Icon = icons[jsxName as keyof typeof icons];

  if (!Icon) {
    return null;
  }

  return <Icon stroke={stroke} size={size} color={color} />;
};
