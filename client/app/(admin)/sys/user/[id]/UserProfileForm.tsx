import { UserProfileHook } from '@/hooks/userProfile';
import { UserDto } from '@/types/sys/User';
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
import { parseDateTime } from '@internationalized/date';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface IUserProfileFormProps {
  user: UserDto;
}

export default function UserProfileForm(props: IUserProfileFormProps) {
  const { user } = props;
  const t = useTranslations('user');
  const msg = useTranslations('msg');
  const [form, setForm] = useState<UserProfileDto>({ ...defaultUserProfileDto });
  const { data, isFetching, refetch } = UserProfileHook.useGetUserProfile(user.id);
  const { mutateAsync: save, isPending } = UserProfileHook.useSave();

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const response = await save({ ...form, userId: user.id });
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

  return (
    <Card className="border-none shadow-none h-full">
      <CardBody>
        <Form
          className="w-full max-w-[700px] justify-start"
          onSubmit={onSubmit}
          id="user-profile-form"
        >
          <div className="flex flex-col gap-4 w-full">
            <Input
              label={msg('address')}
              name="address"
              placeholder={msg('address')}
              value={form.address}
              onValueChange={(value) => setForm({ ...form, address: value })}
            />
            <div className="flex gap-4">
              <DatePicker
                showMonthAndYearPickers
                aria-label="Date of Birth"
                className=""
                label={t('dateOfBirth')}
                value={form.dateOfBirth ? parseDateTime(form.dateOfBirth) : null}
                onChange={(date) => setForm({ ...form, dateOfBirth: date?.toString() })}
                granularity="day"
              />
              <Select
                label={t('gender')}
                name="gender"
                placeholder={t('gender')}
                value={form.gender}
                onChange={(e) => {
                  setForm({ ...form, gender: e.target.value });
                }}
              >
                <SelectItem key="01">Nam</SelectItem>
                <SelectItem key="02">Nữ</SelectItem>
              </Select>
            </div>
            <div className="flex gap-4"></div>
          </div>
        </Form>
      </CardBody>
      <CardFooter className="flex gap-4 justify-end">
        <Button color="primary" type="submit" form="user-profile-form" isLoading={isPending}>
          {msg('save')}
        </Button>
      </CardFooter>
    </Card>
  );
}
