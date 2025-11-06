'use client';
import { ExtButton } from '@/components/ui/button/ExtButton';
import PageLayout from '@/components/ui/layout/PageContentLayout';
import { UserHook } from '@/hooks/user';
import { defaultUserDto } from '@/types/sys/User';
import { Card, CardBody, Tab, Tabs } from '@heroui/react';
import { ArrowLeft01Icon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import AccountCard from './AccountCard';
import ActionCard from './ActionCard';
import UserAttachmentsDocument from './UserAttachmentsDocument';
import UserProfileForm from './UserProfileForm';

interface IUserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: IUserDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations('user');
  const msg = useTranslations('msg');
  const { data: user, isFetching, refetch } = UserHook.useGet(id);
  return (
    <PageLayout
      title={t('userDetails')}
      toolbar={
        <div className="flex gap-2">
          <ExtButton
            color="default"
            startContent={<ArrowLeft01Icon size={16} />}
            variant="light"
            onPress={() => router.back()}
          >
            {msg('back')}
          </ExtButton>
        </div>
      }
      mainContent={
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-6 max-lg:gap-y-6 h-full">
          <div className="md:col-span-1 flex flex-col gap-6 h-full">
            <AccountCard user={user || { ...defaultUserDto }} loading={isFetching} />
            <div className="flex-1">
              <ActionCard user={user || { ...defaultUserDto }} fetchUser={refetch} />
            </div>
          </div>
          {/* Profile Card */}
          <Card className="md:col-span-2">
            <CardBody>
              <Tabs aria-label="Options" classNames={{ panel: 'h-full w-full' }}>
                <Tab key="generalInfo" title={t('generalInfo')}>
                  <UserProfileForm id={id} />
                </Tab>
                <Tab key="attachments" title={t('userDocAttachments')}>
                  <UserAttachmentsDocument id={id} />
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
        </div>
      }
    />
  );
}
