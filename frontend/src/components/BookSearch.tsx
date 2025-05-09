import { useState } from 'react';
import { X, Search, Info, CircleAlert } from 'lucide-react';
import { BookSearchResultItem, useAppStore } from '../context/appStore';
import { useLibrary } from '../hooks/useLibrary';
import { useTranslation } from 'react-i18next';
import { BookSearchResult } from './BookSearchResult';

interface BookSearchProps {
  onClose: () => void;
}

export function BookSearch({ onClose }: BookSearchProps) {

  // Get global state from the store
  const { 
    searchTerm, 
    setSearchTerm,
    setExternal, 
    setSearchPageNumber, 
    setSearchPageSize, 
    setSearchTotalPages, 
    searchTotalResults, 
    setSearchTotalResults, 
    searchResults, 
    setSearchResults 
  } = useAppStore();

  // Set local state variables
  const [ isBookSearchError, setBookSearchError ] = useState(false);
  const [ isBookSearchTermError, setSearchTermError ] = useState(false);

  // Include the traslation hook
  const { t } = useTranslation();

  // Get the library hooks
  const { 
    getLibraryRefetch,
    searchBooksRefetch,
    searchBooksError,
    isSearchActive,
    addBook,
    addBookError,
    isAddBookLoading,
  } = useLibrary();

  // Update the input search (we replace the spaces with +)
  const updateSearchTerm = (term: string) => {
    term = term.trim().replace(/\s+/g, '+');
    setSearchTerm(term);
  }

  // Update the external search checkbox
  const updateExternal = (external: boolean) => {
    setExternal(external);
  }

  // Handle the logic for the search button
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchTerm === undefined || searchTerm.trim() === '') {
      setSearchTermError(true);
      showError();
      return;
    }
    else {
      resetSearch();
    }

    setSearchPageNumber(1);
    setSearchPageSize(20);

    searchBooksRefetch();
  }

  // Handle the logic for the pagination (not working yet)
/*const handleNextPage = () => {
    if (searchPageNumber < searchTotalPages) {
      setSearchPageNumber(searchPageNumber + 1);
      searchBooksRefetch();
    }
  }

  const handlePreviousPage = () => {
    if (searchPageNumber > 1) {
      setSearchPageNumber(searchPageNumber - 1);
      searchBooksRefetch();
    }
  } */

  // Handle the logic for the add book button from the search result
  const handleAddBook = async (isbn: string) => {
    if (isAddBookLoading) return;

    addBook(
      { 
        isbn
      },
      {
        onSuccess: () => {
        getLibraryRefetch();
        resetSearch();
        onClose();
      },
        onError: () => {
          resetSearch();
          showError();
        },
      }
    );
  }

  // Handle the errors from the hook mutations and queries
  const handleErrors = () => {
    
    if (searchBooksError) {
      return handleError(searchBooksError);
    } else if (addBookError) {
      return handleError(addBookError);
    }

    return null;
  };

  // Handle the error messages from the API (localized)
  const handleError = (error: any) => {
    const status = (error as any)?.response?.status;
    let errorMessage = (error as any)?.response?.data?.message || t('generic_unknown_error');
    console.log('Error:', status, errorMessage);
    if (status === 400) {
      if (errorMessage === 'BOOK_ALREADY_EXISTS_IN_SHELF') {
        errorMessage = t('booksearch_book_already_exists_error');
      } else {
        errorMessage = t('generic_error');
      }
    }else if (status === 500) {
      errorMessage = t('generic_server_error');
    }

    return errorMessage;
  }

  // Show error message for 5 seconds
  const showError = () => {
    setBookSearchError(true);
    setTimeout(() => {
      setBookSearchError(false);
    }, 5000);
  }

  // Reset search state
  const resetSearch = () => {
    setSearchResults(undefined);
    setSearchTotalPages(0);
    setSearchTotalResults(0);
    setSearchTerm('');
    setExternal(false);
    setSearchPageNumber(1);
    setSearchPageSize(20);
    setSearchTermError(false);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
    >
      <div className="bg-gray-800 rounded-lg w-full max-w-xl p-3">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">{t('booksearch_title')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-6 p-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <form onSubmit={ handleSearchSubmit }>
            <div className="p-4 bg-gray-900 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-white">{t('booksearch_title_search')}</h3>
                <label className="block text-sm text-gray-400 mb-2">
                  {t('booksearch_search_term')}
                </label>
                <input
                  id="searchTerm"
                  name="searchTerm"
                  type="text"
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('booksearch_search_term_placeholder')}
                  onChange={(e) => updateSearchTerm(e.target.value)}
                />
                <div className="mt-4">
                  <label className="block text-sm text-gray-400 mb-2">
                    {t('booksearch_search_external')}
                  </label>
                  <input
                    id="external"
                    name="external"
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    onChange={(e) => updateExternal(e.target.checked)}
                  />
                </div>
                <button
                  type="submit"
                  onClick={ handleSearchSubmit }
                  className={'flex-1 w-full py-2 text-white rounded-lg bg-blue-700 hover:bg-blue-600 flex items-center justify-center gap-2'}
                  disabled={isSearchActive || isAddBookLoading}
                >
                {(isSearchActive) ? (
                  <>
                    <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                    {t('booksearch_search_button_searching')}
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    {t('booksearch_search_button')}
                  </>
                )}
              </button>
              {isBookSearchError && (
                <div className="flex items-center bg-red-500 text-white text-sm font-bold px-4 py-3" role="alert">
                  <CircleAlert className="w-4 h-4 mr-2" />
                  <p>{ isBookSearchTermError ? t('booksearch_search_term_error') : handleErrors() }</p>
                </div>
              )}
            </div>
          </form>
          <div className="bg-gray-900 rounded-lg space-y-4 p-4">
            <h3 className="text-lg font-semibold text-white mt-6">{t('booksearch_search_results')}</h3>
            <div className="space-y-4">
              {searchTotalResults === 0 && (
                <div className="flex items-center bg-yellow-500 text-white text-sm font-bold px-4 py-3" role="alert">
                  <Info className="w-4 h-4 mr-2" />
                  <p>{t('booksearch_search_results_empty')}</p>
                </div>
              )}
              {searchResults && searchResults.results.map((result: BookSearchResultItem) => (
                <BookSearchResult
                  key={result.isbn[0]}
                  title={result.title}
                  isbn={result.isbn}
                  searchCoverUrl={result.searchCoverUrl}
                  authors={result.authors}
                  publishers={result.publishers}
                  publishPlaces={result.publishPlaces}
                  firstPublishYear={result.firstPublishYear}
                  numPages={result.numPages}
                  availableLanguages={result.availableLanguages}
                  onClick={(isbn) => {handleAddBook(isbn)}}
                />
              ))}
            </div>
          </div>
        </div>
        {/* {searchResults && searchTotalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => { handlePreviousPage() }}
              disabled={searchPageNumber === 1}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              {t('booksearch_search_page_previous')}
            </button>
            <span className="text-white">
              {t('booksearch_search_page')} {searchPageNumber} {t('booksearch_search_page_of')} {searchTotalPages}
            </span>
            <button
              onClick={() => { handleNextPage() }}
              disabled={searchPageNumber === searchTotalPages}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              {t('booksearch_search_page_next')}
            </button>
          </div>
        )} */}
      </div>
    </div>
  );
}