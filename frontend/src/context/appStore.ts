import { create } from 'zustand';
import i18n from '../i18n';

// Define the global app state
interface AppState {
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
  notificationsUnreadCount: number;
  setNotificationsUnreadCount: (count: number) => void;
  userSettings: any;
  setUserSettings: (settings: any) => void;
  library: LibraryOverview;
  setLibrary: (library: LibraryOverview) => void;
  selectedShelfBookShelfId: string | undefined;
  setSelectedShelfBookShelfId: (shelfId: string | undefined) => void;
  selectedShelfBookId: string | undefined;
  setSelectedShelfBookId: (bookId: string | undefined) => void;
  selectedShelfBook: ShelfBook | undefined;
  setSelectedShelfBook: (book: ShelfBook | undefined) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  external: boolean;
  setExternal: (external: boolean) => void;
  searchPageNumber: number;
  setSearchPageNumber: (pageNumber: number) => void;
  searchPageSize: number;
  setSearchPageSize: (pageSize: number) => void;
  searchTotalResults: number;
  setSearchTotalResults: (totalResults: number) => void;
  searchTotalPages: number;
  setSearchTotalPages: (totalPages: number) => void;
  searchResults: BookSearchResult | undefined;
  setSearchResults: (results: BookSearchResult | undefined) => void;
  filterTerm: string;
  setFilterTerm: (term: string) => void;
}

// User settings interface
export interface UserSettings {
  notifyByEmail: boolean;
  notifyLoan: string;
  notifyLoanBeforeDays: number;
  notifyLoanBeforeDaysFrequency: number;
  locale: string;
}

// Shelf book preview interface
export interface ShelfBookPreview {
  id: string;
  title: string;
  order: number;
  cover: string;
}

// Book loan interface
export interface Loan {
  library: string;
  loanDate: Date;
  dueDate: Date;
  notify: boolean;
  lastNotificationDate: Date;
}

// Shelf book interface
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
  order: number;
  loan: Loan | null;
}

// Shelf interface
export interface Shelf {
  id: string;
  name: string;
  order: number;
  isDefault: boolean;
  isReadQueue: boolean;
  books: ShelfBookPreview[];
}

// Library overview interface
export interface LibraryOverview {
  shelves: Shelf[];
}

// Book search result item interface
export interface BookSearchResultItem { 
  title: string;
  isbn: string[];
  searchCoverUrl: string;
  authors: string[];
  publishers: string[];
  publishPlaces: string[];
  firstPublishYear: string;
  numPages: number;
  availableLanguages: string[];
}

// Book search result interface
export interface BookSearchResult {
  totalResults: number;
  page: number;
  totalPages: number;
  results: BookSearchResultItem[];
}

// Create the zustand store and initialize the global state
export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  setIsAuthenticated: (auth) => set({ isAuthenticated: auth }),
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  notificationsUnreadCount: 0,
  setNotificationsUnreadCount: (count) => set({ notificationsUnreadCount: count }),
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
  selectedShelfBookShelfId: undefined,
  setSelectedShelfBookShelfId: (shelfId) => set({ selectedShelfBookShelfId: shelfId }),
  selectedShelfBookId: undefined,
  setSelectedShelfBookId: (bookId) => set({ selectedShelfBookId: bookId }),
  selectedShelfBook: undefined,
  setSelectedShelfBook: (book) => set({ selectedShelfBook: book }),
  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),
  external: false,
  setExternal: (external) => set({ external }),
  searchPageNumber: 1,
  setSearchPageNumber: (pageNumber) => set({ searchPageNumber: pageNumber }),
  searchPageSize: 10,
  setSearchPageSize: (pageSize) => set({ searchPageSize: pageSize }),
  searchTotalResults: 0,
  setSearchTotalResults: (totalResults) => set({ searchTotalResults: totalResults }),
  searchTotalPages: 0,
  setSearchTotalPages: (totalPages) => set({ searchTotalPages: totalPages }),
  searchResults: undefined,
  setSearchResults: (results) => set({ searchResults: results }),
  filterTerm: 'all',
  setFilterTerm: (term) => set({ filterTerm: term }),
}));