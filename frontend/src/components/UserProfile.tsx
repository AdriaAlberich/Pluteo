import { useState } from 'react';
import { X, Save, Lock, Info, CircleAlert } from 'lucide-react';
import { useAppStore } from '../context/appStore';
import { useProfile } from '../hooks/useProfile';
import { useTranslation } from 'react-i18next';

interface UserProfileProps {
  onClose: () => void;
}

export function UserProfile({ onClose }: UserProfileProps) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPasswordShowError, setCurrentPasswordShowError] = useState(false);
  const [newPasswordShowError, setNewPasswordShowError] = useState(false);
  const [newPasswordRepeatShowError, setNewPasswordRepeatShowError] = useState(false);
  const [newPasswordMatchShowError, setNewPasswordMatchShowError] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', newPasswordRepeat: '' });
  const { userSettings, setUserSettings } = useAppStore();
  const { updateSettings, changePassword, isChangePasswordLoading, isChangePasswordSuccess, isChangePasswordError, changePasswordError, resetPasswordError } = useProfile();
  const { t } = useTranslation();

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    const newValue = type === 'checkbox' ? checked : value;

    const updatedSettings = { ...userSettings, [name]: newValue };
    setUserSettings(updatedSettings);

    //TODO: Use debounce here or something to avoid spamming the API
    updateSettings(updatedSettings);
  }

  const handleShowPasswordForm = () => {
    setShowPasswordForm(true);
    resetErrors();
    resetPasswordError();
    resetInputs();
  };

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

  const handlePasswordCancel = () => {
    setShowPasswordForm(false);
    resetErrors();
    resetPasswordError();
    resetInputs();
  };

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

  const handleErrors = () => {
    const status = (changePasswordError as any)?.response?.status;
    let errorMessage = (changePasswordError as any)?.response?.data?.message || 'An unknown error occurred';
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
  };

  const resetInputs = () => {
    setPasswordData({ currentPassword: '', newPassword: '', newPasswordRepeat: '' });
  };

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
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  { t('userprofile_current_password') }
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  { t('userprofile_new_password') }
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  { t('userprofile_confirm_new_password') }
                </label>
                <input
                  type="password"
                  name="newPasswordRepeat"
                  value={passwordData.newPasswordRepeat}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPasswordRepeat: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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