import { ReactNode } from 'react';

interface IPageHeaderProps {
  title: string;
  description?: string;
  toolbar?: ReactNode;
}

export const PageHeader = (props: IPageHeaderProps) => {
  const { title, toolbar, description } = props;

  return (
    <div className="h-fit py-3 flex flex-row justify-between items-center overflow-hidden">
      <div>
        <p className="text-xl font-semibold">{title}</p>
        <p className="text-sm text-secondary-300">{description}</p>
      </div>
      <div className="flex flex-row">{toolbar}</div>
    </div>
  );
};
