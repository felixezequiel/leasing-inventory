import { useState, useCallback, useEffect } from 'react';
import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '@/config/env';
import { useTranslation } from 'react-i18next';
import eventEmitter from '@/utils/events';

export const useSocialAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  // Setup the deep link handler on component mount
  useEffect(() => {
    console.log('Setting up deep link handler...');
    
    // Handle the initial URL that may have opened the app
    const handleInitialURL = async () => {
      try {
        const url = await Linking.getInitialURL();
        console.log('Initial URL:', url);
        if (url) {
          await processURL(url);
        }
      } catch (e) {
        console.error('Error handling initial URL:', e);
      }
    };
    
    // Process the URL containing auth data
    const processURL = async (url: string) => {
      console.log('Processing URL:', url);
      if (url.includes('auth') && url.includes('token=')) {
        const params = new URLSearchParams(url.split('?')[1]);
        const token = params.get('token');
        const errorMessage = params.get('error');

        if (errorMessage) {
          console.error('Auth error from deep link:', errorMessage);
          setError(t('errors.social_auth_failed'));
        } else if (token) {
          console.log('Token received from auth redirect');
          await AsyncStorage.setItem('auth_token', token);
          // Emit auth success event que será capturado pelo AppNavigator
          eventEmitter.emit('auth-success', { token });
        }
        setIsLoading(false);
      }
    };

    // Listen for deep link events
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('Deep link received:', url);
      processURL(url);
    });

    // Handle case where app was opened from a deep link
    handleInitialURL();

    return () => {
      console.log('Removing deep link listener');
      subscription.remove();
    };
  }, [t]);

  const handleSocialLogin = useCallback(async (provider: 'google' | 'facebook') => {
    try {
      setError(null);
      setIsLoading(true);

      // Build the auth URL with platform info
      const platform = Platform.OS;
      const authUrl = `${config.apiUrl}/auth/${provider}?platform=mobile`;
      
      console.log(`Attempting to open auth URL: ${authUrl}`);
      
      const supported = await Linking.canOpenURL(authUrl);
      if (!supported) {
        console.error(`URL scheme not supported: ${authUrl}`);
        setError(t('errors.cannot_open_url'));
        setIsLoading(false);
        return;
      }

      // Open authentication URL
      await Linking.openURL(authUrl);
      console.log('Auth URL opened successfully, authentication continuing in background...');
      
      // Nota: a autenticação continuará em segundo plano e será tratada pelo listener quando
      // a aplicação for reaberta via deep linking
    } catch (err) {
      console.error('Social auth error:', err);
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