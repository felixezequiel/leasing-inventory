import { config } from '@/config/env';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSocialAuth } from './useSocialAuth';

interface LoginCredentials {
  email: string;
  password: string;
}

export const useLoginAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const socialAuth = useSocialAuth();

  const handleLogin = async (credentials: LoginCredentials) => {
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
    socialAuth.handleSocialLogin('google');
  };

  return {
    handleLogin,
    handleGoogleLogin,
    isLoading: isLoading || socialAuth.isLoading,
    error: error || socialAuth.error,
  };
}; 