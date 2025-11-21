import { SearchInput } from '@/components/ui/input/SearchInput';
import { RoleHook } from '@/hooks/sys/role';
import {
  AddRoleMemberDto,
  defaultUserRoleCursorFilterDto,
  RoleDto,
  UserRoleCursorFilterDto,
} from '@/types/sys/Role';
import { UserSelectDto } from '@/types/sys/User';
import {
  Avatar,
  AvatarGroup,
  Button,
  Listbox,
  ListboxItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  User,
} from '@heroui/react';
import { Selection } from '@react-types/shared';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';

interface AddRoleMemberModalProps {
  role?: RoleDto;
  isOpen: boolean;
  onOpenChange: () => void;
  refetch: () => void | Promise<unknown>;
  onRefresh: () => void | Promise<unknown>;
}

export default function AddRoleMemberModal(props: AddRoleMemberModalProps) {
  const { role, isOpen, onOpenChange, refetch, onRefresh } = props;
  const [filter, setFilter] = useState<UserRoleCursorFilterDto>({
    ...defaultUserRoleCursorFilterDto,
  });
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));

  const { data, isFetching } = RoleHook.useGetUsersNotInRole(filter);
  const [users, setUsers] = useState<UserSelectDto[]>([]);
  const { mutateAsync: addMembers, isPending } = RoleHook.useAddMember();
  const listboxRef = useRef<HTMLDivElement>(null);

  const msg = useTranslations('msg');
  const t = useTranslations('role');

  const handleSubmit = async () => {
    if (!role) return;
    const body: AddRoleMemberDto = {
      roleId: role.id,
      userIds: Array.from(selectedKeys) as string[],
    };
    const success = await addMembers(body);
    if (success) {
      onOpenChange();
      await Promise.resolve(refetch());
      await Promise.resolve(onRefresh());
    }
  };

  const selectedCount = useMemo(() => {
    if (selectedKeys === 'all') return users.length || 0;
    else return selectedKeys instanceof Set ? selectedKeys.size : 0;
  }, [selectedKeys, users]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedKeys(new Set([]));
      setFilter({ ...defaultUserRoleCursorFilterDto });
      setUsers([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const root = listboxRef.current;
    const scroller = root?.querySelector<HTMLDivElement>('div[data-orientation="vertical"]');
    if (!scroller) return;
    if (!data?.hasMore) return;
    const handleScroll = (event: Event) => {
      const target = event.currentTarget as HTMLDivElement;
      if (target.scrollTop + target.clientHeight >= target.scrollHeight) {
        setFilter((prev) => ({
          ...prev,
          cursor: data?.nextCursor || null,
        }));
      }
    };

    scroller.addEventListener('scroll', handleScroll);
    return () => scroller.removeEventListener('scroll', handleScroll);
  }, [data, isOpen]);

  useEffect(() => {
    if (data) {
      if (!filter.cursor || filter.cursor === null) {
        setUsers([...data.items]);
      } else {
        setUsers((prev) => [...prev, ...data.items]);
      }
    }
  }, [data]);

  useEffect(() => {
    if (role && isOpen) {
      setFilter((prev) => ({
        ...prev,
        roleId: role.id,
      }));
    }
  }, [role, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      isDismissable={false}
      isKeyboardDismissDisabled
    >
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">
            {msg('addMember')} {role ? `- ${role.name}` : ''}
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <SearchInput
                value={filter.searchTerm}
                onValueChange={(value) => {
                  setFilter((prev) => ({
                    ...prev,
                    cursor: null,
                    searchTerm: value,
                  }));
                }}
              />
              <Listbox
                ref={listboxRef}
                isVirtualized
                virtualization={{
                  maxListboxHeight: 320,
                  itemHeight: 50,
                }}
                classNames={{
                  base: 'w-full',
                  list: 'mt-2 p-2 border border-default rounded-md',
                }}
                items={users || []}
                label={t('assignMembers')}
                selectionMode="multiple"
                variant="flat"
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
                topContent={
                  <AvatarGroup
                    className="min-h-8"
                    isBordered
                    max={3}
                    total={selectedCount - 3}
                    renderCount={(count) => (
                      <p className="text-small text-foreground font-medium ms-2">+{count}</p>
                    )}
                  >
                    {Array.from(selectedKeys)
                      .slice(0, 3)
                      .map((key) => {
                        const user = users.find((u) => u.id === key);
                        return user ? <Avatar key={user.id} src={user.avatar} size="sm" /> : null;
                      })}
                  </AvatarGroup>
                }
                bottomContent={isFetching ? <Spinner></Spinner> : null}
              >
                {(item) => (
                  <ListboxItem key={item.id} textValue={item.fullName} className="my-1">
                    <User
                      className="justify-start"
                      avatarProps={{
                        src: item.avatar || `https://ui-avatars.com/api/?name=${item.fullName}`,
                        alt: 'Avatar',
                        size: 'sm',
                        isBordered: true,
                        color: 'primary',
                      }}
                      description={`${item.userName}`}
                      name={
                        <span className="font-semibold">{item.fullName || t('roleMembers')}</span>
                      }
                    />
                  </ListboxItem>
                )}
              </Listbox>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenChange}>
              {msg('close')}
            </Button>
            <Button
              color="primary"
              isDisabled={!role || selectedCount === 0}
              isLoading={isPending}
              onPress={handleSubmit}
            >
              {msg('submit')}
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
}
