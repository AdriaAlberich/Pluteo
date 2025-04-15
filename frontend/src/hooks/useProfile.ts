import { useQuery, useMutation } from '@tanstack/react-query';
import { userApi } from '../services/api';
import { useAppStore, UserSettings } from '../context/appStore';

export function useProfile() {
  const { isAuthenticated, setUserSettings } = useAppStore();

  const getSettings = useQuery<UserSettings>({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const response = await userApi.getSettings();
      setUserSettings(response.data);
      return response.data;
    },
    enabled: isAuthenticated,
    retry: 1,
    retryDelay: 1000
  });

  const updateSettings = useMutation({
    mutationFn: userApi.updateSettings
  });

  const updateLanguage = useMutation({
    mutationFn: userApi.updateLanguage
  });

  const changePasswordMutation = useMutation({
    mutationFn: userApi.changePassword
  });

  return {
    getSettings: getSettings.data,
    updateSettings: updateSettings.mutate,
    changePassword: changePasswordMutation.mutate,
    updateLanguage: updateLanguage.mutate,
    isChangePasswordLoading: changePasswordMutation.isPending,
    isChangePasswordSuccess: changePasswordMutation.isSuccess,
    isChangePasswordError: changePasswordMutation.isError,
    changePasswordError: changePasswordMutation.error,
    resetPasswordError: changePasswordMutation.reset,
  };
}