import { HugeIcons } from '@/components/ui//icon/HugeIcons';
import { SearchInput } from '@/components/ui/input/SearchInput';
import { MenuHook } from '@/hooks/menu';
import { useNavivationStore } from '@/store/navigation-store';
import { MenuItem } from '@/types/sys/Menu';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/modal';
import { Listbox, ListboxItem, ScrollShadow } from '@heroui/react';
import { LinkSquare02Icon } from 'hugeicons-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

interface IFunctionSearchModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
}

export const FunctionSearchModal = (props: IFunctionSearchModalProps) => {
  const { isOpen, onOpenChange } = props;
  const [searchTerm, setSearchTerm] = useState('');
  const [functions, setFunction] = useState<MenuItem[]>([]);
  const { data } = MenuHook.useGetUserMenu();
  const { setNavigating } = useNavivationStore();

  const locale = useLocale();
  const msg = useTranslations('msg');

  const flattenMenuData = (data: MenuItem[]): MenuItem[] =>
    data.flatMap((item) => (item.children?.length ? flattenMenuData(item.children) : item));

  const dataSource = useMemo(() => flattenMenuData(data || []), [data]);

  useEffect(() => {
    setFunction(dataSource);
  }, [dataSource]);

  useEffect(() => {
    const filteredData = searchTerm
      ? dataSource.filter((item) => {
          const displayName = locale === 'vi' ? item.name : item.engName;
          return displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
        })
      : dataSource;

    setFunction(filteredData);
  }, [dataSource, searchTerm, locale]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop={'blur'}
      size={'lg'}
      classNames={{ closeButton: 'hover:bg-content4' }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 pt-8">
              <SearchInput
                placeholder={`${msg('search')} ...`}
                value={searchTerm}
                onValueChange={(value) => setSearchTerm(value)}
              />
            </ModalHeader>
            <ModalBody>
              <ScrollShadow className={'h-96'}>
                <Listbox
                  aria-label="Dynamic Actions"
                  items={functions}
                  color={'primary'}
                  classNames={{ list: 'gap-3' }}
                >
                  {(item) => (
                    <ListboxItem
                      key={item.url}
                      description={item.url}
                      className={'bg-default bg-opacity-30'}
                      href={item.url}
                      onPress={() => {
                        setNavigating(true);
                        onClose();
                      }}
                      startContent={<HugeIcons name={item.icon || 'command'} size={20} />}
                      endContent={<LinkSquare02Icon size={16} />}
                    >
                      <span className={'text-medium'}>
                        {locale === 'vi' ? item.name : item.engName}
                      </span>
                    </ListboxItem>
                  )}
                </Listbox>
              </ScrollShadow>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
