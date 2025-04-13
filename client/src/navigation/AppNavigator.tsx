import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthScreen } from '../screens/auth/AuthScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import eventEmitter from '@/utils/events';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/design-system';
import { linking } from './linking';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    // Verificar se o usuário já está autenticado ao iniciar o app
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error('Error checking auth token:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Função para lidar com eventos de autenticação bem-sucedida
    const handleAuthSuccess = () => {
      setIsAuthenticated(true);
    };

    // Adicionar listener para eventos de autenticação
    eventEmitter.on('auth-success', handleAuthSuccess);

    return () => {
      // Remover o listener quando o componente for desmontado
      eventEmitter.removeListener('auth-success', handleAuthSuccess);
    };
  }, []);

  // Show a loading indicator while checking auth status
  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
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