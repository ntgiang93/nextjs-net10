import { HugeIcons } from '@/components/ui//icon/HugeIcons';
import { SearchInput } from '@/components/ui/input/SearchInput';
import { MenuItem } from '@/types/sys/Menu';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/modal';
import { Listbox, ListboxItem, ScrollShadow } from '@heroui/react';
import { ArrowRight01Icon } from 'hugeicons-react';
import { useEffect, useMemo, useState } from 'react';

interface IFunctionSearchModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  menuData: MenuItem[];
}

export const FunctionSearchModal = (props: IFunctionSearchModalProps) => {
  const { isOpen, menuData, onOpenChange } = props;
  const [searchTerm, setSearchTerm] = useState('');
  const [functions, setFunction] = useState(menuData);

  const flattenMenuData = (data: MenuItem[]): MenuItem[] =>
    data.flatMap((item) => (item.children?.length ? flattenMenuData(item.children) : item));

  const dataSource = useMemo(() => flattenMenuData(menuData), [menuData]);

  useEffect(() => {
    setFunction(dataSource);
  }, [dataSource]);

  useEffect(() => {
    const filteredData = searchTerm
      ? dataSource.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : dataSource;

    setFunction(filteredData);
  }, [dataSource, searchTerm]);

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
            <ModalHeader className="flex flex-col gap-1">
              <SearchInput
                placeholder={'Tìm kiếm ...'}
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
                      onPress={onClose}
                      startContent={<HugeIcons name={item.icon || 'command'} size={20} />}
                      endContent={<ArrowRight01Icon size={16} />}
                    >
                      <span className={'text-medium'}>{item.name}</span>
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
