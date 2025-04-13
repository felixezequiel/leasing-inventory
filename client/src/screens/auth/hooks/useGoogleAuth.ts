import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { config } from '@/config/env';
import { EnvironmentControl } from '@/utils/environmentControl';
import * as WebBrowser from 'expo-web-browser';
import authService from '@/services/AuthService';

WebBrowser.maybeCompleteAuthSession();

// Function to safely decode a JWT token
const decodeJWT = (token: string) => {
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid token format');
    }

    // Note: atob is not available in React Native, using a base64 decoder
    const base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      Array.from(atob(base64))
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// For React Native, we need to provide our own atob implementation
function atob(input: string) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = input.replace(/=+$/, '');
  let output = '';

  for (
    let bc = 0, bs = 0, buffer, i = 0;
    (buffer = str.charAt(i++));
    ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    buffer = chars.indexOf(buffer);
  }

  return output;
}

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
        try {
          const { id_token } = response.params;

          // Decodificar o token para obter as informações do usuário
          const payload = decodeJWT(id_token);
          if (!payload) {
            throw new Error('Failed to decode token');
          }

          const googleUserData = {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
          };

          // Enviar os dados para o servidor para autenticação/registro
          const serverResponse = await fetch(`${config.apiUrl}/auth/google/profile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(googleUserData),
            credentials: 'include', // Important for cookies
          });

          const data = await serverResponse.json();

          if (data.error) {
            throw new Error(data.error);
          }

          if (data.token && data.user) {
            // Use the auth service to store token and user info
            await authService['saveAuthState'](data.token, data.user, data.refreshToken);
            setIsLoading(false);
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (err) {
          console.error('Error processing Google authentication:', err);
          const errorMessage = err instanceof Error ? err.message : t('errors.generic_error');
          setError(errorMessage);
          setIsLoading(false);
        }
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
