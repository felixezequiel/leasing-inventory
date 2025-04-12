import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthScreen } from '../screens/auth/AuthScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import eventEmitter from '@/utils/events';

const Stack = createNativeStackNavigator();

// Configuração para deep linking
const linking = {
  prefixes: ['leasing-inventory://', 'https://yourdomain.com'],
  config: {
    screens: {
      Auth: 'auth',
      ResetPassword: 'reset-password',
      Home: 'home',
    },
  },
};

export const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se o usuário já está autenticado ao iniciar o app
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error('Error checking auth token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Função para lidar com eventos de autenticação bem-sucedida
    const handleAuthSuccess = () => {
      console.log('Auth success event received, navigating to Home');
      setIsAuthenticated(true);
    };

    // Adicionar listener para eventos de autenticação
    eventEmitter.on('auth-success', handleAuthSuccess);

    return () => {
      // Remover o listener quando o componente for desmontado
      eventEmitter.removeListener('auth-success', handleAuthSuccess);
    };
  }, []);

  return (
    <NavigationContainer
      linking={linking}
      fallback={<AuthScreen />}
      onStateChange={(state) => {
        console.log('Navigation state changed:', state);
      }}
    >
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "Home" : "Auth"}
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <>
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 