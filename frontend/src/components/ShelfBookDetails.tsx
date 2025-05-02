import { useEffect, useState } from 'react';
import { X, Save, Trash } from 'lucide-react';
import { ShelfBook, useAppStore } from '../context/appStore';
import { useShelfBooks } from '../hooks/useShelfBooks';
import { useLibrary } from '../hooks/useLibrary';
import { useTranslation } from 'react-i18next';

interface ShelfBookDetailsProps {
  onClose: () => void;
}

export function ShelfBookDetails({ onClose }: ShelfBookDetailsProps) {
  const { selectedShelfBookId, selectedShelfBookShelfId, selectedShelfBook, setSelectedShelfBook } = useAppStore();
  const [ isBookCreation, setIsBookCreation ] = useState(true);
  const { t } = useTranslation();

  const { getShelfBookDetailsRefetch, updateShelfBook, isUpdateLoading, deleteShelfBook, activateShelfBookLoan, deactivateShelfBookLoan, isShelfBookLoanActiveRefetch } = useShelfBooks();
  const { getLibraryRefetch, addBookManually, isAddBookManuallyLoading } = useLibrary();

  useEffect(() => {
    if (selectedShelfBookId && selectedShelfBookShelfId) {
      setIsBookCreation(false);
      getShelfBookDetailsRefetch();
    } else {
      setIsBookCreation(true);
    }
  }, []);

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedShelfBook) return;
    if (!isBookCreation) {
      updateShelfBook({
        shelfId: selectedShelfBookShelfId!,
        shelfBookId: selectedShelfBookId!,
        shelfBook: selectedShelfBook,
      });
    } else {
      addBookManually({
        shelfId: selectedShelfBookShelfId!,
        shelfBook: selectedShelfBook,
      },
      {
        onSuccess: () => {
          getLibraryRefetch();
          onClose();
        }
      });
    }
  }

  const handleBookDelete = async () => {
    if (selectedShelfBook) {
      deleteShelfBook({
        shelfId: selectedShelfBookShelfId!,
        shelfBookId: selectedShelfBookId!,
      });
      onClose();
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setSelectedShelfBook({
          ...selectedShelfBook!,
          cover: base64String,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-xl p-3">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">{ selectedShelfBook?.title || "Add new book" }</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={ handleBookSubmit } className="space-y-4">
          <div className="space-y-6 p-2 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {selectedShelfBook?.cover ? (
              <div className="flex justify-center mb-4">
                <img
                  src={selectedShelfBook.cover}
                  alt="Book Cover"
                  className="w-32 h-48 object-cover rounded"
                />
              </div>
              ) : (
                <div className="flex justify-center mb-4">
                  <div className="w-32 h-48 bg-gray-700 rounded flex items-center justify-center text-gray-400">
                    No Cover
                  </div>
                </div>
              )
            }
            <div className="flex justify-center mb-4">
              <label
                htmlFor="cover"
                className="cursor-pointer bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Upload Cover
              </label>
              <input
                id="cover"
                name="cover"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            <div className="w-full h-[1px] bg-gray-600 my-4"></div>
            <h3 className="text-lg font-semibold text-white">Book Details</h3>
            <input
              id="title"
              name="title"
              type="text"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Title"
              value={ selectedShelfBook?.title || '' }
              onChange={(e) =>
                setSelectedShelfBook({
                  ...selectedShelfBook!,
                  title: e.target.value,
                })
              }
            />
            <input
              id="isbn"
              name="isbn"
              type="text"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="ISBN"
              value={ selectedShelfBook?.isbn || '' }
              onChange={(e) =>
                setSelectedShelfBook({
                  ...selectedShelfBook!,
                  isbn: e.target.value,
                })
              }
            />
            <input
              id="author"
              name="author"
              type="text"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Author"
              value={ selectedShelfBook?.authors || '' }
              onChange={(e) =>
                setSelectedShelfBook({
                  ...selectedShelfBook!,
                  authors: e.target.value,
                })
              }
            />
            <input
              id="publisher"
              name="publisher"
              type="text"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Publisher"
              value={ selectedShelfBook?.publisher || '' }
              onChange={(e) =>
                setSelectedShelfBook({
                  ...selectedShelfBook!,
                  publisher: e.target.value,
                })
              }
            />
            <input
              id="publisherPlace"
              name="publisherPlace"
              type="text"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Publisher Place"
              value={ selectedShelfBook?.publishPlace || '' }
              onChange={(e) =>
                setSelectedShelfBook({
                  ...selectedShelfBook!,
                  publishPlace: e.target.value,
                })
              }
            />
            <input
              id="firstPublishedYear"
              name="firstPublishedYear"
              type="text"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="First Published Year"
              value={ selectedShelfBook?.firstPublishYear || '' }
              onChange={(e) =>
                setSelectedShelfBook({
                  ...selectedShelfBook!,
                  firstPublishYear: e.target.value,
                })
              }
            />
            <input
              id="numPages"
              name="numPages"
              type="text"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Number of Pages"
              value={ selectedShelfBook?.numPages || '' }
              onChange={(e) =>
                setSelectedShelfBook({
                  ...selectedShelfBook!,
                  title: e.target.value,
                })
              }
            />
            <input
              id="availableLanguages"
              name="availableLanguages"
              type="text"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Available Languages"
              value={ selectedShelfBook?.availableLanguages || '' }
              onChange={(e) =>
                setSelectedShelfBook({
                  ...selectedShelfBook!,
                  availableLanguages: e.target.value,
                })
              }
            />
            <textarea
              id="notes"
              name="notes"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Notes"
              value={ selectedShelfBook?.notes || '' }
              onChange={(e) =>
                setSelectedShelfBook({
                  ...selectedShelfBook!,
                  notes: e.target.value,
                })
              }
            ></textarea>
            <input
              id="physicalLocation"
              name="physicalLocation"
              type="text"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Physical Location"
              value={ selectedShelfBook?.physicalLocation || '' }
              onChange={(e) =>
                setSelectedShelfBook({
                  ...selectedShelfBook!,
                  physicalLocation: e.target.value,
                })
              }
            />
            <select
              id="status"
              name="status"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={ selectedShelfBook?.status || '' }
              onChange={(e) =>
                setSelectedShelfBook({
                  ...selectedShelfBook!,
                  status: e.target.value,
                })
              }
            >
              <option value="0" disabled>Select Status</option>
              <option value="1">Unread</option>
              <option value="2">To Read</option>
              <option value="3">Reading</option>
              <option value="4">Read</option>
              <option value="5">Abandoned</option>
              <option value="6">Wishlist</option>
            </select>
            {!isBookCreation && (
              <div>
                <input
                  id="library"
                  name="library"
                  type="text"
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Library Name"
                />
                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex items-center gap-2">
                  <input
                    id="notify"
                    name="notify"
                    type="checkbox"
                    className="rounded-lg border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    checked={ false }
                  />
                  <label htmlFor="notify" className="text-white">Notify</label>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {}}
                    className="flex-1 py-2 text-white rounded-lg bg-green-700 hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    Activate Loan
                  </button>
                  <button
                    type="button"
                    onClick={() => {}}
                    className="flex-1 py-2 text-white rounded-lg bg-red-700 hover:bg-red-600 flex items-center justify-center gap-2"
                  >
                    Deactivate Loan
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              onClick={ handleBookSubmit }
              className={'flex-1 py-2 text-white rounded-lg bg-blue-700 hover:bg-blue-600 flex items-center justify-center gap-2'}
              disabled={isUpdateLoading || isAddBookManuallyLoading}
            >
              {(isUpdateLoading || isAddBookManuallyLoading) ? (
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
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  { isBookCreation ? "Add" : "Save" }
                </>
              )}
            </button>
            { !isBookCreation && (
              <button
                type="button"
                onClick={ handleBookDelete }
                className="flex-1 py-2 text-white rounded-lg bg-red-700 hover:bg-red-600 flex items-center justify-center gap-2"
              >
                <Trash className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}