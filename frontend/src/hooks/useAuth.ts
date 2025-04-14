import { useQuery, useMutation } from '@tanstack/react-query';
import { authApi } from '../services/api';
import { useAppStore } from '../context/appStore';

export function useAuth() {
  const { setIsAuthenticated } = useAppStore();

  const registerMutation = useMutation({
    mutationFn: authApi.register
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      localStorage.setItem('pluteo-token', response.data.accessToken);
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

  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword
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
    loginErrorReset: loginMutation.reset,
    registerErrorReset: registerMutation.reset,
    activateUserErrorReset: activateUserMutation.reset,
    resendActivationEmailErrorReset: resendActivationEmailMutation.reset,
    forgotPasswordErrorReset: forgotPasswordMutation.reset,
    resetPasswordErrorReset: resetPasswordMutation.reset,
    changePasswordErrorReset: changePasswordMutation.reset,
    isLoading: loginMutation.isPending || registerMutation.isPending || activateUserMutation.isPending || resendActivationEmailMutation.isPending || forgotPasswordMutation.isPending || resetPasswordMutation.isPending || changePasswordMutation.isPending,
    isError: loginMutation.isError || registerMutation.isError || activateUserMutation.isError || resendActivationEmailMutation.isError || forgotPasswordMutation.isError || resetPasswordMutation.isError || changePasswordMutation.isError,
    isSuccess: loginMutation.isSuccess || registerMutation.isSuccess || activateUserMutation.isSuccess || resendActivationEmailMutation.isSuccess || forgotPasswordMutation.isSuccess || resetPasswordMutation.isSuccess || changePasswordMutation.isSuccess
  };
}