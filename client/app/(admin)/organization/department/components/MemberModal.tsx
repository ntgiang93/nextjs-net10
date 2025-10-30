import AsyncDataTable from '@/components/ui/data-table/AsyncDataTable';
import { SearchInput } from '@/components/ui/input/SearchInput';
import { useAuth } from '@/components/ui/layout/AuthProvider';
import { ConfirmModal } from '@/components/ui/overlay/ConfirmModal';
import TreeList, { TreeListItem } from '@/components/ui/tree/TreeList';
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
import clsx from 'clsx';
import { AddTeamIcon, Delete02Icon, UserAccountIcon, ViewIcon, ViewOffIcon } from 'hugeicons-react';
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
  const ut = useTranslations('user');
  const msg = useTranslations('msg');
  const departmentId = department?.id || 0;
  const [selectedRow, setSelectedRow] = useState<number[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<number[]>([]);
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
  const { mutateAsync: remove, isPending } = DepartmentHook.useRemoveMember();
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
        size: 150,
        meta: {
          autoSize: true,
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
              <Tooltip content={ut('userDetails')}>
                <Button
                  isIconOnly
                  aria-label="user-details-button"
                  color="primary"
                  variant="light"
                  radius="full"
                  size="sm"
                  onPress={() => {
                    navigate(`/sys/user/${row.original.userId}`, '_blank');
                  }}
                >
                  <UserAccountIcon size={16} />
                </Button>
              </Tooltip>
              {canEdit && (
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
                      onOpenDel();
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
    [],
  );

  const pages = useMemo(() => {
    if (!data) return 1;
    else return Math.ceil(data.totalCount / filter.pageSize) || 1;
  }, [data?.totalCount, filter.pageSize]);

  const selectedUserName = useMemo(() => {
    if (!data) return [];
    return data.items
      .filter((item) => selectedRow.includes(item.id))
      .map((item) => item.fullName || item.userName);
  }, [selectedRow]);

  const findDept = (id: number, depts: DepartmentDto[]): DepartmentDto | undefined => {
    for (const dept of depts) {
      if (dept.id === id) return dept;
      const found = findDept(id, dept.children || []);
      if (found) return found;
    }
  };

  const currentDepartment = useMemo(() => {
    if (!department?.children || department.children.length === 0) {
      return department;
    } else {
      return findDept(selectedDepartment[0], department.children) || department;
    }
  }, [selectedDepartment, department]);

  const handleDelete = async () => {
    if (selectedRow.length === 0) return;
    const success = await remove(selectedRow);
    OnOpenDelChange();
    if (success) {
      setSelectedRow([]);
      await refetch();
    }
  };

  const mapDepartmentToTreeItem = (dept: DepartmentDto): TreeListItem => {
    return {
      id: dept.id,
      title: dept.name,
      description: '',
      children: dept.children?.map(mapDepartmentToTreeItem) || [],
    };
  };

  const departmentTree = useMemo(() => {
    if (!department) return [] as TreeListItem[];
    else return [mapDepartmentToTreeItem(department)];
  }, [department]);

  const hasChildren = useMemo(() => {
    if (!department) return false;
    return department.children && department.children.length > 0;
  }, [department]);

  useEffect(() => {
    if (isOpen && department) {
      setFilter((prev) => ({ ...prev, departmentId: department.id, page: 1 }));
    }
  }, [isOpen, department]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedRow([]);
      setSelectedDepartment([]);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      size={hasChildren ? '5xl' : '3xl'}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      isDismissable={false}
      isKeyboardDismissDisabled
    >
      <ModalContent>
        <>
          <ModalHeader>{msg('memberManagement') + ' ' + department?.name}</ModalHeader>
          <ModalBody>
            <div className={clsx('w-full h-full gap-2', hasChildren ? 'grid grid-cols-3' : '')}>
              {hasChildren && (
                <Card>
                  <CardHeader className="font-semibold">{t('organizationChart')}</CardHeader>
                  <CardBody>
                    <TreeList
                      selectionStrategy="all"
                      selectionMode="single"
                      items={departmentTree}
                      selectedIds={selectedDepartment}
                      onSelectionChange={(value) => {
                        const selected = value as number[];
                        setSelectedDepartment(selected);
                        setFilter((prev) => ({
                          ...prev,
                          departmentId: selected.length > 0 ? selected[0] : department?.id || 0,
                          page: 1,
                        }));
                      }}
                    />
                  </CardBody>
                </Card>
              )}
              <Card shadow="sm" className="w-full col-span-2">
                <CardHeader className="font-semibold">{currentDepartment?.name}</CardHeader>
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
                      selectedKeys: selectedRow,
                      onChangeSelection(value) {
                        setSelectedRow(value);
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
                        {canEdit && (
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
                              <AddTeamIcon size={16} />
                            </Button>
                          </Tooltip>
                        )}
                        {canEdit && (
                          <Tooltip color="danger" content={msg('delete')}>
                            <Button
                              isIconOnly
                              aria-label="remove-button"
                              color="danger"
                              size="sm"
                              onPress={() => {
                                onOpenDel();
                              }}
                              isDisabled={selectedRow.length === 0}
                            >
                              <Delete02Icon size={16} />
                            </Button>
                          </Tooltip>
                        )}
                        <Tooltip
                          content={
                            filter.isShowSubMembers
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
                                isShowSubMembers: !prev.isShowSubMembers,
                              }));
                            }}
                          >
                            {filter.isShowSubMembers ? <ViewOffIcon /> : <ViewIcon />}
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
          </ModalFooter>
          <ConfirmModal
            isOpen={IsOpenDel}
            title={msg('delete')}
            message={msg('deleteWarning')}
            confirmColor="danger"
            onOpenChange={OnOpenDelChange}
            onConfirm={handleDelete}
            objectName={selectedUserName}
            loading={isPending}
          />
          {isOpenAddMember && (
            <AddMemberModal
              refetch={refetch}
              department={currentDepartment}
              isOpen={isOpenAddMember}
              onOpenChange={onOpenAddMemberChange}
            />
          )}
        </>
      </ModalContent>
    </Modal>
  );
}
