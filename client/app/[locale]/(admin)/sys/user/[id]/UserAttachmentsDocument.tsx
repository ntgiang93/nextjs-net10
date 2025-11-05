import { ExtDropzone } from '@/components/ui/input/ExtDropZone';
import { FileHook } from '@/hooks/file';
import { Button, Card, CardBody, CardFooter } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

interface IUserAttachmentsDocumentProps {
  id: string;
}

export default function UserAttachmentsDocument(props: IUserAttachmentsDocumentProps) {
  const { id } = props;
  const msg = useTranslations('msg');
  const REFERENCE_TYPE = 'userProfile';
  const dropzoneRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const { data: attachments, isFetching } = FileHook.useGetByReference({
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

  return (
    <Card className="h-full" shadow="none">
      <CardBody>
        <ExtDropzone
          ref={dropzoneRef}
          maxSize={10}
          maxFiles={20}
          accept={{ 'image/*': [] }}
          existingFiles={attachments}
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
