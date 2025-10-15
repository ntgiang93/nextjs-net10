import { useAuthStore } from '@/store/auth-store';
import { ApiResponse } from '@/types/base/ApiResponse';
import { addToast } from '@heroui/react';
import { forbidden } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const handleBody = (data: any): any => {
  if (data instanceof FormData) {
    // If data is FormData, return it as is
    return data;
  } else return JSON.stringify(data);
};

const handleNotice = (data: any, isJson?: boolean, method?: string) => {
  // Check if response is ApiResponse format
  const isApiResponse =
    isJson &&
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    'statusCode' in data &&
    'message' in data;

  if (isApiResponse) {
    if (data.success) {
      // For mutations, always show notifications
      if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        addToast({
          description: data.message,
          color: 'success',
        });
      }
    } else {
      // Error, always show notifications eeror
      addToast({
        description: data.message,
        color: 'danger',
      });
    }
  }
};

const getTokenWithPending = async (maxRetries = 2, delay = 300): Promise<string> => {
  return new Promise((resolve) => {
    let retryCount = 0;

    const attemptGetToken = () => {
      const token = useAuthStore.getState().token;

      // Check if we have a valid token
      if (token && token.length > 0 && token !== 'null') {
        resolve(token);
        return;
      }
      // If we've reached max retries, fail
      if (retryCount >= maxRetries) {
        console.warn('Failed to get valid token after multiple attempts');
        resolve(''); // Resolve with empty string instead of failing
        return;
      }
      // Retry after delay
      retryCount++;
      setTimeout(attemptGetToken, delay);
    };

    // Start the token retrieval process
    attemptGetToken();
  });
};

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  notiOff?: boolean,
  isPublic?: boolean,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  let headers: HeadersInit = { ...options.headers };
  if (!isPublic) {
    const token = await getTokenWithPending();
    headers = {
      Authorization: `Bearer ${token}`,
      ...headers,
    };
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers = {
      'Content-Type': 'application/json',
      ...headers,
    };
    options.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for auth
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    // Handle errors based on response status
    if (!response.ok) {
      // Redirect to appropriate error pages based on status code
      if (response.status === 403) {
        forbidden();
      }

      if (response.status === 401) {
        window.location.href = '/login';
      }

      const errorMessage = isJson ? data.message || 'Something went wrong' : 'Something went wrong';
      throw new ApiError(errorMessage, response.status);
    }
    if (notiOff !== true) {
      handleNotice(data, isJson, options.method);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      addToast({
        title: error.status,
        description: error.message,
        color: 'danger',
      });

      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Network error occurred', 0);
  }
}

// Hàm tiện ích cho các phương thức HTTP phổ biến
export const apiService = {
  get: <T = ApiResponse<any>>(
    endpoint: string,
    options?: RequestInit,
    notiOff?: boolean,
    isPublic?: boolean,
  ) => fetchApi<T>(endpoint, { ...options, method: 'GET' }, notiOff, isPublic),

  post: <T = ApiResponse<any>>(
    endpoint: string,
    data?: any,
    options?: RequestInit,
    notiOff?: boolean,
    isPublic?: boolean,
  ) =>
    fetchApi<T>(
      endpoint,
      {
        ...options,
        method: 'POST',
        body: data,
      },
      notiOff,
      isPublic,
    ),

  put: <T = ApiResponse<any>>(
    endpoint: string,
    data?: any,
    options?: RequestInit,
    notiOff?: boolean,
    isPublic?: boolean,
  ) =>
    fetchApi<T>(
      endpoint,
      {
        ...options,
        method: 'PUT',
        body: data,
      },
      notiOff,
      isPublic,
    ),

  patch: <T = ApiResponse<any>>(
    endpoint: string,
    data?: any,
    options?: RequestInit,
    notiOff?: boolean,
    isPublic?: boolean,
  ) =>
    fetchApi<T>(
      endpoint,
      {
        ...options,
        method: 'PATCH',
        body: data,
      },
      notiOff,
      isPublic,
    ),

  delete: <T>(endpoint: string, options?: RequestInit, notiOff?: boolean, isPublic?: boolean) =>
    fetchApi<T>(endpoint, { ...options, method: 'DELETE' }, notiOff, isPublic),
};
