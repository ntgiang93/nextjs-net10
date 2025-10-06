import { create } from 'zustand';

interface NavigationState {
  navigating: boolean;
  setNavigating: (navigating: boolean) => void;
}

export const useNavivationStore = create<NavigationState>((set) => ({
  navigating: false,
  setNavigating: (navigating: boolean) => set({ navigating: navigating }),
}));
