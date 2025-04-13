import { useQuery, useMutation } from '@tanstack/react-query';
import { authApi } from '../services/api';
import { useAppStore } from '../context/appContext';

export function useAuth() {
  const { setIsAuthenticated } = useAppStore();

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      console.log('User registered:', response.data);
    },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      localStorage.setItem('pluteo-token', response.data.token);
      setIsAuthenticated(true);
    },
  });

  const activateUserMutation = useMutation({
    mutationFn: authApi.activate,
    onSuccess: (response) => {
      console.log('User activated:', response.data);
    }
  });

  const resendActivationEmailMutation = useMutation({
    mutationFn: authApi.resendActivationEmail,
    onSuccess: (response) => {
      console.log('Activation email resent:', response.data);
    }
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (response) => {
      console.log('Password reset email sent:', response.data);
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: (response) => {
      console.log('Password reset successful:', response.data);
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
  });

  const logout = () => {
    localStorage.removeItem('pluteo-token');
    setIsAuthenticated(false);
  };

  return {
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    activateUser: activateUserMutation.mutate,
    resendActivationEmail: resendActivationEmailMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    logout,
    isLoading: loginMutation.isPending || registerMutation.isPending || activateUserMutation.isPending || resendActivationEmailMutation.isPending || forgotPasswordMutation.isPending || resetPasswordMutation.isPending || changePasswordMutation.isPending,
    isError: loginMutation.isError || registerMutation.isError || activateUserMutation.isError || resendActivationEmailMutation.isError || forgotPasswordMutation.isError || resetPasswordMutation.isError || changePasswordMutation.isError,
    isSuccess: loginMutation.isSuccess || registerMutation.isSuccess || activateUserMutation.isSuccess || resendActivationEmailMutation.isSuccess || forgotPasswordMutation.isSuccess || resetPasswordMutation.isSuccess || changePasswordMutation.isSuccess,
    error: loginMutation.error || registerMutation.error || activateUserMutation.error || resendActivationEmailMutation.error || forgotPasswordMutation.error || resetPasswordMutation.error || changePasswordMutation.error,
  };
}