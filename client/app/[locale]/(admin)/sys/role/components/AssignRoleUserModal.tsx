import AsyncDataTable from '@/components/ui/data-table/AsyncDataTable';
import { SearchInput } from '@/components/ui/input/SearchInput';
import { useAuth } from '@/components/ui/layout/AuthProvider';
import { ConfirmModal } from '@/components/ui/overlay/ConfirmModal';
import { RoleHook } from '@/hooks/sys/role';
import { hasPermission } from '@/libs/AuthHelper';
import { EPermission } from '@/types/base/Permission';
import { ESysModule } from '@/types/constant/SysModule';
import {
  defaultRoleMemberFilter,
  RoleDto,
  RoleMemberFilter,
  RoleMembersDto,
} from '@/types/sys/Role';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Tooltip,
  useDisclosure,
  User,
} from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { AddTeamIcon, Delete02Icon, UserAccountIcon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AddRoleMemberModal from './AddRoleMemberModal';

interface AssignRoleUserModalProps {
  role: RoleDto;
  isOpen: boolean;
  onOpenChange: () => void;
  onRefresh: () => void | Promise<unknown>;
}

export default function AssignRoleUserModal(props: AssignRoleUserModalProps) {
  const { role, isOpen, onOpenChange, onRefresh } = props;
  const msg = useTranslations('msg');
  const t = useTranslations('role');
  const ut = useTranslations('user');
  const roleId = role?.id || 0;
  const [selectedRow, setSelectedRow] = useState<string[]>([]);
  const [filter, setFilter] = useState<RoleMemberFilter>({
    ...defaultRoleMemberFilter,
  });

  const { data, isFetching, refetch } = RoleHook.useGetMembers(filter, isOpen);
  const { mutateAsync: removeMembers, isPending } = RoleHook.useRemoveMember(role.id);

  const {
    isOpen: isOpenDelete,
    onOpen: onOpenDelete,
    onOpenChange: onOpenDeleteChange,
  } = useDisclosure();
  const {
    isOpen: isOpenAddMember,
    onOpen: onOpenAddMember,
    onOpenChange: onOpenAddMemberChange,
  } = useDisclosure();

  const canEditRole = hasPermission(ESysModule.Roles, EPermission.Edit);
  const { navigate } = useAuth();

  const columns = useMemo<ColumnDef<RoleMembersDto>[]>(
    () => [
      {
        id: 'fullName',
        accessorKey: 'fullName',
        header: () => msg('name'),
        footer: (props) => props.column.id,
        cell: ({ row }) => {
          return (
            <User
              avatarProps={{
                src:
                  row.original.avatar ||
                  `https://ui-avatars.com/api/?name=${row.original.fullName}`,
                alt: 'Avatar',
              }}
              name={row.original.userName}
              description={row.original.fullName}
            />
          );
        },
        size: 200,
        meta: {
          autoSize: true,
        },
      },
      {
        id: 'email',
        accessorKey: 'email',
        header: () => ut('email'),
        footer: (props) => props.column.id,
        minSize: 150,
      },
      {
        accessorKey: 'actions',
        header: msg('actions'),
        footer: (props) => props.column.id,
        size: 100,
        cell: ({ row }) => {
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip content={ut('userDetails')}>
                <Button
                  isIconOnly
                  aria-label="user-details-button"
                  color="primary"
                  variant="light"
                  radius="full"
                  size="sm"
                  onPress={() => {
                    navigate(`/sys/user/${row.original.id}`, '_blank');
                  }}
                >
                  <UserAccountIcon size={16} />
                </Button>
              </Tooltip>
              {canEditRole && (
                <Tooltip color="danger" content={msg('delete')}>
                  <Button
                    isIconOnly
                    aria-label="remove-button"
                    color="danger"
                    variant="light"
                    radius="full"
                    size="sm"
                    onPress={() => {
                      setSelectedRow([row.original.id]);
                      onOpenDelete();
                    }}
                  >
                    <Delete02Icon size={16} />
                  </Button>
                </Tooltip>
              )}
            </div>
          );
        },
        meta: {
          align: 'center',
        },
      },
    ],
    [canEditRole, msg, navigate, onOpenDelete, ut],
  );

  const pages = useMemo(() => {
    if (!data) return 1;
    return Math.ceil((data.totalCount || 0) / filter.pageSize) || 1;
  }, [data?.totalCount, filter.pageSize]);

  const selectedUserName = useMemo(() => {
    if (!data) return [] as string[];
    return data.items
      .filter((item) => selectedRow.includes(item.id))
      .map((item) => item.fullName || item.userName);
  }, [data, selectedRow]);

  const handleDelete = useCallback(async () => {
    if (selectedRow.length === 0 || !roleId) return;
    const success = await removeMembers(selectedRow);
    if (success) {
      await refetch();
      onOpenDeleteChange();
      setSelectedRow([]);
      await Promise.resolve(onRefresh());
    }
  }, [selectedRow, roleId, removeMembers, refetch, onRefresh, onOpenDeleteChange]);

  useEffect(() => {
    if (isOpen && roleId) {
      setFilter((prev) => ({ ...prev, roleId, page: 1 }));
      setSelectedRow([]);
    }
  }, [isOpen, roleId]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedRow([]);
      setFilter({ ...defaultRoleMemberFilter });
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      size="3xl"
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      isDismissable={false}
      isKeyboardDismissDisabled
    >
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">
            {msg('memberManagement')} {role?.name ? `- ${role.name}` : ''}
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-2">
              <AsyncDataTable
                columns={columns}
                data={data?.items || []}
                isLoading={isFetching}
                fetch={refetch}
                removeWrapper={true}
                pagination={{
                  page: filter.page,
                  pageSize: filter.pageSize,
                  totalCount: data?.totalCount || 0,
                  totalPages: data?.totalPages || 1,
                  onPageChange: (page) => {
                    setFilter((prev) => ({ ...prev, page }));
                  },
                  onPageSizeChange: (pageSize) => {
                    setFilter((prev) => ({ ...prev, pageSize }));
                  },
                }}
                selection={{
                  selectedKeys: selectedRow,
                  onChangeSelection(value) {
                    setSelectedRow(value);
                  },
                }}
                leftContent={
                  <SearchInput
                    className="w-64"
                    value={filter.searchTerm}
                    onValueChange={(value) => {
                      setFilter((prev) => ({
                        ...prev,
                        searchTerm: value,
                      }));
                    }}
                  />
                }
                rightContent={
                  canEditRole && (
                    <div className="flex items-center gap-2">
                      <Tooltip content={msg('addMember')}>
                        <Button
                          isIconOnly
                          color="primary"
                          size="sm"
                          isDisabled={!roleId}
                          onPress={() => {
                            if (!roleId) return;
                            onOpenAddMember();
                          }}
                        >
                          <AddTeamIcon size={16} />
                        </Button>
                      </Tooltip>
                      <Tooltip color="danger" content={msg('delete')}>
                        <Button
                          isIconOnly
                          aria-label="remove-button"
                          color="danger"
                          size="sm"
                          onPress={() => {
                            if (selectedRow.length === 0) return;
                            onOpenDelete();
                          }}
                          isDisabled={selectedRow.length === 0}
                        >
                          <Delete02Icon size={16} />
                        </Button>
                      </Tooltip>
                    </div>
                  )
                }
              />
            </div>
          </ModalBody>
          <ConfirmModal
            isOpen={isOpenDelete}
            title={t('removeMember')}
            message={msg('deleteWarning')}
            confirmColor="danger"
            onOpenChange={onOpenDeleteChange}
            onConfirm={handleDelete}
            objectName={selectedUserName}
            loading={isPending}
          />
          {isOpenAddMember && (
            <AddRoleMemberModal
              refetch={refetch}
              role={role}
              isOpen={isOpenAddMember}
              onOpenChange={onOpenAddMemberChange}
              onRefresh={onRefresh}
            />
          )}
        </>
      </ModalContent>
    </Modal>
  );
}
