export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T | null;
  errorCode?: string | null;
};

export const defaultApiResponse: ApiResponse<any> = {
  success: false,
  statusCode: 0,
  message: '',
  data: null,
  errorCode: null,
};
