import { useQuery, useMutation } from '@tanstack/react-query';
import { libraryApi } from '../services/api';
import { LibraryOverview, ShelfBook, useAppStore } from '../context/appStore';

export function useLibrary() {
  const { isAuthenticated, setLibrary } = useAppStore();

  const getLibrary = useQuery<LibraryOverview>({
    queryKey: ['library', { filterTerm: 'all' }],
    queryFn: async ({ queryKey }) => {
      const { filterTerm } = queryKey[1] as { filterTerm: string };
      const response = await libraryApi.getLibrary(filterTerm);
      setLibrary(response.data);
      return response.data;
    },
    enabled: isAuthenticated,
    retry: 1,
    retryDelay: 1000
  });

  const searchBooks = useQuery({
    queryKey: ['searchBooks', { searchTerm: '', pageNumber: 1, pageSize: 10, external: false }],
    queryFn: async ({ queryKey }) => {
      const { searchTerm, pageNumber, pageSize, external } = queryKey[1] as { searchTerm: string; pageNumber: number; pageSize: number; external: boolean };
      const response = await libraryApi.searchBooks(searchTerm, pageNumber, pageSize, external);
      return response.data;
    },
    enabled: false,
    retry: 1,
    retryDelay: 10000,
  });

  const addBook = useMutation({
    mutationFn: ({ isbn, shelfId }: { isbn: string; shelfId: string }) => libraryApi.addBook(isbn, shelfId)
  });

  const addBookManually = useMutation({
    mutationFn: ({ shelfBook, shelfId }: { shelfBook: Partial<ShelfBook>; shelfId: string }) => libraryApi.addBookManually(shelfBook, shelfId)
  });

  return {
    getLibrary: getLibrary.data,
    getLibraryRefetch: getLibrary.refetch,
    getLibraryError: getLibrary.error,
    searchBooks: searchBooks.data,
    searchBooksError: searchBooks.error,
    addBook: addBook.mutate,
    addBookError: addBook.error,
    addBookManually: addBookManually.mutate,
    addBookManuallyError: addBookManually.error,
    isLibraryLoading: getLibrary.isLoading,
    isSearchActive: searchBooks.isLoading,
    isAddBookLoading: addBook.isPending,
    isAddBookManuallyLoading: addBookManually.isPending,
  };
}