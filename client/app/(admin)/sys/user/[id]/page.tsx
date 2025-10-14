'use client';
import { ExtButton } from '@/components/ui/button/ExtButton';
import { PageHeader } from '@/components/ui/navigate/PageHeader';
import { UserHook } from '@/hooks/user';
import { defaultUserDto } from '@/types/sys/User';
import { Card, CardBody, Tab, Tabs } from '@heroui/react';
import { ArrowLeft01Icon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import AccountCard from './AccountCard';
import ActionCard from './ActionCard';
import UserProfileForm from './UserProfileForm';

interface IUserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: IUserDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations('user');
  const msg = useTranslations('msg');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const { data: user, isFetching, refetch } = UserHook.useGet(id);
  return (
    <div className="h-full flex flex-col gap-4">
      <PageHeader
        title={t('userDetails')}
        toolbar={
          <div className="flex gap-2">
            <ExtButton
              color="default"
              startContent={<ArrowLeft01Icon size={16} />}
              variant="light"
              onPress={() => router.back()}
            >
              Back
            </ExtButton>
          </div>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        <div className="md:col-span-1 flex flex-col gap-4">
          <AccountCard user={user || { ...defaultUserDto }} loading={isFetching} />
          {/* Action Card */}
          <ActionCard user={user || { ...defaultUserDto }} fetchUser={refetch} />
        </div>
        {/* Profile Card */}
        <Card className="md:col-span-2">
          <CardBody>
            <Tabs aria-label="Options">
              <Tab key="generalInfo" title={t('generalInfo')} className="h-full">
                <UserProfileForm user={user || { ...defaultUserDto }} />
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
