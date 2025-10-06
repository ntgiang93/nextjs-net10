import { Card, CardBody, Skeleton } from '@heroui/react';

interface IFormSkeleton {
  row: number;
}

export default function FormSkeleton(props: IFormSkeleton) {
  const { row } = props;
  return (
    <div className="h-full w-full">
      <Card>
        <CardBody>
          <div className="flex flex-col gap-4">
            {Array.from({ length: row }).map((_, rowIndex) => (
              <div key={rowIndex} className={'flex flex-col gap-2'}>
                <Skeleton className="h-4 w-8 rounded-lg"></Skeleton>
                <Skeleton className="h-8 w-full rounded-md"></Skeleton>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
