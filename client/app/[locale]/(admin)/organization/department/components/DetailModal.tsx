import DepartmentSelect from '@/components/shared/sys/select/DepartmentSelect';
import DepartmentTypeSelect from '@/components/shared/sys/select/DepartmentTypeSelect';
import FormSkeleton from '@/components/ui/skeleton/FormSkeleton';
import { DepartmentHook } from '@/hooks/department';
import { DepartmentTypeHook } from '@/hooks/departmentType';
import {
  defaultDetailDepartmentDto,
  DepartmentDto,
  DetailDepartmentDto,
} from '@/types/sys/Department';
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

interface DetailProps {
  isOpen: boolean;
  onOpenChange: () => void;
  id: number;
  onRefresh: () => void;
  onResetSelected: () => void;
  parent?: DepartmentDto;
}

export default function DetailModal(props: DetailProps) {
  const { isOpen, onOpenChange, id, onRefresh, onResetSelected, parent } = props;
  const [form, setForm] = useState<DetailDepartmentDto>({ ...defaultDetailDepartmentDto });
  const { data, isFetching } = DepartmentHook.useGet(isOpen ? id : 0);
  const { data: departmentTypes } = DepartmentTypeHook.useGetAll();
  const { mutateAsync: save, isPending } = DepartmentHook.useSave();
  const t = useTranslations('organization');
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
    if (data) {
      setForm({
        ...data,
      });
    }
  }, [data]);

  useEffect(() => {
    if (!isOpen) {
      setForm((prev) => ({ ...prev, ...defaultDetailDepartmentDto }));
      onResetSelected();
    }
  }, [isOpen]);

  useEffect(() => {
    if (id > 0) return;
    if (parent && parent.id) {
      setForm((prev) => ({ ...prev, parentId: parent.id }));
    }
  }, [parent, id]);

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
            {id > 0 ? msg('edit') : msg('add') + ' ' + t('department').toLowerCase()}
          </ModalHeader>
          <ModalBody>
            {isFetching && <FormSkeleton row={6} />}
            {!isFetching && (
              <Form id="detailForm" onSubmit={onSubmit} className={'flex flex-col gap-3'}>
                <Input
                  isRequired
                  label={msg('name')}
                  autoFocus
                  name="name"
                  value={form.name}
                  onValueChange={(value) => setForm({ ...form, name: value })}
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
                <Input
                  label={msg('description')}
                  name="description"
                  placeholder={`${msg('enter')} ${msg('description')}`}
                  value={form.description}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
                  variant="bordered"
                />
                <DepartmentTypeSelect
                  value={form.departmentTypeCode ? [form.departmentTypeCode] : []}
                  onChange={(values) => {
                    setForm((prev) => ({ ...prev, departmentTypeCode: values[0] ?? '' }));
                  }}
                  selectionMode="single"
                  isRequired
                  labelPlacement="outside"
                  variant="bordered"
                />
                <DepartmentSelect
                  values={form.parentId ? [form.parentId] : []}
                  onChange={(values) => {
                    setForm((prev) => ({ ...prev, parentId: values[0] ?? 0 }));
                  }}
                  multiple={false}
                  label={t('parentDepartment')}
                  labelPlacement="outside"
                  anyLevel
                />
                <Input
                  label={msg('address')}
                  name="address"
                  placeholder={`${msg('enter')} ${msg('address')}`}
                  value={form.address}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, address: value }))}
                  variant="bordered"
                />
                {form.treePath && (
                  <Input
                    isDisabled
                    label={msg('path')}
                    name="treePath"
                    value={form.treePath}
                    variant="bordered"
                  />
                )}
              </Form>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenChange}>
              {msg('close')}
            </Button>
            <Button type="submit" color="primary" form="detailForm" isLoading={isPending}>
              {msg('save')}
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
}
