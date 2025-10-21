import { DepartmentHook } from '@/hooks/department';
import { DepartmentDto } from '@/types/sys/Department';
import {
  Button,
  Input,
  Listbox,
  ListboxItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from '@heroui/react';
import { Selection } from '@react-types/shared';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

interface AddMemberModalProps {
  department?: DepartmentDto;
  isOpen: boolean;
  onOpenChange: () => void;
  onAdded?: () => void;
}

export default function AddMemberModal(props: AddMemberModalProps) {
  const { department, isOpen, onOpenChange, onAdded } = props;
  const departmentId = department?.id ?? 0;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));

  const { data: candidates = [], isFetching } = DepartmentHook.useGetUsersNotInDepartment(
    departmentId,
    searchTerm,
    isOpen,
  );
  const { mutateAsync: assignMembers, isPending } = DepartmentHook.useAssignMember(departmentId);

  const msg = useTranslations('msg');
  const t = useTranslations('organization');

  useEffect(() => {
    if (!isOpen) {
      setSelectedKeys(new Set([]));
      setSearchTerm('');
    }
  }, [isOpen]);

  const selectedUserIds = useMemo(() => {
    if (selectedKeys === 'all') {
      return candidates.map((item) => item.id);
    }
    return Array.from(selectedKeys) as string[];
  }, [selectedKeys, candidates]);

  const handleSubmit = async () => {
    if (!departmentId || selectedUserIds.length === 0) return;
    const success = await assignMembers(
      selectedUserIds.map((userId) => ({ departmentId, userId })),
    );
    if (success) {
      onOpenChange();
      setSelectedKeys(new Set([]));
      setSearchTerm('');
      onAdded?.();
    }
  };

  const renderListContent = () => {
    if (isFetching) {
      return (
        <div className="flex items-center justify-center py-6">
          <Spinner size="sm" />
        </div>
      );
    }

    if (!candidates.length) {
      return <div className="py-6 text-center text-small text-default-500">{msg('noData')}</div>;
    }

    return (
      <Listbox
        selectionMode="multiple"
        aria-label="available-users"
        variant="bordered"
        className="max-h-72 overflow-auto"
        selectedKeys={selectedKeys}
        onSelectionChange={(keys) => setSelectedKeys(keys)}
        emptyContent={msg('noData')}
      >
        {candidates.map((user) => (
          <ListboxItem key={user.id} textValue={user.fullName || user.userName}>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.fullName || user.userName}</span>
              <span className="text-tiny text-default-500">{user.userName}</span>
            </div>
          </ListboxItem>
        ))}
      </Listbox>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      isDismissable={false}
      isKeyboardDismissDisabled
    >
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">
            {t('assignMembers')} {department ? `- ${department.name}` : ''}
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                autoFocus
                value={searchTerm}
                onValueChange={setSearchTerm}
                placeholder={msg('search')}
                variant="bordered"
              />
              {renderListContent()}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenChange}>
              {msg('close')}
            </Button>
            <Button
              color="primary"
              isDisabled={!departmentId || selectedUserIds.length === 0}
              isLoading={isPending}
              onPress={handleSubmit}
            >
              {msg('submit')}
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
}
