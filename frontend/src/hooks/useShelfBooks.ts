import { useQuery, useMutation } from '@tanstack/react-query';
import { shelfBookApi } from '../services/api';
import { ShelfBook } from '../context/appStore';

export function useShelfBooks() {

  const getShelfBookDetails = useQuery({
    queryKey: ['shelfBookDetails', { shelfId: '', shelfBookId: '' }],
    queryFn: async ({ queryKey }) => {
      const { shelfId, shelfBookId } = queryKey[1] as { shelfId: string, shelfBookId: string };
      const response = await shelfBookApi.getShelfBookDetails(shelfId, shelfBookId);
      return response.data;
    },
    enabled: false,
    retry: 1,
    retryDelay: 10000,
  });

  const updateShelfBook = useMutation({
    mutationFn: ({ shelfId, shelfBookId, shelfBook }: { shelfId: string; shelfBookId: string; shelfBook: Partial<ShelfBook> }) => shelfBookApi.updateShelfBook(shelfId, shelfBookId, shelfBook)
  });

  const deleteShelfBook = useMutation({
    mutationFn: ({ shelfId, shelfBookId }: { shelfId: string; shelfBookId: string }) => shelfBookApi.deleteShelfBook(shelfId, shelfBookId)
  });

  const reOrderShelfBook = useMutation({
    mutationFn: ({ shelfId, shelfBookId, order }: { shelfId: string; shelfBookId: string; order: number }) => shelfBookApi.reOrderShelfBook(shelfId, shelfBookId, order)
  });

  const moveShelfBook = useMutation({
    mutationFn: ({ shelfId, shelfBookId, destinationShelfId }: { shelfId: string; shelfBookId: string; destinationShelfId: string }) => shelfBookApi.moveShelfBook(shelfId, shelfBookId, destinationShelfId)
  });

  const activateShelfBookLoan = useMutation({
    mutationFn: ({ shelfId, shelfBookId, data }: { shelfId: string; shelfBookId: string; data: { library: string; dueDate: Date; notify: boolean } }) => shelfBookApi.activateShelfBookLoan(shelfId, shelfBookId, data)
  });

  const deactivateShelfBookLoan = useMutation({
    mutationFn: ({ shelfId, shelfBookId }: { shelfId: string; shelfBookId: string }) => shelfBookApi.deactivateShelfBookLoan(shelfId, shelfBookId)
  });

  const isShelfBookLoanActive = useQuery({
    queryKey: ['isShelfBookLoanActive', { shelfId: '', shelfBookId: '' }],
    queryFn: async ({ queryKey }) => {
      const { shelfId, shelfBookId } = queryKey[1] as { shelfId: string; shelfBookId: string };
      const response = await shelfBookApi.isShelfBookLoanActive(shelfId, shelfBookId);
      return response.data;
    },
    enabled: false,
    retry: 1,
    retryDelay: 10000,
  });

  return {
    getShelfBookDetails: getShelfBookDetails.data,
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
    isShelfBookLoanActive: isShelfBookLoanActive.data,
    isShelfBookLoanActiveError: isShelfBookLoanActive.error,
    isGetDetailsLoading: getShelfBookDetails.isLoading,
    isUpdateLoading: updateShelfBook.isPending,
    isDeleteLoading: deleteShelfBook.isPending,
    isReOrderLoading: reOrderShelfBook.isPending,
    isMoveLoading: moveShelfBook.isPending,
    isActivateLoanLoading: activateShelfBookLoan.isPending,
    isDeactivateLoanLoading: deactivateShelfBookLoan.isPending,
    isLoanActiveLoading: isShelfBookLoanActive.isLoading,
  };
}