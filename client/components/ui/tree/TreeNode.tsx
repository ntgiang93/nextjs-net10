import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight01Icon } from 'hugeicons-react';
import { useMemo } from 'react';
import { SelectedIcon } from '../icon/SelectedIcon';
import { TreeListItem } from './TreeList';

interface TreeNodeProps {
  node: TreeListItem;
  level?: number;
  onSelect: (node: TreeListItem) => void;
  selectedId: Set<string | number>;
  expandedIds: Set<string | number>;
  onToggle: (id: string | number) => void;
  selectionMode?: 'single' | 'multiple' | 'read-only';
  selectionStrategy?: 'all' | 'leaf';
  isExpandAll?: boolean;
}

const TreeNode = (props: TreeNodeProps) => {
  const { node, level = 0, onSelect, selectedId, expandedIds, onToggle, isExpandAll } = props;
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id) || isExpandAll;
  const isSelected = useMemo(() => selectedId.has(node.id), [selectedId]);

  return (
    <div className="my-0.5">
      <div
        className={clsx(
          'flex items-center gap-1 h-8 py-1 px-2 cursor-pointer rounded',
          'transition-colors duration-300',
          isSelected
            ? 'bg-primary-100 has-hover:bg-primary-100'
            : 'bg-transparent has-hover:bg-content2 hover:bg-content2',
        )}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        {hasChildren ? (
          <motion.button
            initial={{ rotate: 0 }}
            animate={isExpanded ? { rotate: 90 } : { rotate: 0 }}
            transition={{ duration: 0.4, ease: [0, 0.71, 0.2, 1.01] }}
            className={clsx(
              hasChildren ? 'opacity-100' : 'opacity-0',
              'cursor-pointer rounded-full hover:bg-content3 p-1',
            )}
            onClick={() => onToggle(node.id)}
            disabled={!hasChildren}
          >
            <ArrowRight01Icon size={16} />
          </motion.button>
        ) : (
          <span className="w-4" />
        )}
        <div
          className="w-full justify-between flex items-center"
          onClick={() => {
            onSelect(node);
          }}
        >
          <span className="text-sm select-none">{node.title}</span>
          <SelectedIcon isSelected={isSelected} size={14} />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: 'auto',
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0.0, 0.2, 1],
              opacity: { duration: 0.2 },
            }}
            style={{ overflow: 'hidden' }}
          >
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              exit={{ y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {node.children?.map((child, index) => (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.03,
                  }}
                >
                  <TreeNode
                    node={child}
                    level={level + 1}
                    onSelect={onSelect}
                    selectedId={selectedId}
                    expandedIds={expandedIds}
                    onToggle={onToggle}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TreeNode;
