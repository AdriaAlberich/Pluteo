import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLibrary } from '../hooks/useLibrary';

interface SearchResultProps {
  title: string;
  isbn: string[];
  searchCoverUrl: string;
  authors: string[];
  publishers: string[];
  publishPlaces: string[];
  firstPublishYear: string;
  numPages: number;
  availableLanguages: string[];
  onClick: (isbn: string) => void;
}

export function SearchResult({ title, isbn, searchCoverUrl, authors, publishers, publishPlaces, firstPublishYear, numPages, availableLanguages, onClick }: SearchResultProps) {
  const { isAddBookLoading } = useLibrary();
  const { t } = useTranslation();
  const [ isBeingAdded, setIsBeingAdded ] = useState(false);

  return (
    <div className="flex flex-col bg-gray-700 shadow-lg rounded p-4 h-full space-y-2">
      <div className="flex items-start gap-4 flex-grow">
        <div className="w-32 h-48 flex-shrink-0">
          { searchCoverUrl ? (
            <img
              src={searchCoverUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-500 flex items-center justify-center text-white font-bold">
              {t('searchresult_no_cover_image')}
            </div>
          )}
        </div>
        <div className="flex-grow flex flex-col space-y-1 overflow-hidden">
          <h3 className="text-lg font-semibold text-white truncate">{title}</h3>
          <p className="text-sm text-gray-100 truncate">{t('searchresult_isbn')}: <span className="text-gray-300 truncate">{isbn[0]}</span></p>
          <p className="text-sm text-gray-100 truncate">{t('searchresult_authors')}: <span className="text-gray-300 truncate">{authors.join(', ')}</span></p>
          <p className="text-sm text-gray-100 truncate">{t('searchresult_publishers')}: <span className="text-gray-300 truncate">{publishers.slice(0,5).join(', ')}</span></p>
          <p className="text-sm text-gray-100 truncate">{t('searchresult_publish_places')}: <span className="text-gray-300 truncate">{publishPlaces.slice(0,5).join(', ')}</span></p>
          <p className="text-sm text-gray-100 truncate">{t('searchresult_first_publish_year')}: <span className="text-gray-300 truncate">{firstPublishYear}</span></p>
          <p className="text-sm text-gray-100 truncate">{t('searchresult_numpages')}: <span className="text-gray-300 truncate">{numPages}</span></p>
          <p className="text-sm text-gray-100 truncate">{t('searchresult_available_languages')}: <span className="text-gray-300 truncate">{availableLanguages.join(', ')}</span></p>
        </div>
      </div>
      <div className="mt-auto">
        <button
            onClick={() => {setIsBeingAdded(true); onClick(isbn[0]);}}
            className="w-full px-4 py-2 bg-green-500 hover:bg-green-700 text-white font-bold rounded"
            disabled={isBeingAdded || isAddBookLoading}
          >
            {isBeingAdded ? (
              <div className="flex items-center justify-center gap-2">
                <svg aria-hidden="true" className="w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                {t('searchresult_add_button_loading')}
              </div>
            ) : (
              <>
                <Plus className="inline mr-1" />
                {t('searchresult_add_button')}
              </>
            )}
        </button>
      </div>
    </div>
  );
}