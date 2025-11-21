import FormSkeleton from '@/components/ui/skeleton/FormSkeleton';
import { JobTitleHook } from '@/hooks/orgazination/jobTitle';
import { defaultJobTitleDto, JobTitleDto } from '@/types/sys/JobTitle';
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
}

export default function DetailModal(props: DetailProps) {
  const { isOpen, onOpenChange, id, onRefresh, onResetSelected } = props;
  const [form, setForm] = useState<JobTitleDto>({ ...defaultJobTitleDto });
  const { data, isFetching } = JobTitleHook.useGet(isOpen ? id : 0);
  const { mutateAsync: save, isPending } = JobTitleHook.useSave();
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
      setForm((prev) => ({ ...prev, ...defaultJobTitleDto }));
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
            {id > 0 ? msg('edit') : msg('add') + ' ' + t('jobTitle').toLowerCase()}
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
