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
    <div className="flex items-center gap-2 bg-gray-700 shadow-lg rounded p-4">
      <div
        className="flex flex-col"
      >
        <img
          src={searchCoverUrl}
          alt={title}
          className="w-32 h-48 object-cover mb-2"
        />
      </div>
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-100">ISBN: <span className="text-gray-300">{isbn[0]}</span></p>
        <p className="text-sm text-gray-100">Authors: <span className="text-gray-300">{authors.join(', ')}</span></p>
        <p className="text-sm text-gray-100">Publishers: <span className="text-gray-300">{publishers.slice(0,5).join(', ')}</span></p>
        <p className="text-sm text-gray-100">Publish Places: <span className="text-gray-300">{publishPlaces.slice(0,5).join(', ')}</span></p>
        <p className="text-sm text-gray-100">First Publish Year: <span className="text-gray-300">{firstPublishYear}</span></p>
        <p className="text-sm text-gray-100">Number of Pages: <span className="text-gray-300">{numPages}</span></p>
        <p className="text-sm text-gray-100">Available Languages: <span className="text-gray-300">{availableLanguages.join(', ')}</span></p>
        <button
          onClick={() => {setIsBeingAdded(true); onClick(isbn[0]);}}
          className="mt-2 px-4 py-2 bg-green-500 hover:bg-green-700 text-white font-bold rounded"
          disabled={isBeingAdded || isAddBookLoading}
        >
          {isBeingAdded ? (
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
              Adding...
            </>
          ) : (
            <>
              <Plus className="inline mr-1" />
              Add to Library
            </>
          )}
        </button>
      </div>
    </div>
  );
}