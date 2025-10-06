import { Card, CardBody, Skeleton } from '@heroui/react';

export default function PageContentSkeleton() {
  return (
    <div className="h-full w-full flex flex-col gap-3">
      <div className="flex justify-between items-center h-16 w-full">
        <Skeleton className="flex w-52 h-8 rounded-lg" />
        <Skeleton className="flex w-16 h-8 rounded-md" />
      </div>
      <Card className="h-full">
        <CardBody className="h-full">
          <Skeleton className="w-full h-full rounded-md" />
        </CardBody>
      </Card>
    </div>
  );
}
