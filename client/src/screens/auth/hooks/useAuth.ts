import { useLoginAuth } from './useLoginAuth';
import { useRegisterAuth } from './useRegisterAuth';
import { useRecoveryAuth } from './useRecoveryAuth';
import { LoginDto, RegisterDto, ForgotPasswordDto } from '@shared/dtos/AuthDto';

type AuthMode = 'login' | 'register' | 'recovery';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export const useAuth = () => {
  const loginAuth = useLoginAuth();
  const registerAuth = useRegisterAuth();
  const recoveryAuth = useRecoveryAuth();

  const handleSubmit = async (mode: AuthMode, formData: FormData) => {
    try {
      switch (mode) {
        case 'login':
          return await loginAuth.handleLogin(
            new LoginDto(formData.email, formData.password)
          );
        case 'register':
          return await registerAuth.handleRegister({
            ...new RegisterDto(formData.name, formData.email, formData.password),
            confirmPassword: formData.confirmPassword
          });
        case 'recovery':
          return await recoveryAuth.handleRecovery(
            new ForgotPasswordDto(formData.email)
          );
      }
    } catch (error) {
      // Errors are already handled by individual hooks
    }
  };

  const isLoading = loginAuth.isLoading ?? registerAuth.isLoading ?? recoveryAuth.isLoading;
  const error = loginAuth.error ?? registerAuth.error ?? recoveryAuth.error;

  return {
    handleSubmit,
    handleGoogleLogin: loginAuth.handleGoogleLogin,
    isLoading,
    error,
  };
}; 