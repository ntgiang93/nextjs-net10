import { ExtButton } from '@/components/ui//button/ExtButton';
import { NotificationCenter } from '@/components/ui//drop-down/NotificationCenter';
import { FunctionSearchModal } from '@/components/ui/navigate/Top/FunctionSearchModal';
import { MenuItem } from '@/types/sys/Menu';
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Link,
  Navbar,
  NavbarContent,
  NavbarItem,
  useDisclosure,
} from '@heroui/react';
import { motion } from 'framer-motion';
import { ArrowLeft03Icon, ArrowRight03Icon, Search01Icon } from 'hugeicons-react';
import { ThemeSwitch } from '../../button/theme-switch';
import LanguageSwitcher from '../../select-box/LanguageSwitcher';

interface ITopbarProps {
  menuData?: MenuItem[];
  isCompact: boolean;
  setCompactMode?: () => void;
  toggleSidebar?: () => void;
}

export const Topbar = (props: ITopbarProps) => {
  const { menuData, setCompactMode, isCompact, toggleSidebar } = props;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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

      <NavbarContent justify="start">
        {menuData && (
          <NavbarContent className="hidden sm:flex gap-3">
            <NavbarItem>
              <Link color="foreground" href="#">
                Features
              </Link>
            </NavbarItem>
            <NavbarItem isActive>
              <Link aria-current="page" color="secondary" href="#">
                Customers
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link color="foreground" href="#">
                Integrations
              </Link>
            </NavbarItem>
          </NavbarContent>
        )}
      </NavbarContent>

      <NavbarContent as="div" className="items-center" justify="end">
        {!setCompactMode && (
          <div>
            <Button
              color="default"
              fullWidth
              endContent={<Search01Icon size={18} />}
              variant="bordered"
              className={'justify-between text-default-600 transition-opacity duration-300 w-40 max-md:hidden'}
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
              src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">zoey@example.com</p>
            </DropdownItem>
            <DropdownItem key="settings">My Settings</DropdownItem>
            <DropdownItem key="team_settings">Team Settings</DropdownItem>
            <DropdownItem key="analytics">Analytics</DropdownItem>
            <DropdownItem key="system">System</DropdownItem>
            <DropdownItem key="configurations">Configurations</DropdownItem>
            <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
            <DropdownItem key="logout" color="danger">
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
      <FunctionSearchModal isOpen={isOpen} onOpenChange={onOpenChange} menuData={menuData || []} />
    </Navbar>
  );
};
