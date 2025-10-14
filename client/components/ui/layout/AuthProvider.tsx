'use client';
import { JwtHelper } from '@/libs/JwtHelper';
import { apiService } from '@/services/api';
import { useAuthStore } from '@/store/auth-store';
import { useNavivationStore } from '@/store/navigation-store';
import { ApiResponse, defaultApiResponse } from '@/types/base/ApiResponse';
import { defaultUserClaim, mapJwtClaimToUserClaim } from '@/types/base/UserClaim';
import { LoginDto, TokenDto } from '@/types/sys/Auth';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { useStore } from 'zustand';
import { clearSessionFlag, getDeviceId, hasActiveSession, markSessionActive } from './AuthHelper';
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (body: LoginDto) => Promise<ApiResponse<TokenDto>>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  navigate: (url: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ ...defaultApiResponse }),
  logout: async () => {},
  refreshToken: async () => {},
  navigate: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tokenExpireTime, setExpiredAt] = useState<number | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  const { token, setToken, setUser } = useStore(useAuthStore, (state) => state);
  const router = useRouter();
  const { setNavigating } = useNavivationStore();
  const pathName = usePathname();
  const { permissions } = useAuthStore();

  const resetAuthContext = () => {
    clearSessionFlag();
    setToken(undefined);
    setExpiredAt(undefined);
    setIsAuthenticated(false);
    setUser(defaultUserClaim);
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      setRefreshTimer(null);
    }
  };

  const endpoint = 'auth/';

  const login = async (body: LoginDto): Promise<ApiResponse<TokenDto>> => {
    try {
      setIsLoading(true);
      const response = await apiService.post<ApiResponse<TokenDto>>(endpoint + 'login', {
        ...body,
        deviceId: await getDeviceId(),
      });

      if (response.success && response.data) {
        const accessToken = response.data.accessToken;
        if (accessToken) {
          const jwtClaim = JwtHelper.decodeToken(accessToken);
          if (jwtClaim) {
            setExpiredAt(jwtClaim?.exp);
            setToken(accessToken);
            setUser(mapJwtClaimToUserClaim(jwtClaim));
            setIsAuthenticated(true);
            markSessionActive(jwtClaim);
          }
          router.push('/');
          setIsLoading(false);
          return response;
        }
      }
      setIsLoading(false);
      return response;
    } catch (error: any) {
      console.log('Login error:', error);
    }
    setIsLoading(false);
    return { ...defaultApiResponse };
  };

  // Logout function
  const logout = async () => {
    try {
      apiService.post<ApiResponse<TokenDto>>(endpoint + 'logout', undefined, undefined, true);
    } catch (error: any) {
      console.log('Logout error:', error);
    }
    resetAuthContext();
    router.push('/login');
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const response = await apiService.post<ApiResponse<TokenDto>>(
        endpoint + 'refresh',
        undefined,
        undefined,
        true,
      );

      if (response.success && response.data) {
        const accessToken = response.data.accessToken;
        if (accessToken) {
          const jwtClaim = JwtHelper.decodeToken(accessToken);
          if (jwtClaim) {
            setToken(accessToken);
            setExpiredAt(jwtClaim?.exp);
            setUser(mapJwtClaimToUserClaim(jwtClaim));
            setIsAuthenticated(true);
            markSessionActive(jwtClaim);
            return;
          }
        }
      }
    } catch (error: any) {
      console.log('Refresh token error:', error);
    }
    resetAuthContext();
  };

  const navigate = (url: string) => {
    setNavigating(true);
    router.push(url);
  };

  /**
   * Checks if the current user has the specified permission within a system module.
   *
   * @param permission - The permission to check for
   * @param sysModule - The system module identifier where the permission applies (e.g., "Users", "Products"). Always use camel case. Get list from ESysModule
   * @returns True if the user has the specified permission, false otherwise
   *
   * @example
   * // Check if the user can edit in the "users" module
   * if (hasPermission(EPermission.EDIT, "Users")) {
   *   // User has edit permission for the users module
   * }
   */

  // Kiểm tra session khi component mount
  useLayoutEffect(() => {
    const checkSession = async () => {
      if (hasActiveSession()) {
        await refreshToken();
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    };

    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect để quản lý refresh token tự động
  useEffect(() => {
    // Kiểm tra nếu có token và thời gian hết hạn
    if (token && tokenExpireTime) {
      // Tính thời gian hết hạn trong milliseconds
      const expireTime = tokenExpireTime * 1000;
      const currentTime = Date.now();

      // Tính thời gian còn lại (ms)
      const timeRemaining = expireTime - currentTime;
      const refreshBuffer = 60 * 1000; // Refresh trước 1 phút

      // Tính thời gian cần refresh token (sớm hơn thời gian hết hạn)
      const timeUntilRefresh = Math.max(0, timeRemaining - refreshBuffer);

      // Clear timer cũ nếu có
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      // Tạo timer mới cho refresh token
      const timer = setTimeout(async () => {
        // Chỉ refresh nếu còn token hợp lệ
        if (token && Date.now() < expireTime) {
          await refreshToken();
        }
      }, timeUntilRefresh);

      setRefreshTimer(timer);
      // Cleanup function
      return () => {
        if (timer) clearTimeout(timer);
      };
    } else {
      setIsAuthenticated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, tokenExpireTime]);

  useEffect(() => {
    setNavigating(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathName]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshToken,
        navigate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
