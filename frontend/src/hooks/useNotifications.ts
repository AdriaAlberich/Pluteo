import { useQuery, useMutation } from '@tanstack/react-query';
import { notificationsApi } from '../services/api';

export function useNotifications() {

  const getNotifications = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getNotifications,
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