import { UserDto } from '@/types/sys/User';
import { Card, CardBody, Chip, Skeleton, User } from '@heroui/react';
import dayjs from 'dayjs';
import {
  CheckmarkCircle03Icon,
  MailAtSign01Icon,
  ShieldUserIcon,
  TelephoneIcon,
  UserIcon,
  UserLock01Icon,
} from 'hugeicons-react';
import { useTranslations } from 'next-intl';
interface IAccountCardProps {
  user: UserDto;
  loading: boolean;
}

export default function AccountCard(props: IAccountCardProps) {
  const { user, loading } = props;
  const t = useTranslations('user');
  const msg = useTranslations('msg');
  return (
    <Card>
      <CardBody className="flex flex-col justify-start gap-4 text-sm h-max overflow-hidden">
        {loading && (
          <>
            <div className="max-w-[300px] w-full flex items-center gap-3">
              <div>
                <Skeleton className="flex rounded-full w-14 h-14" />
              </div>
              <div className="w-full flex flex-col gap-2">
                <Skeleton className="h-4 w-3/5 rounded-lg" />
                <Skeleton className="h-3 w-4/5 rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-3 w-3/5 rounded-lg" />
            <Skeleton className="h-4 w-3/5 rounded-lg" />
            <Skeleton className="h-4 w-3/5 rounded-lg" />
            <Skeleton className="h-4 w-3/5 rounded-lg" />
            <Skeleton className="h-4 w-3/5 rounded-lg" />
          </>
        )}
        {!loading && (
          <>
            <User
              className="justify-start"
              avatarProps={{
                src: user.avatar || `https://ui-avatars.com/api/?name=${user.fullName}`,
                alt: 'Avatar',
                size: 'lg',
                isBordered: true,
                color: 'primary',
              }}
              description={`ID: ${user.id}`}
              name={<span className="text-lg font-semibold">{user.fullName || 'Unknow User'}</span>}
            />
            {user.isActive && (
              <div className="flex items-center gap-2 text-success">
                <CheckmarkCircle03Icon size={16} />
                <span>{msg('active')}</span>
              </div>
            )}
            {!user.isActive && (
              <div className="flex items-center gap-2 text-default">
                <CheckmarkCircle03Icon size={16} />
                <span>{msg('inactive')}</span>
              </div>
            )}
            {user.isLocked && (
              <div className="flex items-center gap-2 text-danger">
                <UserLock01Icon size={16} />
                <span>{dayjs(user.lockExprires).format('DD/MM/YYYY HH:mm:ss')}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <UserIcon size={16} />
              <span>{user.userName}</span>
            </div>
            <div className="flex items-center gap-2">
              <MailAtSign01Icon size={16} />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <TelephoneIcon size={16} />
              <span>{user.phone}</span>
            </div>
            {user.twoFa && (
              <div className="flex items-center gap-2 text-success">
                <ShieldUserIcon size={16} />
                <span>{t('twofaEnabled')}</span>
              </div>
            )}
            {!user.twoFa && (
              <div className="flex items-center gap-2 text-default">
                <ShieldUserIcon size={16} />
                <span>{t('twofaDisabled')}</span>
              </div>
            )}
            <div className="flex gap-2">
              {user.rolesName?.map((r) => (
                <Chip key={r} variant="flat">
                  {r}
                </Chip>
              ))}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
