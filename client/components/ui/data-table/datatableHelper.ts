import { Column, ColumnDef } from '@tanstack/react-table';
import { CSSProperties } from 'react';

export const getSelectedItemsFromRowSelection = (
  selectedRows: Record<string, boolean>,
): Array<string | number> => {
  const selectedItems: Array<string | number> = [];

  const resolveKey = (indices: string[]): string | number | undefined => {
    if (!indices.length) return undefined;

    const raw = indices[indices.length - 1]?.trim();
    if (!raw) return undefined;

    const numeric = Number(raw);
    return Number.isNaN(numeric) ? raw : numeric;
  };

  Object.entries(selectedRows).forEach(([path, isSelected]) => {
    if (!isSelected) return;

    const indices = path.split('.').map((i) => i.trim());
    const selectedItem = resolveKey(indices);

    if (selectedItem !== undefined) {
      selectedItems.push(selectedItem);
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
      ? '1.95px 0 2.6px 0px rgba(0,0,0,0.15)'
      : isFirstRightPinnedColumn
        ? '-1.95px 0 2.6px 0px rgba(0,0,0,0.15)'
        : undefined,
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    position: isPinned ? 'sticky' : 'relative',
    width: column.getSize(),
    zIndex: isPinned ? 2 : 0,
  };
};
