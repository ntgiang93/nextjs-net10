import AsyncDataTable from '@/components/ui/data-table/AsyncDataTable';
import { SearchInput } from '@/components/ui/input/SearchInput';
import { UserHook } from '@/hooks/user';
import { defaultPaginationFilter, PaginationFilter } from '@/types/base/PaginationFilter';
import { UserSelectDto } from '@/types/sys/User';
import { User } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

interface IUserSelectTable {
  selectedUserIds: string[];
  onSeledtedChange: (usersIds: string[]) => void;
  loadingInitialData?: boolean;
}

export default function UserSelectTable(props: IUserSelectTable) {
  const { selectedUserIds, onSeledtedChange, loadingInitialData } = props;
  const [filter, setFilter] = useState<PaginationFilter>({
    ...defaultPaginationFilter,
  });

  const { data, refetch, isFetching } = UserHook.useGetPaginationToSelect(filter);

  const selectedItems = useMemo(() => {
    return [...selectedUserIds];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserIds]);

  const handleSelectedChange = (usersIds: string[]) => {
    onSeledtedChange(usersIds);
  };

  // useEffect(() => {
  //   onSeledtedChange(selectedItems);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [selectedItems]);

  const columns = useMemo<ColumnDef<UserSelectDto>[]>(
    () => [
      {
        id: 'fullName',
        accessorKey: 'fullName',
        header: () => <span>Full Name</span>,
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
        id: 'email',
        accessorKey: 'email',
        header: () => <span>Email</span>,
        footer: (props) => props.column.id,
        size: 150,
        meta: {
          align: 'start',
        },
      },
    ],
    [],
  );

  return (
    <div className="w-full h-full flex flex-col gap-2">
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
          selectedKeys: selectedItems,
          onChangeSelection(value) {
            handleSelectedChange(value);
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
      />
    </div>
  );
}
