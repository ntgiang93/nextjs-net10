import clsx from 'clsx';
import { CloudUploadIcon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';

export type FileAcceptType = 'image' | 'document';

const ACCEPT_MAP: Record<FileAcceptType, string[]> = {
  image: ['image/*'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
  ],
};

const ACCEPT_DESCRIPTION: Record<FileAcceptType, string> = {
  image: '.jpg, .jpeg, .png, .gif, ...',
  document: '.pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt',
};

interface IFileUploadProps {
  accept?: FileAcceptType;
  limitSize?: number; // MB
  limitFiles?: number;
  className?: string;
  label?: string;
  placeholder?: string;
}

export const DropZone = (props: IFileUploadProps) => {
  const { accept, limitSize, limitFiles, className, label, placeholder } = props;
  const msg = useTranslations('msg');
  const [isDragging, setIsDragging] = useState(false);
  const [invalidMsg, setInvalidMsg] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedPatterns = useMemo(() => (accept ? ACCEPT_MAP[accept] : undefined), [accept]);
  const acceptAttribute = useMemo(
    () => (allowedPatterns ? allowedPatterns.join(',') : undefined),
    [allowedPatterns],
  );
  const maxSizeLabel = limitSize ?? 1;
  const maxFilesLabel = limitFiles ?? 1;

  const supportDescription = useMemo(() => {
    if (!accept) return '.jpg, .png, .pdf, ...';
    return ACCEPT_DESCRIPTION[accept];
  }, [accept]);

  const detailDescription = useMemo(() => {
    const base = '';
    return `${base} ${msg('dropzoneLimitDescription', {
      limitFiles: maxFilesLabel,
      limitSize: maxSizeLabel,
    })} ${msg('dropzoneSupportDescription', {
      fileTypes: supportDescription,
    })}`;
  }, [maxFilesLabel, maxSizeLabel, msg, placeholder, supportDescription]);

  const validateType = (file: File) => {
    if (!allowedPatterns || allowedPatterns.length === 0) return true;
    const lowerAccept = allowedPatterns.map((item) => item.trim().toLowerCase());
    const mime = file.type.toLowerCase();
    const extension = file.name.includes('.')
      ? `.${file.name.split('.').pop()?.toLowerCase()}`
      : '';
    if (lowerAccept.includes(mime)) return true;
    if (extension && lowerAccept.includes(extension)) return true;
    const baseType = mime.split('/')[0];
    if (lowerAccept.includes(`${baseType}/*`)) return true;
    return false;
  };

  const processFiles = (files: FileList | null) => {
    setInvalidMsg(undefined);
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const normalizedLimit = limitFiles ?? fileArray.length;

    if (limitFiles && fileArray.length > limitFiles) {
      setInvalidMsg(msg('fileCountExceeded', { limit: limitFiles }));
      return;
    }
    const maxSizeBytes = (limitSize ?? 1) * 1024 * 1024;

    for (let index = 0; index < Math.min(fileArray.length, normalizedLimit); index += 1) {
      const file = fileArray[index];
      if (!validateType(file)) {
        setInvalidMsg(msg('fileTypeUnsupported'));
        return;
      }
      if (file.size > maxSizeBytes) {
        setInvalidMsg(msg('fileTooLarge', { limit: limitSize ?? 1 }));
        return;
      }
    }

    setInvalidMsg(undefined);
    // TODO: handle accepted files (upload, preview, etc.)

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(event.target.files);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    processFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      className={clsx(
        'w-full h-60 border-2 border-dashed rounded-lg flex flex-col justify-center items-center gap-3 cursor-pointer p-4 transition-colors',
        isDragging
          ? 'border-primary-500 bg-primary-50'
          : invalidMsg
            ? 'border-danger bg-danger-50'
            : 'border-default',
        className,
      )}
      aria-label={label ?? 'File upload dropzone'}
    >
      <CloudUploadIcon size={48} className="text-default-600" />
      <div className="text-large font-semibold">{msg('dropzoneDescription')}</div>
      <div className="text-xs text-default-600 whitespace-pre-line text-center">
        {detailDescription}
      </div>
      {invalidMsg && <div className="text-xs text-danger-500">{invalidMsg}</div>}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptAttribute}
        multiple={true}
        aria-label={label ?? 'File Upload'}
        className="hidden"
      />
    </div>
  );
};
