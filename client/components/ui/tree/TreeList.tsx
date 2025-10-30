'use client';

import { Input, ScrollShadow } from '@heroui/react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Search01Icon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import TreeNode from './TreeNode';

export type TreeListItem = {
  id: string | number;
  title: string;
  description?: string;
  children?: TreeListItem[];
};

export type SelectionMode = 'single' | 'multiple' | 'read-only';
export type SelectionStrategy = 'all' | 'leaf';

export interface TreeListProps {
  items: TreeListItem[];
  defaultExpandedIds?: (string | number)[];
  selectedIds?: (string | number)[];
  onSelectionChange?: (ids: (string | number)[]) => void;
  selectionMode?: SelectionMode;
  selectionStrategy?: SelectionStrategy;
  searchable?: boolean;
  contentHeight?: number;
}

const filterTree = (nodes: TreeListItem[], keyword: string): TreeListItem[] => {
  if (!keyword || keyword.trim() === '') {
    return nodes;
  }
  const lower = keyword.toLowerCase();

  const walk = (items: TreeListItem[]): TreeListItem[] => {
    return items
      .map((item) => {
        const matchesSelf = [item.title, item.description]
          .filter(Boolean)
          .some((value) => value && value.toLowerCase().includes(lower));
        if (matchesSelf) {
          return {
            ...item,
            ...item.children,
          };
        }

        const children = item.children ? walk(item.children) : [];

        if (children.length > 0) {
          return {
            ...item,
            children,
          };
        }

        return null;
      })
      .filter((item): item is TreeListItem => item !== null);
  };

  return walk(nodes);
};

export const TreeList = (props: TreeListProps) => {
  const {
    items,
    selectedIds,
    onSelectionChange,
    selectionMode = 'multiple',
    selectionStrategy = 'leaf',
    searchable = true,
    defaultExpandedIds,
    contentHeight,
  } = props;

  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(
    new Set(defaultExpandedIds || []),
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState(items);
  const msg = useTranslations('msg');

  const handleToggle = (id: string | number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderItems = (nodes: TreeListItem[]): JSX.Element | null => {
    if (!nodes.length) {
      return null;
    }
    return (
      <ScrollShadow
        className={clsx(contentHeight ? `max-h-[${contentHeight}px]` : 'max-h-[500px]')}
      >
        {nodes.map((node, index) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <TreeNode
              node={node}
              onSelect={handleSelect}
              selectedId={uniqueSelectedIds}
              onToggle={handleToggle}
              expandedIds={expandedIds}
            />
          </motion.div>
        ))}
      </ScrollShadow>
    );
  };

  const handleSelect = useCallback(
    (item: TreeListItem) => {
      if (selectionMode === 'read-only') return;
      const hasChildren = !!item.children?.length;
      if (selectionStrategy === 'leaf' && hasChildren) {
        handleToggle(item.id);
        return;
      }

      if (selectionMode === 'single') {
        onSelectionChange?.([item.id]);
        return;
      }

      const next = new Set(uniqueSelectedIds);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
      }
      onSelectionChange?.(Array.from(next));
    },
    [selectionMode, selectionStrategy, handleToggle],
  );

  const uniqueSelectedIds = useMemo(() => new Set(selectedIds), [selectedIds]);
  const content = useMemo(() => renderItems(data), [data, expandedIds, selectedIds]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const filteredData = filterTree(items, searchTerm);
      setData(filteredData);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return (
    <div className={clsx('flex flex-col gap-3')}>
      {searchable && (
        <Input
          placeholder={msg('search') + '...'}
          labelPlacement="outside"
          aria-label="SearchInput"
          type="text"
          endContent={<Search01Icon size={16} />}
          value={searchTerm}
          onValueChange={(value) => {
            setSearchTerm(value);
          }}
        />
      )}
      <motion.div
        initial="initial"
        animate="animate"
        className="rounded-large border border-default/20 bg-content1/60 p-2"
      >
        {content ?? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-sm text-foreground-400"
          >
            {msg('noResultsFound')}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default TreeList;
