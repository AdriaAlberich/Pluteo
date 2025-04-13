import { useState } from 'react';
import { useAppStore } from '../context/appContext';
import { useAuth } from '../hooks/useAuth';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import { CircleAlert, Info } from 'lucide-react';

export function Auth() {
  const { setIsAuthenticated } = useAppStore();
  const { register, login, forgotPassword, resendActivationEmail, isLoading, isError, isSuccess, response } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isReActivation, setIsReActivation] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [emailShowError, setEmailShowError] = useState(false);
  const [emailBadFormatError, setEmailBadFormatError] = useState(false);
  const [passwordShowError, setPasswordShowError] = useState(false);
  const [passwordConfirmShowError, setPasswordConfirmShowError] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', repeatPassword: '' });
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

    if (!isLogin && !isForgotPassword && formData.repeatPassword == ''){
      setPasswordConfirmShowError(true);
      return false;
    }else{
      setPasswordConfirmShowError(false);
    }

    if (!isLogin && !isForgotPassword && formData.password != formData.repeatPassword){
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

    if(isLogin){
      login(formData);
    }
    else if(isForgotPassword){
      forgotPassword(formData.email);
    }
    else if(isReActivation){
      resendActivationEmail(formData.email);
    }
    else{
      register(formData);
    }
  };

  const handleErrors = () => {
    let errorMessage = '';
    if (response?.status === 406) {
      if (response.data.Message === 'USER_NEW_PASSWORD_NOT_VALID' || response.data.Message === 'USER_PASSWORD_NOT_VALID') {
        errorMessage = t('auth_password_not_valid_error');
      } else if (response.data.Message === 'USER_NEW_PASSWORD_CONFIRMATION_NOT_MATCH') {
        errorMessage = t('auth_password_match_error');
      } else if (response.data.Message === 'USER_EMAIL_NOT_VALID') {
        errorMessage = t('auth_email_format_error');
      } else if (response.data.Message === 'USER_PASSWORD_INCORRECT' || response.data.Message === 'USER_NOT_EXISTS') {
        errorMessage = t('auth_password_incorrect_error');
      } else if (response.data.Message === 'USER_PASSWORD_EXPIRED') {
        errorMessage = t('auth_password_expired_error');
      } else if (response.data.Message === 'USER_NOT_ACTIVE') {
        errorMessage = t('auth_user_not_active_error');
      } else if (response.data.Message === 'USER_ALREADY_ACTIVATED') {
        errorMessage = t('auth_user_already_activated_error');
      } else if (response.data.Message === 'USER_EMAIL_EXISTS') {
        errorMessage = t('auth_user_exists_error');
      } else {
        errorMessage = t('auth_generic_error');
      }
    }else if (response?.status === 500) {
      errorMessage = t('auth_server_error');
    }

    console.log('Error:', response?.status, response?.data);
    return errorMessage;
  };

  return (
    <div className="bg-custom-bg bg-cover bg-center min-h-screen flex items-center justify-center px-4">
      <div className="absolute top-4 left-4">
        <LanguageSelector />
      </div>
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl bg-opacity-90">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-white">
            {isLogin ? t('auth_login_title') : isForgotPassword ? t('auth_forgot_password_title') : isReActivation ? t('auth_resend_activation_title') : t('auth_register_title') }
          </h2>
        </div>
        {isSuccess && (
        <div className="flex items-center bg-blue-500 text-white text-sm font-bold px-4 py-3" role="alert">
          <Info className="w-4 h-4 mr-2" />
          <p> {isLogin ? '' : isForgotPassword ? t('auth_forgot_password_success') : isReActivation ? t('auth_resend_activation_success') : t('auth_register_success')} </p>
        </div>
        )}
        {isError && (
        <div className="flex items-center bg-red-500 text-white text-sm font-bold px-4 py-3" role="alert">
          <CircleAlert className="w-4 h-4 mr-2" />
          <p>{handleErrors()}</p>
        </div>
        )}
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
              value={formData.repeatPassword}
              onChange={(e) =>
                setFormData({ ...formData, repeatPassword: e.target.value })
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