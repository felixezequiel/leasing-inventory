import { config } from '@/config/env';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RegisterDto } from '@shared/dtos/AuthDto';

interface RegisterData extends RegisterDto {
  confirmPassword: string;
}

export const useRegisterAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const validatePasswords = (password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
      throw new Error(t('errors.passwords_dont_match'));
    }
  };

  const handleRegister = async (data: RegisterData) => {
    setError(null);
    setIsLoading(true);

    try {
      validatePasswords(data.password, data.confirmPassword);

      const response = await fetch(config.apiUrl + '/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const responseData = await response.json();
      if (responseData.error) {
        throw new Error(responseData.error);
      }

      // TODO: Save token and redirect using global state management
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
    handleRegister,
    isLoading,
    error,
  };
}; 