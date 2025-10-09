import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { Alert02Icon, AlertCircleIcon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';

interface ConfirmModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  objectName?: string[];
}

export function ConfirmModal({
  isOpen,
  onConfirm,
  onOpenChange,
  title,
  message,
  confirmText,
  cancelText,
  objectName,
  confirmColor = 'primary',
  size = 'md',
}: ConfirmModalProps) {
  const msg = useTranslations('msg');
  return (
    <Modal isOpen={isOpen} size={size} onOpenChange={onOpenChange} scrollBehavior='inside'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className={`flex flex-row items-center gap-3 text-${confirmColor}`}>
              <Alert02Icon size={24} stroke="6" />
              {title ?? msg('confirm')}
            </ModalHeader>
            <ModalBody>
              <p>{message ?? msg('deleteWarning')}</p>
              {Array.isArray(objectName) && (
                <ul className="list-disc">
                  {objectName.map((name) => (
                    <li key={name} className="font-semibold flex gap-2"><AlertCircleIcon /> {name}</li>
                  ))}
                </ul>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose}>
                {cancelText ?? msg('cancel')}
              </Button>
              <Button
                color={confirmColor}
                onPress={() => {
                  onConfirm();
                  onOpenChange();
                }}
              >
                {confirmText ?? msg('confirm')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
