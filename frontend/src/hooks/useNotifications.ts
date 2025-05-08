import { useQuery, useMutation } from '@tanstack/react-query';
import { notificationsApi } from '../services/api';
import { useAppStore } from '../context/appStore';

export function useNotifications() {

  // Global state to manage the notifications queries and mutations
  const { 
    isAuthenticated, 
    setNotifications, 
    setNotificationsUnreadCount 
  } = useAppStore();

  // Query to get notifications (this query is fetched every 30 seconds)
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

  // Mutations for manageing notifications
  const markAsRead = useMutation({
    mutationFn: notificationsApi.markAsRead
  });

  const deleteOne = useMutation({
    mutationFn: notificationsApi.deleteOne
  });

  const clearAll = useMutation({
    mutationFn: notificationsApi.clearAll,
    onSuccess: () => {
      setNotifications([]);
      setNotificationsUnreadCount(0);
    }
  });

  return {
    getNotifications: getNotifications.data,
    getNotificationsRefetch: getNotifications.refetch,
    markAsRead: markAsRead.mutate,
    deleteOne: deleteOne.mutate,
    clearAll: clearAll.mutate,
    isLoading: getNotifications.isLoading || markAsRead.isPending || deleteOne.isPending || clearAll.isPending,
    isError: getNotifications.isError || markAsRead.isError || deleteOne.isError || clearAll.isError,
    error: getNotifications.error || markAsRead.error || deleteOne.error || clearAll.error,
  };
}