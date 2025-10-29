'use client';

import { Input } from '@heroui/react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Search01Icon } from 'hugeicons-react';
import { useCallback, useMemo, useState } from 'react';
import TreeNode from './TreeNode';

export type NestedListItem = {
  id: string;
  title: string;
  description?: string;
  children?: NestedListItem[];
};

type SelectionMode = 'single' | 'multiple' | 'read-only';
type SelectionStrategy = 'all' | 'leaf';

interface AnimatedNestedListProps {
  items: NestedListItem[];
  defaultExpandedIds?: string[];
  defaultSelectedIds?: string[];
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  selectionMode?: SelectionMode;
  selectionStrategy?: SelectionStrategy;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
}

const containerVariants = {
  open: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.26,
      ease: 'easeOut',
    },
  },
  collapsed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.18,
      ease: 'easeIn',
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.16, ease: 'easeOut' } },
};

const toRecord = (ids?: string[]) => {
  if (!ids?.length) {
    return {} as Record<string, boolean>;
  }
  return ids.reduce<Record<string, boolean>>((acc, id) => {
    acc[id] = true;
    return acc;
  }, {});
};

const filterTree = (nodes: NestedListItem[], keyword: string): NestedListItem[] => {
  if (!keyword) {
    return nodes;
  }

  const lower = keyword.toLowerCase();

  const walk = (items: NestedListItem[]): NestedListItem[] => {
    return items
      .map((item) => {
        const children = item.children ? walk(item.children) : [];
        const matchesSelf = [item.title, item.description]
          .filter(Boolean)
          .some((value) => value && value.toLowerCase().includes(lower));

        if (matchesSelf) {
          return {
            ...item,
            ...(item.children
              ? {
                  children: children.length > 0 ? children : item.children,
                }
              : {}),
          };
        }

        if (children.length > 0) {
          return {
            ...item,
            children,
          };
        }

        return null;
      })
      .filter((item): item is NestedListItem => item !== null);
  };

  return walk(nodes);
};

const hasSelectedDescendants = (node: NestedListItem, selected: Set<string>): boolean => {
  if (!node.children?.length) {
    return false;
  }

  return node.children.some(
    (child) => selected.has(child.id) || hasSelectedDescendants(child, selected),
  );
};

const countDescendants = (node: NestedListItem): number => {
  if (!node.children?.length) {
    return 0;
  }

  let count = 0;
  const queue = [...node.children];
  while (queue.length) {
    const current = queue.shift();
    if (current) {
      count += 1;
      if (current.children?.length) {
        queue.push(...current.children);
      }
    }
  }

  return count;
};

export const AnimatedNestedList = (props: AnimatedNestedListProps) => {
  const {
    items,
    defaultExpandedIds,
    defaultSelectedIds,
    selectedIds,
    onSelectionChange,
    selectionMode = 'multiple',
    selectionStrategy = 'leaf',
    searchable = true,
    searchPlaceholder = 'Search...',
    className,
  } = props;

  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set([]));
  const [selectedId, setSelectedId] = useState<string | number | undefined>(undefined);
  const [selectedNode, setSelectedNode] = useState<NestedListItem | null>(null);

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

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    toRecord(defaultExpandedIds),
  );
  const [internalSelected, setInternalSelected] = useState<Set<string>>(
    () => new Set(defaultSelectedIds ?? []),
  );
  const [searchTerm, setSearchTerm] = useState('');

  const isControlled = selectedIds !== undefined;
  const selectedSet = useMemo(
    () => new Set(selectedIds ?? Array.from(internalSelected)),
    [selectedIds, internalSelected],
  );
  const filteredItems = useMemo(() => filterTree(items, searchTerm), [items, searchTerm]);
  const forceExpand = searchTerm.trim().length > 0;

  const updateSelection = useCallback(
    (updater: (prev: Set<string>) => Set<string>) => {
      const next = updater(new Set(selectedSet));
      if (!isControlled) {
        setInternalSelected(next);
      }
      onSelectionChange?.(Array.from(next));
    },
    [isControlled, onSelectionChange, selectedSet],
  );

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const handleSelect = useCallback(
    (item: NestedListItem) => {
      console.log('item', item);
      setSelectedId(item.id);
      return;
      const hasChildren = !!item.children?.length;
      if (selectionStrategy === 'leaf' && hasChildren) {
        toggleExpand(item.id);
        return;
      }

      if (selectionMode === 'single') {
        updateSelection(() => new Set([item.id]));
        return;
      }

      updateSelection((prev) => {
        const next = new Set(prev);
        if (next.has(item.id)) {
          next.delete(item.id);
        } else {
          next.add(item.id);
        }
        return next;
      });
    },
    [selectionMode, selectionStrategy, toggleExpand, updateSelection],
  );

  const renderItems = (nodes: NestedListItem[], depth = 0): JSX.Element | null => {
    if (!nodes.length) {
      return null;
    }

    return (
      <div className="max-h-[500px] overflow-y-auto p-3">
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
              selectedId={selectedId}
              onToggle={handleToggle}
              expandedIds={expandedIds}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  const content = renderItems(filteredItems);

  return (
    <div className={clsx('flex flex-col gap-3', className)}>
      {searchable && (
        <Input
          value={searchTerm}
          onValueChange={setSearchTerm}
          placeholder={searchPlaceholder}
          startContent={<Search01Icon size={16} />}
          radius="lg"
          size="sm"
          classNames={{
            input: 'text-sm',
            mainWrapper: 'bg-content1/80 border border-default/20',
          }}
        />
      )}
      <motion.div
        layout
        initial="initial"
        animate="animate"
        variants={itemVariants}
        className="rounded-large border border-default/20 bg-content1/60 p-3"
      >
        {content ?? <span className="text-sm text-foreground-400">No results</span>}
      </motion.div>
    </div>
  );
};

export default AnimatedNestedList;
