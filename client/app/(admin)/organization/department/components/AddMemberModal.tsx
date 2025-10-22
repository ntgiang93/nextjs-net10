import { SearchInput } from '@/components/ui/input/SearchInput';
import { DepartmentHook } from '@/hooks/department';
import {
  AddDepartmentMemberDto,
  defaultUserDepartmentCursorFilterDto,
  DepartmentDto,
  UserDepartmentCursorFilterDto,
} from '@/types/sys/Department';
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

interface AddMemberModalProps {
  department?: DepartmentDto;
  isOpen: boolean;
  onOpenChange: () => void;
}

export default function AddMemberModal(props: AddMemberModalProps) {
  const { department, isOpen, onOpenChange } = props;
  const [filter, setFilter] = useState<UserDepartmentCursorFilterDto>({
    ...defaultUserDepartmentCursorFilterDto,
  });
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));

  const { data, isFetching } = DepartmentHook.useGetUsersNotInDepartment(filter);
  const [users, setUsers] = useState<UserSelectDto[]>([]);
  const { mutateAsync: addMembers, isPending } = DepartmentHook.useAddMember();

  const msg = useTranslations('msg');
  const t = useTranslations('organization');
  const listboxRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    if (!department) return;
    const body: AddDepartmentMemberDto = {
      departmentId: department.id,
      userIds: Array.from(selectedKeys) as string[],
    };
    const success = await addMembers(body);
    if (success) {
      onOpenChange();
    }
  };

  const selectedCount = useMemo(() => {
    if (selectedKeys === 'all') return users.length || 0;
    else return selectedKeys instanceof Set ? selectedKeys.size : 0;
  }, [selectedKeys]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedKeys(new Set([]));
      setFilter({ ...defaultUserDepartmentCursorFilterDto });
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
      if (!filter.cursor || filter.cursor == null) {
        setUsers([...data.items]);
      } else setUsers((prev) => [...prev, ...data.items]);
    }
  }, [data]);

  useEffect(() => {
    if (department) {
      setFilter((prev) => ({
        ...prev,
        departmentId: department.id,
      }));
    }
  }, [department]);

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
            {msg('addMember')} {department ? `- ${department.name}` : ''}
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
                  maxListboxHeight: 400,
                  itemHeight: 50,
                }}
                classNames={{
                  base: 'w-full',
                  list: 'mt-2 p-2 border border-default rounded-md',
                }}
                items={users || []}
                label="Assigned to"
                selectionMode="multiple"
                variant="flat"
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
                topContent={
                  <AvatarGroup
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
                      name={<span className="font-semibold">{item.fullName || 'Unknow User'}</span>}
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
              isDisabled={!department || selectedCount === 0}
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
