import { useQuery, useMutation } from '@tanstack/react-query';
import { userApi } from '../services/api';
import { useAppStore, UserSettings } from '../context/appStore';

export function useProfile() {
  // Global state to manage the profile queries and mutations
  const { isAuthenticated, setUserSettings } = useAppStore();

  // Query to get user settings
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

  // Mutation to update user settings
  const updateSettings = useMutation({
    mutationFn: userApi.updateSettings
  });

  // Mutation to update user language
  const updateLanguage = useMutation({
    mutationFn: userApi.updateLanguage
  });

  // Mutation to change user password
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