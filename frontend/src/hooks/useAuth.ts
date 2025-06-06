import { useMutation } from '@tanstack/react-query';
import { authApi } from '../services/api';
import { useAppStore } from '../context/appStore';

export function useAuth() {

  // State to manage user authentication and settings
  const { setIsAuthenticated, setUserSettings, setNotifications } = useAppStore();

  // Mutations for the authentication
  const registerMutation = useMutation({
    mutationFn: authApi.register
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      localStorage.setItem('token', response.data.accessToken);
      setIsAuthenticated(true);
    },
  });

  const activateUserMutation = useMutation({
    mutationFn: authApi.activate
  });

  const resendActivationEmailMutation = useMutation({
    mutationFn: authApi.resendActivationEmail
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword
  });

  const resetPasswordMutation = useMutation({
    mutationFn: authApi.resetPassword
  });

  // We use JWT tokens so the only way to log out is clearing the token locally
  const logout = () => {
    setIsAuthenticated(false);
    setUserSettings(null);
    setNotifications([]);
    localStorage.removeItem('token');
  };

  // Return the authentication functions and states
  return {
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    activateUser: activateUserMutation.mutate,
    resendActivationEmail: resendActivationEmailMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    logout,
    loginErrorReset: loginMutation.reset,
    registerErrorReset: registerMutation.reset,
    activateUserErrorReset: activateUserMutation.reset,
    resendActivationEmailErrorReset: resendActivationEmailMutation.reset,
    forgotPasswordErrorReset: forgotPasswordMutation.reset,
    resetPasswordErrorReset: resetPasswordMutation.reset,
    isLoading: loginMutation.isPending || registerMutation.isPending || activateUserMutation.isPending || resendActivationEmailMutation.isPending || forgotPasswordMutation.isPending || resetPasswordMutation.isPending,
    isError: loginMutation.isError || registerMutation.isError || activateUserMutation.isError || resendActivationEmailMutation.isError || forgotPasswordMutation.isError || resetPasswordMutation.isError,
    isSuccess: loginMutation.isSuccess || registerMutation.isSuccess || activateUserMutation.isSuccess || resendActivationEmailMutation.isSuccess || forgotPasswordMutation.isSuccess || resetPasswordMutation.isSuccess,
  };
}