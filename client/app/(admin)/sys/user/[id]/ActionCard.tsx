import { ESysModule } from '@/components/ui/layout/AuthHelper';
import { useAuth } from '@/components/ui/layout/AuthProvider';
import { UserHook } from '@/hooks/user';
import { EPermission } from '@/libs/AuthHelper';
import { UserDto } from '@/types/sys/User';
import { Card, CardBody, CardHeader, Link, Spinner, addToast, useDisclosure } from '@heroui/react';
import {
  Edit01Icon,
  Image02Icon,
  MailAccount01Icon,
  ResetPasswordIcon,
  SecurityPasswordIcon,
  ShieldUserIcon,
  TelephoneIcon,
} from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import UserDetailModal from '../components/UserDetailModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { useAuthStore } from '@/store/auth-store';

interface IActionCardProps {
  user: UserDto;
  fetchUser: () => void;
}

export default function ActionCard(props: IActionCardProps) {
  const { user, fetchUser } = props;
  const t = useTranslations('user');
  const msg = useTranslations('msg');
  const { hasPermission } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: updateAvatar, isPending } = UserHook.useUpdateAvatar();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isOpenChangePass, onOpen: openChangePass, onOpenChange: openChangeChangePass } = useDisclosure();
  const { user: loginUser } = useAuthStore();

  // Hàm xử lý khi người dùng chọn file
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await updateAvatar({ userId: user.id, file });
      fetchUser();
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input file
      }
    } else {
      addToast({
        title: msg('error'),
        description: msg('fileRequired'),
        color: 'danger',
      });
    }
  };
  // Hàm mở hộp thoại chọn file
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  console.log('user', user);
  console.log('loginUser', loginUser);

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <h4 className="text-lg font-semibold">{t('changeAccountInfo')}</h4>
      </CardHeader>
      <CardBody className="flex  flex-col gap-4 text-sm h-max overflow-hidden">
        <div className="flex items-center gap-2">
          <Edit01Icon size={18} />
          <Link
            color="foreground"
            href="#"
            hidden={!hasPermission(EPermission.Edition, ESysModule.Users)}
            onPress={onOpen}
          >
            {t('editUser')}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Image02Icon size={18} />
          {isPending && <Spinner variant="dots" classNames={{ base: 'h-5' }} />}
          {!isPending && (
            <Link
              color="foreground"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleAvatarClick();
              }}
              isDisabled={isPending}
            >
              {t('changeAvatar')}
            </Link>
          )}
          {/* Input file ẩn */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            aria-label={t('changeAvatar')}
          />
        </div>
        {loginUser?.id === user.id && (
          <>
            <div className="flex items-center gap-2">
              <MailAccount01Icon size={18} />
              <Link color="foreground" href="#">
                {t('changeEmail')}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <TelephoneIcon size={18} />
              <Link color="foreground" href="#">
                {t('changePhone')}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <SecurityPasswordIcon size={18} />
              <Link color="foreground" href="#" onPress={openChangePass}>
                {t('changePassword')}
              </Link>
            </div>
          </>
        )}
        <div className="flex items-center gap-2">
          <ResetPasswordIcon size={18} />
          <Link color="foreground" href="#" onPress={openChangePass}>
            {t('resetPassword')}
          </Link>
        </div>
        {user.twoFa && (
          <div className="flex items-center text-danger gap-2">
            <ShieldUserIcon size={18} />
            <Link href="#" color="danger">
              {t('disable2fa')}
            </Link>
          </div>
        )}
        {!user.twoFa && (
          <div className="flex items-center text-primary gap-2">
            <ShieldUserIcon size={18} />
            <Link href="#" hidden={!hasPermission(EPermission.Edition, ESysModule.Users)}>
              {t('enable2fa')}
            </Link>
          </div>
        )}
        {hasPermission(EPermission.Edition, ESysModule.Users) && user.isLocked && (
          <div className="flex items-center text-danger gap-2">
            <ShieldUserIcon size={18} />
            <Link href="#" color="danger">
              {t('unlockUser')}
            </Link>
          </div>
        )}
      </CardBody>
      <UserDetailModal isOpen={isOpen} onOpenChange={onOpenChange} onRefresh={fetchUser} id={user.id} />
      <ChangePasswordModal isOpen={isOpenChangePass} onOpenChange={openChangeChangePass} onRefresh={fetchUser} />
    </Card>
  );
}
