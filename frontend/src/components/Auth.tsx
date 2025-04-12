import { useState } from 'react';
import { useAppStore } from '../context/AppContext';
import { useTranslation } from 'react-i18next';

export function Auth() {
  const { setIsAuthenticated } = useAppStore();
  const [isLogin, setIsLogin] = useState(true);
  const [isReActivation, setIsReActivation] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [emailShowError, setEmailShowError] = useState(false);
  const [emailBadFormatError, setEmailBadFormatError] = useState(false);
  const [passwordShowError, setPasswordShowError] = useState(false);
  const [passwordConfirmShowError, setPasswordConfirmShowError] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', password_confirm: '' });
  const { t } = useTranslation();

  const formValidation = () => {

    if (formData.email == ''){
      setEmailShowError(true);
      return false;
    }else{
      setEmailShowError(false);
    }

    if (!formData.email.includes('@')){
      setEmailBadFormatError(true);
      return false;
    }else{
      setEmailBadFormatError(false);
    }

    if (!isForgotPassword && formData.password == ''){
      setPasswordShowError(true);
      return false;
    }else{
      setPasswordShowError(false);
    }

    if (!isLogin && !isForgotPassword && formData.password_confirm == ''){
      setPasswordConfirmShowError(true);
      return false;
    }else{
      setPasswordConfirmShowError(false);
    }

    if (!isLogin && !isForgotPassword && formData.password != formData.password_confirm){
      setPasswordMatchError(true);
      return false;
    }else{
      setPasswordMatchError(false);
    }

    return true;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValidation())
      return;

    if (!isForgotPassword)
      setIsAuthenticated(true);
  };

  return (
    <div className="bg-custom-bg bg-cover bg-center min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl bg-opacity-90">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-white">
            {isLogin ? t('auth_login_title') : isForgotPassword ? t('auth_forgot_password_title') : isReActivation ? t('auth_resend_activation_title') : t('auth_register_title') }
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              {t('auth_email_label')}
            </label>
            <input
              id="email"
              name="email"
              type="text"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('auth_email_placeholder')}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            {emailShowError && (
              <p className="text-red-500 text-xs mt-1">
                {t('auth_email_error')}
              </p>
            )}
            {emailBadFormatError && (
              <p className="text-red-500 text-xs mt-1">
                {t('auth_email_format_error')}
              </p>
            )}
          </div>
          {!isForgotPassword && !isReActivation && (
          <div>
            <label htmlFor="password" className="sr-only">
              {t('auth_password_label')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('auth_password_placeholder')}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            {passwordShowError && (
              <p className="text-red-500 text-xs mt-1">
                {t('auth_password_error')}
              </p>
            )}
            {passwordMatchError && (
              <p className="text-red-500 text-xs mt-1">
                {t('auth_password_match_error')}
              </p>
            )}
          </div>
          )}
          {!isLogin && formData.password != '' && (
          <div>
            <label htmlFor="password_confirm" className="sr-only">
              {t('auth_password_confirm_label')}
            </label>
            <input
              id="password_confirm"
              name="password_confirm"
              type="password"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('auth_password_confirm_placeholder')}
              value={formData.password_confirm}
              onChange={(e) =>
                setFormData({ ...formData, password_confirm: e.target.value })
              }
            />
            {passwordConfirmShowError && (
              <p className="text-red-500 text-xs mt-1">
                {t('auth_password_confirm_error')}
              </p>
            )}
            {passwordMatchError && (
              <p className="text-red-500 text-xs mt-1">
                {t('auth_password_match_error')}
              </p>
            )}
          </div>
          )}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLogin ? t('auth_login_button') : isForgotPassword ? t('auth_forgot_password_button') : isReActivation ? t('auth_resend_activation_button') : t('auth_register_button')}
            </button>
          </div>
        </form>

        {((isLogin || isReActivation) && !isForgotPassword) && (
        <div className="text-center">
          <button
            className="text-blue-500 hover:text-blue-400"
            onClick={() => {
              setEmailShowError(false);
              setEmailBadFormatError(false);
              setPasswordShowError(false);
              setPasswordConfirmShowError(false);
              setPasswordMatchError(false);
              setIsReActivation(!isReActivation);
              setIsLogin(!isLogin);
            }}
          >
            {isReActivation
              ? t('auth_login_title')
              : t('auth_resend_activation_link')}{}
          </button>
        </div>
        )}
        
        {((isLogin || isForgotPassword) && !isReActivation) && (
        <div className="text-center">
          <button
            className="text-blue-500 hover:text-blue-400"
            onClick={() => {
              setEmailShowError(false);
              setEmailBadFormatError(false);
              setPasswordShowError(false);
              setPasswordConfirmShowError(false);
              setPasswordMatchError(false);
              setIsForgotPassword(!isForgotPassword);
              setIsLogin(!isLogin);
            }}
          >
            {isForgotPassword
              ? t('auth_login_title')
              : t('auth_forgot_password_link')}{}
          </button>
        </div>
        )}

        {!isForgotPassword && !isReActivation && (
        <div className="text-center">
          <button
            className="text-blue-500 hover:text-blue-400"
            onClick={() => {
              setEmailShowError(false);
              setEmailBadFormatError(false);
              setPasswordShowError(false);
              setPasswordConfirmShowError(false);
              setPasswordMatchError(false);
              setIsLogin(!isLogin);
            }}
          >
            {isLogin
              ? t('auth_register_link')
              : t('auth_login_link')}
          </button>
        </div>
        )}
      </div>
    </div>
  );
}