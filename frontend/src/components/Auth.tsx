import { useState } from 'react';
import { useAppStore } from '../context/appContext';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

export function Auth() {
  const { setIsAuthenticated } = useAppStore();
  const { register, login, forgotPassword, resendActivationEmail, isLoading, error, success } = useAuth();
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

  return (
    <div className="bg-custom-bg bg-cover bg-center min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl bg-opacity-90">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-white">
            {isLogin ? t('auth_login_title') : isForgotPassword ? t('auth_forgot_password_title') : isReActivation ? t('auth_resend_activation_title') : t('auth_register_title') }
          </h2>
        </div>
        {success && (
        <div className="flex items-center bg-blue-500 text-white text-sm font-bold px-4 py-3" role="alert">
          <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"/></svg>
          <p> {!isLogin ? t('auth_register_success') : isForgotPassword ? t('auth_forgot_password_success') : isReActivation ? t('auth_resend_activation_success') : ''} </p>
        </div>
        )}
        {error && (
        <div className="flex items-center bg-red-500 text-white text-sm font-bold px-4 py-3" role="alert">
          <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 0a10 10 0 1 0 0 20A10 10 0 0 0 10 0zm1.414 14.586L10 13.172l-1.414 1.414L7.172 14l1.414-1.414L8.586 12l1.414-1.414L12 8.586l1.414-1.414L14 7.172l-1.414 1.414L12 10l1.414 1.414z"/></svg>
          <p>{error.message}</p>
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