import { useEffect, useState } from 'react';
import { X, Save, Trash, Hand, Book, Info, CircleAlert } from 'lucide-react';
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
  const [ showLoanForm, setShowLoanForm ] = useState(false);
  const [ safeDelete, setSafeDelete ] = useState(false);
  const [ isShelfBookDetailsError, setShelfBookDetailsError ] = useState(false);
  const [ isShelfBookDetailsTitleError, setShelfBookDetailsTitleError ] = useState(false);
  const [ isShelfBookDetailsSuccess, setShelfBookDetailsSuccess ] = useState(false);
  const [ loanForm, setLoanForm ] = useState({
    library: selectedShelfBook?.loan?.library || '',
    dueDate: selectedShelfBook?.loan?.dueDate || new Date(),
    notify: selectedShelfBook?.loan?.notify || false,
  });
  const { t } = useTranslation();

  const { 
    getShelfBookDetailsRefetch, 
    updateShelfBook, 
    updateShelfBookError, 
    isUpdateLoading, 
    deleteShelfBook, 
    deleteShelfBookError, 
    isDeleteLoading, 
    activateShelfBookLoan, 
    activateShelfBookLoanError, 
    isActivateLoanLoading, 
    deactivateShelfBookLoan, 
    deactivateShelfBookLoanError, 
    isDeactivateLoanLoading, 
    isShelfBookLoanActiveRefetch 
  } = useShelfBooks();

  const { 
    getLibraryRefetch, 
    addBookManually, 
    addBookManuallyError, 
    isAddBookManuallyLoading 
  } = useLibrary();

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

    if (selectedShelfBook === undefined || (selectedShelfBook.title === undefined || selectedShelfBook.title === '')) {
      setShelfBookDetailsError(true);
      setShelfBookDetailsTitleError(true);
      setTimeout(() => {
        setShelfBookDetailsError(false);
        setShelfBookDetailsTitleError(false);
      }
      , 5000);
      return;
    } else {
      setShelfBookDetailsError(false);
      setShelfBookDetailsTitleError(false);
    }

    if(selectedShelfBook.status === undefined)
      selectedShelfBook.status = '0';

    if (!isBookCreation) {
      updateShelfBook({
        shelfId: selectedShelfBookShelfId!,
        shelfBookId: selectedShelfBookId!,
        shelfBook: selectedShelfBook,
      },
      {
        onSuccess: () => {
          getShelfBookDetailsRefetch();
          setShelfBookDetailsSuccess(true);
          setTimeout(() => {
            setShelfBookDetailsSuccess(false);
          }, 5000);
        }
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
    if (!safeDelete) {
      setSafeDelete(true);
      setTimeout(() => {
        setSafeDelete(false);
      }, 3000);
      return;
    }

    if (selectedShelfBook) {
      deleteShelfBook({
        shelfId: selectedShelfBookShelfId!,
        shelfBookId: selectedShelfBookId!,
      },
      {
        onSuccess: () => {
          getLibraryRefetch();
          onClose();
        }
      });
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

  const handleLoanForm = () => {
    setShowLoanForm(true);
  };

  const handleActivateLoan = () => {
    if (selectedShelfBook) {
      activateShelfBookLoan({
        shelfId: selectedShelfBookShelfId!,
        shelfBookId: selectedShelfBookId!,
        data: {
          library: loanForm.library,
          dueDate: loanForm.dueDate,
          notify: loanForm.notify,
        }
      },
      {
        onSuccess: () => {
          getShelfBookDetailsRefetch();
        }
      });
    }
  }

  const handleDeactivateLoan = () => {
    if (selectedShelfBook) {
      deactivateShelfBookLoan({
        shelfId: selectedShelfBookShelfId!,
        shelfBookId: selectedShelfBookId!
      },
      {
        onSuccess: () => {
          loanForm.library = '';
          loanForm.dueDate = new Date();
          loanForm.notify = false;
          setLoanForm(loanForm);
          getShelfBookDetailsRefetch();
        }
      });
    }
  }

  const handleErrors = () => {
    
    if (updateShelfBookError) {
      return handleError(updateShelfBookError);
    } else if (deleteShelfBookError) {
      return handleError(deleteShelfBookError);
    } else if (activateShelfBookLoanError) {
      return handleError(activateShelfBookLoanError);
    } else if (deactivateShelfBookLoanError) {
      return handleError(deactivateShelfBookLoanError);
    } else if (addBookManuallyError) {
      return handleError(addBookManuallyError);
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
          <h2 className="text-xl font-bold text-white">{ selectedShelfBook?.title || t('shelfbookdetails_add_book_title') }</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={ handleBookSubmit } className="space-y-4">
          <div className="space-y-6 p-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {selectedShelfBook?.cover ? (
              <div className="flex justify-center mb-4">
                <img
                  src={selectedShelfBook.cover}
                  alt={t('shelfbookdetails_cover_image')}
                  className="w-32 h-48 object-cover rounded"
                />
              </div>
              ) : (
                <div className="flex justify-center mb-4">
                  <div className="w-32 h-48 bg-gray-700 rounded flex items-center justify-center text-gray-400">
                    {t('shelfbookdetails_no_cover_image')}
                  </div>
                </div>
              )
            }
            <div className="flex justify-center mb-4">
              <label
                htmlFor="cover"
                className="cursor-pointer bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
              >
                {t('shelfbookdetails_upload_cover_image')}
              </label>
              <input
                id="cover"
                name="cover"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={ handleImageUpload }
              />
            </div>
            <div className="w-full h-[1px] bg-gray-600 my-4"></div>
            <h3 className="text-lg font-semibold text-white">{t('shelfbookdetails_book_details_title')}</h3>
            <label className="block text-sm text-gray-400 mb-2">
              {t('shelfbookdetails_book_status')}
            </label>
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
              <option value="0" disabled>{t('shelfbookdetails_book_status_default')}</option>
              <option value="1">{t('shelfbookdetails_book_status_unread')}</option>
              <option value="2">{t('shelfbookdetails_book_status_toread')}</option>
              <option value="3">{t('shelfbookdetails_book_status_reading')}</option>
              <option value="4">{t('shelfbookdetails_book_status_read')}</option>
              <option value="5">{t('shelfbookdetails_book_status_abandoned')}</option>
              <option value="6">{t('shelfbookdetails_book_status_wishlist')}</option>
            </select>
            <label className="block text-sm text-gray-400 mb-2">
              {t('shelfbookdetails_book_title')}
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('shelfbookdetails_book_title_placeholder')}
              value={ selectedShelfBook?.title || '' }
              onChange={(e) =>
                setSelectedShelfBook({
                  ...selectedShelfBook!,
                  title: e.target.value,
                })
              }
            />
            <label className="block text-sm text-gray-400 mb-2">
              {t('shelfbookdetails_book_isbn')}
            </label>
            <input
              id="isbn"
              name="isbn"
              type="text"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('shelfbookdetails_book_isbn_placeholder')}
              value={ selectedShelfBook?.isbn || '' }
              onChange={(e) =>
                setSelectedShelfBook({
                  ...selectedShelfBook!,
                  isbn: e.target.value,
                })
              }
            />
            <label className="block text-sm text-gray-400 mb-2">
              {t('shelfbookdetails_book_authors')}
            </label>
            <input
              id="author"
              name="author"
              type="text"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('shelfbookdetails_book_authors_placeholder')}
              value={ selectedShelfBook?.authors || '' }
              onChange={(e) =>
                setSelectedShelfBook({
                  ...selectedShelfBook!,
                  authors: e.target.value,
                })
              }
            />
            <label className="block text-sm text-gray-400 mb-2">
              {t('shelfbookdetails_book_publisher')}
            </label>
            <input
              id="publisher"
              name="publisher"
              type="text"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('shelfbookdetails_book_publisher_placeholder')}
              value={ selectedShelfBook?.publisher || '' }
              onChange={(e) =>
                setSelectedShelfBook({
                  ...selectedShelfBook!,
                  publisher: e.target.value,
                })
              }
            />
            <label className="block text-sm text-gray-400 mb-2">
              {t('shelfbookdetails_book_publisher_place')}
            </label>
            <input
              id="publisherPlace"
              name="publisherPlace"
              type="text"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('shelfbookdetails_book_publisher_place_placeholder')}
              value={ selectedShelfBook?.publishPlace || '' }
              onChange={(e) =>
                setSelectedShelfBook({
                  ...selectedShelfBook!,
                  publishPlace: e.target.value,
                })
              }
            />
            <label className="block text-sm text-gray-400 mb-2">
              {t('shelfbookdetails_book_first_publish_year')}
            </label>
            <input
              id="firstPublishedYear"
              name="firstPublishedYear"
              type="text"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('shelfbookdetails_book_first_publish_year_placeholder')}
              value={ selectedShelfBook?.firstPublishYear || '' }
              onChange={(e) =>
                setSelectedShelfBook({
                  ...selectedShelfBook!,
                  firstPublishYear: e.target.value,
                })
              }
            />
            <label className="block text-sm text-gray-400 mb-2">
              {t('shelfbookdetails_book_num_pages')}
            </label>
            <input
              id="numPages"
              name="numPages"
              type="text"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('shelfbookdetails_book_num_pages_placeholder')}
              value={ selectedShelfBook?.numPages || '' }
              onChange={(e) =>
                setSelectedShelfBook({
                  ...selectedShelfBook!,
                  numPages: e.target.value,
                })
              }
            />
            <label className="block text-sm text-gray-400 mb-2">
              {t('shelfbookdetails_book_available_languages')}
            </label>
            <input
              id="availableLanguages"
              name="availableLanguages"
              type="text"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('shelfbookdetails_book_available_languages_placeholder')}
              value={ selectedShelfBook?.availableLanguages || '' }
              onChange={(e) =>
                setSelectedShelfBook({
                  ...selectedShelfBook!,
                  availableLanguages: e.target.value,
                })
              }
            />
            <label className="block text-sm text-gray-400 mb-2">
              {t('shelfbookdetails_book_notes')}
            </label>
            <textarea
              id="notes"
              name="notes"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('shelfbookdetails_book_notes_placeholder')}
              value={ selectedShelfBook?.notes || '' }
              onChange={(e) =>
                setSelectedShelfBook({
                  ...selectedShelfBook!,
                  notes: e.target.value,
                })
              }
            ></textarea>
            <label className="block text-sm text-gray-400 mb-2">
              {t('shelfbookdetails_book_physical_location')}
            </label>
            <input
              id="physicalLocation"
              name="physicalLocation"
              type="text"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('shelfbookdetails_book_physical_location_placeholder')}
              value={ selectedShelfBook?.physicalLocation || '' }
              onChange={(e) =>
                setSelectedShelfBook({
                  ...selectedShelfBook!,
                  physicalLocation: e.target.value,
                })
              }
            />
            {!isBookCreation && (
              <div>
                {!showLoanForm ? (
                  <div>
                    <button
                      onClick={handleLoanForm}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2"
                    >
                      <Book className="w-4 h-4" />
                      {t('shelfbookdetails_book_loan_show_button')}
                    </button>
                  </div>
                ) : (
                <div className="p-4 bg-gray-900 rounded-lg space-y-4">
                  <h3 className="text-lg font-semibold text-white">{t('shelfbookdetails_book_loan_details_title')}</h3>
                  <label className="block text-sm text-gray-400 mb-2">
                    {t('shelfbookdetails_book_loan_loaned_to')}
                  </label>
                  <input
                    id="library"
                    name="library"
                    type="text"
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('shelfbookdetails_book_loan_loaned_to_placeholder')}
                    defaultValue={ selectedShelfBook?.loan?.library || '' }
                    onChange={(e) =>
                      setLoanForm({
                        ...loanForm,
                        library: e.target.value,
                      })
                    }
                  />
                  <label className="block text-sm text-gray-400 mb-2">
                    {t('shelfbookdetails_book_loan_due_date')}
                  </label>
                  <input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('shelfbookdetails_book_loan_due_date_placeholder')}
                    defaultValue={
                      selectedShelfBook?.loan?.dueDate
                        ? new Date(selectedShelfBook.loan.dueDate).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      setLoanForm({
                        ...loanForm,
                        dueDate: new Date(e.target.value),
                      })
                    }
                  />
                  <div className="mt-4">
                    <label className="block text-sm text-gray-400 mb-2">
                      {t('shelfbookdetails_book_loan_notify')}
                    </label>
                    <input
                      id="notify"
                      name="notify"
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked={ selectedShelfBook?.loan?.notify }
                      onChange={(e) =>
                        setLoanForm({
                          ...loanForm,
                          notify: e.target.checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedShelfBook?.loan === null ? (
                      <button
                        type="button"
                        onClick={ handleActivateLoan }
                        className="flex-1 py-2 text-white rounded-lg bg-green-700 hover:bg-green-600 flex items-center justify-center gap-2"
                      >
                        { isActivateLoanLoading ? (
                          <>
                            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                            </svg>
                            {t('shelfbookdetails_book_loan_activate_button_loading')}
                          </>
                        ) : (
                          <>
                            <Hand className="w-4 h-4" />
                            {t('shelfbookdetails_book_loan_activate_button')}
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={ handleDeactivateLoan }
                        className="flex-1 py-2 text-white rounded-lg bg-red-700 hover:bg-red-600 flex items-center justify-center gap-2"
                      >
                        { isDeactivateLoanLoading ? (
                          <>
                            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                            </svg>
                            {t('shelfbookdetails_book_loan_deactivate_button_loading')}
                          </>
                        ) : (
                          <>
                            <CircleAlert className="w-4 h-4" />
                            {t('shelfbookdetails_book_loan_deactivate_button')}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                )}
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
                <>
                  <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                  </svg>
                  { isBookCreation ? t('shelfbookdetails_add_button_loading') : t('shelfbookdetails_save_button_loading') }
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  { isBookCreation ? t('shelfbookdetails_add_button') : t('shelfbookdetails_save_button') }
                </>
              )}
            </button>
            { !isBookCreation && (
              <button
                type="button"
                onClick={ handleBookDelete }
                className={`flex-1 py-2 text-white rounded-lg ${safeDelete ? 'bg-red-900 hover:bg-red-800' : 'bg-red-700 hover:bg-red-600'} flex items-center justify-center gap-2`}
              >
                <Trash className="w-4 h-4" />
                {safeDelete ? (
                  <span>{t('shelfbookdetails_delete_button_confirm')}</span>
                ) : (
                  <span>{t('shelfbookdetails_delete_button')}</span>
                )}
              </button>
            )}
          </div>
          {isShelfBookDetailsSuccess && (
            <div className="flex items-center bg-blue-500 text-white text-sm font-bold px-4 py-3" role="alert">
              <Info className="w-4 h-4 mr-2" />
              <p>{ t('shelfbookdetails_success_action') }</p>
            </div>
          )}
          {isShelfBookDetailsError && (
            <div className="flex items-center bg-red-500 text-white text-sm font-bold px-4 py-3" role="alert">
              <CircleAlert className="w-4 h-4 mr-2" />
              <p>{ isShelfBookDetailsTitleError ? t('shelfbookdetails_title_error') : handleErrors() }</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}