import AsyncDataTable from '@/components/ui/data-table/AsyncDataTable';
import { ListBoxTree } from '@/components/ui/hierarchy/ListBoxTree';
import { TreeItemType } from '@/components/ui/hierarchy/TreeItem';
import { SearchInput } from '@/components/ui/input/SearchInput';
import { useAuth } from '@/components/ui/layout/AuthProvider';
import { ConfirmModal } from '@/components/ui/overlay/ConfirmModal';
import { DepartmentHook } from '@/hooks/department';
import { hasPermission } from '@/libs/AuthHelper';
import { EPermission } from '@/types/base/Permission';
import { ESysModule } from '@/types/constant/SysModule';
import {
  defaultDepartmentMemberFilter,
  DepartmentDto,
  DepartmentMemberDto,
  DepartmentMemberFilter,
} from '@/types/sys/Department';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tooltip,
  useDisclosure,
  User,
} from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { AddTeamIcon, Delete01Icon, UserAccountIcon, ViewIcon, ViewOffIcon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import AddMemberModal from './AddMemberModal';

interface MemberModalProps {
  department?: DepartmentDto;
  isOpen: boolean;
  onOpenChange: () => void;
  onRefresh: () => void;
}

export default function MemberModal(props: MemberModalProps) {
  const { department, isOpen, onOpenChange, onRefresh } = props;
  const t = useTranslations('organization');
  const msg = useTranslations('msg');
  const departmentId = department?.id || 0;
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<DepartmentMemberFilter>({
    ...defaultDepartmentMemberFilter,
  });
  const { isOpen: IsOpenDel, onOpen: onOpenDel, onOpenChange: OnOpenDelChange } = useDisclosure();
  const {
    isOpen: isOpenAddMember,
    onOpen: onOpenAddMember,
    onOpenChange: onOpenAddMemberChange,
  } = useDisclosure();

  const { data, isFetching, refetch } = DepartmentHook.useGetMembers(filter);
  const { mutateAsync: addMember, isPending } = DepartmentHook.useAddMember();
  const canEdit = hasPermission(ESysModule.Department, EPermission.Edit);

  const { navigate } = useAuth();
  const columns = useMemo<ColumnDef<DepartmentMemberDto>[]>(
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
        minSize: 150,
        meta: {
          pinned: 'left',
        },
      },
      {
        accessorKey: 'actions',
        header: msg('actions'),
        footer: (props) => props.column.id,
        size: 100,
        cell: ({ row }) => {
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip content={t('userDetails')}>
                <Button
                  isIconOnly
                  aria-label="user-details-button"
                  color="primary"
                  variant="light"
                  radius="full"
                  size="sm"
                  onPress={() => {
                    navigate(`/sys/user/${row.original.id}`);
                  }}
                >
                  <UserAccountIcon size={16} />
                </Button>
              </Tooltip>
              {canEdit && (
                <Tooltip color="danger" content={msg('remove')}>
                  <Button
                    isIconOnly
                    aria-label="remove-button"
                    color="danger"
                    variant="light"
                    radius="full"
                    size="sm"
                    onPress={() => {
                      setSelectedUserIds([row.original.id]);
                      onOpenDel();
                    }}
                  >
                    <Delete01Icon size={16} />
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
    [],
  );

  const pages = useMemo(() => {
    if (!data) return 1;
    else return Math.ceil(data.totalCount / filter.pageSize) || 1;
  }, [data?.totalCount, filter.pageSize]);

  const handleDelete = async () => {
    // const success = await del(selected?.id || 0);
    // if (success) {
    //   refetch();
    //   OnOpenDelChange();
    //   onResetSelected();
    // }
  };

  const mapDepartmentToTreeItem = (dept: DepartmentDto): TreeItemType => {
    return {
      value: dept.id,
      label: dept.name,
      children: dept.children?.map(mapDepartmentToTreeItem) || [],
    };
  };

  const departmentTree = useMemo(() => {
    if (!department) return [] as TreeItemType[];
    else return [mapDepartmentToTreeItem(department)];
  }, [department]);

  useEffect(() => {
    if (isOpen && department) {
      setFilter((prev) => ({ ...prev, departmentId: department.id, page: 1 }));
    }
  }, [isOpen, department]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedUserIds([]);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!departmentId) return;
    // const success = await assignMembers(
    //   selectedUserIds.map((userId) => ({ departmentId, userId })),
    // );
    // if (success) {
    //   onOpenChange();
    //   onRefresh();
    // }
  };

  return (
    <Modal
      isOpen={isOpen}
      size={departmentTree.length > 0 ? '5xl' : '3xl'}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      onClose={() => setSelectedUserIds([])}
      isDismissable={false}
      isKeyboardDismissDisabled
    >
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">
            {msg('memberManagement') + ' ' + department?.name}
          </ModalHeader>
          <ModalBody>
            <div className="w-full h-full flex gap-2">
              <Card shadow="sm" className="w-fit">
                <CardHeader className="font-semibold">{t('organizationChart')}</CardHeader>
                <CardBody>
                  <ListBoxTree
                    items={departmentTree}
                    selectedValues={[]}
                    onSelectedChange={(value) => console.log(value)}
                  />{' '}
                </CardBody>
              </Card>
              <Card shadow="sm" className="w-full">
                <CardHeader className="font-semibold">{t('organizationChart')}</CardHeader>
                <CardBody>
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
                      totalPages: pages,
                      onPageChange: (page) => {
                        setFilter((prev) => ({ ...prev, page }));
                      },
                      onPageSizeChange: (pageSize) => {
                        setFilter((prev) => ({ ...prev, pageSize }));
                      },
                    }}
                    selection={{
                      selectedKeys: selectedUserIds,
                      onChangeSelection(value) {
                        setSelectedUserIds(value);
                      },
                    }}
                    leftContent={
                      <>
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
                      </>
                    }
                    rightContent={
                      <>
                        <Tooltip content={msg('addMember')}>
                          <Button
                            isIconOnly
                            color="primary"
                            size="sm"
                            isDisabled={!departmentId}
                            onPress={() => {
                              if (!departmentId) return;
                              onOpenAddMember();
                            }}
                          >
                            <AddTeamIcon size={18} />
                          </Button>
                        </Tooltip>
                        <Tooltip
                          content={
                            filter.isShowChildrenMembers
                              ? t('hideSubDepartmentsMembers')
                              : t('showSubDepartmentsMembers')
                          }
                        >
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onPress={() => {
                              setFilter((prev) => ({
                                ...prev,
                              }));
                            }}
                          >
                            {filter.isShowChildrenMembers ? <ViewOffIcon /> : <ViewIcon />}
                          </Button>
                        </Tooltip>
                      </>
                    }
                  />
                </CardBody>
              </Card>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenChange}>
              {msg('close')}
            </Button>
            <Button
              color="primary"
              isLoading={isPending}
              isDisabled={!departmentId}
              onPress={handleSubmit}
            >
              {msg('submit')}
            </Button>
          </ModalFooter>
          <ConfirmModal
            isOpen={IsOpenDel}
            title={msg('delete')}
            message={msg('deleteWarning')}
            confirmColor="danger"
            onOpenChange={OnOpenDelChange}
            onConfirm={handleDelete}
            objectName={selectedUserIds}
            loading={isFetching}
          />
          {isOpenAddMember && (
            <AddMemberModal
              department={department}
              isOpen={isOpenAddMember}
              onOpenChange={onOpenAddMemberChange}
            />
          )}
        </>
      </ModalContent>
    </Modal>
  );
}
