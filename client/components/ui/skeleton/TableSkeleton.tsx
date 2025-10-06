import { Skeleton } from '@heroui/react';

interface ITableSkeletonProps {
  col: number;
  row: number;
  showHeader?: boolean;
}

export default function TableSkeleton(props: ITableSkeletonProps) {
  const { col, row, showHeader } = props;
  return (
    <div className="h-full w-full bg-background rounded-lg shadow-md gap-4 p-3 mb-3">
      <div className="flex flex-row justify-between">
        <Skeleton className="flex w-64 h-8 rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="flex w-6 h-6 rounded-md" />
          <Skeleton className="flex w-6 h-6 rounded-md" />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: row }).map((_, rowIndex) => (
          <div key={rowIndex} className={'flex gap-2 border-b-1 justify-center border-default-300 p-3'}>
            {Array.from({ length: col }).map((_, colIndex) => {
              if (rowIndex === 0 && showHeader)
                return <Skeleton key={colIndex} className="flex-1 h-8 rounded-lg"></Skeleton>;
              else return <Skeleton key={colIndex} className="flex-1 h-4 rounded-lg"></Skeleton>;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
