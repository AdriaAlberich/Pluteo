import { useQuery, useMutation } from '@tanstack/react-query';
import { userApi } from '../services/api';
import { useAppStore, UserSettings } from '../context/appStore';
import { useTranslation } from 'react-i18next';

export function useProfile() {
  const { isAuthenticated, setUserSettings } = useAppStore();
  const { i18n } = useTranslation();

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
    isLoading: getSettings.isLoading || updateSettings.isPending || changePasswordMutation.isPending || updateLanguage.isPending,
    isError: getSettings.isError || updateSettings.isError || changePasswordMutation.isError || updateLanguage.isError,
    error: getSettings.error || updateSettings.error || changePasswordMutation.error || updateLanguage.error,
  };
}