import { ExtDropzone } from '@/components/ui/input/ExtDropZone';
import { FileHook } from '@/hooks/sys/file';
import { Button, Card, CardBody, CardFooter } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';

interface IUserAttachmentsDocumentProps {
  id: string;
}

export default function UserAttachmentsDocument(props: IUserAttachmentsDocumentProps) {
  const { id } = props;
  const msg = useTranslations('msg');
  const REFERENCE_TYPE = 'userProfile';
  const dropzoneRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { data: attachments, refetch } = FileHook.useGetByReference({
    referenceId: id,
    referenceType: REFERENCE_TYPE,
  });

  const onSubmit = async () => {
    try {
      setLoading(true);
      await dropzoneRef.current.updateReference(id, REFERENCE_TYPE);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const dropzoneHeight = useMemo(() => {
    if (cardRef.current) {
      const cardHeight = cardRef.current.clientHeight;
      return cardHeight - 128; // Subtract footer height
    }
  }, [cardRef.current]);

  return (
    <Card shadow="none" className="h-full p-0" ref={cardRef}>
      <CardBody className="overflow-auto" style={{ height: dropzoneHeight }}>
        <ExtDropzone
          ref={dropzoneRef}
          maxSize={10}
          maxFiles={20}
          accept={{ 'image/*': [], 'application/pdf': [], 'text/plain': ['.txt'] }}
          existingFiles={attachments}
          refetch={refetch}
        />
      </CardBody>
      <CardFooter className="flex justify-end">
        <Button
          color="primary"
          type="button"
          form="user-profile-form"
          isLoading={loading}
          onPress={onSubmit}
        >
          {msg('save')}
        </Button>
      </CardFooter>
    </Card>
  );
}
