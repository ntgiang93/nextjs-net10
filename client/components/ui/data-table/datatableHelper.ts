import { Column, ColumnDef } from '@tanstack/react-table';
import { CSSProperties } from 'react';

export const getSelectedItemsFromRowSelection = (selectedRows: Record<string, boolean>): any[] => {
  const selectedItems: any[] = [];

  const getItemByIndices = (indices: string[]): any | undefined => {
    if (indices.length === 0) return undefined;

    const rowKey = indices[0];
    if (indices.length === 1) return rowKey;
    return getItemByIndices(indices.slice(1));
  };

  Object.keys(selectedRows).forEach((path) => {
    if (selectedRows[path]) {
      const indices = path.split('.').map((i) => i.trim());
      const selectedItem = getItemByIndices(indices);

      if (selectedItem) {
        selectedItems.push(selectedItem);
      }
    }
  });

  return selectedItems;
};

export const getRowSelection = (selectedKeys: string[] | number[]): Record<string, boolean> => {
  const selectedRows: Record<string | number, boolean> = {};
  selectedKeys.forEach((key) => {
    const path = key;
    selectedRows[path] = true;
  });
  return selectedRows;
};

export const getfirstColumn = (columns: ColumnDef<any>[]) => {
  const firstColumn = columns.find((column) => column.meta?.pinned === 'left');
  if (firstColumn) {
    return firstColumn;
  }
  return columns[0];
};

export const tableCheckBoxClass = {
  label: 'hidden',
  hiddenInput: 'w-4',
  wrapper: 'p-0 m-0',
};

export const getCommonPinningStyles = (column: Column<any>): CSSProperties => {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn = isPinned === 'left' && column.getIsLastColumn('left');
  const isFirstRightPinnedColumn = isPinned === 'right' && column.getIsFirstColumn('right');

  return {
    boxShadow: isLastLeftPinnedColumn
      ? '-4px 0 4px -4px rgb(0 0 0 / 0.1) inset'
      : isFirstRightPinnedColumn
      ? '4px 0 4px -4px rgb(0 0 0 / 0.1) inset'
      : undefined,
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    position: isPinned ? 'sticky' : 'relative',
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  };
};
