import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { Platform } from 'react-native';
import { config } from '@/config/env';
import { EnvironmentControl } from '@/utils/environmentControl';

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
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: EnvironmentControl.isWeb() ? webClientId : config.googleAuth.expoClientId,
    iosClientId: iosClientId,
    androidClientId: androidClientId,
    webClientId: webClientId,
    redirectUri,
    scopes: ['profile', 'email'],
  });

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const options = EnvironmentControl.isWeb()
        ? { promptType: 'redirect' } // Para web, redirecionar em vez de usar popup
        : { useProxy: true, showInRecents: true }; // Para mobile, usar proxy
        
      const result = await promptAsync(options as any);
      
      if (result.type === 'success') {
        const { authentication } = result;
        
        // Obtém dados do usuário do Google
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/userinfo/v2/me',
          {
            headers: { Authorization: `Bearer ${authentication?.accessToken}` },
          }
        );

        const userData = await userInfoResponse.json();

        // Envia os dados para o servidor para processamento adicional
        const response = await fetch(config.apiUrl + '/auth/google-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: authentication?.accessToken,
            userData,
          }),
        });

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        return data;
      } else if (result.type === 'error') {
        throw new Error(result.error?.message || t('errors.auth_error'));
      } else {
        // Cancelado pelo usuário
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Google login error:', err);
      const errorMessage = err instanceof Error ? err.message : t('errors.generic_error');
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleGoogleLogin,
    isLoading,
    error,
  };
}; 