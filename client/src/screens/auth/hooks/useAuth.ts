import { useState } from 'react';
import { useLoginAuth } from './useLoginAuth';
import { useRegisterAuth } from './useRegisterAuth';
import { useRecoveryAuth } from './useRecoveryAuth';

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
          return await loginAuth.handleLogin({
            email: formData.email,
            password: formData.password,
          });
        case 'register':
          return await registerAuth.handleRegister(formData);
        case 'recovery':
          return await recoveryAuth.handleRecovery({
            email: formData.email,
          });
      }
    } catch (error) {
      // Errors are already handled by individual hooks
    }
  };

  const isLoading = loginAuth.isLoading || registerAuth.isLoading || recoveryAuth.isLoading;
  const error = loginAuth.error || registerAuth.error || recoveryAuth.error;

  return {
    handleSubmit,
    handleGoogleLogin: loginAuth.handleGoogleLogin,
    isLoading,
    error,
  };
}; 