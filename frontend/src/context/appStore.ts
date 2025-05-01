import { create } from 'zustand';
import i18n from '../i18n';

interface AppState {
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
  userSettings: any;
  setUserSettings: (settings: any) => void;
  library: LibraryOverview;
  setLibrary: (library: LibraryOverview) => void;
}

export interface UserSettings {
  notifyByEmail: boolean;
  notifyLoan: string;
  notifyLoanBeforeDays: number;
  notifyLoanBeforeDaysFrequency: number;
  locale: string;
}

export interface ShelfBookPreview {
  id: string;
  title: string;
  order: number;
  cover: string;
}

export interface ShelfBook {
  id: string;
  title: string;
  isbn: string;
  cover: string;
  authors: string;
  publisher: string;
  publishPlace: string;
  firstPublishYear: string;
  numPages: string;
  availableLanguages: string;
  notes: string;
  physicalLocation: string;
  status: string;
}

export interface Shelf {
  id: string;
  name: string;
  order: number;
  isDefault: boolean;
  isReadQueue: boolean;
  books: ShelfBookPreview[];
}

export interface LibraryOverview {
  shelves: Shelf[];
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
  },
  library: {
    shelves: [],
  } as LibraryOverview,
  setLibrary: (library) => set({ library }),
}));