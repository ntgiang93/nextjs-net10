import FormSkeleton from '@/components/ui/skeleton/FormSkeleton';
import { JobScheduleHook } from '@/hooks/sys/jobSchedule';
import { defaultJobConfiguration, DetailJobConfigurationDto } from '@/types/sys/JobConfiguration';
import {
  Button,
  Form,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
interface JobScheduleModalProps {
  id: number;
  isOpen: boolean;
  onOpenChange: () => void;
  onRefresh: () => void;
}

export default function DetailModal(props: JobScheduleModalProps) {
  const t = useTranslations('jobSchedule');
  const msg = useTranslations('msg');
  const { id, isOpen, onOpenChange, onRefresh } = props;
  const [form, setForm] = useState<DetailJobConfigurationDto>({ ...defaultJobConfiguration });
  const { data: types, isFetching: isFetchingTypes } = JobScheduleHook.useGetType();
  const { data: jobSchedule, isFetching } = JobScheduleHook.useGet(isOpen ? id : 0);
  const { mutateAsync: save, isPending } = JobScheduleHook.useSave();

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const success = await save(form);
    if (success) {
      onOpenChange();
      onRefresh();
    }
  };

  const isEdit = useMemo(() => {
    return jobSchedule && jobSchedule.id > 0;
  }, [jobSchedule]);

  useEffect(() => {
    if (jobSchedule) {
      console.log('Job Schedule loaded:', jobSchedule);
      setForm({ ...jobSchedule });
    }
  }, [jobSchedule]);

  useEffect(() => {
    if (!isOpen) {
      setForm({ ...defaultJobConfiguration });
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside" size="2xl">
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">
            {jobSchedule?.id && jobSchedule.id > 0 ? t('editJobSchedule') : t('addJobSchedule')}
          </ModalHeader>
          <ModalBody>
            {isFetching && <FormSkeleton row={6} col={1} />}
            {!isFetching && (
              <Form id="jobScheduleForm" onSubmit={onSubmit} className={'flex flex-col gap-3'}>
                <Input
                  isRequired
                  label={t('jobName')}
                  autoFocus
                  name="jobName"
                  placeholder={t('jobName')}
                  value={form.jobName}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, jobName: value }))}
                  validate={(value) => {
                    return !value || value.trim() === '' ? msg('required') : null;
                  }}
                  type="text"
                  variant={'bordered'}
                  disabled={isEdit}
                />
                <Input
                  isRequired
                  label={t('jobGroup')}
                  name="jobGroup"
                  placeholder={t('jobGroup')}
                  value={form.jobGroup}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, jobGroup: value }))}
                  validate={(value) => {
                    return !value || value.trim() === '' ? msg('required') : null;
                  }}
                  type="text"
                  variant={'bordered'}
                  disabled={isEdit}
                />
                <Select
                  isRequired
                  label={t('jobType')}
                  name="jobType"
                  placeholder={t('jobType')}
                  items={types}
                  selectedKeys={new Set<string>([form.jobType])}
                  onChange={(e) => setForm((prev) => ({ ...prev, jobType: e.target.value }))}
                  validate={(value) => {
                    return !value || value.length < 1 ? msg('required') : null;
                  }}
                  disabled={isEdit}
                  variant={'bordered'}
                  isLoading={isFetchingTypes}
                >
                  {(type) => <SelectItem key={type.key}>{type.label}</SelectItem>}
                </Select>
                <Input
                  isRequired
                  label={t('cronExpression')}
                  name="cronExpression"
                  placeholder="0 0 12 * * ?"
                  value={form.cronExpression}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, cronExpression: value }))}
                  validate={(value) => {
                    if (!value || value.trim() === '') return msg('required');
                    // Quartz.NET Cron: 6-7 parts (second minute hour day month dayOfWeek [year])
                    const parts = value.trim().split(/\s+/);
                    if (parts.length < 6 || parts.length > 7) {
                      return t('cronExpressionInvalid');
                    }
                    return null;
                  }}
                  type="text"
                  variant={'bordered'}
                  description={
                    <div className="flex justify-between">
                      <span className="text-xs">{t('cronExpressionDescription')}. </span>
                      <Link isExternal showAnchorIcon href="https://crontab.cronhub.io/" size="sm">
                        {t('buildExpression')}
                      </Link>
                    </div>
                  }
                />
                <Textarea
                  label={t('jobDataJson')}
                  name="jobDataJson"
                  placeholder={t('jobDataJson')}
                  value={form.jobDataJson}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, jobDataJson: value }))}
                  validate={(value) => {
                    if (!value) return null;
                    try {
                      JSON.parse(value);
                      return null; // Valid
                    } catch (e) {
                      return msg('invalidJson');
                    }
                  }}
                  type="text"
                  variant={'bordered'}
                  description={t('jsonDataDescription')}
                />
                <Textarea
                  label={t('description')}
                  name="description"
                  placeholder={t('description')}
                  value={form.description}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
                  variant={'bordered'}
                />
              </Form>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenChange}>
              {msg('close')}
            </Button>
            <Button type="submit" color="primary" form="jobScheduleForm" isLoading={isPending}>
              {msg('save')}
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
}
