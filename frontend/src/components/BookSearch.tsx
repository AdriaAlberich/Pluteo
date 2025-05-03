import { useEffect, useState } from 'react';
import { X, Search, Plus, Info, CircleAlert } from 'lucide-react';
import { BookSearchResult, SearchResultItem, useAppStore } from '../context/appStore';
import { useLibrary } from '../hooks/useLibrary';
import { useTranslation } from 'react-i18next';
import { SearchResult } from './SearchResult';

interface BookSearchProps {
  onClose: () => void;
}

export function BookSearch({ onClose }: BookSearchProps) {
  const { searchTerm, setSearchTerm, external, setExternal, searchPageNumber, setSearchPageNumber, searchPageSize, setSearchPageSize, searchTotalPages, setSearchTotalPages, searchTotalResults, setSearchTotalResults, searchResults, setSearchResults } = useAppStore();
  const [ isBookSearchError, setBookSearchError ] = useState(false);
  const { t } = useTranslation();

  const { 
    getLibraryRefetch,
    searchBooksRefetch,
    searchBooksError,
    isSearchActive,
    addBook,
    addBookError,
    isAddBookLoading,
  } = useLibrary();

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchTerm.trim() === '') {
      setBookSearchError(true);
      return;
    }

    setSearchTerm(searchTerm.trim().replace(' ', '+'));

    setSearchPageNumber(1);
    setSearchPageSize(3);

    searchBooksRefetch();
  }

  const handleAddBook = async (isbn: string) => {
    if (isAddBookLoading) return;

    addBook(
      { 
        isbn
      },
      {
        onSuccess: () => {
        getLibraryRefetch();
        setSearchResults(undefined);
        setSearchTotalPages(0);
        setSearchTotalResults(0);
        setSearchTerm('');
        setExternal(false);
        setSearchPageNumber(1);
        setSearchPageSize(5);
        onClose();
      },
        onError: (error) => {
          console.error('Error adding book:', error);
        },
      }
    );
  }

  const handleErrors = () => {
    
    if (searchBooksError) {
      return handleError(searchBooksError);
    } else if (addBookError) {
      return handleError(addBookError);
    }

    return null;
  };

  // TODO: Finish this
  const handleError = (error: any) => {
    const status = (error as any)?.response?.status;
    let errorMessage = (error as any)?.response?.data?.message || 'An unknown error occurred';
    console.log('Error:', status, errorMessage);
    if (status === 400) {
      if (errorMessage === 'USER_NEW_PASSWORD_NOT_VALID') {
        errorMessage = t('auth_password_not_valid_error');
      } else if (errorMessage === 'USER_NEW_PASSWORD_CONFIRMATION_NOT_MATCH') {
        errorMessage = t('auth_password_match_error');
      } else if (errorMessage === 'USER_PASSWORD_INCORRECT') {
        errorMessage = t('auth_password_incorrect_error');
      } else {
        errorMessage = t('auth_generic_error');
      }
    }else if (status === 500) {
      errorMessage = t('auth_server_error');
    }

    return errorMessage;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-xl p-3">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">{t('booksearch_title')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={ handleSearchSubmit } className="space-y-4">
          <div className="p-4 bg-gray-900 rounded-lg">
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
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
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
                  onChange={(e) =>
                    setExternal(e.target.checked)
                  }
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
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
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
                <p>{ handleErrors() }</p>
              </div>
            )}
          </div>
        </form>
        <div>
          <h3 className="text-lg font-semibold text-white mt-6">{t('booksearch_search_results')}</h3>
          <div className="space-y-6 p-2 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {searchTotalResults === 0 && (
              <div className="flex items-center bg-yellow-500 text-white text-sm font-bold px-4 py-3" role="alert">
                <Info className="w-4 h-4 mr-2" />
                <p>{t('booksearch_search_results_empty')}</p>
              </div>
            )}
            {searchResults && searchResults.results.map((result: SearchResultItem) => (
              <SearchResult
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
        {searchResults && searchTotalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => {
                if (searchPageNumber > 1) {
                  setSearchPageNumber(searchPageNumber - 1);
                  searchBooksRefetch();
                }
              }}
              disabled={searchPageNumber === 1}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              {t('booksearch_search_page_previous')}
            </button>
            <span className="text-white">
              {t('booksearch_search_page')} {searchPageNumber} {t('booksearch_search_page_of')} {searchTotalPages}
            </span>
            <button
              onClick={() => {
                if (searchPageNumber < searchTotalPages) {
                  setSearchPageNumber(searchPageNumber + 1);
                  searchBooksRefetch();
                }
              }}
              disabled={searchPageNumber === searchTotalPages}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              {t('booksearch_search_page_next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}