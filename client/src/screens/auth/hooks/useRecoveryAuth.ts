import { config } from '@/config/env';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ForgotPasswordDto } from '@shared/dtos/AuthDto';

export const useRecoveryAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleRecovery = async (data: ForgotPasswordDto) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(config.apiUrl + '/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      const responseData = await response.json();
      if (responseData.error) {
        throw new Error(responseData.error);
      }

      return responseData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errors.generic_error');
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleRecovery,
    isLoading,
    error,
  };
}; 