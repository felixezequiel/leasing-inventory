import { useState, useCallback } from 'react';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '@/config/env';
import { useTranslation } from 'react-i18next';
import { EventRegister } from 'react-native-event-listeners';

export const useSocialAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleSocialLogin = useCallback(async (provider: 'google' | 'facebook') => {
    try {
      setError(null);
      setIsLoading(true);

      const authUrl = `${config.apiUrl}/auth/${provider}`;
      const supported = await Linking.canOpenURL(authUrl);

      if (!supported) {
        setError(t('errors.cannot_open_url'));
        return;
      }

      // Add event listener for deep linking
      const subscription = Linking.addEventListener('url', async ({ url }) => {
        const params = new URLSearchParams(url.split('?')[1]);
        const token = params.get('token');
        const errorMessage = params.get('error');

        if (errorMessage) {
          setError(t('errors.social_auth_failed', { provider }));
        } else if (token) {
          await AsyncStorage.setItem('auth_token', token);
          // Emit auth success event
          EventRegister.emit('auth-success', {
            provider,
            token
          });
        }

        setIsLoading(false);
        // Remove subscription after handling
        subscription.remove();
      });

      // Open authentication URL
      await Linking.openURL(authUrl);

    } catch (err) {
      setError(t('errors.auth_cancelled'));
      setIsLoading(false);
    }
  }, [t]);

  return {
    handleSocialLogin,
    isLoading,
    error,
  };
}; 