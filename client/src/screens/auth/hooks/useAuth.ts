import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { LoginDto, RegisterDto } from '@shared/dtos/AuthDto';
import authService from '@/services/AuthService';
import { useGoogleAuth } from './useGoogleAuth';

type AuthMode = 'login' | 'register' | 'recovery';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const googleAuth = useGoogleAuth();

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        // Navigate to home if already authenticated
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' as never }],
        });
      }
    };

    checkAuth();
  }, [navigation]);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = authService.subscribe((state) => {
      setIsLoading(state.isLoading);
      setError(state.error);
      
      // Redirect to home on successful authentication
      if (state.isAuthenticated && !state.isLoading) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' as never }],
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [navigation]);

  const handleSubmit = async (mode: AuthMode, formData: FormData) => {
    setError(null);
    
    try {
      switch (mode) {
        case 'login':
          return await authService.login(
            new LoginDto(formData.email, formData.password)
          );
        case 'register':
          if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
          }
          return await authService.register(
            new RegisterDto(formData.name, formData.email, formData.password)
          );
        case 'recovery':
          return await authService.forgotPassword(formData.email);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      return false;
    }
  };

  return {
    handleSubmit,
    handleGoogleLogin: googleAuth.handleGoogleLogin,
    isLoading: isLoading ?? googleAuth.isLoading,
    error: error ?? googleAuth.error,
  };
}; 