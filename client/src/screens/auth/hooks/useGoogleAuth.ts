import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { config } from '@/config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import eventEmitter from '@/utils/events';
import { useTranslation } from 'react-i18next';

// Configurar WebBrowser para redirecionamentos OAuth
WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  // Configurar o hook de autenticação para Google, usando o ID do cliente
  const [,response, promptAsync] = Google.useAuthRequest({
    clientId: config.googleClientId,
    redirectUri: 'leasing-inventory://auth'
  });

  // Processar a resposta de autenticação quando mudar
  const processAuthResult = async () => {
    if (response?.type === 'success') {
      setIsLoading(true);
      try {
        const accessToken = response.authentication?.accessToken;
        console.log('Token de acesso recebido:', accessToken);
        
        // Obter informações do usuário usando o token de acesso
        const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        const userData = await userInfoResponse.json();
        console.log('Dados do usuário:', userData);
        
        // Enviar os dados para o servidor para criar o usuário/obter token JWT
        const serverResponse = await fetch(`${config.apiUrl}/auth/google/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            googleId: userData.id,
            email: userData.email,
            name: userData.name
          })
        });
        
        const data = await serverResponse.json();
        
        if (data.token) {
          // Armazenar o token e emitir evento de sucesso
          await AsyncStorage.setItem('auth_token', data.token);
          eventEmitter.emit('auth-success', { token: data.token });
        } else {
          throw new Error(data.error || 'Falha ao obter token');
        }
      } catch (err: any) {
        console.error('Erro ao processar autenticação Google:', err);
        setError(err.message || t('errors.auth_failed'));
      } finally {
        setIsLoading(false);
      }
    } else if (response?.type === 'error') {
      console.error('Erro na autenticação:', response.error);
      setError(response.error?.message || t('errors.auth_cancelled'));
    }
  };

  // Processar o resultado quando a resposta mudar
  if (response) {
    processAuthResult();
  }

  // Função para iniciar o fluxo de autenticação
  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      console.log('Iniciando autenticação Google...');
      
      // Iniciar o fluxo de autenticação
      await promptAsync();
    } catch (err: any) {
      console.error('Erro ao iniciar autenticação:', err);
      setError(err.message || t('errors.auth_failed'));
      setIsLoading(false);
    }
  };

  return {
    handleGoogleLogin,
    isLoading,
    error,
  };
}; 