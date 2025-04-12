import { config } from '@/config/env';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGoogleAuth } from './useGoogleAuth';
import { LoginDto } from '@shared/dtos/AuthDto';

export const useLoginAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const googleAuth = useGoogleAuth();

  const handleLogin = async (credentials: LoginDto) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(config.apiUrl + '/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errors.generic_error');
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    googleAuth.handleGoogleLogin();
  };

  return {
    handleLogin,
    handleGoogleLogin,
    isLoading: isLoading || googleAuth.isLoading,
    error: error || googleAuth.error,
  };
}; 