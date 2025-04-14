import { create } from 'zustand';

interface AppState {
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  setIsAuthenticated: (auth) => set({ isAuthenticated: auth }),
}));