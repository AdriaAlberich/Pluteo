import { useMutation } from '@tanstack/react-query';
import { shelfApi } from '../services/api';

export function useShelves() {

  const createShelf = useMutation({
    mutationFn: ({ shelfName }: { shelfName: string }) => shelfApi.createShelf(shelfName)
  });

  const updateShelf = useMutation({
    mutationFn: ({ shelfId, shelfName }: { shelfId: string; shelfName: string }) => shelfApi.updateShelf(shelfId, shelfName)
  });

  const deleteShelf = useMutation({
    mutationFn: ({ shelfId }: { shelfId: string }) => shelfApi.deleteShelf(shelfId)
  });

  const reOrderShelf = useMutation({
    mutationFn: ({ shelfId, order }: { shelfId: string; order: number }) => shelfApi.reOrderShelf(shelfId, order)
  });

  return {
    createShelf: createShelf.mutate,
    createShelfError: createShelf.error,
    updateShelf: updateShelf.mutate,
    updateShelfError: updateShelf.error,
    deleteShelf: deleteShelf.mutate,
    deleteShelfError: deleteShelf.error,
    reOrderShelf: reOrderShelf.mutate,
    reOrderShelfError: reOrderShelf.error,
    isCreateShelfLoading: createShelf.isPending,
    isUpdateShelfLoading: updateShelf.isPending,
    isDeleteShelfLoading: deleteShelf.isPending,
    isReOrderShelfLoading: reOrderShelf.isPending,
  };
}