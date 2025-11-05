import { useRouter } from '@/i18n/navigation';
import { Button } from '@heroui/react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight01Icon, CircleIcon } from 'hugeicons-react';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { HugeIcons } from '../../icon/HugeIcons';
import { SidebarNodeType } from './SidebarBody';

interface SidebarNodeProps {
  node: SidebarNodeType;
  expandedIds: Set<string | number>;
  onToggle: (id: string | number) => void;
  selectionStrategy?: 'all' | 'leaf';
  isCompact?: boolean;
}

const SidebarNode = (props: SidebarNodeProps) => {
  const { node, expandedIds, onToggle, isCompact } = props;
  const hasChildren = node.children && node.children.length > 0;
  const router = useRouter();
  const pathName = usePathname();
  const isSelected = useMemo(() => node.url === pathName, [pathName]);

  const isParentOfSelected = useMemo(() => {
    const checkRecursive = (children?: SidebarNodeType[]): boolean => {
      if (!children) return false;
      return children.some((child) => {
        if (child.url === pathName) return true;
        return checkRecursive(child.children);
      });
    };
    return hasChildren ? checkRecursive(node.children) : false;
  }, [node, pathName, hasChildren]);

  const isExpanded = useMemo(() => {
    return (isParentOfSelected || expandedIds.has(node.id)) && !isCompact;
  }, [isParentOfSelected, expandedIds, isCompact]);

  return (
    <div className="my-1">
      <div
        className={clsx(
          'flex justify-between items-center h-10 min-w-8 py-1 px-2 cursor-pointer rounded-lg',
          'transition-colors duration-300',
          isSelected
            ? 'bg-primary has-hover:bg-primary'
            : isCompact && isParentOfSelected
              ? 'bg-primary'
              : 'bg-transparent has-hover:bg-content2 hover:bg-content2',
        )}
        onClick={() => {
          hasChildren ? onToggle(node.id) : router.push(node.url);
        }}
      >
        <div
          className={clsx(
            'w-full flex items-center gap-2',
            isSelected ? 'text-background' : 'text-foreground',
            isCompact ? 'justify-center' : 'justify-start',
          )}
        >
          <div>
            {node.icon && node.icon.trim().length > 0 && <HugeIcons name={node.icon} size={18} />}
            {(!node.icon || node.icon.trim().length < 1) && <CircleIcon size={10} />}
          </div>
          {!isCompact && (
            <motion.span
              initial={{ opacity: 1, width: 'auto' }}
              animate={{
                opacity: 1,
                width: 'auto',
              }}
              exit={{
                opacity: 0,
                width: 0,
              }}
              transition={{
                duration: 0.5,
                ease: [0.4, 0.0, 0.2, 1],
                opacity: { duration: 0.2 },
              }}
              className={clsx(isSelected ? 'text-background' : 'text-foreground', 'truncate')}
            >
              {node.name}
            </motion.span>
          )}
        </div>
        {hasChildren && !isCompact && (
          <motion.div
            initial={{ rotate: 0 }}
            animate={isExpanded ? { rotate: 90 } : { rotate: 0 }}
            transition={{ duration: 0.4, ease: [0, 0.71, 0.2, 1.01] }}
            className={clsx(hasChildren ? 'opacity-100' : 'opacity-0')}
            onClick={() => onToggle(node.id)}
          >
            <Button
              isIconOnly
              variant="light"
              size="sm"
              radius="full"
              onPress={() => onToggle(node.id)}
            >
              <ArrowRight01Icon size={16} />
            </Button>
          </motion.div>
        )}
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
              className="border-l-1 border-content3 ml-4 p-2"
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
                  <SidebarNode node={child} expandedIds={expandedIds} onToggle={onToggle} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SidebarNode;
