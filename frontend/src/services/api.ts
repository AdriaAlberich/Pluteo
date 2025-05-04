import axios from 'axios';
import { ShelfBook, UserSettings } from '../context/appStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5299/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  const notIncludeEndpoints = [
    '/users/login',
    '/users/register',
    '/users/activate',
    '/users/resend-activation',
    '/users/lost-password',
    '/users/reset-password',
  ];

  if (notIncludeEndpoints.some((endpoint) => config.url?.includes(endpoint))) {
    return config;
  }

  if (token !== undefined) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// User authentication related endpoints
export const authApi = {
  register: (data: { email: string; password: string; passwordRepeat: string; }) =>
    api.post('/users', data),
  login: (credentials: { email: string; password: string }) =>
    api.post('/users/login', credentials),
  activate: (token: string) =>
    api.patch(`/users/activate?token=${encodeURIComponent(token)}`),
  resendActivationEmail: (email: string) =>
    api.patch(`/users/resend-activation?email=${encodeURIComponent(email)}`),
  forgotPassword: (email: string) =>
    api.patch(`/users/lost-password?email=${encodeURIComponent(email)}`),
  resetPassword: (data: { token: string; newPassword: string; newPasswordRepeat: string }) =>
    api.patch(`/users/reset-password?token=${encodeURIComponent(data.token)}`, { 
      newPassword: data.newPassword, 
      newPasswordRepeat: data.newPasswordRepeat 
    }),
};

// User profile related endpoints
export const userApi = {
  getSettings: () =>
    api.get<UserSettings>('/users/settings'),
  updateSettings: (data: Partial<UserSettings>) =>
    api.patch('/users/settings', data),
  updateLanguage: (data: { locale: string }) =>
    api.patch('/users/settings', data),
  changePassword: (data: { currentPassword: string; newPassword: string; newPasswordRepeat: string }) =>
    api.patch('/users/change-password', data),
};

// Notification related endpoints
export const notificationsApi = {
  getNotifications: () =>
    api.get('/notifications'),
  markAsRead: (notificationId: string) =>
    api.patch(`/notifications/${notificationId}`),
  deleteOne: (notificationId: string) =>
    api.delete(`/notifications/${notificationId}`),
  clearAll: () =>
    api.delete('/notifications'),
};

// Library related endpoints
export const libraryApi = {
  getLibrary: (filterTerm: string) => {
    const query = filterTerm ? `?filter=${encodeURIComponent(filterTerm)}` : '';
    return api.get(`/library${query}`);
  },
  searchBooks: (searchTerm: string, pageNumber: number, pageSize: number, external: boolean) =>
    api.get(`/library/search/${encodeURIComponent(searchTerm)}/${pageNumber}/${pageSize}/${external}`),
  addBook: (isbn: string, shelfId: string | undefined) =>
    api.post('/library/add', { isbn, shelfId }),
  addBookManually: (shelfBook: Partial<ShelfBook>, shelfId: string | undefined) =>
    api.post('/library/add-manually',{ book: shelfBook, shelfId }),
};

// Shelf related endpoints
export const shelfApi = {
  createShelf: (shelfName: string) =>
    api.post('/shelves', { name: shelfName }),
  updateShelf: (shelfId: string, shelfName: string) =>
    api.patch(`/shelves/${shelfId}`, { name: shelfName }),
  deleteShelf: (shelfId: string) =>
    api.delete(`/shelves/${shelfId}`),
  reOrderShelf: (shelfId: string, order: number) =>
    api.patch(`/shelves/${shelfId}/new-order`, { order }),
};

// Shelfbook related endpoints
export const shelfBookApi = {
  getShelfBookDetails: (shelfId: string | undefined, shelfBookId: string | undefined) =>
    api.get(`/shelfbooks/${shelfId}/${shelfBookId}`),
  updateShelfBook: (shelfId: string, shelfBookId: string, data: Partial<ShelfBook>) =>
    api.patch(`/shelfbooks/${shelfId}/${shelfBookId}`, data),
  deleteShelfBook: (shelfId: string, shelfBookId: string) =>
    api.delete(`/shelfbooks/${shelfId}/${shelfBookId}`),
  reOrderShelfBook: (shelfId: string, shelfBookId: string, order: number) =>
    api.patch(`/shelfbooks/${shelfId}/${shelfBookId}/new-order`, { order }),
  moveShelfBook: (shelfId: string, shelfBookId: string, destinationShelfId: string) =>
    api.patch(`/shelfbooks/${shelfId}/${shelfBookId}/move/${destinationShelfId}`),
  activateShelfBookLoan: (shelfId: string, shelfBookId: string, data: { library: string, dueDate: Date, notify: boolean }) =>
    api.post(`/shelfbooks/${shelfId}/${shelfBookId}/activate-loan`, data),
  deactivateShelfBookLoan: (shelfId: string, shelfBookId: string) =>
    api.delete(`/shelfbooks/${shelfId}/${shelfBookId}/deactivate-loan`),
  isShelfBookLoanActive: (shelfId: string, shelfBookId: string) =>
    api.get(`/shelfbooks/${shelfId}/${shelfBookId}/is-loan-active`),
};

export default api;