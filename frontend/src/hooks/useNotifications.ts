import { useQuery, useMutation } from '@tanstack/react-query';
import { notificationsApi } from '../services/api';
import { useAppStore } from '../context/appStore';

export function useNotifications() {
  const { isAuthenticated, setNotifications } = useAppStore();

  const getNotifications = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await notificationsApi.getNotifications();
      setNotifications(response.data);
      return response.data;
    },
    enabled: isAuthenticated,
    retry: 1,
    retryDelay: 1000,
    refetchInterval: 30000,
    refetchOnWindowFocus: true
  });

  const markAsRead = useMutation({
    mutationFn: notificationsApi.markAsRead
  });

  const deleteOne = useMutation({
    mutationFn: notificationsApi.deleteOne
  });

  const clearAll = useMutation({
    mutationFn: notificationsApi.clearAll
  });

  return {
    getNotifications: getNotifications.data,
    markAsRead: markAsRead.mutate,
    deleteOne: deleteOne.mutate,
    clearAll: clearAll.mutate,
    isLoading: getNotifications.isLoading || markAsRead.isPending || deleteOne.isPending || clearAll.isPending,
    isError: getNotifications.isError || markAsRead.isError || deleteOne.isError || clearAll.isError,
    error: getNotifications.error || markAsRead.error || deleteOne.error || clearAll.error,
  };
}