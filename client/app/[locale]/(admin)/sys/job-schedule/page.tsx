'use client';
import { ExtButton } from '@/components/ui/button/ExtButton';
import DataTable from '@/components/ui/data-table/Datatable';
import { SearchInput } from '@/components/ui/input/SearchInput';
import { PageHeader } from '@/components/ui/navigate/PageHeader';
import { ConfirmModal } from '@/components/ui/overlay/ConfirmModal';
import { JobScheduleHook } from '@/hooks/jobSchedule';
import { hasPermission } from '@/libs/AuthHelper';
import { EPermission } from '@/types/base/Permission';
import { ESysModule } from '@/types/constant/SysModule';
import { JobScheduleDto } from '@/types/sys/JobConfiguration';
import { Button, Tooltip, useDisclosure } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import {
  Add01Icon,
  Delete02Icon,
  Edit01Icon,
  PauseIcon,
  PlayIcon,
  ReplayIcon,
} from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import DetailModal from './components/DetailModal';

export default function Roles() {
  const t = useTranslations('jobSchedule');
  const msg = useTranslations('msg');
  const { data: jobs, refetch, isFetching } = JobScheduleHook.useGetAll();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedJob, setSelectedJob] = useState<JobScheduleDto | undefined>(undefined);
  const { isOpen: IsOpenDel, onOpen: onOpenDel, onOpenChange: OnOpenDelChange } = useDisclosure();
  const {
    isOpen: IsOpenTrigger,
    onOpen: onOpenTrigger,
    onOpenChange: OnOpenTriggerChange,
  } = useDisclosure();
  const {
    isOpen: IsOpenPause,
    onOpen: onOpenPause,
    onOpenChange: OnOpenPauseChange,
  } = useDisclosure();
  const {
    isOpen: IsOpenResume,
    onOpen: onOpenResume,
    onOpenChange: OnOpenResumeChange,
  } = useDisclosure();
  const { mutateAsync: del, isPending: delLoading } = JobScheduleHook.useDelete();
  const { mutateAsync: trigger, isPending: triggerLoading } = JobScheduleHook.useTrigger();
  const { mutateAsync: pause, isPending: pauseLoading } = JobScheduleHook.usePause();
  const { mutateAsync: resume, isPending: resumeLoading } = JobScheduleHook.useResume();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tableData, setTableData] = useState<JobScheduleDto[]>(jobs || []);
  const canCreateRole = hasPermission(ESysModule.JobScheduler, EPermission.Create);
  const canEditRole = hasPermission(ESysModule.JobScheduler, EPermission.Edit);
  const canDeleteRole = hasPermission(ESysModule.JobScheduler, EPermission.Delete);

  const columns = useMemo<ColumnDef<JobScheduleDto>[]>(
    () => [
      {
        id: 'jobName',
        accessorKey: 'jobName',
        header: () => t('jobName'),
        footer: (props) => props.column.id,
        minSize: 150,
        meta: {
          pinned: 'left',
        },
      },
      {
        id: 'jobGroup',
        accessorKey: 'jobGroup',
        header: () => t('jobGroup'),
        footer: (props) => props.column.id,
        size: 150,
        meta: { autoSize: true },
      },
      {
        id: 'jobType',
        accessorKey: 'jobType',
        header: () => t('jobType'),
        footer: (props) => props.column.id,
        size: 200,
        meta: { autoSize: true },
      },
      {
        id: 'cronExpression',
        accessorKey: 'cronExpression',
        header: () => t('cronExpression'),
        footer: (props) => props.column.id,
        size: 150,
        meta: { autoSize: true },
      },
      {
        id: 'triggerState',
        accessorKey: 'triggerState',
        header: () => msg('status'),
        footer: (props) => props.column.id,
        size: 150,
        meta: {
          align: 'center',
        },
      },
      {
        id: 'nextFireTime',
        accessorKey: 'nextFireTime',
        header: () => t('nextExecutionTime'),
        footer: (props) => props.column.id,
        size: 150,
        meta: {
          align: 'center',
        },
        cell: ({ cell }) => {
          const value = cell.getValue() as string | number | Date | null | undefined;
          return <span>{value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : ''}</span>;
        },
      },
      {
        id: 'previousFireTime',
        accessorKey: 'previousFireTime',
        header: () => t('lastExecutionTime'),
        footer: (props) => props.column.id,
        size: 150,
        meta: { autoSize: true },
        cell: ({ cell }) => {
          const value = cell.getValue() as string | number | Date | null | undefined;
          return <span>{value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : ''}</span>;
        },
      },
      {
        id: 'actions',
        accessorKey: 'actions',
        header: msg('actions'),
        footer: (props) => props.column.id,
        meta: {
          align: 'center',
          pinned: 'right',
        },
        size: 150,
        cell: ({ row }) => {
          return (
            <div className="relative flex items-center gap-2">
              {canEditRole && row.original.triggerState != 'Normal' && (
                <Tooltip content={msg('edit')}>
                  <Button
                    isIconOnly
                    aria-label="expand-button"
                    color="primary"
                    variant="light"
                    radius="full"
                    size="sm"
                    onPress={() => {
                      if (!canEditRole) return;
                      setSelectedJob(row.original);
                      onOpen();
                    }}
                  >
                    <Edit01Icon size={16} />
                  </Button>
                </Tooltip>
              )}
              {canEditRole && row.original.triggerState === 'None' && (
                <Tooltip content={t('startJob')}>
                  <Button
                    isIconOnly
                    aria-label="trigger-button"
                    color="success"
                    variant="light"
                    radius="full"
                    size="sm"
                    onPress={() => {
                      if (!canEditRole) return;
                      setSelectedJob(row.original);
                      onOpenTrigger();
                    }}
                  >
                    <PlayIcon size={16} />
                  </Button>
                </Tooltip>
              )}
              {canEditRole && row.original.triggerState === 'Normal' && (
                <Tooltip content={t('pauseJob')}>
                  <Button
                    isIconOnly
                    aria-label="pause-button"
                    color="warning"
                    variant="light"
                    radius="full"
                    size="sm"
                    onPress={() => {
                      if (!canEditRole) return;
                      setSelectedJob(row.original);
                      onOpenPause();
                    }}
                  >
                    <PauseIcon size={16} />
                  </Button>
                </Tooltip>
              )}
              {canEditRole && row.original.triggerState === 'Paused' && (
                <Tooltip content={t('resumeJob')}>
                  <Button
                    isIconOnly
                    aria-label="resume-button"
                    color="primary"
                    variant="light"
                    radius="full"
                    size="sm"
                    onPress={() => {
                      if (!canEditRole) return;
                      setSelectedJob(row.original);
                      onOpenResume();
                    }}
                  >
                    <ReplayIcon size={16} />
                  </Button>
                </Tooltip>
              )}
              {canDeleteRole && row.original.triggerState != 'Normal' && (
                <Tooltip color="danger" content={msg('delete')}>
                  <Button
                    isIconOnly
                    aria-label="expand-button"
                    color="danger"
                    variant="light"
                    radius="full"
                    size="sm"
                    onPress={() => {
                      setSelectedJob(row.original);
                      onOpenDel();
                    }}
                  >
                    <Delete02Icon size={16} />
                  </Button>
                </Tooltip>
              )}
            </div>
          );
        },
      },
    ],
    [
      canDeleteRole,
      canEditRole,
      msg,
      onOpen,
      onOpenDel,
      onOpenTrigger,
      onOpenPause,
      onOpenResume,
      t,
    ],
  );

  const handleDelete = async () => {
    if (!selectedJob) return;
    const success = await del(selectedJob.id);
    if (success) {
      refetch();
      OnOpenDelChange();
      setSelectedJob(undefined);
    }
  };

  const handleTrigger = async () => {
    if (!selectedJob) return;
    const success = await trigger(selectedJob.jobName);
    if (success) {
      refetch();
      setSelectedJob(undefined);
    }
    OnOpenTriggerChange();
  };

  const handlePause = async () => {
    if (!selectedJob) return;
    const success = await pause(selectedJob.jobName);
    if (success) {
      refetch();
      setSelectedJob(undefined);
    }
    OnOpenPauseChange();
  };

  const handleResume = async () => {
    if (!selectedJob) return;
    const success = await resume(selectedJob.jobName);
    if (success) {
      refetch();
      setSelectedJob(undefined);
    }
    OnOpenResumeChange();
  };

  useEffect(() => {
    if (searchTerm && searchTerm.length > 0) {
      const searchTermLower = searchTerm.toLocaleLowerCase();
      const dataSource =
        jobs?.filter(
          (r) =>
            r.jobName.toLocaleLowerCase().includes(searchTermLower) ||
            r.description?.toLocaleLowerCase().includes(searchTermLower),
        ) || [];
      setTableData([...dataSource]);
    } else {
      console.log('No search term provided, displaying all jobs', jobs);
      setTableData([...(jobs || [])]);
    }
  }, [searchTerm, jobs]);

  return (
    <div className={'h-full w-full flex flex-col gap-2'}>
      <PageHeader
        title={t('title')}
        toolbar={
          <>
            {canCreateRole && (
              <ExtButton
                color="primary"
                startContent={<Add01Icon size={16} />}
                variant="shadowSmall"
                onPress={() => {
                  if (!canCreateRole) return;
                  setSelectedJob(undefined);
                  onOpen();
                }}
              >
                {msg('add')}
              </ExtButton>
            )}
          </>
        }
      ></PageHeader>
      <DataTable
        columns={columns}
        data={tableData}
        isLoading={isFetching}
        fetch={refetch}
        leftContent={
          <>
            <SearchInput
              className="w-64"
              value={searchTerm}
              onValueChange={(value) => setSearchTerm(value)}
            />
          </>
        }
      />
      <DetailModal
        id={selectedJob?.id || 0}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onRefresh={refetch}
      />
      <ConfirmModal
        isOpen={IsOpenDel}
        title={msg('delete')}
        confirmColor="danger"
        message={t('deleteJobScheduleWarning')}
        onOpenChange={OnOpenDelChange}
        onConfirm={handleDelete}
        objectName={[selectedJob?.jobName || '']}
        loading={delLoading}
      />
      <ConfirmModal
        isOpen={IsOpenTrigger}
        title={t('startJob')}
        confirmColor="success"
        message={t('triggerJobWarning')}
        onOpenChange={OnOpenTriggerChange}
        onConfirm={handleTrigger}
        objectName={[selectedJob?.jobName || '']}
        loading={triggerLoading}
      />
      <ConfirmModal
        isOpen={IsOpenPause}
        title={t('pauseJob')}
        confirmColor="warning"
        message={t('pauseJobWarning')}
        onOpenChange={OnOpenPauseChange}
        onConfirm={handlePause}
        objectName={[selectedJob?.jobName || '']}
        loading={pauseLoading}
      />
      <ConfirmModal
        isOpen={IsOpenResume}
        title={t('resumeJob')}
        confirmColor="primary"
        message={t('resumeJobWarning')}
        onOpenChange={OnOpenResumeChange}
        onConfirm={handleResume}
        objectName={[selectedJob?.jobName || '']}
        loading={resumeLoading}
      />
    </div>
  );
}
