import { UserClaim } from '@/types/base/UserClaim';
import { RolePermissionDto } from '@/types/sys/Role';
import { create } from 'zustand';

interface AuthState {
  token: string | undefined;
  user: UserClaim | undefined;
  permissions: RolePermissionDto[];
  setToken: (token: string | undefined) => void;
  setUser: (user: UserClaim | undefined) => void;
  setPermissions: (permissions: RolePermissionDto[]) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: undefined,
  user: undefined,
  permissions: [],
  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
  setPermissions: (permissions) => set({ permissions }),
}));
