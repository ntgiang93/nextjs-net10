import { Button } from '@heroui/react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight01Icon } from 'hugeicons-react';
import { useMemo } from 'react';

export type NestedListItem = {
  id: string;
  title: string;
  description?: string;
  children?: NestedListItem[];
};

interface TreeNodeProps {
  node: NestedListItem;
  level?: number;
  onSelect: (node: NestedListItem) => void;
  selectedId: string | number | undefined;
  expandedIds: Set<string | number>;
  onToggle: (id: string | number) => void;
}

const TreeNode = (props: TreeNodeProps) => {
  const { node, level = 0, onSelect, selectedId, expandedIds, onToggle } = props;
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = useMemo(() => selectedId === node.id, [selectedId]);

  const handleToggle = () => {
    //e.stopPropagation();
    if (hasChildren) {
      onToggle(node.id);
    }
  };

  return (
    <div>
      <div
        className={clsx(
          'flex items-center gap-1 h-10 py-1 px-2 cursor-pointer rounded',
          'transition-colors duration-300',
          isSelected
            ? 'bg-primary-100 has-hover:bg-primary-100'
            : 'bg-transparent has-hover:bg-content2 hover:bg-content2',
        )}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => {
          onSelect(node);
        }}
      >
        {hasChildren ? (
          <motion.div
            initial={{ rotate: 0 }}
            animate={isExpanded ? { rotate: 90 } : { rotate: 0 }}
            transition={{ duration: 0.4, ease: [0, 0.71, 0.2, 1.01] }}
          >
            <Button
              isIconOnly
              radius={'full'}
              size={'sm'}
              color={'default'}
              variant="light"
              className={clsx(hasChildren ? 'opacity-100' : 'opacity-0')}
              onPress={() => onToggle(node.id)}
              disabled={!hasChildren}
            >
              <ArrowRight01Icon size={16} />
            </Button>
          </motion.div>
        ) : (
          <span className="w-4" />
        )}
        <span className="ml-1 text-sm select-none">{node.title}</span>
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
