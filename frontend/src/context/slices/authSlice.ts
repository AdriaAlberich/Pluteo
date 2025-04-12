import { StateCreator } from 'zustand';
import { AppState } from '../../types/applicationState';

export const createAuthSlice: StateCreator<AppState, [], []> = (set) => ({
  isAuthenticated: false,
  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
});