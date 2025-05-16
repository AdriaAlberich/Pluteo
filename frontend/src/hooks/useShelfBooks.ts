import { useQuery, useMutation } from '@tanstack/react-query';
import { shelfBookApi } from '../services/api';
import { ShelfBook, useAppStore } from '../context/appStore';

export function useShelfBooks() {

  // Global state to manage the shelf book queries and mutations
  const { 
    selectedShelfBookShelfId, 
    selectedShelfBookId, 
    setSelectedShelfBook 
  } = useAppStore();

  // Query to get the book details
  const getShelfBookDetails = useQuery<ShelfBook>({
    queryKey: ['shelfBookDetails', { selectedShelfBookShelfId, selectedShelfBookId }],
    queryFn: async () => {
      const response = await shelfBookApi.getShelfBookDetails(selectedShelfBookShelfId, selectedShelfBookId);
      setSelectedShelfBook(response.data);
      return response.data;
    },
    enabled: false,
    retry: 1,
    retryDelay: 10000,
  });

  // Mutation to update the book details
  const updateShelfBook = useMutation({
    mutationFn: ({ shelfId, shelfBookId, shelfBook }: { shelfId: string; shelfBookId: string; shelfBook: Partial<ShelfBook> }) => shelfBookApi.updateShelfBook(shelfId, shelfBookId, shelfBook)
  });

  // Mutation to delete a book
  const deleteShelfBook = useMutation({
    mutationFn: ({ shelfId, shelfBookId }: { shelfId: string; shelfBookId: string }) => shelfBookApi.deleteShelfBook(shelfId, shelfBookId)
  });

  // Mutation to reorder a book in the shelf
  const reOrderShelfBook = useMutation({
    mutationFn: ({ shelfId, shelfBookId, order }: { shelfId: string; shelfBookId: string; order: number }) => shelfBookApi.reOrderShelfBook(shelfId, shelfBookId, order)
  });

  // Mutation to move a book to another shelf
  const moveShelfBook = useMutation({
    mutationFn: ({ shelfId, shelfBookId, destinationShelfId }: { shelfId: string; shelfBookId: string; destinationShelfId: string }) => shelfBookApi.moveShelfBook(shelfId, shelfBookId, destinationShelfId)
  });

  // Mutation to activate a book loan
  const activateShelfBookLoan = useMutation({
    mutationFn: ({ shelfId, shelfBookId, data }: { shelfId: string; shelfBookId: string; data: { library: string; dueDate: Date; notify: boolean } }) => shelfBookApi.activateShelfBookLoan(shelfId, shelfBookId, data)
  });

  // Mutation to deactivate a book loan
  const deactivateShelfBookLoan = useMutation({
    mutationFn: ({ shelfId, shelfBookId }: { shelfId: string; shelfBookId: string }) => shelfBookApi.deactivateShelfBookLoan(shelfId, shelfBookId)
  });

  return {
    getShelfBookDetails: getShelfBookDetails.data,
    getShelfBookDetailsRefetch: getShelfBookDetails.refetch,
    getShelfBookDetailsError: getShelfBookDetails.error,
    updateShelfBook: updateShelfBook.mutate,
    updateShelfBookError: updateShelfBook.error,
    deleteShelfBook: deleteShelfBook.mutate,
    deleteShelfBookError: deleteShelfBook.error,
    reOrderShelfBook: reOrderShelfBook.mutate,
    reOrderShelfBookError: reOrderShelfBook.error,
    moveShelfBook: moveShelfBook.mutate,
    moveShelfBookError: moveShelfBook.error,
    activateShelfBookLoan: activateShelfBookLoan.mutate,
    activateShelfBookLoanError: activateShelfBookLoan.error,
    deactivateShelfBookLoan: deactivateShelfBookLoan.mutate,
    deactivateShelfBookLoanError: deactivateShelfBookLoan.error,
    isGetDetailsLoading: getShelfBookDetails.isLoading,
    isUpdateLoading: updateShelfBook.isPending,
    isDeleteLoading: deleteShelfBook.isPending,
    isReOrderLoading: reOrderShelfBook.isPending,
    isMoveLoading: moveShelfBook.isPending,
    isActivateLoanLoading: activateShelfBookLoan.isPending,
    isDeactivateLoanLoading: deactivateShelfBookLoan.isPending
  };
}