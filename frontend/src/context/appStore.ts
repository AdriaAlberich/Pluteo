import { create } from 'zustand';
import i18n from '../i18n';

interface AppState {
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
  userSettings: any;
  setUserSettings: (settings: any) => void;
}

export interface UserSettings {
  notifyByEmail: boolean;
  notifyLoan: string;
  notifyLoanBeforeDays: number;
  notifyLoanBeforeDaysFrequency: number;
  locale: string;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  setIsAuthenticated: (auth) => set({ isAuthenticated: auth }),
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  userSettings: {} as UserSettings,
  setUserSettings: (settings) => {
    set({ userSettings: settings })
    if (settings && settings.locale) {
      i18n.changeLanguage(settings.locale);
    }
  }
}));