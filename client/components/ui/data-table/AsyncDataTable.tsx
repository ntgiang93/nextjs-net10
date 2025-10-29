import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Pagination,
  Select,
  SelectItem,
  Spinner,
} from '@heroui/react';
import {
  ColumnDef,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  RowSelectionState,
  Updater,
  useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { ArrowRight01Icon, ReloadIcon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ExtButton } from '../button/ExtButton';
import {
  getCommonPinningStyles,
  getfirstColumn,
  getRowSelection,
  getSelectedItemsFromRowSelection,
  tableCheckBoxClass,
} from './datatableHelper';
import { AsyncDataTableProps, ITEM_PER_PAGE } from './DataTableType';

const AsyncDataTable = (props: AsyncDataTableProps) => {
  const {
    data,
    columns,
    selection,
    childrenProperty,
    keyColumn,
    isLoading,
    fetch,
    rightContent,
    leftContent,
    pagination,
    removeWrapper,
    height,
  } = props;
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [tableHeight, setTableHeight] = useState(240);
  const cardRef = useRef<HTMLDivElement>(null);
  const msg = useTranslations('msg');

  const rowSelection = useMemo(() => {
    return getRowSelection(selection?.selectedKeys || []);
  }, [selection?.selectedKeys]);

  const handleSelectedKeysChange = (updater: Updater<RowSelectionState>) => {
    var result = typeof updater === 'function' ? updater(rowSelection) : updater;
    const selectedItems = getSelectedItemsFromRowSelection(result);
    selection?.onChangeSelection(selectedItems);
  };

  //* Handler column before render
  const cols = useMemo(() => {
    const cloneColumns = [...(columns as ColumnDef<any>[])];
    if (childrenProperty) {
      const firstCol = getfirstColumn(cloneColumns);
      firstCol.cell = ({ row, cell }) => {
        return (
          <div className="flex items-center gap-2">
            {row.getCanExpand() ? (
              <Button
                isIconOnly
                aria-label="expand-button"
                color="secondary"
                variant="light"
                radius="full"
                size="sm"
                onPress={() => row.toggleExpanded()}
                style={row.depth > 0 ? { marginLeft: row.depth * 32 } : {}}
              >
                <ArrowRight01Icon
                  size={16}
                  className={`transition-transform ${row.getIsExpanded() ? 'rotate-90' : ''}`}
                />
              </Button>
            ) : (
              <div style={{ width: row.depth * 32 + 32 }}></div>
            )}
            <span>{String(cell.getValue())}</span>
          </div>
        );
      };
    }
    if (selection) {
      cloneColumns.unshift({
        id: 'select',
        size: 50,
        meta: { align: 'center', pinned: 'left' },
        header: ({ table }) => (
          <div className="flex items-center justify-start gap-2 w-full">
            {selection && (
              <Checkbox
                classNames={tableCheckBoxClass}
                isSelected={table.getIsAllRowsSelected()}
                isIndeterminate={table.getIsSomeRowsSelected()}
                onChange={table.getToggleAllRowsSelectedHandler()}
              />
            )}
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-start gap-2 w-full">
            {selection && (
              <Checkbox
                classNames={tableCheckBoxClass}
                isSelected={row.getIsSelected()}
                isIndeterminate={row.getIsSomeSelected()}
                onChange={row.getToggleSelectedHandler()}
              />
            )}
          </div>
        ),
      });
    }

    return cloneColumns;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, childrenProperty]);

  useEffect(() => {
    if (!cardRef.current) return;
    if (height) {
      setTableHeight(height);
      return;
    }
    const cardHeight = cardRef.current.clientHeight;
    // Calculate the remaining space for the table
    const newTableHeight = cardHeight - 152;
    setTableHeight(Math.max(newTableHeight, 240));
  }, []);

  const table = useReactTable({
    data,
    columns: cols,
    state: {
      rowSelection,
      expanded,
      columnPinning: {
        left: cols
          .filter((col) => col.meta?.pinned === 'left')
          .map((col) => col.id)
          .filter((id): id is string => id !== undefined),
        right: cols
          .filter((col) => col.meta?.pinned === 'right')
          .map((col) => col.id)
          .filter((id): id is string => id !== undefined),
      },
    },
    enableRowSelection: true,
    manualPagination: true,
    onRowSelectionChange: (updater) => handleSelectedKeysChange(updater),
    onExpandedChange: setExpanded,
    getSubRows: (row) => row[childrenProperty || 'children'],
    getRowId: (row) => row[keyColumn || 'id'],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    debugTable: true,
  });

  return (
    <Card className="h-full overflow-auto" ref={cardRef} shadow={removeWrapper ? 'none' : 'md'}>
      <CardHeader className="flex items-center justify-between w-full">
        <div className="flex items-center justify-start gap-4">{leftContent}</div>
        <div className="flex items-center justify-end gap-2">
          {rightContent}
          <ExtButton isIconOnly disabled={isLoading} variant="light" size="sm" onPress={fetch}>
            <ReloadIcon size={20} />
          </ExtButton>
        </div>
      </CardHeader>
      <CardBody style={{ height: `${tableHeight}px` }} className="py-0">
        <div className="py-0 relative overflow-auto" style={{ height: `${tableHeight}px` }}>
          <table aria-label="Data table" className="grid text-sm">
            <thead className="sticky top-0 z-10 grid">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="w-full flex shadow-md rounded-md">
                  {headerGroup.headers.map((header, index) => {
                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className={clsx(
                          'flex items-center bg-content3 p-3 font-semibold',
                          index === 0 ? 'rounded-l-md' : '',
                          index === headerGroup.headers.length - 1 ? 'rounded-r-md' : '',
                          header.column.columnDef.meta?.align
                            ? `justify-${header.column.columnDef.meta?.align}`
                            : '',
                          header.column.columnDef.meta?.autoSize
                            ? `flex-auto min-w-[${header.getSize()}px]`
                            : 'w-[${header.getSize()}px]',
                        )}
                        style={{ ...getCommonPinningStyles(header.column) }}
                      >
                        {header.isPlaceholder ? null : (
                          <div>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="grid w-full">
              {isLoading && (
                <tr className="absolute top-0 left-0 h-full w-full bg-content2/50 flex items-center justify-center z-10">
                  <td colSpan={table.getVisibleLeafColumns().length}>
                    <Spinner variant="gradient" />
                  </td>
                </tr>
              )}
              {table.getRowModel().rows.map((row) => {
                return (
                  <tr key={row.id} className="group flex w-full">
                    {row.getVisibleCells().map((cell, index) => {
                      return (
                        <td
                          key={cell.id}
                          width={
                            cell.column.columnDef.meta?.autoSize ? undefined : cell.column.getSize()
                          }
                          className={clsx(
                            'whitespace-nowrap truncate border-b border-default/50 bg-background',
                            'px-3 py-1 group-hover:bg-content2 min-h-10',
                            index === 0 ? 'rounded-l-md' : '',
                            index === row.getVisibleCells().length - 1 ? 'rounded-r-md' : '',
                            cell.column.columnDef.meta?.autoSize
                              ? `flex-auto min-w-[${cell.column.getSize()}px]`
                              : `w-[${cell.column.getSize()}px]`,
                          )}
                          style={{ ...getCommonPinningStyles(cell.column) }}
                        >
                          <div
                            className={clsx(
                              'flex items-center h-full justify-' +
                                (cell.column.columnDef.meta?.align || 'start'),
                            )}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardBody>
      <CardFooter className="grid grid-cols-6 gap-4">
        <div className="col-span-2 text-sm font-semibold">
          {(() => {
            return `${msg('totalRow')} : ${pagination.totalCount}`;
          })()}
        </div>
        <div className="col-span-4 flex items-center justify-end w-full gap-8">
          <Select
            size="sm"
            classNames={{
              mainWrapper: 'w-16',
              popoverContent: 'w-20',
              label: 'text-sm font-semibold',
              base: 'w-fit',
            }}
            className="max-w-xs"
            items={ITEM_PER_PAGE}
            label={msg('showPerPage')}
            labelPlacement="outside-left"
            selectedKeys={[pagination.pageSize.toString()]}
            onChange={(e) => {
              pagination.onPageSizeChange(Number(e.target.value));
            }}
          >
            {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
          </Select>
          <Pagination
            classNames={{
              item: 'hover:cursor-pointer',
            }}
            isCompact
            showShadow
            page={pagination.page}
            total={pagination.totalPages}
            onChange={(page) => pagination.onPageChange(page)}
          />
        </div>
      </CardFooter>
    </Card>
  );
};

export default AsyncDataTable;
