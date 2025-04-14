import { create } from 'zustand';

interface AppState {
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  setIsAuthenticated: (auth) => set({ isAuthenticated: auth }),
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
}));