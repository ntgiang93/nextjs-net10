import FormSkeleton from '@/components/ui/skeleton/FormSkeleton';
import { DepartmentHook } from '@/hooks/department';
import { DepartmentTypeHook } from '@/hooks/departmentType';
import {
  defaultDetailDepartmentDto,
  DepartmentDto,
  DetailDepartmentDto,
} from '@/types/sys/Department';
import { DepartmentTypeDto } from '@/types/sys/DepartmentType';
import {
  Button,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

interface DetailProps {
  isOpen: boolean;
  onOpenChange: () => void;
  id: number;
  onRefresh: () => void;
  onResetSelected: () => void;
}

export default function DetailModal(props: DetailProps) {
  const { isOpen, onOpenChange, id, onRefresh, onResetSelected } = props;
  const [form, setForm] = useState<DetailDepartmentDto>({ ...defaultDetailDepartmentDto });
  const { data, isFetching } = DepartmentHook.useGet(isOpen ? id : 0);
  const { data: departmentTypes } = DepartmentTypeHook.useGetAll();
  const { data: departments } = DepartmentHook.useGetAll();
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

  const flattenDepartments = useMemo(() => {
    const list: DepartmentDto[] = [];
    const traverse = (items?: DepartmentDto[], prefix = '') => {
      if (!items) return;
      items.forEach((item) => {
        list.push({ ...item, name: `${prefix}${item.name}` });
        if (item.children && item.children.length > 0) {
          traverse(item.children, `${prefix}— `);
        }
      });
    };
    traverse(departments);
    return list;
  }, [departments]);

  const parentOptions = useMemo(() => {
    return flattenDepartments.filter((dept) => dept.id !== id);
  }, [flattenDepartments, id]);

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
    if (!isOpen || id > 0) return;
    if (form.departmentTypeCode && form.departmentTypeCode.length > 0) return;
    if (departmentTypes && departmentTypes.length > 0) {
      setForm((prev) => ({ ...prev, departmentTypeCode: departmentTypes[0].code }));
    }
  }, [departmentTypes, form.departmentTypeCode, id, isOpen]);

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
                <Select
                  label={t('departmentType')}
                  isRequired
                  placeholder={msg('select')}
                  selectedKeys={
                    form.departmentTypeCode && form.departmentTypeCode.length > 0
                      ? new Set([form.departmentTypeCode])
                      : new Set([])
                  }
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string | undefined;
                    setForm((prev) => ({ ...prev, departmentTypeCode: key ?? '' }));
                  }}
                  variant="bordered"
                >
                  {(departmentTypes || []).map((item: DepartmentTypeDto) => (
                    <SelectItem key={item.code} textValue={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label={t('department')}
                  isClearable
                  placeholder={msg('select')}
                  selectedKeys={
                    form.parentId && form.parentId > 0
                      ? new Set([String(form.parentId)])
                      : new Set([])
                  }
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string | undefined;
                    setForm((prev) => ({ ...prev, parentId: key ? Number(key) : undefined }));
                  }}
                  variant="bordered"
                >
                  {parentOptions.map((item) => (
                    <SelectItem key={String(item.id)} textValue={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </Select>
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
