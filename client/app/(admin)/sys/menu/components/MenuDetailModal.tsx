import MenuSelect from '@/components/shared/sys/select/MenuSelect';
import SysModuleSelect from '@/components/shared/sys/select/SysModuleSelect';
import { IconSelect } from '@/components/ui//icon/IconSelect';
import FormSkeleton from '@/components/ui/skeleton/FormSkeleton';
import { MenuHook } from '@/hooks/menu';
import { defaultSaveMenuDto, MenuItem, SaveMenuDto } from '@/types/sys/Menu';
import {
  Button,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NumberInput,
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface MenuDetailProps {
  isOpen: boolean;
  parent: MenuItem | undefined;
  onOpenChange: () => void;
  id: number;
  onRefresh: () => void;
  onResetSelected: () => void;
}

export default function MenuDetail(props: MenuDetailProps) {
  const { isOpen, onOpenChange, id, onRefresh, parent, onResetSelected } = props;
  const [form, setForm] = useState<SaveMenuDto>({ ...defaultSaveMenuDto });
  const { data, isFetching } = MenuHook.useGet(isOpen ? id : 0);
  const { mutateAsync: save, isPending } = MenuHook.useSave();
  const t = useTranslations('menu');
  const msg = useTranslations('msg');

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const response = await save(form);
    if (response && response.success) {
      onOpenChange();
      onRefresh();
    }
  };

  useEffect(() => {
    if (!data) {
      setForm({
        ...defaultSaveMenuDto,
        parentId: parent?.id || 0,
        url: parent?.url + '/' || '/',
      });
    }
  }, [parent?.id]);

  useEffect(() => {
    if (data) {
      setForm({
        ...data,
        sysmodule: data.sysmodule || '',
      });
    }
  }, [data]);

  useEffect(() => {
    if (!isOpen) {
      setForm((prev) => ({ ...prev, ...defaultSaveMenuDto }));
      onResetSelected();
    }
  }, [isOpen]);

  return (
    <Modal
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
    >
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">
            {id > 0 ? msg('edit') : msg('add') + ' ' + t('menu')}
          </ModalHeader>
          <ModalBody>
            {isFetching && <FormSkeleton row={6} />}
            {!isFetching && (
              <Form id="menuForm" onSubmit={onSubmit} className={'flex flex-col gap-3'}>
                <MenuSelect
                  label={t('parentMenu')}
                  values={form.parentId ? [form.parentId] : []}
                  onChange={(values) => setForm((prev) => ({ ...prev, parentId: values[0] }))}
                  isRequired={false}
                  multiple={false}
                  labelPlacement={'outside'}
                />
                <Input
                  isRequired
                  label={msg('name')}
                  autoFocus
                  name="name"
                  value={form.name}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
                  placeholder={`${msg('enter')} ${msg('name')}`}
                  validate={(value) => {
                    return value === '' || !value ? msg('requiredField') : null;
                  }}
                  type="text"
                  variant={'bordered'}
                />
                <Input
                  isRequired
                  label={msg('path')}
                  name="url"
                  placeholder={`${msg('enter')} ${msg('path')}`}
                  value={form.url}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, url: value }))}
                  variant="bordered"
                  validate={(value) => {
                    return value === '' || !value ? msg('requiredField') : null;
                  }}
                />
                <IconSelect
                  label="Icon"
                  value={form.icon}
                  onChange={(value) => setForm((prev) => ({ ...prev, icon: value }))}
                  variant="bordered"
                />
                <SysModuleSelect
                  value={form.sysmodule}
                  onChange={(value) => setForm((prev) => ({ ...prev, sysmodule: value }))}
                  labelPlacement={'outside'}
                />
                <NumberInput
                  hideStepper
                  minValue={0}
                  label={msg('displayOrder')}
                  placeholder={msg('displayOrder')}
                  value={form.displayOrder}
                  labelPlacement="outside"
                  onValueChange={(value) => setForm((prev) => ({ ...prev, displayOrder: value }))}
                  variant="bordered"
                />
              </Form>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenChange}>
              {msg('close')}
            </Button>
            <Button type="submit" color="primary" form="menuForm" isLoading={isPending}>
              {msg('save')}
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
}
