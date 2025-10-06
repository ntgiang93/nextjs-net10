import { UserClaim } from '@/types/base/UserClaim';
import { create } from 'zustand';

interface AuthState {
  token: string | undefined;
  user: UserClaim | undefined;
  permissions: string[];
  setToken: (token: string | undefined) => void;
  setUser: (user: UserClaim | undefined) => void;
  setPermissions: (permissions: string[]) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: undefined,
  user: undefined,
  permissions: [],
  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
  setPermissions: (permissions) => set({ permissions }),
}));
