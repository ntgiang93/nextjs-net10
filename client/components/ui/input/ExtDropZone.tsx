import { FileHook } from '@/hooks/file';
import { useAuthStore } from '@/store/auth-store';
import { defaultFileDto, FileDto, FileUploadDto } from '@/types/sys/File';
import {
  Button,
  Divider,
  Link,
  Progress,
  ScrollShadow,
  Tooltip,
  useDisclosure,
} from '@heroui/react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import {
  CloudDownloadIcon,
  CloudSavingDone01Icon,
  CloudUploadIcon,
  Delete01Icon,
  FileCloudIcon,
} from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Accept, useDropzone } from 'react-dropzone';
import { ConfirmModal } from '../overlay/ConfirmModal';

interface IExtDropzoneProps {
  maxSize: number;
  maxFiles: number;
  // Chỉ cho ảnh: { 'image/*': [] }
  // Chỉ PDF và Word: { 'application/pdf': [], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }
  // Theo đuôi file: { 'text/plain': ['.txt'], 'application/vnd.ms-excel': ['.xls', '.xlsx'] }
  // Hoặc kết hợp: { 'image/*': [], 'application/pdf': [], 'text/plain': ['.txt'] }
  // https://react-dropzone.js.org/#section-accepting-specific-file-types
  accept?: Accept;
  existingFiles?: FileDto[];
  height?: number;
  refetch?: () => void;
}

export const ExtDropzone = forwardRef((props: IExtDropzoneProps, ref) => {
  const { maxSize, maxFiles, accept, existingFiles, refetch } = props;
  const { mutateAsync: uploadFile, isPending } = FileHook.useUpload();
  const { mutateAsync: deleteFile, isPending: isDeleting } = FileHook.useDelete();
  const { mutateAsync: updateReference } = FileHook.useUpdateReference();
  const [selectedFile, setSelectedFile] = useState<FileDto | undefined>(undefined);
  const [uploadedFile, setUploadedFile] = useState<FileDto[]>([]);
  const dropBoxRef = useRef<HTMLDivElement | null>(null);
  const {
    isOpen: IsOpenConfirm,
    onOpen: onOpenConfirm,
    onOpenChange: OnOpenConfirmChange,
  } = useDisclosure();
  const { user } = useAuthStore();
  const { getRootProps, getInputProps, isDragActive, isFileDialogActive } = useDropzone({
    accept: accept,
    maxSize: maxSize * 1024 * 1024,
    maxFiles: maxFiles,
    onDropAccepted: (files) => {
      handleUploadFiles(files);
    },
    disabled: isPending,
  });
  const msg = useTranslations('msg');

  useImperativeHandle(ref, () => ({
    updateReference: async (referenceId: string, referenceType: string) => {
      console.log('uploadedFile', uploadedFile);
      var response = await updateReference({
        ids: uploadedFile.filter((f) => f.id > 0).map((f) => f.id),
        referenceId: referenceId || '',
        referenceType: referenceType || '',
      });
      if (response) {
        setUploadedFile([]);
        refetch && refetch();
      }
    },
  }));

  const newListFile = useMemo(() => {
    return uploadedFile.map((file, index) => {
      const uploaded = file.id > 0;
      return (
        <li
          className="w-full flex flex-col  border border-default px-4 py-1 rounded-lg"
          key={index}
        >
          <div className="flex items-center gap-4">
            <div className="w-full flex flex-col">
              <span>{file.fileName}</span>
              <div className="flex gap-3 text-sm font-light">
                <span className="text-default-600">{Math.ceil(file.fileSize / 1024)} KB</span>
                <span className="text-default">•</span>
                <span className="text-default-600">{dayjs().format('DD/MM/YYYY HH:mm:ss')}</span>
                <span className="text-default">•</span>
                <span className="text-default-600">
                  {msg('uploadBy', { userName: user?.userName ?? '' })}
                </span>
              </div>
            </div>
            <div
              className={`flex transition-all ease-in-out duration-400 opacity-0 ${uploaded ? 'opacity-100' : ''}`}
            >
              <Button variant="light" radius="full" color="success" isIconOnly disabled>
                <CloudSavingDone01Icon size={20} />
              </Button>
              <Tooltip content={msg('delete')}>
                <Button
                  variant="light"
                  radius="full"
                  color="danger"
                  isIconOnly
                  onPress={() => {
                    setSelectedFile(file);
                    onOpenConfirm();
                  }}
                >
                  <Delete01Icon size={16} />
                </Button>
              </Tooltip>
              <Tooltip content={msg('download')}>
                <Button
                  as={Link}
                  variant="light"
                  radius="full"
                  color="primary"
                  isIconOnly
                  href={file.filePath}
                  target="_blank"
                >
                  <CloudDownloadIcon size={16} />
                </Button>
              </Tooltip>
            </div>
          </div>

          <Progress
            isIndeterminate
            aria-label="Loading..."
            size="sm"
            value={30}
            color={'primary'}
            className={`transition-all ease-in-out duration-400 opacity-100 ${uploaded ? 'opacity-0' : ''}`}
          />
        </li>
      );
    });
  }, [uploadedFile, user, msg]);

  const listExistingFiles = useMemo(
    () =>
      existingFiles?.map((file, index) => (
        <li className="w-full flex border border-default gap-4 py-1 px-4 rounded" key={index}>
          <div className="w-full flex flex-col">
            <span>{file.fileName}</span>
            <div className="flex gap-3 text-sm font-light">
              <span className="text-default-600">{Math.ceil(file.fileSize / 1024)} KB</span>
              <span className="text-default">•</span>
              <span className="text-default-600">{dayjs().format('DD/MM/YYYY HH:mm:ss')}</span>
              <span className="text-default">•</span>
              <span className="text-default-600">
                {msg('uploadBy', { userName: user?.userName ?? '' })}
              </span>
            </div>
          </div>
          <div className={`flex`}>
            <Button variant="light" radius="full" color="default" isIconOnly disabled>
              <FileCloudIcon size={20} />
            </Button>
            <Tooltip content={msg('delete')}>
              <Button
                variant="light"
                radius="full"
                color="danger"
                isIconOnly
                onPress={() => {
                  setSelectedFile(file);
                  onOpenConfirm();
                }}
              >
                <Delete01Icon size={16} />
              </Button>
            </Tooltip>
            <Tooltip content={msg('download')}>
              <Button
                as={Link}
                variant="light"
                radius="full"
                color="primary"
                isIconOnly
                href={file.filePath}
                target="_blank"
              >
                <CloudDownloadIcon size={16} />
              </Button>
            </Tooltip>
          </div>
        </li>
      )),
    [existingFiles],
  );

  const handleUploadFiles = (files: File[]) => {
    const startIndex = uploadedFile.length;
    const uploadingFiles: FileDto[] = files.map((file, index) => {
      return {
        ...defaultFileDto,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        queueIndex: startIndex + index,
      };
    });

    setUploadedFile((prev) => [...prev, ...uploadingFiles]);
    files.forEach(async (file, index) => {
      const body: FileUploadDto = {
        file: file,
        isPublic: false,
      };
      uploadFile(body).then((response) => {
        setUploadedFile((prev) =>
          prev.map((f) =>
            f.queueIndex === startIndex + index
              ? { ...response, queueIndex: startIndex + index }
              : f,
          ),
        );
      });
    });
  };

  const handleDeleteFile = async () => {
    const response = await deleteFile(selectedFile?.id || 0);
    if (response) {
      setUploadedFile((prev) => prev.filter((f) => f.id !== selectedFile?.id));
      if (selectedFile?.referenceId && selectedFile?.referenceId !== '') {
        refetch && refetch();
      }
    }
    OnOpenConfirmChange();
  };

  const detailDescription = useMemo(() => {
    const base = '';
    return `${base} ${msg('dropzoneLimitDescription', {
      limitFiles: maxFiles ?? 1,
      limitSize: maxSize ?? 10,
    })} ${msg('dropzoneSupportDescription', {
      fileTypes: accept ? Object.keys(accept).join(', ') : '.jpg, .png, .pdf, ...',
    })}`;
  }, [maxFiles, maxSize, msg]);

  return (
    <section className="w-full h-full flex flex-col p-2 gap-6">
      <div
        {...getRootProps({
          className: clsx(
            'w-full border-2 border-dashed rounded-lg cursor-pointer p-8 transition-colors',
            'flex flex-col justify-center items-center gap-3 flex-shrink-0 ',
            isDragActive || isFileDialogActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-default',
          ),
        })}
        ref={dropBoxRef}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon size={48} className="text-default" />
        <p className="font-semibold text-lg">{msg('dropzoneDescription')}</p>
        <p className="text-sm text-default-600">{detailDescription}</p>
      </div>
      <ScrollShadow className="flex-1">
        <ul className="flex flex-col gap-2">{newListFile}</ul>
        <Divider className="my-4" />
        <ul className="flex flex-col gap-2">{listExistingFiles}</ul>
      </ScrollShadow>
      <ConfirmModal
        isOpen={IsOpenConfirm}
        title={msg('delete')}
        confirmColor="danger"
        onOpenChange={OnOpenConfirmChange}
        onConfirm={() => handleDeleteFile()}
        objectName={[`${selectedFile?.fileName}`]}
        loading={isDeleting}
      />
    </section>
  );
});
