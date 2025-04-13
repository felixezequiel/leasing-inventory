import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { config } from '@/config/env';
import { EnvironmentControl } from '@/utils/environmentControl';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  // Configuração específica para a plataforma web
  const webClientId = config.googleAuth.webClientId || '';
  const androidClientId = config.googleAuth.androidClientId || '';
  const iosClientId = config.googleAuth.iosClientId || '';
  
  const redirectUri = makeRedirectUri({
    scheme: config.appScheme,
    preferLocalhost: EnvironmentControl.isDevelopment(),
  });
  
  // Use o cliente ID apropriado para cada plataforma
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: EnvironmentControl.isWeb() ? webClientId : config.googleAuth.expoClientId,
    iosClientId: iosClientId,
    androidClientId: androidClientId,
    redirectUri: EnvironmentControl.isWeb() ? redirectUri : undefined,
    scopes: ['profile', 'email'],
  });

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Configure especificamente para Android
      if (EnvironmentControl.isAndroid()) {
        await promptAsync({ useProxy: true } as any);
      } else {
        await promptAsync();
      }
    } catch (err) {
      console.error('Google login error:', err);
      const errorMessage = err instanceof Error ? err.message : t('errors.generic_error');
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (response?.type === 'success') {
      const fetchUserData = async () => {
        const { id_token } = response.params;
        // Processar a autenticação com o token de ID
        // ...resto do código de processamento...

        console.log('id_token', id_token);
        console.log('response', response);

        setIsLoading(false);
      };
      fetchUserData();
    } else if (response?.type === 'error') {
      setError(response.error?.message || t('errors.auth_cancelled'));
      setIsLoading(false);
    }
  }, [response, t]);

  return {
    handleGoogleLogin,
    isLoading,
    error,
  };
}; 