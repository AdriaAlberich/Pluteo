import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5299/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pluteo-token');
  if (token !== undefined) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pluteo-token');
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
  changePassword: (data: { currentPassword: string; newPassword: string; newPasswordRepeat: string }) =>
    api.patch('/users/change-password', data),
};

export default api;