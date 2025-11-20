'use client';

import { ScrollShadow } from '@heroui/react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import SidebarNode from './SidebarNode';

export type SidebarNodeType = {
  id: number;
  name: string;
  engName?: string;
  url: string;
  icon?: string;
  children?: SidebarNodeType[];
};

export interface SidebarBodyProps {
  items: SidebarNodeType[];
  isCompact?: boolean;
}

export const SidebarBody = (props: SidebarBodyProps) => {
  const { items, isCompact } = props;
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set());

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

  const renderItems = (nodes: SidebarNodeType[]): JSX.Element | null => {
    if (!nodes.length) {
      return null;
    }
    return (
      <ScrollShadow
        hideScrollBar
        className="lg:h-[calc(100vh-11rem)] max-lg:h-[calc(100vh-12rem)] max-w-[calc(256-24px)] w-full"
      >
        {nodes.map((node, index) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <SidebarNode
              node={node}
              onToggle={handleToggle}
              expandedIds={expandedIds}
              isCompact={isCompact}
            />
          </motion.div>
        ))}
      </ScrollShadow>
    );
  };

  const content = useMemo(() => renderItems(items), [items, expandedIds, isCompact]);

  return (
    <div className={clsx('flex flex-col gap-3')}>
      <motion.div initial="initial" animate="animate" className="rounded-large p-2">
        {content}
      </motion.div>
    </div>
  );
};

export default SidebarBody;
