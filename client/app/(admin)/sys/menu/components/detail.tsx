import { MenuHook } from '@/hooks/menu';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  Input,
  NumberInput,
} from '@heroui/react';
import { defaultSaveMenuDto, SaveMenuDto } from '@/types/sys/Menu';
import { useEffect, useState } from 'react';
import MenuSelect from '@/components/shared/sys/Select/MenuSelect';
import { IconSelect } from '@/components/ui//icon/IconSelect';
import SysModuleSelect from '@/components/shared/sys/Select/SysModuleSelect';

interface MenuDetailProps {
  isOpen: boolean;
  onOpenChange: () => void;
  id: number;
  onRefresh: () => void;
}

export default function MenuDetail(props: MenuDetailProps) {
  const { isOpen, onOpenChange, id, onRefresh } = props;
  const [form, setForm] = useState<SaveMenuDto>({ ...defaultSaveMenuDto });
  const { data, isLoading } = MenuHook.useGet(id);
  const { mutateAsync: save, isPending } = MenuHook.useSave();

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const response = await save(form);
    if (response && response.success) {
      onOpenChange();
      setForm({ ...defaultSaveMenuDto });
      onRefresh();
    }
  };

  useEffect(() => {
    if (data) {
      setForm({
        ...data,
        sysmodule: data.sysmodule || '',
      });
    }
  }, [data]);

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
          <ModalHeader className="flex flex-col gap-1">Modal Title</ModalHeader>
          <ModalBody>
            <Form id="menuForm" onSubmit={onSubmit} className={'flex flex-col gap-3'}>
              <MenuSelect
                label="Parent Menu"
                values={form.parentId ? [form.parentId] : []}
                onChange={(values) => setForm({ ...form, parentId: values[0] })}
                isRequired={false}
                multiple={false}
                labelPlacement={'outside'}
              />
              <Input
                isRequired
                label="Name"
                autoFocus
                name="name"
                value={form.name}
                onValueChange={(value) => setForm({ ...form, name: value })}
                placeholder="Enter menu name"
                validate={(value) => {
                  return value === '' || !value ? 'This field is required' : null;
                }}
                type="text"
                variant={'bordered'}
              />
              <Input
                isRequired
                label="URL"
                name="url"
                placeholder="Enter menu url"
                value={form.url}
                onValueChange={(value) => setForm({ ...form, url: value })}
                variant="bordered"
                validate={(value) => {
                  return value === '' || !value ? 'This field is required' : null;
                }}
              />
              <IconSelect
                label="Icon"
                value={form.icon}
                onChange={(value) => setForm({ ...form, icon: value })}
                variant="bordered"
              />
              <SysModuleSelect
                value={form.sysmodule}
                onChange={(value) => setForm({ ...form, sysmodule: value })}
                labelPlacement={'outside'}
              />
              <NumberInput
                hideStepper
                minValue={0}
                label="Display Order"
                placeholder="Enter display order"
                value={form.displayOrder}
                labelPlacement="outside"
                onValueChange={(value) => setForm({ ...form, displayOrder: value })}
                variant="bordered"
              />
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenChange}>
              Close
            </Button>
            <Button type="submit" color="primary" form="menuForm" isLoading={isPending}>
              Submit
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
}
