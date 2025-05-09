import { useQuery, useMutation } from '@tanstack/react-query';
import { libraryApi } from '../services/api';
import { LibraryOverview, ShelfBook, useAppStore } from '../context/appStore';

export function useLibrary() {

  // Global state to manage the library queries and mutations
  const { 
    isAuthenticated, 
    setLibrary, 
    searchTerm, 
    searchPageNumber, 
    searchPageSize, 
    external, 
    setSearchResults, 
    setSearchTotalPages, 
    setSearchTotalResults, 
    setSearchPageNumber,
    filterTerm
  } = useAppStore();

  // Get the whole library overview (shelves with books)
  const getLibrary = useQuery<LibraryOverview>({
    queryKey: ['library', { filterTerm }],
    queryFn: async () => {
      const response = await libraryApi.getLibrary(filterTerm);
      setLibrary(response.data);
      return response.data;
    },
    enabled: isAuthenticated,
    retry: false
  });

  // Search for books in the library (external or internal)
  const searchBooks = useQuery({
    queryKey: ['searchBooks', { searchTerm, searchPageNumber, searchPageSize, external }],
    queryFn: async () => {
      const response = await libraryApi.searchBooks(searchTerm, searchPageNumber, searchPageSize, external);
      setSearchResults(response.data);
      setSearchTotalPages(response.data.totalPages);
      setSearchTotalResults(response.data.totalResults);
      setSearchPageNumber(response.data.page);
      return response.data;
    },
    enabled: false,
    retry: false
  });

  // Mutation for adding an existing book to the library (external or internal)
  const addBook = useMutation({
    mutationFn: ({ isbn, shelfId }: { isbn: string; shelfId?: string | undefined }) => libraryApi.addBook(isbn, shelfId),
  });

  // Mutation for adding a book manually to the library (custom book)
  const addBookManually = useMutation({
    mutationFn: ({ shelfBook, shelfId }: { shelfBook: Partial<ShelfBook>; shelfId: string | undefined }) => libraryApi.addBookManually(shelfBook, shelfId)
  });

  return {
    getLibrary: getLibrary.data,
    getLibraryRefetch: getLibrary.refetch,
    getLibraryError: getLibrary.error,
    searchBooks: searchBooks.data,
    searchBooksRefetch: searchBooks.refetch,
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