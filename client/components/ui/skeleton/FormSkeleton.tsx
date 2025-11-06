import { Skeleton } from '@heroui/react';
import clsx from 'clsx';

interface IFormSkeleton {
  row: number;
  col?: number;
}

export default function FormSkeleton(props: IFormSkeleton) {
  const { row, col = 1 } = props;
  return (
    <div
      className={clsx('grid gap-6 w-full h-full')}
      style={{ gridTemplateColumns: `repeat(${col}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: col }).map((_, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-4">
          {Array.from({ length: row }).map((_, rowIndex) => (
            <div key={rowIndex} className={'flex flex-col gap-2'}>
              <Skeleton className="h-4 w-16 rounded-lg"></Skeleton>
              <Skeleton className="h-8 w-full rounded-md"></Skeleton>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
