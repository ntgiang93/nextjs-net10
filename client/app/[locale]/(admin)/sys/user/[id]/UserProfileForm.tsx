import JobTitleSelect from '@/components/shared/sys/select/JobTitleSelect';
import FormSkeleton from '@/components/ui/skeleton/FormSkeleton';
import { UserProfileHook } from '@/hooks/sys/userProfile';
import { defaultUserProfileDto, UserProfileDto } from '@/types/sys/UserProfile';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  DatePicker,
  Form,
  Input,
  Select,
  SelectItem,
} from '@heroui/react';
import { getLocalTimeZone, parseDateTime, today } from '@internationalized/date';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface IUserProfileFormProps {
  id: string;
}

export default function UserProfileForm(props: IUserProfileFormProps) {
  const { id } = props;
  const t = useTranslations('user');
  const msg = useTranslations('msg');
  const org = useTranslations('organization');
  const [form, setForm] = useState<UserProfileDto>({ ...defaultUserProfileDto });
  const { data, isFetching, refetch } = UserProfileHook.useGetUserProfile(id);
  const { mutateAsync: save, isPending } = UserProfileHook.useSave();

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const response = await save({ ...form, id });
    if (response && response.success) {
      refetch();
    }
  };

  useEffect(() => {
    if (data) {
      setForm({ ...data });
    } else {
      setForm({ ...defaultUserProfileDto });
    }
  }, [data]);

  if (isFetching) {
    return <FormSkeleton row={4} col={2} />;
  }

  return (
    <Card className="border-none shadow-none h-full w-full">
      <CardBody>
        {isFetching ? (
          <FormSkeleton row={4} col={2} />
        ) : (
          <Form className="w-full justify-start" onSubmit={onSubmit} id="user-profile-form">
            <div className="flex flex-col gap-4 w-full">
              <Input
                label={msg('address')}
                name="address"
                variant="bordered"
                placeholder={msg('address')}
                value={form.address}
                onValueChange={(value) => setForm((prev) => ({ ...prev, address: value }))}
              />
              <div className="flex gap-4">
                <DatePicker
                  showMonthAndYearPickers
                  aria-label="Date of Birth"
                  variant="bordered"
                  className=""
                  label={t('dateOfBirth')}
                  value={form.dateOfBirth ? parseDateTime(form.dateOfBirth) : null}
                  onChange={(date) =>
                    setForm((prev) => ({ ...prev, dateOfBirth: date?.toString() }))
                  }
                  granularity="day"
                  maxValue={today(getLocalTimeZone())}
                />
                <Select
                  label={t('gender')}
                  name="gender"
                  placeholder={t('gender')}
                  variant="bordered"
                  value={form.gender}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, gender: e.target.value }));
                  }}
                >
                  <SelectItem key="01">Nam</SelectItem>
                  <SelectItem key="02">Nữ</SelectItem>
                </Select>
              </div>
              <div className="flex gap-4">
                <JobTitleSelect
                  value={form.jobTitleId && form.jobTitleId > 0 ? form.jobTitleId : undefined}
                  onChange={(value) => setForm((prev) => ({ ...prev, jobTitleId: value ?? 0 }))}
                  variant="bordered"
                  labelPlacement="outside"
                />
                <Input
                  label={org('department')}
                  name="department"
                  variant="bordered"
                  placeholder={org('department')}
                  value={form.departmentName}
                  readOnly
                />
              </div>
            </div>
          </Form>
        )}
      </CardBody>
      <CardFooter className="flex gap-4 justify-end">
        <Button color="primary" type="submit" form="user-profile-form" isLoading={isPending}>
          {msg('save')}
        </Button>
      </CardFooter>
    </Card>
  );
}
