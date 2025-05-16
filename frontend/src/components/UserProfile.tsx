import { useState } from 'react';
import { X, Save, Lock, Info, CircleAlert } from 'lucide-react';
import { useAppStore } from '../context/appStore';
import { useProfile } from '../hooks/useProfile';
import { useTranslation } from 'react-i18next';

interface UserProfileProps {
  onClose: () => void;
}

export function UserProfile({ onClose }: UserProfileProps) {

  // State for the password form and errors
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPasswordShowError, setCurrentPasswordShowError] = useState(false);
  const [newPasswordShowError, setNewPasswordShowError] = useState(false);
  const [newPasswordRepeatShowError, setNewPasswordRepeatShowError] = useState(false);
  const [newPasswordMatchShowError, setNewPasswordMatchShowError] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', newPasswordRepeat: '' });

  // Global state and hooks for the user profile
  const { userSettings, setUserSettings } = useAppStore();
  const { updateSettings, changePassword, isChangePasswordLoading, isChangePasswordSuccess, isChangePasswordError, changePasswordError, resetPasswordError } = useProfile();
  
  // Hook for the translation
  const { t } = useTranslation();

  // Handle the settings change event to update them
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    const newValue = type === 'checkbox' ? checked : value;

    const updatedSettings = { ...userSettings, [name]: newValue };
    setUserSettings(updatedSettings);

    //TODO: Use debounce here or something to avoid spamming the API
    updateSettings(updatedSettings);
  }

  // Handle the password form visibility and reset errors
  const handleShowPasswordForm = () => {
    setShowPasswordForm(true);
    resetErrors();
    resetPasswordError();
    resetInputs();
  };

  // Handle the password form submission and validation
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if(!passwordFormValidation())
      return;

    changePassword(passwordData, {
      onSuccess: () => {
        resetErrors();
        resetInputs();
      }
    })
  };

  // Handle the password form cancellation and reset errors
  const handlePasswordCancel = () => {
    setShowPasswordForm(false);
    resetErrors();
    resetPasswordError();
    resetInputs();
  };

  // Validate the password form inputs and show errors if necessary
  const passwordFormValidation = () => {

    resetPasswordError();

    if (passwordData.currentPassword == ''){
      setCurrentPasswordShowError(true);
      return false;
    }else{
      setCurrentPasswordShowError(false);
    }

    if (passwordData.newPassword == ''){
      setNewPasswordShowError(true);
      return false;
    }else{
      setNewPasswordShowError(false);
    }

    if (passwordData.newPasswordRepeat == ''){
      setNewPasswordRepeatShowError(true);
      return false;
    }else{
      setNewPasswordRepeatShowError(false);
    }

    if (passwordData.newPassword != passwordData.newPasswordRepeat){
      setNewPasswordMatchShowError(true);
      return false;
    }else{
      setNewPasswordMatchShowError(false);
    }

    return true;
  };

  // Handle the error messages from the API (localized)
  const handleErrors = () => {
    const status = (changePasswordError as any)?.response?.status;
    let errorMessage = (changePasswordError as any)?.response?.data?.message || t('generic_unknown_error');
    console.log('Error:', status, errorMessage);
    if (status === 400) {
      if (errorMessage === 'USER_NEW_PASSWORD_NOT_VALID') {
        errorMessage = t('auth_password_not_valid_error');
      } else if (errorMessage === 'USER_NEW_PASSWORD_CONFIRMATION_NOT_MATCH') {
        errorMessage = t('auth_password_match_error');
      } else if (errorMessage === 'USER_PASSWORD_INCORRECT') {
        errorMessage = t('auth_password_incorrect_error');
      } else {
        errorMessage = t('generic_error');
      }
    }else if (status === 500) {
      errorMessage = t('generic_server_error');
    }

    return errorMessage;
  };

  // Reset the password form inputs
  const resetInputs = () => {
    setPasswordData({ currentPassword: '', newPassword: '', newPasswordRepeat: '' });
  };

  // Reset the error states
  const resetErrors = () => {
    setCurrentPasswordShowError(false);
    setNewPasswordShowError(false);
    setNewPasswordRepeatShowError(false);
    setNewPasswordMatchShowError(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
    >
      <div className="bg-gray-800 rounded-lg w-full max-w-md p-3">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">{ t('userprofile_title') }</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6 p-2 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">{ t('userprofile_info_title') }</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400">{ t('userprofile_email_label') }</label>
                <p className="text-white">{ userSettings.email }</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">{ t('userprofile_settings_title') }</h3>
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                name="notifyByEmail"
                checked={userSettings.notifyByEmail}
                onChange={(e) => {
                  handleSettingsChange(e)
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-400">{ t('userprofile_notify_email_label') }</label>
            </div>
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                name="notifyLoan"
                checked={userSettings.notifyLoan}
                onChange={(e) => {
                  handleSettingsChange(e);
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-400">{ t('userprofile_notify_loan_label') }</label>
            </div>
            <div className="mt-4">
              <label className="block text-sm text-gray-400 mb-2">
                {t('userprofile_notify_loan_before_days_label')}
              </label>
              <input
                type="range"
                name="notifyLoanBeforeDays"
                min="1"
                max="30"
                value={userSettings.notifyLoanBeforeDays}
                onChange={(e) => {
                  handleSettingsChange(e);
                }}
                className="w-full"
              />
              <p className="text-sm text-gray-400 mt-2">
                {userSettings.notifyLoanBeforeDays}
              </p>
            </div>
            <div className="mt-4">
              <label className="block text-sm text-gray-400 mb-2">
                {t('userprofile_notify_loan_before_days_frequency_label')}
              </label>
              <input
                type="range"
                name="notifyLoanBeforeDaysFrequency"
                min="1"
                max="30"
                value={userSettings.notifyLoanBeforeDaysFrequency}
                onChange={(e) => {
                  handleSettingsChange(e);
                }}
                className="w-full"
              />
              <p className="text-sm text-gray-400 mt-2">
                {userSettings.notifyLoanBeforeDaysFrequency}
              </p>
            </div>
          </div>

          {!showPasswordForm ? (
            <button
              onClick={ handleShowPasswordForm }
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              { t('userprofile_change_password') }
            </button>
          ) : (
            <form onSubmit={ handlePasswordSubmit } className="space-y-4">
              {isChangePasswordSuccess && (
                <div className="flex items-center bg-blue-500 text-white text-sm font-bold px-4 py-3" role="alert">
                  <Info className="w-4 h-4 mr-2" />
                  <p>{ t('userprofile_change_password_success') }</p>
                </div>
              )}
              {isChangePasswordError && (
                <div className="flex items-center bg-red-500 text-white text-sm font-bold px-4 py-3" role="alert">
                  <CircleAlert className="w-4 h-4 mr-2" />
                  <p>{ handleErrors() }</p>
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  { t('userprofile_current_password') }
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  
                />
                {currentPasswordShowError && (
                  <p className="text-red-500 text-xs mt-1">
                    {t('auth_password_error')}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  { t('userprofile_new_password') }
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {newPasswordShowError && (
                  <p className="text-red-500 text-xs mt-1">
                    {t('auth_password_error')}
                  </p>
                )}
                {newPasswordMatchShowError && (
                  <p className="text-red-500 text-xs mt-1">
                    {t('auth_password_match_error')}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  { t('userprofile_confirm_new_password') }
                </label>
                <input
                  type="password"
                  name="newPasswordRepeat"
                  value={passwordData.newPasswordRepeat}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPasswordRepeat: e.target.value })
                  }
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {newPasswordRepeatShowError && (
                  <p className="text-red-500 text-xs mt-1">
                    {t('auth_password_error')}
                  </p>
                )}
                {newPasswordMatchShowError && (
                  <p className="text-red-500 text-xs mt-1">
                    {t('auth_password_match_error')}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  onClick={handlePasswordSubmit}
                  className={`flex-1 py-2 ${isChangePasswordLoading ? 'bg-gray-600' : 'bg-blue-600'} text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2`}
                  disabled={isChangePasswordLoading}
                >
                  {isChangePasswordLoading ? (
                  <>
                    <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                    { t('userprofile_change_password_button_loading') }
                  </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      { t('userprofile_change_password_button') }
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={ handlePasswordCancel }
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  { t('userprofile_change_password_cancel_button') }
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}