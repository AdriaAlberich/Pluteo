import { useQuery, useMutation } from '@tanstack/react-query';
import { userApi } from '../services/api';

export function useProfile() {

  const getSettings = useQuery({
    queryKey: ['settings'],
    queryFn: userApi.getSettings,
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