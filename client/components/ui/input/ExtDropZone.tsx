import { FileHook } from '@/hooks/file';
import { useAuthStore } from '@/store/auth-store';
import { defaultFileDto, FileDto, FileUploadDto } from '@/types/sys/File';
import { Button, Link, Progress, Tooltip, useDisclosure } from '@heroui/react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import {
  CheckmarkCircle03Icon,
  CloudDownloadIcon,
  CloudUploadIcon,
  Delete01Icon,
} from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Accept, useDropzone } from 'react-dropzone';
import { ConfirmModal } from '../overlay/ConfirmModal';

interface IExtDropzoneProps {
  maxSize: number;
  maxFiles: number;
  // Chỉ cho ảnh: { 'image/*': [] }
  // Chỉ PDF và Word: { 'application/pdf': [], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }
  // Theo đuôi file: { 'text/plain': ['.txt'], 'application/vnd.ms-excel': ['.xls', '.xlsx'] }
  // Hoặc kết hợp: { 'image/*': [], 'application/pdf': [], 'text/plain': ['.txt'] }
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input
  accept?: Accept;
  existingFiles?: FileDto[];
  // Id của bản ghi được tham chiếu đến file này
  referenceId?: string;
  // Loại bản ghi được tham chiếu đến file này. Ví dụ: 'user', 'post', ...
  referenceType?: string;
}

export const ExtDropzone = (props: IExtDropzoneProps) => {
  const { maxSize, maxFiles, accept, existingFiles, referenceId, referenceType } = props;
  const { mutateAsync: uploadFile, isPending } = FileHook.useUpload();
  const { mutateAsync: deleteFile, isPending: isDeleting } = FileHook.useDelete();
  const [selectedFile, setSelectedFile] = useState<FileDto | undefined>(undefined);
  const [uploadedFile, setUploadedFile] = useState<FileDto[]>([]);
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

  const newListFile = useMemo(() => {
    return uploadedFile.map((file, index) => {
      const uploaded = file.id > 0;
      return (
        <li className="w-full flex flex-col  border border-default  p-2 rounded-lg" key={index}>
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
                <CheckmarkCircle03Icon size={20} />
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
        <li className="w-full flex border border-default gap-4 p-4 rounded" key={index}>
          <div className="w-full flex flex-col">
            <p>
              <span className="font-semibold mr-2">{file.fileName}</span>
              <span className="text-default-600"> {Math.ceil(file.fileSize / 1024)} KB</span>
            </p>
          </div>
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
          <Button
            as={Link}
            variant="light"
            radius="full"
            color="primary"
            isIconOnly
            href="https://github.com/heroui-inc/heroui"
            target="_blank"
          >
            <CloudDownloadIcon size={16} />
          </Button>
        </li>
      )),
    [existingFiles],
  );

  const handleUploadFiles = (files: File[]) => {
    const uploadingFiles: FileDto[] = files.map((file, index) => {
      return {
        ...defaultFileDto,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        queueIndex: index,
      };
    });
    setUploadedFile((prev) => [...prev, ...uploadingFiles]);
    files.forEach(async (file, index) => {
      const body: FileUploadDto = {
        file: file,
        referenceId: referenceId || '',
        referenceType: referenceType || '',
        isPublic: false,
      };
      uploadFile(body).then((response) => {
        setUploadedFile((prev) =>
          prev.map((f) => (f.queueIndex === index ? { ...response, queueIndex: index } : f)),
        );
      });
    });
  };

  const handleDeleteFile = async () => {
    await deleteFile(selectedFile?.id || 0);
    setUploadedFile((prev) => prev.filter((f) => f.id !== selectedFile?.id));
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
    <section className="w-full flex flex-col p-2 gap-6">
      <div
        {...getRootProps({
          className: clsx(
            'w-full h-56 border-2 border-dashed rounded-lg flex flex-col justify-center items-center gap-3 cursor-pointer p-4 transition-colors',
            isDragActive || isFileDialogActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-default',
          ),
        })}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon size={48} className="text-default" />
        <p className="font-semibold text-lg">{msg('dropzoneDescription')}</p>
        <p className="text-sm text-default-600">{detailDescription}</p>
      </div>
      <aside>
        <ul className="flex flex-col gap-2">{newListFile}</ul>
      </aside>
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
};
