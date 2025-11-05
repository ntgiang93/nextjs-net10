import { ExtButton } from '@/components/ui//button/ExtButton';
import { NotificationCenter } from '@/components/ui//drop-down/NotificationCenter';
import { FunctionSearchModal } from '@/components/ui/navigate/Top/FunctionSearchModal';
import { useAuthStore } from '@/store/auth-store';
import { MenuItem } from '@/types/sys/Menu';
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarContent,
  useDisclosure,
} from '@heroui/react';
import { motion } from 'framer-motion';
import {
  ArrowLeft03Icon,
  ArrowRight03Icon,
  Logout03Icon,
  Search01Icon,
  UserAccountIcon,
} from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '../../../shared/sys/select/LanguageSwitcher';
import { ThemeSwitch } from '../../button/theme-switch';
import { useAuth } from '../../layout/AuthProvider';

interface ITopbarProps {
  menuData?: MenuItem[];
  isCompact: boolean;
  setCompactMode?: () => void;
  toggleSidebar?: () => void;
}

export const Topbar = (props: ITopbarProps) => {
  const { menuData, setCompactMode, isCompact, toggleSidebar } = props;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { user } = useAuthStore();
  const msg = useTranslations('msg');
  const { navigate, logout } = useAuth();

  return (
    <Navbar classNames={{ wrapper: 'max-w-full' }}>
      <NavbarContent justify={'start'}>
        <motion.div
          animate={isCompact ? { rotateY: 180 } : { rotateY: 0 }}
          transition={{
            duration: 0.5,
            ease: [0, 0.71, 0.2, 1.01],
          }}
        >
          <ExtButton
            className={'max-md:hidden'}
            isIconOnly
            color={'transparent'}
            onPress={setCompactMode}
            hidden={!setCompactMode}
          >
            <ArrowLeft03Icon />
          </ExtButton>
        </motion.div>
        <ExtButton className={'md:hidden'} isIconOnly color={'transparent'} onPress={toggleSidebar}>
          <ArrowRight03Icon />
        </ExtButton>
      </NavbarContent>

      <NavbarContent as="div" className="items-center" justify="end">
        {!setCompactMode && (
          <div>
            <Button
              color="default"
              fullWidth
              endContent={<Search01Icon size={18} />}
              variant="bordered"
              className={
                'justify-between text-default-600 transition-opacity duration-300 w-40 max-md:hidden'
              }
              onPress={onOpen}
              radius={'full'}
            >
              Tìm kiếm ...
            </Button>
            <Button
              color="default"
              variant="light"
              className={'text-default-600 md:hidden'}
              onPress={onOpen}
              isIconOnly
            >
              <Search01Icon size={18} />
            </Button>
          </div>
        )}
        <ThemeSwitch />
        <LanguageSwitcher />
        <NotificationCenter />
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              color="secondary"
              name="Jason Hughes"
              size="sm"
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.fullName}`}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem
              key="name"
              className="h-14 gap-2"
              startContent={
                <Avatar
                  isBordered
                  color="secondary"
                  name="Jason Hughes"
                  size="sm"
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.fullName}`}
                />
              }
            >
              <p className="font-semibold">{user?.fullName}</p>
            </DropdownItem>
            <DropdownItem
              key="profile"
              startContent={<UserAccountIcon />}
              onPress={() => navigate(`/sys/user/${user?.id}`)}
            >
              {msg('profile')}
            </DropdownItem>
            <DropdownItem
              key="logout"
              color="danger"
              startContent={<Logout03Icon />}
              onPress={logout}
            >
              {msg('logout')}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
      <FunctionSearchModal isOpen={isOpen} onOpenChange={onOpenChange} menuData={menuData || []} />
    </Navbar>
  );
};
