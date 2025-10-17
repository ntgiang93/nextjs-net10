export interface FileUploadDto {
  referenceId?: string;
  referenceType?: string;
  isPublic?: boolean;
  file: File;
}

export interface FileDto {
  id: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  referenceId?: string | null;
  referenceType?: string | null;
  container?: string | null;
  isPublic: boolean;
  uploadedByName: string;
  createdAt: string; // ISO 8601 date string
  queueIndex: number;
}

export const defaultFileDto: FileDto = {
  id: 0,
  fileName: '',
  fileSize: 0,
  mimeType: '',
  filePath: '',
  referenceId: null,
  referenceType: null,
  container: null,
  isPublic: false,
  uploadedByName: '',
  createdAt: new Date().toISOString(),
  queueIndex: 0,
};
