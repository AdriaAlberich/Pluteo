import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import { CircleAlert, Info, Book } from 'lucide-react';

export function Auth() {

  // Hooks for authentication system
  const { 
    register, 
    login, 
    activateUser,
    forgotPassword, 
    resetPassword, 
    resendActivationEmail,
    loginErrorReset,
    registerErrorReset,
    activateUserErrorReset,
    resendActivationEmailErrorReset,
    forgotPasswordErrorReset,
    resetPasswordErrorReset,
    isLoading
  } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Parameters for the activation and password reset tokens
  const { activationToken, resetPasswordToken } = useParams();

  // Local state variables
  const [isLogin, setIsLogin] = useState(true);
  const [isReActivation, setIsReActivation] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [emailShowError, setEmailShowError] = useState(false);
  const [emailBadFormatError, setEmailBadFormatError] = useState(false);
  const [passwordShowError, setPasswordShowError] = useState(false);
  const [passwordConfirmShowError, setPasswordConfirmShowError] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [currentError, setCurrentError] = useState<Error>(new Error(''));
  const [formData, setFormData] = useState({ email: '', password: '', passwordRepeat: '' });

  // Check if some of the tokens is present
  useEffect(() => {
    if (activationToken) {
      activateUser(activationToken);
    }
    if (resetPasswordToken) {
      setIsResetPassword(true);
      setIsLogin(false);
      setIsForgotPassword(false);
      setIsReActivation(false);
    }
  }, [activationToken, activateUser, resetPasswordToken, setIsResetPassword]);

  // Validate the form inputs (this is only a basic validation for the client side, in the backend there are more)
  const formValidation = () => {
    resetErrorMessages();
    if(!isResetPassword){
      if (formData.email == ''){
        setEmailShowError(true);
        return false;
      }else{
        setEmailShowError(false);
      }
    }

    if(!isResetPassword){
      if (!formData.email.includes('@')){
        setEmailBadFormatError(true);
        return false;
      }else{
        setEmailBadFormatError(false);
      }
    }

    if (!isForgotPassword && !isReActivation && formData.password == ''){
      setPasswordShowError(true);
      return false;
    }else{
      setPasswordShowError(false);
    }

    if (!isLogin && !isForgotPassword && !isReActivation && formData.passwordRepeat == ''){
      setPasswordConfirmShowError(true);
      return false;
    }else{
      setPasswordConfirmShowError(false);
    }

    if (!isLogin && !isForgotPassword && !isReActivation && formData.password != formData.passwordRepeat){
      setPasswordMatchError(true);
      return false;
    }else{
      setPasswordMatchError(false);
    }

    return true;
  }

  // Handle the main submit button, this button handles all the authentication functionality depending on the state
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValidation())
      return;

    if(isLogin){
      login(formData, {
        onSuccess: () => {
          const redirectPath = location.state?.from || '/mylibrary';
          navigate(redirectPath);
        },
        onError: (error) => {
          setCurrentError(error);
          setShowErrorAlert(true);
          setShowSuccessAlert(false);
        },
      });
    }
    else if(isForgotPassword){
      forgotPassword(formData.email, {
        onSuccess: () => {
          resetErrorMessages();
          setShowSuccessAlert(true);
          setShowErrorAlert(false);
        },
        onError: (error) => {
          setCurrentError(error);
          setShowErrorAlert(true);
          setShowSuccessAlert(false);
        },
      });
    }
    else if(isReActivation){
      resendActivationEmail(formData.email, {
        onSuccess: () => {
          resetErrorMessages();
          setShowSuccessAlert(true);
          setShowErrorAlert(false);
        },
        onError: (error) => {
          setCurrentError(error);
          setShowErrorAlert(true);
          setShowSuccessAlert(false);
        },
      });
    }
    else if(isResetPassword){
      if(resetPasswordToken !== undefined){
        resetPassword({token: resetPasswordToken, newPassword: formData.password, newPasswordRepeat: formData.passwordRepeat}, {
          onSuccess: () => {
            resetErrorMessages();
            setShowErrorAlert(false);
            setShowSuccessAlert(true);
          },
          onError: (error) => {
            setCurrentError(error);
            setShowErrorAlert(true);
            setShowSuccessAlert(false);
          },
        });
      }else{
        console.error('Reset password token is undefined');
      }
    }
    else{
      register(formData, {
        onSuccess: () => {
          resetErrorMessages();
          setShowSuccessAlert(true);
          setShowErrorAlert(false);
        },
        onError: (error) => {
          setCurrentError(error);
          setShowErrorAlert(true);
          setShowSuccessAlert(false);
        },
      });
    }
  };

  // Handle the error messages from the API (localized)
  const handleErrors = (error: Error) => {
    const status = (error as any)?.response?.status;
    let errorMessage = (error as any)?.response?.data?.message || t('generic_unknown_error');
    console.log('Error:', status, errorMessage);
    if (status === 400) {
      if (errorMessage === 'USER_NEW_PASSWORD_NOT_VALID' || errorMessage === 'USER_PASSWORD_NOT_VALID') {
        errorMessage = t('auth_password_not_valid_error');
      } else if (errorMessage === 'USER_NEW_PASSWORD_CONFIRMATION_NOT_MATCH') {
        errorMessage = t('auth_password_match_error');
      } else if (errorMessage === 'USER_EMAIL_NOT_VALID') {
        errorMessage = t('auth_email_format_error');
      } else if (errorMessage === 'USER_PASSWORD_INCORRECT' || errorMessage === 'USER_NOT_EXISTS') {
        errorMessage = t('auth_password_incorrect_error');
      } else if (errorMessage === 'USER_PASSWORD_EXPIRED') {
        errorMessage = t('auth_password_expired_error');
      } else if (errorMessage === 'USER_NOT_ACTIVE') {
        errorMessage = t('auth_user_not_active_error');
      } else if (errorMessage === 'USER_ALREADY_ACTIVATED') {
        errorMessage = t('auth_user_already_activated_error');
      } else if (errorMessage === 'USER_EMAIL_EXISTS') {
        errorMessage = t('auth_user_exists_error');
      } else if (errorMessage === 'USER_RESET_PASSWORD_TOKEN_NOT_FOUND') {
        errorMessage = t('auth_reset_password_token_not_found_error');
      } else {
        errorMessage = t('generic_error');
      }
    }else if (status === 500) {
      errorMessage = t('generic_server_error');
    }

    return errorMessage;
  };

  // Hide all error messages
  const deactivateErrorMessages = () => {
    setEmailShowError(false);
    setEmailBadFormatError(false);
    setPasswordShowError(false);
    setPasswordConfirmShowError(false);
    setPasswordMatchError(false);
    setShowSuccessAlert(false);
    setShowErrorAlert(false);
  };

  // Reset all the error states (from hooks)
  const resetErrorMessages = () => {
    loginErrorReset();
    registerErrorReset();
    activateUserErrorReset();
    resendActivationEmailErrorReset();
    forgotPasswordErrorReset();
    resetPasswordErrorReset();
    deactivateErrorMessages();
  };

  // Reset the form inputs
  const resetInputs = () => {
    setFormData({ email: '', password: '', passwordRepeat: '' });
  }

  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center px-4 shadow-lg">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <div className="max-w-md w-full space-y-6 bg-gray-800 p-8 rounded-xl bg-opacity-90">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">{t('library_name')}<Book className='inline ml-2'/></h1>
          <p className="block text-sm text-white">{t('library_motto')}</p>
          <div className="border-t border-gray-700 my-4"></div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            {isLogin ? t('auth_login_title') : isForgotPassword ? t('auth_forgot_password_title') : isReActivation ? t('auth_resend_activation_title') : isResetPassword ? t('auth_reset_password_title') : t('auth_register_title') }
          </h2>
        </div>
        {showSuccessAlert && !isLogin && (
        <div className="flex items-center bg-blue-500 text-white text-sm font-bold px-4 py-3" role="alert">
          <Info className="w-4 h-4 mr-2" />
          <p> {isForgotPassword ? t('auth_forgot_password_success') : isReActivation ? t('auth_resend_activation_success') : isResetPassword ? t('auth_reset_password_success') : t('auth_register_success')} </p>
        </div>
        )}
        {showErrorAlert && currentError && (
        <div className="flex items-center bg-red-500 text-white text-sm font-bold px-4 py-3" role="alert">
          <CircleAlert className="w-4 h-4 mr-2" />
          <p>{handleErrors(currentError)}</p>
        </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {!isResetPassword && (
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
          )}
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
          {!isLogin && !isForgotPassword && !isReActivation && formData.password != '' && (
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
              value={formData.passwordRepeat}
              onChange={(e) =>
                setFormData({ ...formData, passwordRepeat: e.target.value })
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
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="flex-1 py-2 text-white rounded-lg bg-blue-700 hover:bg-blue-600 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg aria-hidden="true" className="w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                  </svg>
                  {
                    isLogin
                    ? t('auth_login_button_loading')
                    : isForgotPassword
                    ? t('auth_forgot_password_button_loading')
                    : isReActivation
                    ? t('auth_resend_activation_button_loading')
                    : isResetPassword
                    ? t('auth_reset_password_button_loading')
                    : t('auth_register_button_loading')
                  }
                </>
              ) : (
                isLogin
                  ? t('auth_login_button')
                  : isForgotPassword
                  ? t('auth_forgot_password_button')
                  : isReActivation
                  ? t('auth_resend_activation_button')
                  : isResetPassword
                  ? t('auth_reset_password_button')
                  : t('auth_register_button')
              )}
            </button>
          </div>
        </form>
        
        {(!isResetPassword && ((isLogin || isReActivation) && !isForgotPassword)) && (
        <div className="text-center">
          <button
            className="text-blue-500 hover:text-blue-400"
            onClick={() => {
              resetInputs();
              resetErrorMessages();
              setIsReActivation(!isReActivation);
              setIsLogin(!isLogin);
            }}
            disabled={isLoading}
          >
            {isReActivation
              ? t('auth_login_link')
              : t('auth_resend_activation_link')}{}
          </button>
        </div>
        )}
        
        {(!isResetPassword && ((isLogin || isForgotPassword) && !isReActivation)) && (
        <div className="text-center">
          <button
            className="text-blue-500 hover:text-blue-400"
            onClick={() => {
              resetInputs();
              resetErrorMessages();
              setIsForgotPassword(!isForgotPassword);
              setIsLogin(!isLogin);
            }}
            disabled={isLoading}
          >
            {isForgotPassword
              ? t('auth_login_link')
              : t('auth_forgot_password_link')}{}
          </button>
        </div>
        )}

        {!isForgotPassword && !isReActivation && (
        <div className="text-center">
          <button
            className="text-blue-500 hover:text-blue-400"
            onClick={() => {
              resetInputs();
              resetErrorMessages();
              setIsLogin(!isLogin);
              setIsResetPassword(false);
            }}
            disabled={isLoading}
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