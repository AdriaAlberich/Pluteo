import { create } from 'zustand';
import { AppState } from '../types/applicationState';
import { createAuthSlice } from './slices/authSlice';

export const useAppStore = create<AppState>((...args) => ({
  ...createAuthSlice(...args)
}));