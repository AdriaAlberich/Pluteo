import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../context/appStore';
import { useAuth } from '../hooks/useAuth';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import { CircleAlert, Info } from 'lucide-react';

export function Auth() {
  const { setIsAuthenticated } = useAppStore();
  const { 
    register, 
    login, 
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
  const { activationToken, resetPasswordToken } = useParams();
  const { activateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const { t } = useTranslation();

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

  const handleErrors = (error: Error) => {
    const status = (error as any)?.response?.status;
    let errorMessage = (error as any)?.response?.data?.message || 'An unknown error occurred';
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
        errorMessage = t('auth_generic_error');
      }
    }else if (status === 500) {
      errorMessage = t('auth_server_error');
    }

    return errorMessage;
  };

  const deactivateErrorMessages = () => {
    setEmailShowError(false);
    setEmailBadFormatError(false);
    setPasswordShowError(false);
    setPasswordConfirmShowError(false);
    setPasswordMatchError(false);
    setShowSuccessAlert(false);
    setShowErrorAlert(false);
  };

  const resetErrorMessages = () => {
    loginErrorReset();
    registerErrorReset();
    activateUserErrorReset();
    resendActivationEmailErrorReset();
    forgotPasswordErrorReset();
    resetPasswordErrorReset();
    deactivateErrorMessages();
  };

  const resetInputs = () => {
    setFormData({ email: '', password: '', passwordRepeat: '' });
  }

  return (
    <div className="bg-custom-bg bg-cover bg-center min-h-screen flex items-center justify-center px-4">
      <div className="absolute top-4 left-4">
        <LanguageSelector />
      </div>
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl bg-opacity-90">
        <div className="text-center">
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
          <div>
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              disabled={isLoading}
            >
              {isLoading ? (
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