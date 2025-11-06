'use client';
import { ReactNode } from 'react';

interface AdminPageContentLayoutProps {
  title: string;
  description?: string;
  toolbar?: ReactNode;
  mainContent?: ReactNode;
}

export default function PageLayout(props: AdminPageContentLayoutProps) {
  const { title, description, toolbar, mainContent } = props;

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="h-16 py-3 flex flex-row justify-between items-center overflow-hidden">
        <div>
          <p className="text-xl font-semibold">{title}</p>
          <p className="text-sm text-secondary-300">{description}</p>
        </div>
        <div className="flex flex-row">{toolbar}</div>
      </div>
      <div className="flex-1">{mainContent}</div>
    </div>
  );
}
