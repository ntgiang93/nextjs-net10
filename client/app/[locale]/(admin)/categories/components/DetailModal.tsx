import CategoryTypeSelect from '@/components/shared/sys/select/CategoryTypeSelect';
import FormSkeleton from '@/components/ui/skeleton/FormSkeleton';
import { SysCategoryHook } from '@/hooks/sys/sysCategories';
import { CategoryDto, defaultCategory } from '@/types/sys/SysCategory';
import {
  Button,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface DetailModalProps {
  isOpen: boolean;
  parent: CategoryDto | undefined;
  onOpenChange: () => void;
  id: number;
  onRefresh: () => void;
  onResetSelected: () => void;
}

export default function DetailModal(props: DetailModalProps) {
  const { isOpen, onOpenChange, id, onRefresh, parent, onResetSelected } = props;
  const [form, setForm] = useState<CategoryDto>({ ...defaultCategory });
  const { data, isFetching } = SysCategoryHook.useGet(id, isOpen);
  const { mutateAsync: save, isPending } = SysCategoryHook.useSave();
  const msg = useTranslations('msg');

  const onSubmit = async (e: any) => {
    e.preventDefault();
    await save(form);
    onOpenChange();
    onRefresh();
  };

  useEffect(() => {
    if (!data) {
      setForm({ ...defaultCategory, type: parent?.code || '' });
    }
  }, [parent?.code]);

  useEffect(() => {
    if (data) {
      setForm({ ...data });
    }
  }, [data]);

  useEffect(() => {
    if (!isOpen) {
      setForm({ ...defaultCategory });
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
            {id > 0 ? msg('edit') : msg('add') + ' ' + msg('category').toLocaleLowerCase()}
          </ModalHeader>
          <ModalBody>
            {isFetching && <FormSkeleton row={6} />}
            {!isFetching && (
              <Form id="menuForm" onSubmit={onSubmit} className={'flex flex-col gap-3'}>
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
                  label={msg('code')}
                  name="code"
                  placeholder={`${msg('enter')} ${msg('code')}`}
                  value={form.code}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, code: value }))}
                  variant="bordered"
                  validate={(value) => {
                    return value === '' || !value ? msg('requiredField') : null;
                  }}
                />
                <CategoryTypeSelect
                  variant="bordered"
                  selectionMode="single"
                  value={[form.type]}
                  onChange={(values) => {
                    setForm((prev) => ({ ...prev, type: values[0] }));
                  }}
                />
                <Input
                  label={msg('description')}
                  name="description"
                  placeholder={`${msg('enter')} ${msg('description')}`}
                  value={form.description}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
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
