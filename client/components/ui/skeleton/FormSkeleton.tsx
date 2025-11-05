import { Card, CardBody, Skeleton } from '@heroui/react';

interface IFormSkeleton {
  row: number;
  col?: number;
}

export default function FormSkeleton(props: IFormSkeleton) {
  const { row, col = 1 } = props;
  return (
    <div className="h-full w-full">
      <Card>
        <CardBody>
          <div className="flex gap-6">
            {Array.from({ length: col }).map((_, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-4">
                {Array.from({ length: row }).map((_, rowIndex) => (
                  <div key={rowIndex} className={'flex flex-col gap-2'}>
                    <Skeleton className="h-4 w-8 rounded-lg"></Skeleton>
                    <Skeleton className="h-8 w-full rounded-md"></Skeleton>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
