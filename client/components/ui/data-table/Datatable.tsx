import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import {
  ColumnDef,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  RowSelectionState,
  useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { ArrowRight01Icon, ReloadIcon, Settings04Icon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ExtButton } from '../button/ExtButton';
import { PaginationInput } from '../input/PaginationInput';
import Loading from '../overlay/Loading';
import {
  getCommonPinningStyles,
  getfirstColumn,
  getRowSelection,
  getSelectedItemsFromRowSelection,
  tableCheckBoxClass,
} from './datatableHelper';
import { DataTableProps, ITEM_PER_PAGE } from './DataTableType';

const DataTable = (props: DataTableProps) => {
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
    onRowAction,
    removeWrapper,
  } = props;
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(getRowSelection(selection?.selectedKeys || []));
  const [tableHeight, setTableHeight] = useState(200);
  const cardRef = useRef<HTMLDivElement>(null);
  const msg = useTranslations('msg');

  useEffect(() => {
    const selectedItems = getSelectedItemsFromRowSelection(rowSelection);
    selection?.onChangeSelection(selectedItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection]);

  //* Handler column before render
  const cols = useMemo(() => {
    const cloneColumns = [...(columns as ColumnDef<any>[])];
    if (childrenProperty) {
      const firstCol = getfirstColumn(cloneColumns);
      firstCol.cell = ({ row, cell }) => {
        return (
          <div className="flex items-center gap-2" style={{ paddingLeft: row.depth * 16 }}>
            {row.getCanExpand() ? (
              <Button
                isIconOnly
                aria-label="expand-button"
                color="secondary"
                variant="light"
                radius="full"
                size="sm"
                onPress={() => row.toggleExpanded()}
                style={row.depth > 0 ? { marginLeft: row.depth * 20 } : {}}
              >
                <ArrowRight01Icon
                  size={16}
                  className={`transition-transform ${row.getIsExpanded() ? 'rotate-90' : ''}`}
                />
              </Button>
            ) : (
              <div style={{ width: row.depth * 32 }}></div>
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
    const cardHeight = cardRef.current.clientHeight;
    // Calculate the remaining space for the table
    const newTableHeight = cardHeight - 152;
    console.log('tableHeight', newTableHeight, cardHeight);
    setTableHeight(Math.max(newTableHeight, 400));
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
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    getSubRows: (row) => row[childrenProperty || 'children'],
    getRowId: (row) => row[keyColumn || 'id'],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    debugTable: true,
  });

  return (
    <Card
      className={clsx('h-full overflow-auto')}
      ref={cardRef}
      shadow={removeWrapper ? 'none' : 'md'}
      classNames={{
        header: removeWrapper ? 'px-0' : 'px-3',
        body: removeWrapper ? 'px-0' : 'px-3',
        footer: removeWrapper ? 'px-0' : 'px-3',
      }}
    >
      <CardHeader className="flex items-center justify-between w-full">
        <div className="flex items-center justify-start gap-4">{leftContent}</div>
        <div className="flex items-center justify-end gap-1">
          {rightContent}
          <Button isIconOnly isLoading={isLoading} variant="light" size="sm" onPress={fetch}>
            <ReloadIcon size={16} />
          </Button>
          <Dropdown>
            <DropdownTrigger>
              <ExtButton isIconOnly isLoading={isLoading} variant="light" size="sm" onPress={fetch}>
                <Settings04Icon size={20} />
              </ExtButton>
            </DropdownTrigger>
            <DropdownMenu aria-label="Dynamic Actions" selectionMode="multiple">
              <DropdownItem key={1}>Resize column</DropdownItem>
              <DropdownItem key={2}>Move column</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </CardHeader>
      <CardBody style={{ height: `${tableHeight}px` }} className="py-0">
        <Table
          aria-label="Data table"
          isHeaderSticky
          onRowAction={(key) => onRowAction?.(key)}
          classNames={{
            wrapper: 'p-1 shadow-none',
            base: `overflow-scroll`,
          }}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableColumn
                      key={header.id}
                      colSpan={header.colSpan}
                      width={header.getSize()}
                      align={header.column.columnDef.meta?.align}
                      className={'border-0'}
                      style={{ ...getCommonPinningStyles(header.column) }}
                    >
                      {header.isPlaceholder ? null : (
                        <div>{flexRender(header.column.columnDef.header, header.getContext())}</div>
                      )}
                    </TableColumn>
                  );
                })}
              </>
            ))}
          </TableHeader>
          <TableBody isLoading={isLoading} loadingContent={<Loading />}>
            {table.getRowModel().rows.map((row) => {
              return (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <TableCell
                        key={cell.id}
                        width={cell.column.getSize()}
                        className="whitespace-nowrap truncate border-b border-default/50 py-1 bg-background"
                        style={{ ...getCommonPinningStyles(cell.column) }}
                      >
                        <div className={`flex items-center justify-${cell.column.columnDef.meta?.align}`}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardBody>
      <CardFooter className="grid grid-cols-6 gap-4">
        <div className="col-span-2 text-sm font-semibold">
          {(() => {
            const totalRows = table.getRowCount();
            return `${msg('totalRow')} : ${totalRows}`;
          })()}
        </div>
        <div className="col-span-4 flex items-center justify-end w-full gap-4">
          <Select
            size="sm"
            classNames={{
              mainWrapper: 'w-16',
              popoverContent: 'w-20',
              label: 'text-sm',
              base: 'w-fit',
            }}
            className="max-w-xs"
            items={ITEM_PER_PAGE}
            label={msg('showPerPage')}
            labelPlacement="outside-left"
            selectedKeys={[table.getState().pagination.pageSize.toString()]}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
          </Select>
          <PaginationInput
            page={table.getState().pagination.pageIndex + 1}
            totalPage={table.getPageCount()}
            onPageChange={(page) => table.setPageIndex(page - 1)}
          />
        </div>
      </CardFooter>
    </Card>
  );
};

export default DataTable;
